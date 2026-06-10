import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { ProjectTabs } from "@/components/projects/ProjectTabs";
import { blogSanitizeSchema, rehypePullQuote } from "@/lib/blog-sanitize";
import { getProject, getProjectPage, getProjects } from "@/lib/content";

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  return getProjects().projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Not found" };
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const page = getProjectPage(slug);

  return (
    <div className="cv-surface">
      <header className="blog-post-header" data-reveal>
        <div className="blog-post-meta">
          <span>Project</span>
          <span aria-hidden="true">—</span>
          <span>{project.stack}</span>
        </div>
        <h1 className="blog-post-title">{project.title}</h1>
        <p className="blog-post-summary">{project.summary}</p>
      </header>

      <ProjectTabs project={project} />

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

        {project.links.length > 0 && (
          <section style={{ marginTop: "var(--gap-block)" }}>
            <h2 className="blog-h2">Links</h2>
            <ul>
              {project.links.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                  {link.note && <span style={{ color: "var(--muted)" }}> — {link.note}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <footer className="blog-post-footer">
        <Link href="/#projects" className="blog-post-back">
          ← All projects
        </Link>
      </footer>
    </div>
  );
}
