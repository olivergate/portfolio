import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { BlogBlock } from "@/lib/blog-schemas";
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
  return { title: post.title, description: post.summary };
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main className="cv-surface">
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
    </main>
  );
}
