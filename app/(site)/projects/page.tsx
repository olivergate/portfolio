import type { Metadata } from "next";
import { ProjectCard } from "@/components/lab/ProjectCard";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Five things I've built, with screenshots and notes on how they work.",
};

export default function ProjectsPage() {
  return (
    <div className="cv-surface">
      <header className="blog-post-header">
        <h1 className="blog-post-title">Projects</h1>
        <p className="blog-post-summary">
          These are things I wanted to use, so I built them. Each page has a short overview and
          notes on how it works.
        </p>
      </header>
      <h2 id="project-overviews" className="sr-only">
        Project overviews
      </h2>
      <ul className="cv-projects-grid list-none p-0" aria-labelledby="project-overviews">
        {getProjects().projects.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
}
