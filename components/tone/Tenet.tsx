import type { ToneTenet } from "@/lib/schemas";

type Props = {
  tenet: ToneTenet;
  total: number;
};

export function Tenet({ tenet, total }: Props) {
  const numberLabel = `${String(tenet.number).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  return (
    <article
      id={`tenet-${tenet.number}`}
      className="tone-tenet"
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
          {tenet.title}
        </h3>
      </header>

      <div className="tone-grid">
        <div className="tone-voice tone-voice--formal">
          <span
            aria-hidden="true"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.66rem",
              letterSpacing: "var(--tracking-meta)",
              textTransform: "uppercase",
              color: "var(--muted)",
              display: "block",
              marginBottom: "0.4rem",
            }}
          >
            Formal
          </span>
          <p
            style={{
              fontSize: "var(--size-body)",
              lineHeight: "var(--line)",
              color: "var(--fg)",
              maxWidth: "44ch",
              textWrap: "pretty",
              margin: 0,
            }}
          >
            {tenet.formal}
          </p>
        </div>

        <div className="tone-divider" aria-hidden="true" />

        <div className="tone-voice tone-voice--personal">
          <span
            aria-hidden="true"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.66rem",
              letterSpacing: "var(--tracking-meta)",
              textTransform: "uppercase",
              color: "var(--muted)",
              display: "block",
              marginBottom: "0.4rem",
            }}
          >
            Personal
          </span>
          <p
            style={{
              fontSize: "var(--size-body)",
              lineHeight: "var(--line)",
              color: "var(--fg)",
              maxWidth: "44ch",
              textWrap: "pretty",
              margin: 0,
              fontStyle: "var(--personal-style, normal)",
            }}
          >
            {tenet.personal}
          </p>
        </div>
      </div>
    </article>
  );
}
