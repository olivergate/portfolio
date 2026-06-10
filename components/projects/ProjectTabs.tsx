import Link from "next/link";
import type { Project } from "@/lib/retro-schemas";

type Props = {
  project: Project;
  activeSub?: string;
};

export function ProjectTabs({ project, activeSub }: Props) {
  if (project.subPages.length === 0) return null;

  const tabs = [
    { slug: "", title: "Overview", href: `/projects/${project.slug}` },
    ...project.subPages.map((sub) => ({
      slug: sub.slug,
      title: sub.title,
      href: `/projects/${project.slug}/${sub.slug}`,
    })),
  ];

  return (
    <nav className="project-tabs" aria-label={`${project.title} sections`}>
      {tabs.map((tab) => {
        const active = (activeSub ?? "") === tab.slug;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="project-tab"
          >
            {tab.title}
          </Link>
        );
      })}
    </nav>
  );
}
