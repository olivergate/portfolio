import { BulletMarker } from "@/components/cv/BulletMarker";
import { SectionHeader } from "@/components/cv/SectionHeader";
import type { CV } from "@/lib/schemas";

type SkillBlock = {
  title: string;
  items: string[];
  asList?: boolean;
};

function buildBlocks(skills: CV["skills"]): SkillBlock[] {
  return [
    { title: "Primary stack", items: skills.primary },
    { title: "AI / LLM (currently focused)", items: skills.ai, asList: true },
    { title: "Frontend", items: skills.frontend },
    { title: "Backend", items: skills.backend },
    { title: "Infrastructure & DevOps", items: skills.infra },
    { title: "Leadership", items: skills.leadership, asList: true },
  ];
}

function Block({ block }: { block: SkillBlock }) {
  return (
    <div
      data-reveal
      style={{
        paddingTop: "var(--gap-item)",
        paddingBottom: "var(--gap-item)",
        borderTop: "var(--rule-weight) solid var(--card-border)",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--size-meta)",
          letterSpacing: "var(--tracking-meta)",
          textTransform: "uppercase",
          color: "var(--muted)",
          margin: 0,
          marginBottom: "0.6rem",
          fontWeight: 500,
        }}
      >
        {block.title}
      </h3>
      {block.asList ? (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.45rem",
          }}
        >
          {block.items.map((item, i) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: skill list items are static prose
              key={i}
              style={{
                fontSize: "var(--size-body)",
                lineHeight: "var(--line)",
                color: "var(--fg)",
                paddingLeft: "1.1rem",
                position: "relative",
              }}
            >
              <BulletMarker size="sm" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--skill-gap, 0.4rem 0.6rem)",
            alignItems: "baseline",
          }}
        >
          {block.items.map((item, i) => (
            <span
              key={item}
              className="skill-chip"
              style={{
                fontFamily: "var(--skill-font, var(--font-mono))",
                fontSize: "var(--skill-size, var(--size-meta))",
                padding: "var(--skill-pad, 0.3rem 0.55rem)",
                border: "var(--skill-border, 1px solid var(--card-border))",
                borderRadius: "var(--radius-chip)",
                color: "var(--fg)",
                background: "var(--chip-bg, transparent)",
                textTransform: "var(--skill-case, none)",
                letterSpacing: "var(--skill-tracking, 0.04em)",
              }}
            >
              {item}
              {i < block.items.length - 1 ? (
                <span
                  aria-hidden="true"
                  style={{
                    display: "var(--skill-sep-display, none)",
                    marginLeft: "0.5rem",
                    color: "var(--muted)",
                  }}
                >
                  ·
                </span>
              ) : null}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

type Props = { skills: CV["skills"] };

export function Skills({ skills }: Props) {
  const blocks = buildBlocks(skills);
  return (
    <section id="skills" style={{ marginTop: "var(--gap-section)" }}>
      <SectionHeader number="05" title="Skills" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(var(--col-count, 1), minmax(0, 1fr))",
          gap: "var(--gap-block) clamp(2rem, 4vw, 3.5rem)",
        }}
      >
        {blocks.map((block) => (
          <Block key={block.title} block={block} />
        ))}
      </div>
    </section>
  );
}
