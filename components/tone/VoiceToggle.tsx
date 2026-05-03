"use client";

import { useEffect, useState } from "react";

export type Voice = "both" | "personal";

const STORAGE_KEY = "tone-voice";

/**
 * Reads/writes the data-voice attribute on the .tone-manifesto root so the
 * Tenet grid can collapse/expand its formal column via CSS. Plain useState +
 * sessionStorage — no URL state (Phase 2 spec marks persistence out of scope,
 * but a within-tab carry-over is friendly and free).
 */
export function VoiceToggle() {
  const [voice, setVoice] = useState<Voice>("both");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored === "personal" || stored === "both") setVoice(stored);
    } catch {
      // sessionStorage may be unavailable (privacy mode); defaults to "both".
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.querySelector<HTMLElement>(".tone-manifesto");
    if (root) root.dataset.voice = voice;
    try {
      sessionStorage.setItem(STORAGE_KEY, voice);
    } catch {
      // ignore
    }
  }, [voice, mounted]);

  return (
    <div
      role="tablist"
      aria-label="Voice"
      className="tone-voice-toggle"
      style={{
        display: "inline-grid",
        gridAutoFlow: "column",
        gap: 0,
        background: "var(--card-bg)",
        border: "var(--rule-weight) solid var(--card-border)",
        borderRadius: "var(--radius-control, 999px)",
        padding: "4px",
        position: "relative",
      }}
    >
      <ToggleButton
        active={voice === "both"}
        onClick={() => setVoice("both")}
        label="Both voices"
      />
      <ToggleButton
        active={voice === "personal"}
        onClick={() => setVoice("personal")}
        label="My voice only"
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        appearance: "none",
        border: 0,
        background: active ? "var(--fg)" : "transparent",
        color: active ? "var(--bg)" : "var(--fg)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--size-meta)",
        letterSpacing: "var(--tracking-meta)",
        textTransform: "uppercase",
        padding: "0.55rem 1rem",
        borderRadius: "999px",
        cursor: "pointer",
        transition:
          "background-color var(--motion-base) var(--ease-out), color var(--motion-base) var(--ease-out)",
      }}
    >
      {label}
    </button>
  );
}
