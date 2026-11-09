import { RetroDemo } from "@/components/lab/RetroDemo";
import type { LabProjects } from "@/lib/retro-schemas";

type Props = { projects: LabProjects };

export function LabSection({ projects }: Props) {
  const { featured } = projects;

  return (
    <>
      <header className="lab-hero" data-reveal>
        <div className="lab-hero-meta">
          <span>Lab</span>
        </div>
        <h2>
          Things I'm building <em>with LLMs</em>
        </h2>
        <p>Try the demo below. I use the same kind of session review on my own work.</p>
      </header>

      <div style={{ marginTop: "var(--gap-section)" }}>
        <RetroDemo featured={featured} />
      </div>
    </>
  );
}
