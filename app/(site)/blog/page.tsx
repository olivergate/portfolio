import type { Metadata } from "next";
import Link from "next/link";
import { getBlog } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on UX, AI tooling, and the build process behind this portfolio.",
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const idx = Number(m) - 1;
  return `${months[idx] ?? m} ${Number(d)}, ${y}`;
}

export default function BlogIndexPage() {
  const { posts } = getBlog();
  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main className="cv-surface">
      <header className="blog-hero" data-reveal>
        <div className="blog-hero-meta">
          <span>Blog</span>
          <span aria-hidden="true">—</span>
          <span>{posts.length} {posts.length === 1 ? "post" : "posts"}</span>
        </div>
        <h1>
          Notes <em>in flight</em>
        </h1>
        <p>
          Working notes on UX, AI tooling, and the build process behind this portfolio.
          Everything here is a draft until it isn&rsquo;t.
        </p>
      </header>

      <ul className="blog-list">
        {sorted.map((post) => (
          <li key={post.slug} className="blog-card" data-reveal>
            <Link href={`/blog/${post.slug}`} className="blog-card-link">
              <div className="blog-card-meta">
                {post.kicker && <span className="blog-card-kicker">{post.kicker}</span>}
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </div>
              <h2>{post.title}</h2>
              <p>{post.summary}</p>
              <span className="blog-card-arrow" aria-hidden="true">
                Read →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
