import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { blogSanitizeSchema, rehypePullQuote } from "@/lib/blog-sanitize";
import { getBlog, getBlogPost } from "@/lib/content";

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  return getBlog().posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Not found" };
  if (post.status !== "published") {
    return {
      title: "Draft",
      description: "Draft post, not yet published.",
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

export default async function BlogPostPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const draft = post.status !== "published";

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
          DRAFT — {post.status}
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
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypePullQuote, [rehypeSanitize, blogSanitizeSchema]]}
        >
          {post.bodyMd}
        </Markdown>
      </article>

      <footer className="blog-post-footer">
        <Link href="/blog" className="blog-post-back">
          ← All posts
        </Link>
      </footer>
    </div>
  );
}
