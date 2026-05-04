import Link from "next/link";
import type { SecondaryProject } from "@/lib/retro-schemas";

type Props = {
  project: SecondaryProject;
};

/**
 * Server component card for the three side projects on /lab. Gradient hero
 * with glyph + "project / personal" pill, body with title + tech pills + blurb,
 * mono CTA with arrow that translates on hover. Linkout-only by design
 * (ADR-0024) — the card is the link, no embedded screens.
 *
 * External URLs (anything starting with "http") get target=_blank +
 * rel=noopener,noreferrer. Internal/anchor URLs stay in-tab.
 */
export function ProjectCard({ project }: Props) {
  const isExternal = /^https?:/.test(project.ctaUrl);
  const gradient = project.gradient.via
    ? `linear-gradient(135deg, ${project.gradient.from} 0%, ${project.gradient.via} 60%, ${project.gradient.to} 100%)`
    : `linear-gradient(135deg, ${project.gradient.from} 0%, ${project.gradient.to} 100%)`;
  const titleId = `lab-card-title-${project.slug}`;

  const inner = (
    <>
      <div className="lab-card-hero" style={{ background: gradient }}>
        <span className="glyph" aria-hidden="true">
          {project.glyph}
        </span>
        <span className="pill">Project / personal</span>
      </div>
      <div className="lab-card-body">
        <h3 id={titleId}>{project.title}</h3>
        <div className="lab-card-pills" aria-hidden="true">
          {project.techPills.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <p className="lab-card-blurb">{project.blurb}</p>
        <span className="lab-card-cta" aria-hidden="true">
          {project.ctaLabel}
          <span className="lab-card-cta-arrow">→</span>
        </span>
      </div>
    </>
  );

  // aria-labelledby points the screen reader at the project title alone, so
  // the link's accessible name is "Language Learning App" rather than the
  // 30-word concatenation of glyph + pill + title + every tech tag + blurb +
  // CTA. Tech pills + CTA are aria-hidden because the title carries the
  // semantic; visually the rest stays.
  if (isExternal) {
    return (
      <a
        className="lab-card"
        href={project.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-labelledby={titleId}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link className="lab-card" href={project.ctaUrl} aria-labelledby={titleId}>
      {inner}
    </Link>
  );
}
