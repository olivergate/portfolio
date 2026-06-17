import type { Metadata } from "next";
import { RetroDemo } from "@/components/lab/RetroDemo";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "A live Claude Code retrospective demo: paste a session transcript and it synthesises a structured retro.",
};

// Demo-only page. The side-projects grid that used to sit below the demo was
// removed — projects now live solely in the CV's 06 Projects section (ADR-0040,
// reversing the "/lab keeps its grid" consequence of ADR-0038).
export default function LabPage() {
  const { featured } = getProjects();

  return (
    <div className="cv-surface">
      <header className="lab-hero" data-reveal>
        <div className="lab-hero-meta">
          <span>Oliver Kaikane Gate</span>
          <span aria-hidden="true">—</span>
          <span>Lab</span>
          <span aria-hidden="true">—</span>
          <span>Updated weekly</span>
        </div>
        <h1>
          Retro Claude <em>Demo</em>
        </h1>
        <p>
          This formed the basis of my work on Claude GUI. An attempt to understand deeply how I work
          with LLMs and how I can improve either my prompt writing or the harness of LLMs in my
          work.
        </p>
      </header>

      <section style={{ marginTop: "var(--gap-section)" }}>
        <RetroDemo featured={featured} />
      </section>
    </div>
  );
}
