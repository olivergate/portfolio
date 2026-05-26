import Link from "next/link";
import type { Project } from "@/lib/retro-schemas";

type Props = {
  project: Project;
};

/**
 * Server component card for the project linkouts on /lab. Gradient hero with
 * glyph + "project / personal" pill, body with title + tech pills + summary,
 * mono CTA with arrow that translates on hover. Links to /projects/[slug]
 * (ADR-0034) where the full page lives.
 */
export function ProjectCard({ project }: Props) {
  const gradient = project.gradient
    ? project.gradient.via
      ? `linear-gradient(135deg, ${project.gradient.from} 0%, ${project.gradient.via} 60%, ${project.gradient.to} 100%)`
      : `linear-gradient(135deg, ${project.gradient.from} 0%, ${project.gradient.to} 100%)`
    : "linear-gradient(135deg, var(--muted-2) 0%, var(--card-border) 100%)";
  const titleId = `lab-card-title-${project.slug}`;
  const ctaLabel = project.subPages.length > 0 ? "Open project" : "Read writeup";

  return (
    <Link className="lab-card" href={`/projects/${project.slug}`} aria-labelledby={titleId}>
      <div className="lab-card-hero" style={{ background: gradient }}>
        {project.glyph && (
          <span className="glyph" aria-hidden="true">
            {project.glyph}
          </span>
        )}
        <span className="pill">Project / personal</span>
      </div>
      <div className="lab-card-body">
        <h3 id={titleId}>{project.title}</h3>
        <div className="lab-card-pills" aria-hidden="true">
          {project.techPills.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <p className="lab-card-blurb">{project.summary}</p>
        <span className="lab-card-cta" aria-hidden="true">
          {ctaLabel}
          <span className="lab-card-cta-arrow">→</span>
        </span>
      </div>
    </Link>
  );
}
