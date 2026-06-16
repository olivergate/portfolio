/**
 * generate-cv-pdf — snapshot the /cv/print route to a static PDF at
 * public/oliver-gate-cv.pdf.
 *
 * Reuses the Playwright Chromium already in the repo — page.pdf() emits a real
 * selectable text layer (the ATS-gating requirement). The route is pinned to
 * DEFAULT_STYLE, single-column, ~2 pages. See
 * docs/specs/2026-06-04-cv-pdf-distribution.md.
 *
 * Self-bootstrapping: if nothing is serving on PORT it spawns `next start`
 * (assumes a prior `next build`), generates, then tears the server down. So:
 *
 *   bun run cv:pdf            # = next build && bun scripts/generate-cv-pdf.ts
 */
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const base = `http://127.0.0.1:${PORT}`;
const url = `${base}/cv/print`;
const out = "public/oliver-gate-cv.pdf";

async function reachable(): Promise<boolean> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch {
    return false;
  }
}

async function waitFor(predicate: () => Promise<boolean>, tries: number): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    if (await predicate()) return true;
    await new Promise((res) => setTimeout(res, 1000));
  }
  return false;
}

let server: ReturnType<typeof spawn> | null = null;
if (!(await reachable())) {
  console.log(`No server on :${PORT} — starting \`next start\`…`);
  server = spawn("bun", ["run", "start", "--port", String(PORT)], { stdio: "ignore" });
  if (!(await waitFor(reachable, 40))) {
    server.kill();
    throw new Error(`Server never became ready on ${base} (did you run \`next build\`?)`);
  }
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  if (!res?.ok()) {
    throw new Error(`Failed to load ${url}: HTTP ${res?.status() ?? "no response"}`);
  }
  await page.emulateMedia({ media: "print" });
  await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
  console.log(`Wrote ${out}`);
} finally {
  await browser.close();
  server?.kill();
}
