import { SectionHeader } from "@/components/cv/SectionHeader";
import type { CV } from "@/lib/schemas";

type Props = { projects: CV["projects"] };

export function Projects({ projects }: Props) {
  return (
    <section id="projects" style={{ marginTop: "var(--gap-section)" }}>
      <SectionHeader number="07" title="Projects" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(var(--proj-cols, 1), minmax(0, 1fr))",
          gap: "var(--gap-block)",
        }}
      >
        {projects.map((project, i) => (
          <article
            key={project.id}
            data-reveal
            className="cv-card"
            style={{
              background: "var(--card-bg)",
              border: "var(--card-border-width) solid var(--card-border)",
              borderRadius: "var(--radius)",
              padding: "var(--pad-card)",
              boxShadow: "var(--shadow)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--size-meta)",
                letterSpacing: "var(--tracking-meta)",
                textTransform: "uppercase",
                color: "var(--muted)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(i + 1).padStart(2, "0")} / project
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--size-h3)",
                fontWeight: "var(--weight-h3)",
                textTransform: "var(--case-h3)",
                color: "var(--fg)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {project.title}
            </h3>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--size-meta)",
                color: "var(--muted)",
                letterSpacing: "0.04em",
              }}
            >
              {project.stack}
            </div>
            <p
              style={{
                fontSize: "var(--size-body)",
                lineHeight: "var(--line)",
                color: "var(--fg)",
                textWrap: "pretty",
                margin: 0,
              }}
            >
              {project.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
