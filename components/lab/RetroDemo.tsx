"use client";

import { useEffect, useRef, useState } from "react";
import { LiveBadge } from "@/components/lab/LiveBadge";
import { LoadingPipeline } from "@/components/lab/LoadingPipeline";
import { RetroOutput } from "@/components/lab/RetroOutput";
import type { FeaturedProject, RetroResponse } from "@/lib/retro-schemas";

type Props = {
  featured: FeaturedProject;
};

type LoadingState =
  | { kind: "idle" }
  | { kind: "running"; phase: number }
  | { kind: "error"; message: string };

type OutputState =
  | { source: "live"; retro: RetroResponse; sampleLabel: string }
  | { source: "fallback"; retro: RetroResponse; sampleLabel: string };

const PIPELINE_STEP_MS = 520;
const PIPELINE_TOTAL_MS = PIPELINE_STEP_MS * 4;

/**
 * Featured Claude Code retro demo.
 *
 * Pipeline cadence is decoupled from the fetch (per plan): the 4-step visual
 * runs on a fixed timer, the API call runs in parallel, output renders when
 * both have completed. Cache hits wait for the timer; cold paths wait for the
 * fetch.
 *
 * Failure paths render the canned response from the route handler's `fallback`
 * envelope, with a swapped caption ("API call paused — showing a sample
 * retrospective"). ADR-0025.
 */
export function RetroDemo({ featured }: Props) {
  const samples = featured.samples;
  const firstSample = samples[0];
  if (!firstSample) {
    throw new Error("featured.samples must contain at least one entry");
  }

  const [activeSampleId, setActiveSampleId] = useState<string>(firstSample.id);
  const [text, setText] = useState<string>(firstSample.transcript);
  const [loading, setLoading] = useState<LoadingState>({ kind: "idle" });
  const [output, setOutput] = useState<OutputState | null>(null);

  /**
   * Generation counter — bumped on every run / sample-pick / textarea edit.
   * Async closures (timer + fetch) capture gen at start; results are dropped
   * if a newer generation has begun. Same pattern as JDAdapter.
   */
  const genRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSample = samples.find((s) => s.id === activeSampleId) ?? firstSample;

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, []);

  const pickSample = (id: string) => {
    const sample = samples.find((s) => s.id === id);
    if (!sample) return;
    genRef.current += 1;
    if (timerRef.current !== null) clearInterval(timerRef.current);
    setActiveSampleId(id);
    setText(sample.transcript);
    setOutput(null);
    setLoading({ kind: "idle" });
  };

  const runRetro = async () => {
    if (loading.kind === "running") return;
    if (text.trim().length < 20) {
      setLoading({ kind: "error", message: "Transcript too short — paste at least a paragraph." });
      return;
    }
    const myGen = ++genRef.current;
    if (timerRef.current !== null) clearInterval(timerRef.current);
    setOutput(null);
    setLoading({ kind: "running", phase: 0 });

    // Timer drives the pipeline visual.
    const timerStart = Date.now();
    let p = 0;
    timerRef.current = setInterval(() => {
      if (genRef.current !== myGen) return;
      p += 1;
      if (p < 4) {
        setLoading({ kind: "running", phase: p });
      }
    }, PIPELINE_STEP_MS);

    // Fetch runs in parallel.
    const fetchPromise = (async () => {
      try {
        const resp = await fetch("/api/retro", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ transcript: text }),
        });
        const json = (await resp.json()) as
          | { ok: true; retro: RetroResponse; cached: boolean }
          | {
              ok: false;
              stage: string;
              detail?: string;
              fallback?: { sampleId: string; retro: RetroResponse };
            };
        return json;
      } catch (err) {
        return {
          ok: false as const,
          stage: "network" as const,
          detail: (err as Error).message,
        };
      }
    })();

    const [json] = await Promise.all([
      fetchPromise,
      new Promise<void>((resolve) =>
        setTimeout(resolve, PIPELINE_TOTAL_MS - (Date.now() - timerStart)),
      ),
    ]);

    if (genRef.current !== myGen) return;
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (json.ok) {
      setOutput({ source: "live", retro: json.retro, sampleLabel: activeSample.label });
      setLoading({ kind: "idle" });
      return;
    }

    if (json.fallback) {
      setOutput({
        source: "fallback",
        retro: json.fallback.retro,
        sampleLabel: activeSample.label,
      });
      setLoading({ kind: "idle" });
      return;
    }

    setLoading({
      kind: "error",
      message: `${json.stage}: ${json.detail ?? "unknown error"}`,
    });
  };

  return (
    <article className="lab-demo-shell">
      <header className="lab-demo-header">
        <div className="lab-demo-header-text">
          <div className="lab-demo-kicker">
            <span>Featured / 01</span>
            <span className="sep" aria-hidden="true">
              ·
            </span>
            <span>Personal Claude Code Setup</span>
          </div>
          <h2>{featured.title}</h2>
          <p>{featured.blurb}</p>
        </div>
        <LiveBadge />
      </header>

      {/* Sample picker */}
      <div className="lab-sample-row">
        <span className="label">Sample sessions /</span>
        {samples.map((s) => (
          <button
            key={s.id}
            type="button"
            className="lab-sample-pill"
            aria-pressed={s.id === activeSampleId}
            onClick={() => pickSample(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Transcript area */}
      <div className="lab-transcript-wrap">
        <span className="label" aria-hidden="true">
          transcript / editable
        </span>
        <textarea
          className="lab-transcript"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            // Hide stale output as soon as the transcript is edited, AND bump
            // the generation counter + cancel the pipeline timer so any
            // in-flight fetch's resolution drops on the floor — otherwise the
            // user could click Run, edit mid-flight, and see a retro for the
            // pre-edit transcript appear after the fetch returns.
            if (output) setOutput(null);
            if (loading.kind === "running") {
              genRef.current += 1;
              if (timerRef.current !== null) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              setLoading({ kind: "idle" });
            }
          }}
          spellCheck={false}
          aria-label="Claude Code transcript"
        />
      </div>

      {/* Run + meta */}
      <div className="lab-run-row">
        <button
          type="button"
          className="lab-run-btn"
          onClick={runRetro}
          disabled={loading.kind === "running"}
        >
          {loading.kind === "running" ? "Running…" : "Run retro"}
          <span aria-hidden="true">→</span>
        </button>
        <span className="lab-run-meta">
          {text.length.toLocaleString()} chars · sample = {activeSample.label}
        </span>
      </div>

      {loading.kind === "error" && (
        <p className="lab-error" role="alert">
          {loading.message}
        </p>
      )}

      <div style={{ marginTop: "1.75rem" }}>
        {loading.kind === "running" && <LoadingPipeline phase={loading.phase} />}
        {output && loading.kind !== "running" && (
          <RetroOutput
            retro={output.retro}
            sampleLabel={output.sampleLabel}
            source={output.source}
          />
        )}
        {!output && loading.kind === "idle" && (
          <div className="lab-empty">
            Pick a sample, edit if you like, then run a retro to see the output.
          </div>
        )}
      </div>
    </article>
  );
}
