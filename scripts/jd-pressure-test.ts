/**
 * Phase 3 pressure test runner.
 *
 * Reads every source/jd_*.md, drives them through the JD pipeline running on
 * 127.0.0.1:3100, and prints the parser + matcher output as markdown to stdout.
 * Pipe to docs/test-runs/jd-pressure-tests.md (after a manual review).
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const BASE = "http://127.0.0.1:3100";

type ParseResp =
  | {
      ok: true;
      cached: boolean;
      requirements: { id: string; text: string; category: string; weight: number }[];
      jdHash: string;
      costUSD?: number;
    }
  | { ok: false; stage: string; detail?: string };

type MatchResp =
  | {
      ok: true;
      cached: boolean;
      matches: {
        requirementId: string;
        status: "hit" | "stretch" | "miss";
        cite: string[];
        reasoning: string;
        gapFraming?: string;
      }[];
      costUSD?: number;
    }
  | { ok: false; stage: string; detail?: string };

async function runJD(jdName: string, jdText: string): Promise<void> {
  console.log(`\n## ${jdName}\n`);

  const parseR = await fetch(`${BASE}/api/jd-parse`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jdText }),
  });
  const parseJ = (await parseR.json()) as ParseResp;
  if (!parseJ.ok) {
    console.log(`Parser FAILED: ${parseJ.stage}: ${parseJ.detail ?? ""}`);
    return;
  }
  console.log(
    `**Parser** (${parseJ.cached ? "cached" : "live"}${parseJ.costUSD ? ` $${parseJ.costUSD.toFixed(6)}` : ""}) — ${parseJ.requirements.length} requirements, jdHash=\`${parseJ.jdHash.slice(0, 12)}…\`\n`,
  );
  for (const r of parseJ.requirements) {
    console.log(`- \`${r.id}\` (${r.category}, w=${r.weight.toFixed(2)}) — ${r.text}`);
  }

  for (const level of ["strict", "balanced", "generous"] as const) {
    const matchR = await fetch(`${BASE}/api/jd-match`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jdHash: parseJ.jdHash,
        requirements: parseJ.requirements,
        stretchLevel: level,
      }),
    });
    const matchJ = (await matchR.json()) as MatchResp;
    if (!matchJ.ok) {
      console.log(`\n**Matcher (${level})** FAILED: ${matchJ.stage}: ${matchJ.detail ?? ""}`);
      continue;
    }
    const counts = { hit: 0, stretch: 0, miss: 0 };
    for (const m of matchJ.matches) counts[m.status]++;
    console.log(
      `\n**Matcher (${level}, ${matchJ.cached ? "cached" : "live"}${matchJ.costUSD ? ` $${matchJ.costUSD.toFixed(6)}` : ""})** — ${counts.hit} hits, ${counts.stretch} stretches, ${counts.miss} honest gaps.\n`,
    );
    for (const m of matchJ.matches) {
      const cites =
        m.cite.length === 0 ? "" : ` — cite: ${m.cite.map((c) => `\`${c}\``).join(", ")}`;
      console.log(`- \`${m.requirementId}\` **${m.status.toUpperCase()}**${cites}`);
      console.log(`  - ${m.reasoning}`);
      if (m.gapFraming) console.log(`  - **gap framing:** _${m.gapFraming}_`);
    }
  }
}

async function main(): Promise<void> {
  const sourceDir = path.join(process.cwd(), "source");
  const files = readdirSync(sourceDir)
    .filter((f) => f.startsWith("jd_") && f.endsWith(".md"))
    .sort();

  console.log(`# JD pressure-test results\n`);
  console.log(`Generated ${new Date().toISOString()} against ${BASE}\n`);
  console.log(`${files.length} JDs · prompts: jd-parser@v1, jd-matcher@v1\n`);

  for (const f of files) {
    const jdText = readFileSync(path.join(sourceDir, f), "utf8");
    await runJD(f, jdText);
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
