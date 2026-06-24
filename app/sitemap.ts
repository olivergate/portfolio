import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";

const BASE = "https://olivergate.com";

// Blog is intentionally omitted — blog/[slug] pages are robots:noindex by
// constraint. /cv/print is omitted (noindex, phone-bearing PDF source).
// /tone, /jd, /lab are NOT listed — they 308-redirect to anchored sections of
// "/" (ADR-0028), so they're not distinct indexable pages.
const STATIC_PATHS = ["", "/game", "/accessibility", "/projects"];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${BASE}${path || "/"}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const projectEntries = getProjects()
    .projects.filter((p) => p.showOn.lab || p.showOn.cv)
    .map((p) => ({
      url: `${BASE}/projects/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [...staticEntries, ...projectEntries];
}
