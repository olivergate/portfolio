"use client";

import { useTone } from "@/components/cv/tone-context";

const TICKER_PHRASE = "Satire mode active — these bullets are deliberately ridiculous · ";

export function SatireBanner() {
  const { tone } = useTone();
  if (tone !== "absurd") return null;

  return (
    <div className="satire-banner" role="status" aria-live="polite">
      <span className="satire-banner__chip">SATIRE</span>
      <div className="satire-banner__ticker" aria-hidden="true">
        <span className="satire-banner__track">
          <span>{TICKER_PHRASE.repeat(6)}</span>
          <span>{TICKER_PHRASE.repeat(6)}</span>
        </span>
      </div>
      <span className="satire-banner__hint">switch tone to dismiss</span>
    </div>
  );
}
