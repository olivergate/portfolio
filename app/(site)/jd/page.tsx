import type { Metadata } from "next";
import { SectionHeader } from "@/components/cv/SectionHeader";
import { JDAdapter } from "@/components/jd/JDAdapter";
import { getCV, getSampleJDs } from "@/lib/content";

export const metadata: Metadata = {
  title: "JD adapter",
  description:
    "Paste a job description, get a chip grid of hits, stretches, and honest gaps. Conservative-bias matching: every Hit cites the supporting bullet.",
};

export default function JDPage() {
  const cv = getCV();
  const samples = getSampleJDs();

  return (
    <div>
      <header
        style={{
          paddingBottom: "1.5rem",
          borderBottom: "var(--rule-weight) solid var(--rule)",
          marginBottom: "var(--gap-block)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem 1.25rem",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--size-meta)",
            letterSpacing: "var(--tracking-meta)",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "0.85rem",
          }}
        >
          <span>CV / 2026</span>
          <span aria-hidden="true">—</span>
          <span>{cv.header.location}</span>
          <span aria-hidden="true">—</span>
          <span>JD adapter</span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-display)",
            fontSize: "var(--size-h1)",
            letterSpacing: "var(--tracking-h1)",
            lineHeight: 0.95,
            margin: 0,
            textWrap: "balance",
          }}
        >
          {cv.header.name}
        </h1>
        <p
          style={{
            marginTop: "1.25rem",
            fontSize: "var(--size-tagline)",
            maxWidth: "60ch",
            textWrap: "pretty",
          }}
        >
          {cv.header.tagline}
        </p>
      </header>

      <SectionHeader number="01" title="Score this CV against a job" />
      <p
        style={{
          maxWidth: "68ch",
          marginBottom: "1.5rem",
          textWrap: "pretty",
          color: "var(--fg-soft)",
        }}
      >
        Paste a JD. The page will highlight which requirements I&rsquo;d land cleanly, where
        I&rsquo;d stretch, and where I&rsquo;d be honest about a gap. The slider tunes the matching
        threshold; if you&rsquo;re reading conservatively, drag it left.
      </p>

      <JDAdapter samples={samples} />
    </div>
  );
}
