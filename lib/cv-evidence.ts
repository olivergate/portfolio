import "server-only";
import { createHash } from "node:crypto";
import type { CV } from "@/lib/schemas";
import { stableStringify } from "@/lib/stable-stringify";

/**
 * Stable hash over the CV evidence the matcher actually reads — bullet IDs,
 * honest-voice bullet text, and project metadata. Tone variants don't affect
 * matching (matcher reads honest only), so they're excluded to keep the cache
 * stable across tone-only edits.
 */
export function computeCVHash(cv: CV): string {
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
      summary: r.summary.honest,
      bullets: r.bullets.map((b) => ({ id: b.id, text: b.text.honest })),
      technologies: r.technologies,
    })),
    projects: cv.projects.map((p) => ({
      id: p.id,
      title: p.title,
      stack: p.stack,
      description: p.description,
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
 * matcher can cite "role:opensc-1" etc. Projects render with project: prefix.
 */
export function formatCVForPrompt(cv: CV): string {
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
    lines.push(`Summary: ${r.summary.honest}`);
    lines.push("Bullets:");
    for (const b of r.bullets) {
      lines.push(`- [role:${b.id}] ${b.text.honest}`);
    }
  }
  lines.push("");
  lines.push("## Projects");
  for (const p of cv.projects) {
    lines.push(`- [project:${p.id}] ${p.title} — ${p.stack}. ${p.description}`);
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
