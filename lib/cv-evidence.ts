import "server-only";
import { createHash } from "node:crypto";
import type { Project } from "@/lib/retro-schemas";
import type { CV } from "@/lib/schemas";
import { stableStringify } from "@/lib/stable-stringify";

function resolveProjects(cv: CV, projects: Project[]): Project[] {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  return cv.projectSlugs.map((s) => bySlug.get(s)).filter((p): p is Project => p !== undefined);
}

/**
 * Stable hash over the CV evidence the matcher reads — bullet IDs,
 * bullet text, and project metadata. The CV is now single-voice
 * (ADR-0030 retired the live tone toggle), so the hash is just the prose.
 * Projects are resolved through the canonical projects list (ADR-0034) so
 * the hash covers their current title/summary/stack.
 */
export function computeCVHash(cv: CV, projects: Project[]): string {
  const resolved = resolveProjects(cv, projects);
  const evidence = {
    name: cv.header.name,
    tagline: cv.header.tagline,
    experienceOverview: cv.experienceOverview,
    roles: cv.roles.map((r) => ({
      id: r.id,
      title: r.title,
      company: r.company,
      start: r.start,
      end: r.end,
      summary: r.summary,
      bullets: r.bullets.map((b) => ({ id: b.id, text: b.text })),
      technologies: r.technologies,
    })),
    projects: resolved.map((p) => ({
      slug: p.slug,
      title: p.title,
      stack: p.stack,
      summary: p.summary,
    })),
    skills: cv.skills,
    education: cv.education.map((e) => ({
      id: e.id,
      degree: e.degree,
      school: e.school,
      start: e.start,
      end: e.end,
      notes: e.notes,
    })),
  };
  return createHash("sha256").update(stableStringify(evidence)).digest("hex");
}

/**
 * Compact, prompt-ready representation of the CV's matchable evidence.
 * Each role is rendered as a heading + bullet list with explicit IDs so the
 * matcher can cite "role:opensc-sole-frontend" etc. Projects render with
 * project:<slug> prefix (ADR-0034).
 */
export function formatCVForPrompt(cv: CV, projects: Project[]): string {
  const resolved = resolveProjects(cv, projects);
  const lines: string[] = [];
  lines.push(`# ${cv.header.name}`);
  lines.push(cv.header.tagline);
  lines.push("");
  lines.push("## Experience overview");
  lines.push(cv.experienceOverview);
  lines.push("");
  lines.push("## Roles");
  for (const r of cv.roles) {
    lines.push("");
    lines.push(`### ${r.title} — ${r.company} (${r.start} → ${r.end})`);
    lines.push(`Stack: ${r.technologies.join(", ")}`);
    lines.push(`Summary: ${r.summary}`);
    lines.push("Bullets:");
    for (const b of r.bullets) {
      lines.push(`- [role:${b.id}] ${b.text}`);
    }
  }
  lines.push("");
  lines.push("## Projects");
  for (const p of resolved) {
    lines.push(`- [project:${p.slug}] ${p.title} — ${p.stack}. ${p.summary}`);
  }
  lines.push("");
  lines.push("## Education");
  for (const e of cv.education) {
    lines.push(`- ${e.degree} — ${e.school} (${e.start} → ${e.end})`);
    for (const n of e.notes) lines.push(`  - ${n}`);
  }
  lines.push("");
  lines.push("## Skills");
  lines.push(`Primary: ${cv.skills.primary.join(", ")}`);
  lines.push(`AI/LLM:`);
  for (const s of cv.skills.ai) lines.push(`  - ${s}`);
  lines.push(`Frontend: ${cv.skills.frontend.join(", ")}`);
  lines.push(`Backend: ${cv.skills.backend.join(", ")}`);
  lines.push(`Infra: ${cv.skills.infra.join(", ")}`);
  lines.push(`Leadership:`);
  for (const s of cv.skills.leadership) lines.push(`  - ${s}`);
  return lines.join("\n");
}
