import { readFileSync } from "node:fs";
import path from "node:path";
import { type SampleJDs, SampleJDsSchema } from "@/lib/jd-schemas";
import { type CV, CVSchema, type Tone, ToneSchema } from "@/lib/schemas";

let cachedCV: CV | null = null;
let cachedTone: Tone | null = null;
let cachedSampleJDs: SampleJDs | null = null;

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
