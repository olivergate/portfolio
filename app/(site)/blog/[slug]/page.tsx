import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { BlogBlock } from "@/lib/blog-schemas";
import { getBlog, getBlogPost } from "@/lib/content";

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  return getBlog().posts.map((p) => ({ slug: p.slug }));
}

/**
 * Posts whose title still starts with "TODO" are drafts that have been
 * publicly linked (the FAB "About these sliders" link points at one). To
 * avoid leaking the placeholder string into <title> or search engines, we
 * detect TODO posts and substitute a generic draft title + robots:noindex.
 * The page body still renders so the FAB link doesn't 404.
 */
function isDraftPost(title: string): boolean {
  return title.trimStart().startsWith("TODO");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Not found" };
  if (isDraftPost(post.title)) {
    return {
      title: "Draft",
      description: "Draft post — placeholder content.",
      robots: { index: false, follow: false },
    };
  }
  return { title: post.title, description: post.summary };
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const idx = Number(m) - 1;
  return `${months[idx] ?? m} ${Number(d)}, ${y}`;
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.kind) {
    case "p":
      return <p className="blog-p">{block.text}</p>;
    case "h2":
      return <h2 className="blog-h2">{block.text}</h2>;
    case "list":
      return (
        <ul className="blog-list-block">
          {block.items.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: items are static, ordered prose
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "pull":
      return <blockquote className="blog-pull">{block.text}</blockquote>;
  }
}

/**
 * Cheap heuristic: if the first body block is a paragraph that contains the
 * literal "TODO — opening paragraph" placeholder string from the blog content
 * template, the post is unfinished and we render a DRAFT banner above the
 * article.
 */
function isDraftBody(blocks: readonly BlogBlock[]): boolean {
  const first = blocks[0];
  if (!first || first.kind !== "p") return false;
  return first.text.includes("TODO — opening paragraph");
}

export default async function BlogPostPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const draft = isDraftBody(post.body);

  return (
    <div className="cv-surface">
      {draft && (
        <div
          role="note"
          aria-label="Draft notice"
          style={{
            padding: "0.5rem 1rem",
            marginBottom: "var(--gap-block)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--size-meta)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--accent)",
            borderTop: "1px solid var(--accent)",
            borderBottom: "1px solid var(--accent)",
          }}
        >
          DRAFT — placeholder content
        </div>
      )}

      <header className="blog-post-header" data-reveal>
        <div className="blog-post-meta">
          {post.kicker && <span>{post.kicker}</span>}
          {post.kicker && <span aria-hidden="true">—</span>}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <h1 className="blog-post-title">{post.title}</h1>
        <p className="blog-post-summary">{post.summary}</p>
      </header>

      <article className="blog-post-body">
        {post.body.map((block, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: blocks are static, ordered prose
          <Block key={i} block={block} />
        ))}
      </article>

      <footer className="blog-post-footer">
        <Link href="/blog" className="blog-post-back">
          ← All posts
        </Link>
      </footer>
    </div>
  );
}
