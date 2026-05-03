import { readFileSync } from "node:fs";
import path from "node:path";
import { CVSchema, ToneSchema } from "@/lib/schemas";

const cvPath = path.join(process.cwd(), "content", "cv.json");
const tonePath = path.join(process.cwd(), "content", "tone.json");

try {
  const cvRaw = readFileSync(cvPath, "utf8");
  const cv = CVSchema.safeParse(JSON.parse(cvRaw));
  if (!cv.success) {
    console.error("content/cv.json failed validation:");
    for (const issue of cv.error.issues) {
      console.error(`  ${issue.path.join(".") || "<root>"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const ids = new Set<string>();
  for (const role of cv.data.roles) {
    if (ids.has(role.id)) {
      console.error(`duplicate role id: ${role.id}`);
      process.exit(1);
    }
    ids.add(role.id);
    const bulletIds = new Set<string>();
    for (const b of role.bullets) {
      if (bulletIds.has(b.id)) {
        console.error(`duplicate bullet id within role ${role.id}: ${b.id}`);
        process.exit(1);
      }
      bulletIds.add(b.id);
    }
  }

  console.log(
    `content/cv.json OK — ${cv.data.roles.length} roles, ${cv.data.projects.length} projects, ${cv.data.education.length} education entries`,
  );

  const toneRaw = readFileSync(tonePath, "utf8");
  const tone = ToneSchema.safeParse(JSON.parse(toneRaw));
  if (!tone.success) {
    console.error("content/tone.json failed validation:");
    for (const issue of tone.error.issues) {
      console.error(`  ${issue.path.join(".") || "<root>"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const tenetNumbers = new Set<number>();
  for (const t of tone.data.tenets) {
    if (tenetNumbers.has(t.number)) {
      console.error(`duplicate tenet number: ${t.number}`);
      process.exit(1);
    }
    tenetNumbers.add(t.number);
  }

  console.log(`content/tone.json OK — ${tone.data.tenets.length} tenets`);
} catch (err) {
  console.error("content validation crashed:", err);
  process.exit(1);
}
