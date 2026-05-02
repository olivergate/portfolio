import { readFileSync } from "node:fs";
import path from "node:path";
import { type CV, CVSchema } from "@/lib/schemas";

let cached: CV | null = null;

export function getCV(): CV {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "content", "cv.json");
  const raw = readFileSync(filePath, "utf8");
  const parsed = CVSchema.parse(JSON.parse(raw));
  cached = parsed;
  return parsed;
}
