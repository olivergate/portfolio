import type { Metadata } from "next";
import { ProjectCard } from "@/components/lab/ProjectCard";
import { RetroDemo } from "@/components/lab/RetroDemo";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Lab: a featured Claude Code retrospective demo. See side projects I'm building above. ",
};

export default function LabPage() {
  const { featured, projects } = getProjects();
  const labProjects = projects.filter((p) => p.showOn.lab);

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
          This formed the basis of my work on claude gui. An attempt to understand deeply how I work
          with LLM's and how I can improve either my prompt writing or the harnass of LLMs in my
          work.
        </p>
      </header>

      <section style={{ marginTop: "var(--gap-section)" }}>
        <RetroDemo featured={featured} />
      </section>

      <section style={{ marginTop: "var(--gap-section)" }}>
        <header className="lab-secondary-header">
          <span className="num">02</span>
          <h2>Side projects</h2>
          <span className="meta">linkouts, not demos</span>
        </header>
        <div className="lab-secondary-grid">
          {labProjects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
