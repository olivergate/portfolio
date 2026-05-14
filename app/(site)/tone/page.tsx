import type { Metadata } from "next";
import { SectionHeader } from "@/components/cv/SectionHeader";
import { Pledge } from "@/components/tone/Pledge";
import { getTone } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tone",
  description:
    "Voice and values manifesto: six positions on how I work, with the trade-offs and concrete examples behind each.",
};

export default function TonePage() {
  const tone = getTone();
  const total = tone.pledges.length;

  return (
    <div className="cv-surface">
      <header
        style={{
          paddingTop: "clamp(0.5rem, 2vw, 1.5rem)",
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
            marginBottom: "0.85rem",
            display: "flex",
            gap: "0.75rem 1.25rem",
            flexWrap: "wrap",
          }}
        >
          <span>CV / 2026</span>
          <span aria-hidden="true">—</span>
          <span>Tone manifesto</span>
          <span aria-hidden="true">—</span>
          <span>{total} pledges</span>
        </div>

        <h1
          data-reveal-display
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-display)",
            fontSize: "var(--size-h1)",
            letterSpacing: "var(--tracking-h1)",
            lineHeight: 0.98,
            color: "var(--fg)",
            textTransform: "var(--case-display)",
            textWrap: "balance",
            margin: 0,
          }}
        >
          Voice &amp; <em style={{ color: "var(--accent)", fontStyle: "italic" }}>values</em>
        </h1>
      </header>

      <section
        id="tone-intro"
        style={{
          marginTop: "var(--gap-section)",
          maxWidth: "62ch",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {tone.intro.paragraphs.map((paragraph, i) => (
          <p
            // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs are static, ordered prose
            key={i}
            data-reveal
            style={{
              fontSize: "var(--size-body)",
              lineHeight: "var(--line)",
              color: "var(--fg)",
              textWrap: "pretty",
              margin: 0,
              marginBottom: i === tone.intro.paragraphs.length - 1 ? 0 : "var(--gap-item)",
              fontStyle: i === 0 ? "var(--lede-style, normal)" : "normal",
            }}
          >
            {paragraph}
          </p>
        ))}
      </section>

      <section id="tone-manifesto" style={{ marginTop: "var(--gap-section)" }}>
        <SectionHeader number="TN-01" title="Manifesto" meta={`${total} pledges`} />
        <div className="tone-manifesto">
          {tone.pledges.map((pledge) => (
            <Pledge key={pledge.number} pledge={pledge} total={total} />
          ))}
        </div>
      </section>

      <section
        id="tone-signature"
        style={{
          marginTop: "var(--gap-section)",
          paddingTop: "var(--gap-block)",
          borderTop: "var(--rule-weight) solid var(--rule)",
          textAlign: "center",
        }}
      >
        <p
          data-reveal
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--size-h3)",
            fontStyle: "italic",
            fontWeight: 400,
            color: "var(--fg)",
            margin: 0,
            textWrap: "balance",
          }}
        >
          {tone.signature.text}
        </p>
      </section>
    </div>
  );
}
