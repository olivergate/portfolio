import Link from "next/link";
import { SectionHeader } from "@/components/cv/SectionHeader";
import type { Project } from "@/lib/retro-schemas";

type Props = {
  projectSlugs: readonly string[];
  allProjects: readonly Project[];
};

export function Projects({ projectSlugs, allProjects }: Props) {
  const bySlug = new Map(allProjects.map((p) => [p.slug, p]));
  const resolved = projectSlugs
    .map((s) => bySlug.get(s))
    .filter((p): p is Project => p !== undefined);

  return (
    <section id="projects" style={{ marginTop: "var(--gap-section)" }}>
      <SectionHeader number="06" title="Projects" />
      <div className="cv-projects-grid">
        {resolved.map((project, i) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            data-reveal
            data-project-id={project.slug}
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
              textDecoration: "none",
              color: "inherit",
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
              {project.summary}
            </p>
            <span
              aria-hidden="true"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--size-meta)",
                letterSpacing: "var(--tracking-meta)",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginTop: "0.5rem",
              }}
            >
              Read more →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
