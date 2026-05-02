import { readFileSync } from "node:fs";
import path from "node:path";
import { CVSchema } from "@/lib/schemas";

const filePath = path.join(process.cwd(), "content", "cv.json");

try {
  const raw = readFileSync(filePath, "utf8");
  const parsed = CVSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    console.error("content/cv.json failed validation:");
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join(".") || "<root>"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const ids = new Set<string>();
  for (const role of parsed.data.roles) {
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
    `content/cv.json OK — ${parsed.data.roles.length} roles, ${parsed.data.projects.length} projects, ${parsed.data.education.length} education entries`,
  );
} catch (err) {
  console.error("content validation crashed:", err);
  process.exit(1);
}
