import Link from "next/link";
import { SectionHeader } from "@/components/cv/SectionHeader";
import { ProjectCard } from "@/components/lab/ProjectCard";
import type { Project } from "@/lib/retro-schemas";

type Props = {
  projectSlugs: readonly string[];
  allProjects: readonly Project[];
};

/**
 * Renders selected projects using the gradient ProjectCard treatment
 * (ADR-0038) so projects appear once on the home page — the Lab section at the
 * foot of the page no longer duplicates the grid. The cards opt into
 * `citeTarget` so the JD matcher's project chips still scroll to and pulse the
 * canonical card here (ADR-0029). The grid stays `cv-projects-grid` so the
 * density slider keeps driving its column count.
 */
export function Projects({ projectSlugs, allProjects }: Props) {
  const bySlug = new Map(allProjects.map((p) => [p.slug, p]));
  const resolved = projectSlugs
    .map((s) => bySlug.get(s))
    .filter((p): p is Project => p !== undefined);

  return (
    <section id="projects" style={{ marginTop: "var(--gap-section)" }}>
      <SectionHeader number="03" title="Selected projects" />
      <div className="cv-projects-grid">
        {resolved.map((project) => (
          <ProjectCard key={project.slug} project={project} citeTarget reveal />
        ))}
      </div>
      <p style={{ marginTop: "var(--gap-item)" }}>
        <Link href="/projects" className="blog-post-back">
          All projects →
        </Link>
      </p>
    </section>
  );
}
