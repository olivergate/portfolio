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
      style={{
        paddingTop: "var(--gap-item)",
        paddingBottom: "var(--gap-item)",
        borderTop: "var(--rule-weight) solid var(--card-border)",
      }}
    >
      <h4
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
      </h4>
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
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 0,
                  top: "calc(var(--line) * 0.5em)",
                  transform: "translateY(-50%)",
                  width: "0.5rem",
                  height: "1px",
                  background: "var(--fg)",
                }}
              />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem 0.6rem",
            alignItems: "baseline",
          }}
        >
          {block.items.map((item) => (
            <span
              key={item}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--size-meta)",
                padding: "0.3rem 0.55rem",
                border: "1px solid var(--card-border)",
                borderRadius: "var(--radius-chip)",
                color: "var(--fg)",
                letterSpacing: "0.04em",
              }}
            >
              {item}
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
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
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
