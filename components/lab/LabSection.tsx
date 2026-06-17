import { RetroDemo } from "@/components/lab/RetroDemo";
import type { LabProjects } from "@/lib/retro-schemas";

type Props = { projects: LabProjects };

/**
 * Home-page Lab section. Shows only the featured live demo — the side-projects
 * grid that used to sit below it duplicated the CV's 06 Projects section, so it
 * was removed here (ADR-0038). The standalone /lab route still carries the
 * full side-projects grid.
 */
export function LabSection({ projects }: Props) {
  const { featured } = projects;

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
        <p>A working space. One live demo below, and it runs for real. None of it is finished.</p>
      </header>

      <div style={{ marginTop: "var(--gap-section)" }}>
        <RetroDemo featured={featured} />
      </div>
    </>
  );
}
