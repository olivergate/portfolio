import type { MetadataRoute } from "next";

const BASE = "https://olivergate.com";

// AI assistant / answer-engine crawlers. The site is RSC-first (full CV ships in
// raw HTML), and its whole thesis is AI-native work — so we explicitly welcome the
// crawlers that read pages to answer questions about a person. Disallow the API
// routes and the phone-bearing /cv/print source page everywhere.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

const DISALLOW = ["/api/", "/cv/print"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
