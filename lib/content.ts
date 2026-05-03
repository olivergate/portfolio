import { readFileSync } from "node:fs";
import path from "node:path";
import { type CV, CVSchema, type Tone, ToneSchema } from "@/lib/schemas";

let cachedCV: CV | null = null;
let cachedTone: Tone | null = null;

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
