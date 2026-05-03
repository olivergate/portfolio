"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HoverData } from "@/components/jd/Chip";
import { ChipGrid } from "@/components/jd/ChipGrid";
import {
  type ChipModel,
  parseCite,
  projectMatchedChips,
  projectSampleChips,
} from "@/components/jd/chip-models";
import { FloatingTooltip } from "@/components/jd/FloatingTooltip";
import { JDExperience } from "@/components/jd/JDExperience";
import { ReorderToggle } from "@/components/jd/ReorderToggle";
import { SamplePill } from "@/components/jd/SamplePill";
import { StretchSlider } from "@/components/jd/StretchSlider";
import { SummaryLine } from "@/components/jd/SummaryLine";
import {
  levelFromPosition,
  type Match,
  type ParsedRequirement,
  positionFromLevel,
  type SampleJD,
  type StretchLevel,
} from "@/lib/jd-schemas";
import type { CV } from "@/lib/schemas";

type Props = {
  cv: CV;
  samples: SampleJD[];
};

type LiveState = {
  jdHash: string;
  requirements: ParsedRequirement[];
  matchesByLevel: Partial<Record<StretchLevel, Match[]>>;
};

type LoadingStage =
  | { kind: "idle" }
  | { kind: "parsing" }
  | { kind: "matching"; level: StretchLevel }
  | { kind: "error"; message: string };

const PARSE_ENDPOINT = "/api/jd-parse";
const MATCH_ENDPOINT = "/api/jd-match";
const MATCH_DEBOUNCE_MS = 400;

export function JDAdapter({ cv, samples }: Props) {
  const [activeKey, setActiveKey] = useState<string>(samples[0]?.key ?? "");
  const activeSample = samples.find((s) => s.key === activeKey) ?? null;

  const [jdText, setJdText] = useState<string>(activeSample?.text ?? "");
  const [scored, setScored] = useState(true);
  const [stretchPosition, setStretchPosition] = useState(0.5);
  const [reorder, setReorder] = useState(false);
  const [pulseId, setPulseId] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<HoverData | null>(null);
  const [loading, setLoading] = useState<LoadingStage>({ kind: "idle" });

  /** Live state populated only when the visitor pasted a JD and clicked Score. */
  const [live, setLive] = useState<LiveState | null>(null);

  /**
   * Generation counter — bumped on every fetch (Score click, level change).
   * Each async closure captures the gen at start; results are dropped if a
   * newer generation has begun (sample pick, second Score click, level slide).
   * Prevents stale responses from clobbering current state.
   */
  const genRef = useRef(0);

  /** Pulse-clear timeout id — kept in a ref so successive clicks don't lose it. */
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup pulse timer on unmount.
  useEffect(() => {
    return () => {
      if (pulseTimerRef.current !== null) {
        clearTimeout(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
    };
  }, []);

  const stretchLevel: StretchLevel = levelFromPosition(stretchPosition);

  const chips: ChipModel[] | null = useMemo(() => {
    if (!scored) return null;
    if (live) {
      const matches = live.matchesByLevel[stretchLevel];
      if (!matches) return null;
      return projectMatchedChips(matches, live.requirements);
    }
    if (activeSample) return projectSampleChips(activeSample.chips, stretchLevel);
    return null;
  }, [scored, live, stretchLevel, activeSample]);

  const pickSample = (key: string) => {
    const sample = samples.find((s) => s.key === key);
    if (!sample) return;
    // Bump generation so any in-flight handleScore / level-change fetch is
    // ignored when it resolves — picking a sample mid-flight must not let the
    // stale response snap the UI back.
    genRef.current += 1;
    setActiveKey(key);
    setJdText(sample.text);
    setScored(true);
    setStretchPosition(positionFromLevel("balanced"));
    setReorder(false);
    setLive(null);
    setLoading({ kind: "idle" });
  };

  const handleScore = async () => {
    if (loading.kind === "parsing" || loading.kind === "matching") return;
    if (jdText.trim().length < 20) {
      setLoading({ kind: "error", message: "JD too short — paste at least a paragraph." });
      return;
    }
    const myGen = ++genRef.current;
    setLoading({ kind: "parsing" });
    setLive(null);
    try {
      const parseResp = await fetch(PARSE_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jdText }),
      });
      const parseJson = (await parseResp.json()) as
        | { ok: true; requirements: ParsedRequirement[]; jdHash: string }
        | { ok: false; stage: string; detail?: string };
      if (genRef.current !== myGen) return; // superseded — drop response
      if (!parseJson.ok) {
        setLoading({
          kind: "error",
          message: `Parser ${parseJson.stage}: ${parseJson.detail ?? "unknown error"}`,
        });
        return;
      }
      setLoading({ kind: "matching", level: stretchLevel });
      const matchResp = await fetch(MATCH_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jdHash: parseJson.jdHash,
          requirements: parseJson.requirements,
          stretchLevel,
        }),
      });
      const matchJson = (await matchResp.json()) as
        | { ok: true; matches: Match[] }
        | { ok: false; stage: string; detail?: string };
      if (genRef.current !== myGen) return; // superseded — drop response
      if (!matchJson.ok) {
        setLoading({
          kind: "error",
          message: `Matcher ${matchJson.stage}: ${matchJson.detail ?? "unknown error"}`,
        });
        return;
      }
      setLive({
        jdHash: parseJson.jdHash,
        requirements: parseJson.requirements,
        matchesByLevel: { [stretchLevel]: matchJson.matches },
      });
      setActiveKey("");
      setScored(true);
      setLoading({ kind: "idle" });
    } catch (err) {
      if (genRef.current !== myGen) return;
      setLoading({ kind: "error", message: `network: ${(err as Error).message}` });
    }
  };

  /** Refetch matches on stretch level change for live (pasted) JDs only. */
  useEffect(() => {
    if (!live) return;
    if (live.matchesByLevel[stretchLevel]) return;
    // Don't piggyback on parsing/matching — and don't re-fire on every error
    // transition, which previously thrashed Matching… ↔ error message.
    if (loading.kind === "parsing" || loading.kind === "matching" || loading.kind === "error") {
      return;
    }

    // Capture generation + level at scheduling time. Fetch resolution must
    // confirm the gen matches and the level it fetched is still current.
    const myGen = ++genRef.current;
    const myLevel = stretchLevel;
    const myJdHash = live.jdHash;
    const myRequirements = live.requirements;

    const t = setTimeout(async () => {
      if (genRef.current !== myGen) return;
      setLoading({ kind: "matching", level: myLevel });
      try {
        const resp = await fetch(MATCH_ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            jdHash: myJdHash,
            requirements: myRequirements,
            stretchLevel: myLevel,
          }),
        });
        const json = (await resp.json()) as
          | { ok: true; matches: Match[] }
          | { ok: false; stage: string; detail?: string };
        if (genRef.current !== myGen) return; // superseded — drop response
        if (!json.ok) {
          setLoading({
            kind: "error",
            message: `Matcher ${json.stage}: ${json.detail ?? "unknown error"}`,
          });
          return;
        }
        setLive((prev) =>
          prev
            ? {
                ...prev,
                matchesByLevel: { ...prev.matchesByLevel, [myLevel]: json.matches },
              }
            : prev,
        );
        setLoading({ kind: "idle" });
      } catch (err) {
        if (genRef.current !== myGen) return;
        setLoading({ kind: "error", message: `network: ${(err as Error).message}` });
      }
    }, MATCH_DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [stretchLevel, live, loading.kind]);

  const onActivate = (chip: ChipModel) => {
    if (chip.cite.length === 0) return;
    const first = chip.cite[0];
    if (!first) return;
    const parsed = parseCite(first);
    if (!parsed) return;
    const selector =
      parsed.kind === "role"
        ? `[data-bullet-id="${parsed.id}"]`
        : `[data-project-id="${parsed.id}"]`;
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
    const pulseRef = parsed.kind === "role" ? parsed.id : `project:${parsed.id}`;
    setPulseId(pulseRef);
    // Cancel any prior pulse-clear timer so back-to-back clicks don't truncate
    // the new pulse early; cleared on unmount via the effect above.
    if (pulseTimerRef.current !== null) {
      clearTimeout(pulseTimerRef.current);
    }
    pulseTimerRef.current = setTimeout(() => {
      setPulseId(null);
      pulseTimerRef.current = null;
    }, 1700);
  };

  const isSamplePicked = activeKey !== "" && live === null;
  const characterCount = jdText.length;
  const charLimit = 10_000;

  return (
    <div>
      {/* Sample JD pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem 0.6rem",
          marginBottom: "0.85rem",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginRight: "0.5rem",
          }}
        >
          Sample JDs /
        </span>
        {samples.map((s) => (
          <SamplePill
            key={s.key}
            active={s.key === activeKey && live === null}
            onClick={() => pickSample(s.key)}
          >
            {s.label}
          </SamplePill>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        className="jd-textarea"
        value={jdText}
        onChange={(e) => {
          setJdText(e.target.value);
          if (e.target.value !== activeSample?.text) {
            setActiveKey("");
            setScored(false);
          }
        }}
        placeholder="Paste a job description here, or pick a sample above…"
        maxLength={charLimit}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          color: "var(--muted)",
          padding: "0.55rem 0.2rem 0",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span style={{ flex: "1 1 360px", minWidth: 0 }}>
          ↳ pasted JDs are sent to a server route to score against the CV; not stored, not shared,
          not logged
        </span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {characterCount.toLocaleString()}{" "}
          <span style={{ color: "var(--muted-2)" }}>/ {charLimit.toLocaleString()}</span>
        </span>
      </div>

      {/* Score button + stretch slider strip */}
      <div className="jd-cta-strip">
        <button
          type="button"
          className="score-btn"
          onClick={handleScore}
          disabled={loading.kind === "parsing" || loading.kind === "matching" || isSamplePicked}
          aria-label="Score this JD"
          title={
            isSamplePicked ? "Sample JDs are pre-scored — paste a custom JD to score live" : ""
          }
        >
          {loading.kind === "parsing"
            ? "Parsing…"
            : loading.kind === "matching"
              ? "Matching…"
              : "Score this JD"}
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </button>
        <StretchSlider value={stretchPosition} onChange={setStretchPosition} />
      </div>

      {loading.kind === "error" && (
        <p
          role="alert"
          style={{
            marginTop: "1rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            color: "var(--accent)",
          }}
        >
          {loading.message}
        </p>
      )}

      {/* Score summary + chip grid */}
      {chips && (
        <div style={{ marginTop: "2.5rem" }}>
          <SummaryLine chips={chips} />
          <div style={{ marginTop: "1.5rem" }}>
            <ChipGrid chips={chips} onActivate={onActivate} onHoverChange={setHoverData} />
          </div>
          <p
            style={{
              marginTop: "1.25rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            <span style={{ color: "var(--hit)" }}>● Hit</span>
            <span aria-hidden="true" style={{ margin: "0 0.6rem", color: "var(--muted-2)" }}>
              ·
            </span>
            <span style={{ color: "var(--stretch)" }}>◐ Stretch</span>
            <span aria-hidden="true" style={{ margin: "0 0.6rem", color: "var(--muted-2)" }}>
              ·
            </span>
            <span style={{ color: "var(--muted)" }}>○ Honest gap</span>
            <span aria-hidden="true" style={{ margin: "0 0.6rem", color: "var(--muted-2)" }}>
              ·
            </span>
            <span>hover for reasoning · click hits to jump · click gaps to expand</span>
          </p>
        </div>
      )}

      {/* Experience section with reorder */}
      <section id="experience" style={{ marginTop: "var(--gap-section)" }}>
        <header className="section-header">
          <span className="kicker">02</span>
          <h2>Experience</h2>
          {chips && (
            <span className="meta">{reorder ? "reordered by relevance" : "original order"}</span>
          )}
        </header>
        {chips && <ReorderToggle on={reorder} onChange={setReorder} />}
        <JDExperience cv={cv} scoredChips={chips} reorder={reorder} pulseId={pulseId} />
      </section>

      <FloatingTooltip data={hoverData} />
    </div>
  );
}
