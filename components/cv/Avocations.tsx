import { SectionHeader } from "@/components/cv/SectionHeader";
import type { CV } from "@/lib/schemas";

type Props = { avocations: CV["avocations"] };

export function Avocations({ avocations }: Props) {
  return (
    <section id="avocations" style={{ marginTop: "var(--gap-section)" }}>
      <SectionHeader number="07" title="Outside work" />
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.6rem 0.8rem",
        }}
      >
        {avocations.map((item) => (
          <li
            key={item}
            data-reveal
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--size-h3)",
              fontWeight: "var(--weight-h3)",
              textTransform: "var(--case-h3)",
              fontStyle: "var(--avocation-style, normal)",
              color: "var(--fg)",
              padding: "0.4rem 0.9rem",
              border: "var(--rule-weight) solid var(--rule)",
              borderRadius: "var(--radius-chip)",
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
