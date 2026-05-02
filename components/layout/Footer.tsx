export function Footer() {
  return (
    <footer
      style={{
        marginTop: "var(--gap-section)",
        paddingTop: "var(--gap-block)",
        paddingBottom: "var(--gap-section)",
        borderTop: "var(--rule-weight) solid var(--rule)",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem 2rem",
        justifyContent: "space-between",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--size-meta)",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--muted)",
      }}
    >
      <span>© Oliver Kaikane Gate</span>
      <span>last revised — May 2026</span>
      <span>4 axes · ∞ settings</span>
    </footer>
  );
}
