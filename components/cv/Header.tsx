import type { CV } from "@/lib/schemas";

type Props = { header: CV["header"] };

export function Header({ header }: Props) {
  const { name, tagline, location, contact } = header;
  return (
    <header
      style={{
        paddingTop: "clamp(0.5rem, 2vw, 1.5rem)",
        paddingBottom: "var(--gap-block)",
        borderBottom: "var(--rule-weight) solid var(--rule)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--size-meta)",
          letterSpacing: "var(--tracking-meta)",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "0.85rem",
          display: "flex",
          gap: "0.75rem 1.25rem",
          flexWrap: "wrap",
        }}
      >
        <span>CV / 2026</span>
        <span aria-hidden="true">—</span>
        <span>{location}</span>
        <span aria-hidden="true">—</span>
        <span>Available for senior IC roles</span>
      </div>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--weight-display)",
          fontSize: "var(--size-h1)",
          letterSpacing: "var(--tracking-h1)",
          lineHeight: 0.95,
          color: "var(--fg)",
          textWrap: "balance",
          margin: 0,
        }}
      >
        {name}
      </h1>

      <p
        style={{
          marginTop: "1.25rem",
          fontFamily: "var(--font-body)",
          fontSize: "var(--size-tagline)",
          lineHeight: "var(--line)",
          color: "var(--fg)",
          maxWidth: "60ch",
          textWrap: "pretty",
        }}
      >
        {tagline}
      </p>

      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          gap: "0.5rem 2rem",
          flexWrap: "wrap",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--size-meta)",
          letterSpacing: "0.06em",
          color: "var(--fg)",
        }}
      >
        <span>
          <span style={{ color: "var(--muted)" }}>email </span>
          <a href={`mailto:${contact.email}`} style={{ color: "inherit" }}>
            {contact.email}
          </a>
        </span>
        <span>
          <span style={{ color: "var(--muted)" }}>tel </span>
          {contact.phone}
        </span>
      </div>
    </header>
  );
}
