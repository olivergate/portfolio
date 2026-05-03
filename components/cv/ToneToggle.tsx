"use client";

import { useTone } from "@/components/cv/tone-context";
import type { CVTone } from "@/lib/schemas";

type ToneOption = {
  id: CVTone;
  name: string;
  desc: string;
  thumbClass: string;
};

const TONES: readonly ToneOption[] = [
  { id: "pessimistic", name: "Pessimistic", desc: "Self-aware", thumbClass: "tone-thumb--pessimistic" },
  { id: "honest", name: "Honest", desc: "As written", thumbClass: "tone-thumb--honest" },
  { id: "absurd", name: "Absurd", desc: "Satire", thumbClass: "tone-thumb--absurd" },
] as const;

export function ToneToggle() {
  const { tone, setTone } = useTone();
  const idx = Math.max(
    0,
    TONES.findIndex((t) => t.id === tone),
  );
  const current = TONES[idx] ?? TONES[1];
  if (!current) throw new Error("ToneToggle: TONES is empty (unreachable)");

  return (
    <section
      id="tone-toggle"
      data-reveal
      style={{ marginTop: "var(--gap-section)" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "1rem",
          marginBottom: "0.85rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--size-meta)",
            letterSpacing: "var(--tracking-meta)",
            textTransform: "uppercase",
            color: "var(--muted)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          03 / Tone
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--size-h2)",
            fontWeight: "var(--weight-h2)",
            letterSpacing: "var(--tracking-h2)",
            margin: 0,
            lineHeight: "var(--line-tight)",
            color: "var(--fg)",
            textWrap: "balance",
          }}
        >
          How would you like the bullets framed?
        </h2>
      </div>

      <div className={`tone-toggle tone-toggle--${current.id}`} role="tablist" aria-label="CV bullet voice">
        <span
          className={`tone-thumb ${current.thumbClass}`}
          style={{ left: `calc(6px + ${idx} * (100% - 12px) / 3)` }}
          aria-hidden="true"
        />
        {TONES.map((t) => {
          const selected = t.id === tone;
          return (
            <button
              type="button"
              key={t.id}
              role="tab"
              aria-selected={selected}
              aria-controls="experience"
              tabIndex={selected ? 0 : -1}
              className="tone-btn"
              data-selected={selected ? "true" : "false"}
              onClick={() => setTone(t.id)}
            >
              <span className="tone-name">{t.name}</span>
              <span className="tone-desc">{t.desc}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
