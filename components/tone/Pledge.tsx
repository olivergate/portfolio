import type { TonePledge } from "@/lib/schemas";

type Props = {
  pledge: TonePledge;
  total: number;
};

export function Pledge({ pledge, total }: Props) {
  const numberLabel = `${String(pledge.number).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  return (
    <article
      id={`pledge-${pledge.number}`}
      className="tone-pledge"
      data-reveal
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--gap-item)",
        paddingTop: "var(--gap-block)",
        paddingBottom: "var(--gap-block)",
        borderTop: "var(--rule-weight) solid var(--card-border)",
      }}
    >
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          gap: "0.6rem 1.25rem",
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
          {numberLabel}
        </span>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--size-h3)",
            fontWeight: "var(--weight-h3)",
            letterSpacing: "-0.005em",
            textTransform: "var(--case-h3)",
            color: "var(--fg)",
            margin: 0,
            lineHeight: 1.2,
            textWrap: "balance",
          }}
        >
          {pledge.title}
        </h3>
      </header>

      <p
        style={{
          fontSize: "var(--size-body)",
          lineHeight: "var(--line)",
          color: "var(--fg)",
          maxWidth: "62ch",
          textWrap: "pretty",
          margin: 0,
        }}
      >
        {pledge.text}
      </p>
    </article>
  );
}
