import type { Metadata } from "next";
import { ProjectCard } from "@/components/lab/ProjectCard";
import { RetroDemo } from "@/components/lab/RetroDemo";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Things I'm building with LLMs — featured Claude Code retrospective demo plus three side projects in flight.",
};

export default function LabPage() {
  const { featured, secondary } = getProjects();

  return (
    <main className="cv-surface">
      <header className="lab-hero" data-reveal>
        <div className="lab-hero-meta">
          <span>Oliver Kaikane Gate</span>
          <span aria-hidden="true">—</span>
          <span>Lab</span>
          <span aria-hidden="true">—</span>
          <span>Updated weekly</span>
        </div>
        <h1>
          Things I'm building <em>with LLMs</em>
        </h1>
        <p>
          A working space — one fully live demo at the top, three side projects below. Everything
          here is in flight; nothing is finished. That's the point.
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
          {secondary.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
