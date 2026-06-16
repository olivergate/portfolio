import { SectionHeader } from "@/components/cv/SectionHeader";
import type { Project } from "@/lib/retro-schemas";

type Props = {
  projectSlugs: readonly string[];
  allProjects: readonly Project[];
};

// Compact, print-only Projects. The web <Projects> renders full clickable cards with
// a "Read more →" affordance that is meaningless in a PDF and runs the doc to a third
// page. This collapses each project to title — stack — one-line summary so all five
// fit on page 2 while staying single-column and fully text-extractable.
export function ProjectsPrint({ projectSlugs, allProjects }: Props) {
  const bySlug = new Map(allProjects.map((p) => [p.slug, p]));
  const resolved = projectSlugs
    .map((s) => bySlug.get(s))
    .filter((p): p is Project => p !== undefined);

  return (
    <section id="projects" style={{ marginTop: "var(--gap-section)" }}>
      <SectionHeader number="06" title="Projects" />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-block)" }}>
        {resolved.map((project) => (
          <div key={project.slug} style={{ breakInside: "avoid" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
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
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--size-meta)",
                  color: "var(--muted)",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                olivergate.com/projects/{project.slug}
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--size-meta)",
                color: "var(--muted)",
                letterSpacing: "0.04em",
                marginTop: "0.15rem",
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
                margin: "0.2rem 0 0",
              }}
            >
              {project.summary}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
