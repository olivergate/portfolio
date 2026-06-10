import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { ProjectTabs } from "@/components/projects/ProjectTabs";
import { blogSanitizeSchema, rehypePullQuote } from "@/lib/blog-sanitize";
import { getProject, getProjectSubPage, getProjects } from "@/lib/content";

type RouteParams = { slug: string; sub: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  const params: RouteParams[] = [];
  for (const project of getProjects().projects) {
    for (const sub of project.subPages) {
      params.push({ slug: project.slug, sub: sub.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug, sub } = await params;
  const project = getProject(slug);
  const subPage = project?.subPages.find((s) => s.slug === sub);
  if (!project || !subPage) return { title: "Not found" };
  return {
    title: `${subPage.title} — ${project.title}`,
    description: project.summary,
  };
}

export default async function ProjectSubPage({ params }: { params: Promise<RouteParams> }) {
  const { slug, sub } = await params;
  const project = getProject(slug);
  const subPage = project?.subPages.find((s) => s.slug === sub);
  if (!project || !subPage) notFound();
  const page = getProjectSubPage(slug, sub);

  return (
    <div className="cv-surface">
      <header className="blog-post-header" data-reveal>
        <div className="blog-post-meta">
          <Link href={`/projects/${project.slug}`} style={{ color: "var(--muted)" }}>
            {project.title}
          </Link>
          <span aria-hidden="true">—</span>
          <span>{subPage.title}</span>
        </div>
        <h1 className="blog-post-title">{subPage.title}</h1>
      </header>

      <ProjectTabs project={project} activeSub={sub} />

      <article className="blog-post-body" style={{ marginTop: "var(--gap-block)" }}>
        {page ? (
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypePullQuote, [rehypeSanitize, blogSanitizeSchema]]}
          >
            {page.bodyMd}
          </Markdown>
        ) : (
          <p>Coming soon.</p>
        )}
      </article>

      <footer className="blog-post-footer">
        <Link href={`/projects/${project.slug}`} className="blog-post-back">
          ← Back to {project.title}
        </Link>
      </footer>
    </div>
  );
}
