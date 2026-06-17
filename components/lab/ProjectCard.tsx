import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/retro-schemas";

type Props = {
  project: Project;
  /**
   * Render `data-project-id` so the JD matcher can scroll to and pulse this
   * card (ADR-0029). Only the CV's 06 Projects section opts in — it is the
   * single canonical home for project-citation targets (ADR-0038).
   */
  citeTarget?: boolean;
  /** Opt into the scroll-reveal animation used by the CV section. */
  reveal?: boolean;
};

/**
 * Server component card for the project linkouts on /lab and the CV's 06
 * Projects section. The hero leads with a screenshot when the project has one
 * (ADR-0039) and otherwise falls back to the gradient + glyph; both carry the
 * "project / personal" pill. Body has title + tech pills + summary, mono CTA
 * with arrow that translates on hover. Links to /projects/[slug] (ADR-0034)
 * where the full page lives.
 */
export function ProjectCard({ project, citeTarget = false, reveal = false }: Props) {
  const gradient = project.gradient
    ? project.gradient.via
      ? `linear-gradient(135deg, ${project.gradient.from} 0%, ${project.gradient.via} 60%, ${project.gradient.to} 100%)`
      : `linear-gradient(135deg, ${project.gradient.from} 0%, ${project.gradient.to} 100%)`
    : "linear-gradient(135deg, var(--muted-2) 0%, var(--card-border) 100%)";
  const titleId = `lab-card-title-${project.slug}`;
  const ctaLabel = project.subPages.length > 0 ? "Open project" : "Read writeup";

  return (
    <Link
      className="lab-card"
      href={`/projects/${project.slug}`}
      aria-labelledby={titleId}
      data-project-id={citeTarget ? project.slug : undefined}
      data-reveal={reveal || undefined}
    >
      {project.image ? (
        <div className="lab-card-hero has-image">
          <Image
            className="lab-card-shot"
            src={project.image.src}
            alt={project.image.alt}
            fill
            sizes="(max-width: 720px) 100vw, 440px"
          />
          <span className="pill">Project / personal</span>
        </div>
      ) : (
        <div className="lab-card-hero" style={{ background: gradient }}>
          {project.glyph && (
            <span className="glyph" aria-hidden="true">
              {project.glyph}
            </span>
          )}
          <span className="pill">Project / personal</span>
        </div>
      )}
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
