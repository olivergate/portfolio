import { ProjectCard } from "@/components/lab/ProjectCard";
import { RetroDemo } from "@/components/lab/RetroDemo";
import type { LabProjects } from "@/lib/retro-schemas";

type Props = { projects: LabProjects };

export function LabSection({ projects }: Props) {
  const { featured, secondary } = projects;

  return (
    <>
      <header className="lab-hero" data-reveal>
        <div className="lab-hero-meta">
          <span>Lab</span>
          <span aria-hidden="true">—</span>
          <span>Updated weekly</span>
        </div>
        <h2>
          Things I'm building <em>with LLMs</em>
        </h2>
        <p>
          A working space — one fully live demo at the top, three side projects below. Everything
          here is in flight; nothing is finished. That's the point.
        </p>
      </header>

      <div style={{ marginTop: "var(--gap-section)" }}>
        <RetroDemo featured={featured} />
      </div>

      <div style={{ marginTop: "var(--gap-section)" }}>
        <header className="lab-secondary-header">
          <span className="num">02</span>
          <h3>Side projects</h3>
          <span className="meta">linkouts, not demos</span>
        </header>
        <div className="lab-secondary-grid">
          {secondary.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </div>
    </>
  );
}
