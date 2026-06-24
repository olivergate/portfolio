"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { HoverData } from "@/components/jd/Chip";
import { ChipGrid } from "@/components/jd/ChipGrid";
import {
  type ChipModel,
  chipCounts,
  parseCite,
  projectMatchedChips,
  projectSampleChips,
} from "@/components/jd/chip-models";
import { FloatingTooltip } from "@/components/jd/FloatingTooltip";
import { SamplePill } from "@/components/jd/SamplePill";
import { StretchSlider } from "@/components/jd/StretchSlider";
import { SummaryLine } from "@/components/jd/SummaryLine";
import { LoadingPipeline } from "@/components/ui/LoadingPipeline";
import {
  levelFromPosition,
  type Match,
  type ParsedRequirement,
  positionFromLevel,
  type SampleJD,
  type StretchLevel,
} from "@/lib/jd-schemas";

type Props = {
  samples: SampleJD[];
};

/**
 * Live state for a pasted JD. `matches` carries all three readings per
 * requirement (ADR-0042), so the stretch slider is a pure client-side
 * projection — no refetch when the reading changes.
 */
type LiveState = {
  jdHash: string;
  requirements: ParsedRequirement[];
  matches: Match[];
};

type LoadingState =
  | { kind: "idle" }
  | { kind: "running"; phase: number }
  | { kind: "error"; message: string };

const PARSE_ENDPOINT = "/api/jd-parse";
const MATCH_ENDPOINT = "/api/jd-match";

/**
 * Designed loading pipeline (ADR-0042). The visual cadence is driven by a fixed
 * timer, decoupled from the parse→match fetch chain — same pattern as the /lab
 * retro demo. Cache hits wait for the timer; cold paths wait for the fetch.
 */
const PIPELINE_STEPS = [
  "read job description",
  "extract requirements",
  "match against CV evidence",
  "score strict / balanced / generous",
] as const;
const PIPELINE_STEP_MS = 520;
const PIPELINE_TOTAL_MS = PIPELINE_STEP_MS * PIPELINE_STEPS.length;

export function JDAdapter({ samples }: Props) {
  const [activeKey, setActiveKey] = useState<string>(samples[0]?.key ?? "");
  const activeSample = samples.find((s) => s.key === activeKey) ?? null;

  const [jdText, setJdText] = useState<string>(activeSample?.text ?? "");
  const [scored, setScored] = useState(true);
  const [stretchPosition, setStretchPosition] = useState(0.5);
  const [hoverData, setHoverData] = useState<HoverData | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ kind: "idle" });
  /**
   * Live-region announce text (Phase 4.5). Set imperatively in handleScore at
   * two points (start → "Analyzing…"; success → summary text). Reading changes
   * don't announce — the StretchSlider's own aria-valuetext signals that change,
   * and re-announcing on every drag would be chatter. Errors are announced by
   * the existing role="alert" block below, not by this region.
   */
  const [announce, setAnnounce] = useState<string>("");

  /** Live state populated only when the visitor pasted a JD and clicked Score. */
  const [live, setLive] = useState<LiveState | null>(null);

  /**
   * Generation counter — bumped on every run (Score click, sample pick, edit
   * mid-run). The async fetch closure captures the gen at start; its result is
   * dropped if a newer generation has begun. Prevents stale responses from
   * clobbering current state.
   */
  const genRef = useRef(0);

  /** Pipeline interval id — kept in a ref so successive runs cancel cleanly. */
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Pulse-clear timeout id — kept in a ref so successive clicks don't lose it. */
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Track the currently pulsing element so back-to-back clicks clear cleanly. */
  const pulseElRef = useRef<HTMLElement | null>(null);

  // Cleanup timers + lingering pulse class on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (pulseTimerRef.current !== null) {
        clearTimeout(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
      if (pulseElRef.current) {
        pulseElRef.current.classList.remove("bullet-pulse");
        pulseElRef.current = null;
      }
    };
  }, []);

  const stretchLevel: StretchLevel = levelFromPosition(stretchPosition);

  /**
   * Mirror of the current reading. handleScore is an async closure that
   * captures stretchLevel at click time; if the visitor drags the slider while
   * the score is in flight, the completion announce must reflect the reading
   * the chips actually render at (the latest), not the captured one.
   */
  const stretchLevelRef = useRef<StretchLevel>(stretchLevel);
  useEffect(() => {
    stretchLevelRef.current = stretchLevel;
  }, [stretchLevel]);

  const chips: ChipModel[] | null = useMemo(() => {
    if (!scored) return null;
    // Both paths project the current reading client-side via statusAtLevel —
    // live matches carry all three readings (ADR-0042), exactly like samples.
    if (live) return projectMatchedChips(live.matches, live.requirements, stretchLevel);
    if (activeSample) return projectSampleChips(activeSample.chips, stretchLevel);
    return null;
  }, [scored, live, stretchLevel, activeSample]);

  /** Stop the pipeline timer and supersede any in-flight fetch. */
  const cancelRun = () => {
    genRef.current += 1;
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const pickSample = (key: string) => {
    const sample = samples.find((s) => s.key === key);
    if (!sample) return;
    // Supersede any in-flight run — picking a sample mid-flight must not let a
    // stale response snap the UI back.
    cancelRun();
    setActiveKey(key);
    setJdText(sample.text);
    setScored(true);
    setStretchPosition(positionFromLevel("balanced"));
    setLive(null);
    setLoading({ kind: "idle" });
    // Clear any stale "Scored." announcement from a previous custom run so it
    // doesn't re-announce when this pre-scored sample's chips render.
    setAnnounce("");
  };

  const handleScore = async () => {
    if (loading.kind === "running") return;
    if (jdText.trim().length < 20) {
      setLoading({ kind: "error", message: "JD too short. Paste at least a paragraph." });
      setAnnounce("");
      return;
    }
    const myGen = ++genRef.current;
    if (timerRef.current !== null) clearInterval(timerRef.current);
    setLive(null);
    setLoading({ kind: "running", phase: 0 });
    setAnnounce("Analyzing the job description against the CV. This usually takes a few seconds.");

    // Timer drives the pipeline visual on a fixed cadence, independent of the
    // fetch chain below.
    const timerStart = Date.now();
    let p = 0;
    timerRef.current = setInterval(() => {
      if (genRef.current !== myGen) return;
      p += 1;
      if (p < PIPELINE_STEPS.length) {
        setLoading({ kind: "running", phase: p });
      }
    }, PIPELINE_STEP_MS);

    // Fetch chain (parse → match) runs in parallel with the timer. One match
    // call now returns all three readings.
    const fetchPromise = (async (): Promise<
      { ok: true; live: LiveState } | { ok: false; message: string }
    > => {
      try {
        const parseResp = await fetch(PARSE_ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jdText }),
        });
        const parseJson = (await parseResp.json()) as
          | { ok: true; requirements: ParsedRequirement[]; jdHash: string }
          | { ok: false; stage: string; detail?: string };
        if (!parseJson.ok) {
          return {
            ok: false,
            message: `Parser ${parseJson.stage}: ${parseJson.detail ?? "unknown error"}`,
          };
        }
        const matchResp = await fetch(MATCH_ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jdHash: parseJson.jdHash, requirements: parseJson.requirements }),
        });
        const matchJson = (await matchResp.json()) as
          | { ok: true; matches: Match[] }
          | { ok: false; stage: string; detail?: string };
        if (!matchJson.ok) {
          return {
            ok: false,
            message: `Matcher ${matchJson.stage}: ${matchJson.detail ?? "unknown error"}`,
          };
        }
        return {
          ok: true,
          live: {
            jdHash: parseJson.jdHash,
            requirements: parseJson.requirements,
            matches: matchJson.matches,
          },
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, message: `network: ${message}` };
      }
    })();

    const [result] = await Promise.all([
      fetchPromise,
      new Promise<void>((resolve) =>
        setTimeout(resolve, Math.max(0, PIPELINE_TOTAL_MS - (Date.now() - timerStart))),
      ),
    ]);

    if (genRef.current !== myGen) return; // superseded — drop response
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!result.ok) {
      setLoading({ kind: "error", message: result.message });
      setAnnounce("");
      return;
    }

    setLive(result.live);
    setActiveKey("");
    setScored(true);
    setLoading({ kind: "idle" });

    // Announce the editorial summary at the current reading, same shape
    // SummaryLine renders. Phase 4.5: one announcement on completion. Use the
    // ref, not the captured stretchLevel — the visitor may have dragged the
    // slider during the in-flight score, and the announced counts must match
    // the chips that render.
    const counts = chipCounts(
      projectMatchedChips(result.live.matches, result.live.requirements, stretchLevelRef.current),
    );
    const word = (n: number, s: string, pl: string) => `${n} ${n === 1 ? s : pl}`;
    setAnnounce(
      `Scored. ${word(counts.hit, "hit", "hits")}, ${word(counts.stretch, "stretch", "stretches")}, ${word(counts.miss, "honest gap", "honest gaps")}.`,
    );
  };

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
    // scroll-margin-top in styles/globals.css carries the sticky-nav offset;
    // scrollIntoView respects it without a duplicated magic-number here.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

    // Pulse the canonical CV element directly. ADR-0029 deleted the JD-side
    // duplicate; the only place this element exists now is the CV section
    // up-page, so we toggle the .bullet-pulse class on it without needing
    // a JD context provider feeding state into the CV components.
    if (pulseTimerRef.current !== null) clearTimeout(pulseTimerRef.current);
    if (pulseElRef.current) pulseElRef.current.classList.remove("bullet-pulse");
    // Force a synchronous reflow between remove and add so the browser
    // observes an off→on transition. Without this, back-to-back classList
    // mutations on the same element are batched and @keyframes bullet-pulse
    // does not restart — rapid same-chip clicks would otherwise no-op.
    void el.offsetWidth;
    el.classList.add("bullet-pulse");
    pulseElRef.current = el;
    pulseTimerRef.current = setTimeout(() => {
      el.classList.remove("bullet-pulse");
      if (pulseElRef.current === el) pulseElRef.current = null;
      pulseTimerRef.current = null;
    }, 1700);
  };

  const isSamplePicked = activeKey !== "" && live === null;
  const characterCount = jdText.length;
  const charLimit = 10_000;

  // Phase 4.5 a11y: stable ids for label/describedby wiring.
  const textareaId = useId();
  const sampleLabelId = useId();
  const hintId = useId();
  const charCountId = useId();

  return (
    <div>
      {/*
        Phase 4.5 live region — persistent in the DOM (must exist on first
        render for SRs to subscribe), aria-atomic=false so only the changed
        portion is read. Updated imperatively in handleScore at two points
        (start + completion); never per-token. Errors are announced by the
        role="alert" block further down, not by this region.
      */}
      <div role="status" aria-live="polite" aria-atomic="false" className="sr-only">
        {announce}
      </div>

      {/* Sample JD pills — labelled group so SR users hear "Sample JDs, group"
          before the first pill (Phase 4.5). The pills aren't form controls so
          <fieldset>/<legend> would be the wrong shape (and triggers known
          legend-in-flex layout quirks); ARIA group with aria-labelledby is the
          right semantics. */}
      {/* biome-ignore lint/a11y/useSemanticElements: group of action buttons (not form controls); <fieldset> is the wrong semantic and breaks flex layout of <legend>. */}
      <div
        role="group"
        aria-labelledby={sampleLabelId}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem 0.6rem",
          marginBottom: "0.85rem",
          alignItems: "center",
        }}
      >
        <span
          id={sampleLabelId}
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

      {/* Textarea — visually-hidden label, plus aria-describedby chaining the
          privacy hint and the live char count. Placeholder is kept as a hint
          for sighted users but is not the accessible name. */}
      <label htmlFor={textareaId} className="sr-only">
        Paste a job description
      </label>
      <textarea
        id={textareaId}
        className="jd-textarea"
        value={jdText}
        onChange={(e) => {
          setJdText(e.target.value);
          if (e.target.value !== activeSample?.text) {
            setActiveKey("");
            setScored(false);
          }
          // Editing mid-run supersedes the in-flight score so a stale result
          // can't snap in after the text changed; editing after an error
          // clears the stale alert as the visitor fixes the JD.
          if (loading.kind === "running") {
            cancelRun();
            setLoading({ kind: "idle" });
          } else if (loading.kind === "error") {
            setLoading({ kind: "idle" });
          }
        }}
        placeholder="Paste a job description here, or pick a sample above…"
        maxLength={charLimit}
        aria-describedby={`${hintId} ${charCountId}`}
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
        <span id={hintId} style={{ flex: "1 1 360px", minWidth: 0 }}>
          ↳ pasted JDs are sent to a server route to score against the CV; not stored, not shared,
          not logged
        </span>
        <span id={charCountId} style={{ fontVariantNumeric: "tabular-nums" }}>
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
          disabled={loading.kind === "running" || isSamplePicked}
          aria-label="Score this JD"
          title={isSamplePicked ? "Sample JDs are pre-scored. Paste a custom JD to score live" : ""}
        >
          {loading.kind === "running" ? "Scoring…" : "Score this JD"}
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

      {/* Designed loading pipeline — shown while a custom JD is scoring. The
          live-region announcement is owned by the role="status" region above
          (Analyzing… / Scored.), so the pipeline's own announcer is suppressed
          to avoid two polite regions double-announcing. */}
      {loading.kind === "running" && (
        <div style={{ marginTop: "2.5rem" }}>
          <LoadingPipeline phase={loading.phase} steps={PIPELINE_STEPS} announce={false} />
        </div>
      )}

      {/* Score summary + chip grid */}
      {chips && loading.kind !== "running" && (
        <div style={{ marginTop: "2.5rem" }}>
          <SummaryLine chips={chips} />
          <div style={{ marginTop: "1.5rem" }}>
            <ChipGrid chips={chips} onActivate={onActivate} onHoverChange={setHoverData} />
          </div>
          {/* Visual legend only — each Chip already exposes its category via
              aria-label ("Hit: …", "Stretch: …", "Honest gap: …"), so reading
              this legend would double-announce. Hidden from SRs (Phase 4.5). */}
          <p
            aria-hidden="true"
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
            <span style={{ margin: "0 0.6rem", color: "var(--muted-2)" }}>·</span>
            <span style={{ color: "var(--stretch)" }}>◐ Stretch</span>
            <span style={{ margin: "0 0.6rem", color: "var(--muted-2)" }}>·</span>
            <span style={{ color: "var(--muted)" }}>○ Honest gap</span>
            <span style={{ margin: "0 0.6rem", color: "var(--muted-2)" }}>·</span>
            <span>hover for reasoning · click hits to jump · click gaps to expand</span>
          </p>
        </div>
      )}

      <FloatingTooltip data={hoverData} />
    </div>
  );
}
