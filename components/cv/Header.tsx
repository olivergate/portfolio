import type { CV } from "@/lib/schemas";

// "web" = the public, crawlable CV page; "print" = the /cv/print surface the PDF is
// snapshotted from. The phone is intentionally PDF-only (privacy: a crawlable number
// is a scraper magnet — see docs/specs/2026-06-04-cv-pdf-distribution.md), and the
// "Download PDF" affordance only makes sense on the web page, not inside the PDF.
type Props = { header: CV["header"]; variant?: "web" | "print" };

export function Header({ header, variant = "web" }: Props) {
  const { name, tagline, location, contact, availability, links } = header;
  const isPrint = variant === "print";
  return (
    <header
      style={{
        paddingTop: isPrint ? "0" : "clamp(0.5rem, 2vw, 1.5rem)",
        paddingBottom: "var(--gap-block)",
        borderBottom: "var(--rule-weight) solid var(--rule)",
      }}
    >
      <div
        data-reveal
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--size-meta)",
          letterSpacing: "var(--tracking-meta)",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: isPrint ? "0.5rem" : "0.85rem",
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
        data-reveal-display
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--weight-display)",
          fontSize: "var(--size-h1)",
          letterSpacing: "var(--tracking-h1)",
          lineHeight: 0.95,
          color: "var(--fg)",
          textTransform: "var(--case-display)",
          textWrap: "balance",
          margin: 0,
        }}
      >
        {name}
      </h1>

      <p
        data-reveal
        style={{
          marginTop: isPrint ? "0.6rem" : "1.25rem",
          fontFamily: "var(--font-body)",
          fontSize: "var(--size-tagline)",
          lineHeight: "var(--line)",
          color: "var(--fg)",
          maxWidth: "60ch",
          textWrap: "pretty",
          fontStyle: "var(--tagline-style, normal)",
        }}
      >
        {tagline}
      </p>

      {/* Relocation + work-authorization stated up front: a recruiter who can't tell
          whether you'll move or need sponsorship skips you to avoid the hassle.
          Accent-coloured so it reads as a deliberate availability signal, not a
          muted aside. Renders in both the web CV and the PDF. */}
      {availability ? (
        <p
          data-reveal
          style={{
            marginTop: isPrint ? "0.55rem" : "1rem",
            marginBottom: 0,
            fontFamily: "var(--font-mono)",
            fontSize: "var(--size-meta)",
            letterSpacing: "0.05em",
            color: "var(--accent)",
            fontWeight: 500,
          }}
        >
          {availability}
        </p>
      ) : null}

      <div
        data-reveal
        style={{
          marginTop: isPrint ? "0.7rem" : "1.5rem",
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
        {!isPrint && links?.linkedin ? (
          <a href={links.linkedin} style={{ color: "inherit" }}>
            <span style={{ color: "var(--muted)" }}>linkedin </span>↗
          </a>
        ) : null}
        {isPrint ? (
          <span>
            <span style={{ color: "var(--muted)" }}>tel </span>
            {contact.phone}
          </span>
        ) : (
          <a
            href="/oliver-gate-cv.pdf"
            download
            style={{ color: "var(--accent)", textUnderlineOffset: "0.2em" }}
          >
            Download PDF ↓
          </a>
        )}
      </div>
    </header>
  );
}
