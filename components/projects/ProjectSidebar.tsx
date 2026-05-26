import Link from "next/link";
import type { Project } from "@/lib/retro-schemas";

type Props = {
  project: Project;
  activeSub?: string;
};

export function ProjectSidebar({ project, activeSub }: Props) {
  if (project.subPages.length === 0) return null;

  const overviewActive = !activeSub;

  return (
    <nav
      className="project-sidebar"
      aria-label={`${project.title} sub-pages`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        padding: "var(--pad-card)",
        background: "var(--card-bg)",
        border: "var(--card-border-width) solid var(--card-border)",
        borderRadius: "var(--radius)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--size-meta)",
        letterSpacing: "var(--tracking-meta)",
      }}
    >
      <div
        style={{
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "0.5rem",
        }}
      >
        {project.title}
      </div>
      <Link
        href={`/projects/${project.slug}`}
        aria-current={overviewActive ? "page" : undefined}
        style={{
          padding: "0.4rem 0",
          color: overviewActive ? "var(--accent)" : "var(--fg)",
          textDecoration: "none",
          borderLeft: overviewActive ? "2px solid var(--accent)" : "2px solid transparent",
          paddingLeft: "0.5rem",
        }}
      >
        Overview
      </Link>
      {project.subPages.map((sub) => {
        const active = activeSub === sub.slug;
        return (
          <Link
            key={sub.slug}
            href={`/projects/${project.slug}/${sub.slug}`}
            aria-current={active ? "page" : undefined}
            style={{
              padding: "0.4rem 0",
              color: active ? "var(--accent)" : "var(--fg)",
              textDecoration: "none",
              borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
              paddingLeft: "0.5rem",
            }}
          >
            {sub.title}
          </Link>
        );
      })}
    </nav>
  );
}
