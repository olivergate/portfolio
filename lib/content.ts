import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { type Blog, BlogFrontmatterSchema, type BlogPost } from "@/lib/blog-schemas";
import { type SampleJDs, SampleJDsSchema } from "@/lib/jd-schemas";
import { type LabProjects, LabProjects as LabProjectsSchema } from "@/lib/retro-schemas";
import { type CV, CVSchema, type Tone, ToneSchema } from "@/lib/schemas";

let cachedCV: CV | null = null;
let cachedTone: Tone | null = null;
let cachedSampleJDs: SampleJDs | null = null;
let cachedProjects: LabProjects | null = null;
let cachedBlog: Blog | null = null;

export function getCV(): CV {
  if (cachedCV) return cachedCV;
  const filePath = path.join(process.cwd(), "content", "cv.json");
  const raw = readFileSync(filePath, "utf8");
  const parsed = CVSchema.parse(JSON.parse(raw));
  cachedCV = parsed;
  return parsed;
}

export function getTone(): Tone {
  if (cachedTone) return cachedTone;
  const filePath = path.join(process.cwd(), "content", "tone.json");
  const raw = readFileSync(filePath, "utf8");
  const parsed = ToneSchema.parse(JSON.parse(raw));
  cachedTone = parsed;
  return parsed;
}

export function getSampleJDs(): SampleJDs {
  if (cachedSampleJDs) return cachedSampleJDs;
  const filePath = path.join(process.cwd(), "content", "sample-jds.json");
  const raw = readFileSync(filePath, "utf8");
  const parsed = SampleJDsSchema.parse(JSON.parse(raw));
  cachedSampleJDs = parsed;
  return parsed;
}

export function getProjects(): LabProjects {
  if (cachedProjects) return cachedProjects;
  const filePath = path.join(process.cwd(), "content", "projects.json");
  const raw = readFileSync(filePath, "utf8");
  const parsed = LabProjectsSchema.parse(JSON.parse(raw));
  cachedProjects = parsed;
  return parsed;
}

const BLOG_DIR = path.join("content", "blog-drafts");

export function getBlog(): Blog {
  if (cachedBlog) return cachedBlog;
  const dir = path.join(process.cwd(), BLOG_DIR);
  const includeDrafts = process.env.NODE_ENV !== "production";
  const files = readdirSync(dir).filter(
    (f) => f.endsWith(".md") && f !== "README.md" && !f.startsWith("_"),
  );
  const posts: BlogPost[] = [];
  for (const file of files) {
    const filePath = path.join(dir, file);
    const raw = readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    if (data.date instanceof Date) {
      data.date = data.date.toISOString().slice(0, 10);
    }
    const fm = BlogFrontmatterSchema.parse(data);
    const expectedFile = `${fm.slug}.md`;
    if (file !== expectedFile) {
      throw new Error(
        `Blog filename ${file} does not match slug ${fm.slug} (expected ${expectedFile})`,
      );
    }
    if (!includeDrafts && fm.status !== "published") continue;
    posts.push({ ...fm, bodyMd: content });
  }
  cachedBlog = { posts };
  return cachedBlog;
}

export function getBlogPost(slug: string): BlogPost | null {
  return getBlog().posts.find((p) => p.slug === slug) ?? null;
}
