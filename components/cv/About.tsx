import { SectionHeader } from "@/components/cv/SectionHeader";
import type { CV } from "@/lib/schemas";

type Props = { about: CV["about"] };

export function About({ about }: Props) {
  return (
    <section id="about" style={{ marginTop: "var(--gap-section)" }}>
      <SectionHeader number="01" title="Personal" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--gap-item)",
          maxWidth: "68ch",
        }}
      >
        {about.paragraphs.map((paragraph, i) => (
          <p
            // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs are static, ordered prose
            key={i}
            style={{
              fontSize: "var(--size-body)",
              lineHeight: "var(--line)",
              color: "var(--fg)",
              textWrap: "pretty",
              margin: 0,
            }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
