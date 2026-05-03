"use client";

type Props = {
  on: boolean;
  onChange: (next: boolean) => void;
};

export function ReorderToggle({ on, onChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.85rem 1.25rem",
        padding: "0.85rem 1rem",
        background: "var(--card-bg)",
        border: "1px solid var(--rule-soft)",
        marginBottom: "1.5rem",
      }}
    >
      <button
        type="button"
        className="jd-switch"
        role="switch"
        aria-checked={on}
        aria-label="Reorder bullets by relevance to this JD"
        onClick={() => onChange(!on)}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 200 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "1rem",
            lineHeight: 1.2,
          }}
        >
          {on ? "Reordered by relevance to this JD" : "Original order"}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.66rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          {on
            ? "Hits float up · cited bullets marked"
            : "The CV as written — the truth, in date order"}
        </span>
      </div>
      {on && (
        <button
          type="button"
          onClick={() => onChange(false)}
          style={{
            background: "transparent",
            border: "1px solid var(--rule)",
            padding: "8px 14px",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--fg)",
          }}
        >
          Restore original
        </button>
      )}
    </div>
  );
}
