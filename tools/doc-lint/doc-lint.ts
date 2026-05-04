#!/usr/bin/env tsx
// doc-lint — enforces doc-system conventions.
// Hard fails (exit 1): frontmatter presence/schema, ISO dates, cross-refs,
// feature template sections, AGENTS.md line cap, shipped specs without shipped_on.
// Advisory (exit 0): stale last_verified > 90 days.
//
// Config: reads `doc-lint.config.json` from process.cwd() (or --config <path>).
// See kit/tools/doc-lint/config.example.json for the full schema.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

// ----- Config -----

type Config = {
  buckets: string[]; // directories to walk for full-tree mode
  scopePrefixes: string[]; // path prefixes for --changed mode (must end with /)
  excludedIndexFiles: string[]; // INDEX-like files that get cross-ref check only (no schema)
  repoPathPrefixes: string[]; // prefixes that count as repo paths for cross-ref resolution
  agentsMdLineLimit: number; // hard cap for AGENTS.md / CLAUDE.md
  agentsMdFiles: string[]; // which files get the line-cap check
  skipDirNames: string[]; // directory names to skip during walk (e.g. node_modules)
};

const DEFAULT_CONFIG: Config = {
  buckets: [
    "docs/decisions",
    "docs/features",
    "docs/practices",
    "docs/runbooks",
    "docs/superpowers/specs",
    "docs/superpowers/plans",
    "docs/reference",
    "docs/doc-system",
    "prd",
    ".claude/agents",
    ".claude/commands",
  ],
  scopePrefixes: ["docs/", "prd/", ".claude/agents/", ".claude/commands/"],
  excludedIndexFiles: [
    "docs/decisions/INDEX.md",
    "docs/INDEX.md",
    "docs/practices/INDEX.md",
    "docs/runbooks/INDEX.md",
    "prd/INDEX.md",
  ],
  repoPathPrefixes: [
    "docs/",
    "src/",
    "app/",
    "apps/",
    "packages/",
    "infra/",
    "prd/",
    "scripts/",
    "lib/",
    "tools/",
    "tests/",
    "components/",
    ".claude/",
  ],
  agentsMdLineLimit: 200,
  agentsMdFiles: ["AGENTS.md", "CLAUDE.md"],
  skipDirNames: ["node_modules", "archive", ".next", ".git", "dist", "build"],
};

const args = process.argv.slice(2);
const CHANGED = args.includes("--changed");
const VERBOSE = args.includes("--verbose");
const CONFIG_ARG_IDX = args.indexOf("--config");
const CONFIG_PATH = CONFIG_ARG_IDX !== -1 ? args[CONFIG_ARG_IDX + 1] : "doc-lint.config.json";

const REPO_ROOT = process.cwd();
const TODAY = new Date();

function loadConfig(): Config {
  const configFile = resolve(REPO_ROOT, CONFIG_PATH);
  if (!existsSync(configFile)) {
    if (VERBOSE) console.log(`doc-lint: no config at ${CONFIG_PATH}, using defaults`);
    return DEFAULT_CONFIG;
  }
  try {
    const raw = JSON.parse(readFileSync(configFile, "utf8"));
    return { ...DEFAULT_CONFIG, ...raw };
  } catch (e) {
    console.error(`doc-lint: failed to parse ${CONFIG_PATH}: ${e}`);
    process.exit(2);
  }
}

const CONFIG = loadConfig();

type Issue = { file: string; kind: "error" | "warn"; msg: string };
const issues: Issue[] = [];
const addErr = (file: string, msg: string) => issues.push({ file, kind: "error", msg });
const addWarn = (file: string, msg: string) => issues.push({ file, kind: "warn", msg });

// ----- File enumeration -----

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (CONFIG.skipDirNames.includes(entry.name)) continue;
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

function scopedFiles(): string[] {
  const files = CONFIG.buckets.flatMap((b) => walk(join(REPO_ROOT, b)));
  return files.filter((f) => !f.includes("/archive/")).map((f) => relative(REPO_ROOT, f));
  // Note: excludedIndexFiles are NOT filtered out here — they get included in the
  // file list and dispatched as `cat === "index"` in lintFile, which performs
  // cross-ref-only checking (no schema enforcement).
}

function gitStagedMarkdown(): string[] {
  // Use execFileSync (array args, no shell) for safe invocation — `git diff` here is fully static.
  try {
    const out = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACM"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    return out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function gitStagedAll(): string[] {
  // Same safety pattern as gitStagedMarkdown — used for the AGENTS.md line-cap check.
  try {
    const out = execFileSync("git", ["diff", "--cached", "--name-only"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    return out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function stagedFiles(): string[] {
  return gitStagedMarkdown()
    .filter((f) => f.endsWith(".md"))
    .filter(
      (f) => CONFIG.scopePrefixes.some((p) => f.startsWith(p)) || CONFIG.agentsMdFiles.includes(f),
    )
    .filter((f) => !f.includes("/archive/"));
}

// ----- Frontmatter parsing -----

type Frontmatter = Record<string, unknown>;

function splitFrontmatter(src: string): { fm: string | null; body: string; fmEndLine: number } {
  if (!src.startsWith("---\n") && !src.startsWith("---\r\n")) {
    return { fm: null, body: src, fmEndLine: 0 };
  }
  const lines = src.split("\n");
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return { fm: null, body: src, fmEndLine: 0 };
  return {
    fm: lines.slice(1, end).join("\n"),
    body: lines.slice(end + 1).join("\n"),
    fmEndLine: end,
  };
}

function stripQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function parseInlineArray(s: string): unknown[] {
  const inner = s.trim().slice(1, -1).trim();
  if (!inner) return [];
  return inner.split(",").map((x) => parseScalar(x.trim()));
}

function parseInlineObject(s: string): Record<string, unknown> {
  const inner = s.trim().slice(1, -1).trim();
  if (!inner) return {};
  const obj: Record<string, unknown> = {};
  for (const pair of inner.split(",")) {
    const idx = pair.indexOf(":");
    if (idx === -1) continue;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    obj[k] = parseScalar(v);
  }
  return obj;
}

function parseScalar(raw: string): unknown {
  const v = raw.trim();
  if (v === "null" || v === "~" || v === "") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (v.startsWith("[") && v.endsWith("]")) return parseInlineArray(v);
  if (v.startsWith("{") && v.endsWith("}")) return parseInlineObject(v);
  if (/^-?\d+$/.test(v)) return Number(v);
  return stripQuotes(v);
}

// Hand-rolled YAML — covers the shapes in 02-style-atlas.md.
function parseFrontmatter(src: string, file: string): Frontmatter | null {
  const obj: Frontmatter = {};
  const lines = src.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) {
      i++;
      continue;
    }
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!m) {
      addErr(file, `unsupported frontmatter shape: "${line}"`);
      return null;
    }
    const key = m[1];
    const rest = m[2];
    if (rest.trim() !== "") {
      obj[key] = parseScalar(rest);
      i++;
      continue;
    }
    const blockLines: string[] = [];
    let j = i + 1;
    while (j < lines.length && (lines[j].startsWith("  ") || lines[j] === "")) {
      if (lines[j] !== "") blockLines.push(lines[j]);
      j++;
    }
    if (blockLines.length === 0) {
      obj[key] = null;
      i = j;
      continue;
    }
    const isArray = blockLines.every((l) => l.trimStart().startsWith("- "));
    if (isArray) {
      obj[key] = blockLines.map((l) => {
        const payload = l.trimStart().replace(/^- /, "");
        return parseScalar(payload);
      });
    } else {
      const nested: Record<string, unknown> = {};
      for (const l of blockLines) {
        const nm = l.trimStart().match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
        if (!nm) {
          addErr(file, `unsupported nested frontmatter shape: "${l}"`);
          continue;
        }
        nested[nm[1]] = parseScalar(nm[2]);
      }
      obj[key] = nested;
    }
    i = j;
  }
  return obj;
}

// ----- Checks -----

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function checkISODate(file: string, key: string, val: unknown) {
  if (val === null || val === undefined) return;
  if (typeof val !== "string" || !ISO_DATE.test(val)) {
    addErr(file, `frontmatter ${key} must be ISO YYYY-MM-DD, got: ${JSON.stringify(val)}`);
  }
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function checkLastVerifiedStale(file: string, fm: Frontmatter) {
  const lv = fm.last_verified;
  if (typeof lv !== "string" || !ISO_DATE.test(lv)) return;
  const lvDate = new Date(lv + "T00:00:00Z");
  const days = daysBetween(TODAY, lvDate);
  if (days > 90) {
    addWarn(file, `last_verified is ${days} days stale (${lv})`);
  }
}

function requireKeys(file: string, fm: Frontmatter, keys: string[]) {
  for (const k of keys) {
    if (!(k in fm)) addErr(file, `missing required frontmatter key: ${k}`);
  }
}

type Category =
  | "ref"
  | "feature"
  | "spec"
  | "plan"
  | "adr"
  | "index"
  | "prd"
  | "practice-authoritative"
  | "practice-audit"
  | "practice-gaplog"
  | "runbook"
  | "doc-system"
  | "harness-agent"
  | "harness-command"
  | "skip";

function categorize(file: string): Category {
  if (CONFIG.excludedIndexFiles.includes(file)) return "index";

  // Template files (basename starts with `_`) ship as placeholders by
  // convention — their frontmatter dates and three-doc-pattern conformance
  // are intentionally not real. Skip content-shape checks for them.
  const base = file.split("/").pop() ?? "";
  if (base.startsWith("_")) return "skip";

  if (file.startsWith("docs/features/")) return "feature";
  if (file.startsWith("docs/reference/")) return "ref";
  if (file.startsWith("docs/superpowers/specs/")) return "spec";
  if (file.startsWith("docs/superpowers/plans/")) return "plan";
  if (file.startsWith("docs/decisions/")) return "adr";
  if (file.startsWith("prd/")) return "prd";
  if (file.startsWith("docs/runbooks/")) return "runbook";
  if (file.startsWith("docs/doc-system/")) return "doc-system";
  if (file.startsWith(".claude/agents/")) return "harness-agent";
  if (file.startsWith(".claude/commands/")) return "harness-command";
  if (file.startsWith("docs/practices/")) {
    const base = file.split("/").pop() ?? "";
    if (/_BEST_PRACTICES\.md$/.test(base)) return "practice-authoritative";
    if (/_COVERAGE_AUDIT\.md$/.test(base)) return "practice-audit";
    if (/^PRODUCTION_GAPS_FROM_.+\.md$/.test(base)) return "practice-gaplog";
    addWarn(
      file,
      "unexpected file in practices directory — expected three-doc pattern (_BEST_PRACTICES.md, _COVERAGE_AUDIT.md, PRODUCTION_GAPS_FROM_*.md); consider moving to docs/runbooks/ or naming per pattern",
    );
    return "skip";
  }
  return "skip";
}

const FEATURE_SECTIONS = [
  "## What It Does",
  "## User Flow",
  "## Key Components",
  "## API Surface",
  "## Data Model",
  "## Pages / Routes",
  "## Auth / Permissions",
  "## External Services",
  "## Coverage Assessment",
  "## Known Gaps",
  "## Dependencies",
];

function checkFeatureSections(file: string, body: string) {
  for (const h of FEATURE_SECTIONS) {
    const re = new RegExp(`^${h.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\s*$`, "m");
    if (!re.test(body)) addErr(file, `feature template missing section header: "${h}"`);
  }
}

// ----- Cross-reference resolution -----

function stripFencedCode(body: string): string {
  const keepNewlines = (match: string) => match.replace(/[^\n]/g, "");
  return body.replace(/```[\s\S]*?```/g, keepNewlines).replace(/~~~[\s\S]*?~~~/g, keepNewlines);
}

function lineNumberAt(src: string, index: number): number {
  let line = 1;
  const end = Math.min(index, src.length);
  for (let i = 0; i < end; i++) {
    if (src.charCodeAt(i) === 10 /* \n */) line++;
  }
  return line;
}

function buildBareRefRegex(): RegExp {
  const prefixes = CONFIG.repoPathPrefixes
    .map((p) => p.replace(/\/$/, ""))
    .filter((p) => p.length > 0)
    .map((p) => p.replace(/[.+*?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  return new RegExp(`(?<![A-Za-z0-9_/<-])((?:${prefixes})\\/[A-Za-z0-9_./@\\[\\]*-]+)`, "g");
}

const BARE_REF_RE = buildBareRefRegex();

function extractRefs(body: string): Array<{ path: string; line: number }> {
  const stripped = stripFencedCode(body);
  const seen = new Map<string, number>();
  const add = (path: string, line: number) => {
    if (!seen.has(path)) seen.set(path, line);
  };
  const linkRe = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(stripped))) {
    add(m[1], lineNumberAt(stripped, m.index));
  }
  const tickRe = /`([^`\n]+)`/g;
  while ((m = tickRe.exec(stripped))) {
    add(m[1], lineNumberAt(stripped, m.index));
  }
  while ((m = BARE_REF_RE.exec(stripped))) {
    add(m[1], lineNumberAt(stripped, m.index));
  }
  return [...seen.entries()].map(([path, line]) => ({ path, line }));
}

function isRepoPath(p: string): boolean {
  if (!p) return false;
  if (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("mailto:")) return false;
  if (p.startsWith("#")) return false;
  if (p.includes("*")) return false;
  if (p.includes("<") || p.includes(">")) return false;
  if (p.includes("{") || p.includes("}")) return false;
  if (p.includes("$")) return false; // slash-command placeholders ($ARGUMENTS, $1, ${VAR})
  if (p.includes("NNN")) return false;
  if (p.includes("…")) return false;
  if (p.includes("§") || /\s/.test(p)) return false;
  if (!CONFIG.repoPathPrefixes.some((pref) => p.startsWith(pref))) return false;
  if (/[-_]$/.test(p)) return false;
  return true;
}

function normalizePath(p: string): string {
  let t = p;
  while (t.length > 0 && /[.,)"'`;]/.test(t[t.length - 1])) t = t.slice(0, -1);
  t = t.split("#")[0].split("?")[0];
  t = t.replace(/:\d+(:\d+)?$/, "");
  return t;
}

function checkCrossRefs(file: string, body: string, bodyLineOffset: number = 0) {
  const rawRefs = extractRefs(body);
  for (const { path: raw, line: bodyLine } of rawRefs) {
    if (!isRepoPath(raw)) continue;
    const p = normalizePath(raw);
    if (!p) continue;
    const abs = join(REPO_ROOT, p);
    if (!existsSync(abs)) {
      const sourceLine = bodyLine + bodyLineOffset;
      addErr(file, `L${sourceLine}: broken cross-reference: ${p}`);
    }
  }
}

// ----- Per-category linting -----

function lintFile(file: string) {
  const abs = join(REPO_ROOT, file);
  if (!existsSync(abs)) return;
  const src = readFileSync(abs, "utf8");
  const cat = categorize(file);
  if (cat === "skip") return;

  if (cat === "index") {
    checkCrossRefs(file, src);
    return;
  }

  const { fm: fmRaw, body, fmEndLine } = splitFrontmatter(src);
  const bodyOffset = fmRaw === null ? 0 : fmEndLine + 1;
  if (fmRaw === null) {
    addErr(file, "missing frontmatter block");
    checkCrossRefs(file, src, 0);
    return;
  }
  const fm = parseFrontmatter(fmRaw, file);
  if (!fm) return;

  switch (cat) {
    case "ref":
      requireKeys(file, fm, ["title", "purpose", "audience", "last_verified", "canonical_for"]);
      checkISODate(file, "last_verified", fm.last_verified);
      checkLastVerifiedStale(file, fm);
      break;
    case "feature":
      requireKeys(file, fm, ["feature", "domain", "last_verified", "code_paths", "status"]);
      checkISODate(file, "last_verified", fm.last_verified);
      checkLastVerifiedStale(file, fm);
      checkFeatureSections(file, body);
      break;
    case "spec":
    case "plan":
      requireKeys(file, fm, [
        "title",
        "kind",
        "status",
        "date",
        "shipped_on",
        "supersedes",
        "adrs",
        "feature",
      ]);
      checkISODate(file, "date", fm.date);
      if (fm.shipped_on !== null && fm.shipped_on !== undefined)
        checkISODate(file, "shipped_on", fm.shipped_on);
      if (
        cat === "spec" &&
        fm.status === "shipped" &&
        (fm.shipped_on === null || fm.shipped_on === undefined)
      ) {
        addErr(file, `spec marked status: shipped but shipped_on is null`);
      }
      if (fm.status === "draft" || fm.status === "superseded") {
        return;
      }
      break;
    case "adr":
      requireKeys(file, fm, ["adr", "title", "status", "date", "supersedes", "superseded_by"]);
      checkISODate(file, "date", fm.date);
      break;
    case "practice-authoritative":
      requireKeys(file, fm, ["domain", "title", "status", "date", "authoritative"]);
      checkISODate(file, "date", fm.date);
      if (fm.authoritative !== true) {
        addErr(file, `authoritative practice doc must set authoritative: true`);
      }
      break;
    case "practice-audit":
      requireKeys(file, fm, ["domain", "title", "status", "date", "authoritative", "snapshot_of"]);
      checkISODate(file, "date", fm.date);
      if (fm.authoritative !== false) {
        addErr(file, `practice-audit doc must set authoritative: false`);
      }
      break;
    case "practice-gaplog":
      requireKeys(file, fm, [
        "domain",
        "title",
        "status",
        "date",
        "authoritative",
        "log_for",
        "append_only",
      ]);
      checkISODate(file, "date", fm.date);
      if (fm.authoritative !== false) {
        addErr(file, `practice-gaplog doc must set authoritative: false`);
      }
      if (fm.append_only !== true) {
        addErr(file, `practice-gaplog doc must set append_only: true`);
      }
      break;
    case "runbook":
      requireKeys(file, fm, ["kind", "title", "status", "date"]);
      checkISODate(file, "date", fm.date);
      if (fm.kind !== "runbook") {
        addErr(file, `runbook doc must set kind: runbook`);
      }
      break;
    case "doc-system":
      requireKeys(file, fm, ["title", "purpose", "audience", "last_verified"]);
      checkISODate(file, "last_verified", fm.last_verified);
      checkLastVerifiedStale(file, fm);
      break;
    case "prd":
      requireKeys(file, fm, [
        "prd",
        "title",
        "status",
        "priority",
        "created",
        "shipped_on",
        "phases",
      ]);
      checkISODate(file, "created", fm.created);
      if (fm.shipped_on !== null && fm.shipped_on !== undefined)
        checkISODate(file, "shipped_on", fm.shipped_on);
      if (Array.isArray(fm.phases)) {
        for (const phase of fm.phases) {
          if (
            phase &&
            typeof phase === "object" &&
            "shipped_on" in phase &&
            (phase as { shipped_on: unknown }).shipped_on !== null
          ) {
            checkISODate(
              file,
              `phases[].shipped_on`,
              (phase as { shipped_on: unknown }).shipped_on,
            );
          }
        }
      }
      break;
    case "harness-agent":
      requireKeys(file, fm, ["name", "description", "model", "tools"]);
      break;
    case "harness-command":
      requireKeys(file, fm, ["description", "argument-hint"]);
      break;
  }

  checkCrossRefs(file, body, bodyOffset);
}

function lintAgentsMd() {
  for (const filename of CONFIG.agentsMdFiles) {
    const path = join(REPO_ROOT, filename);
    if (!existsSync(path)) continue;
    const src = readFileSync(path, "utf8");
    const lines = src.split("\n").length;
    if (lines > CONFIG.agentsMdLineLimit) {
      addErr(filename, `file is ${lines} lines (limit: ${CONFIG.agentsMdLineLimit})`);
    }
  }
}

// ----- Main -----

function main() {
  let files: string[];
  if (CHANGED) {
    files = stagedFiles();
  } else {
    files = scopedFiles();
  }
  if (VERBOSE) {
    console.log(`doc-lint: checking ${files.length} file(s)${CHANGED ? " (staged)" : ""}`);
  }
  for (const f of files) {
    if (VERBOSE) console.log(`  • ${f}`);
    lintFile(f);
  }

  // AGENTS.md / CLAUDE.md line-cap check: always in full-tree mode; in --changed mode only if staged.
  if (!CHANGED) {
    lintAgentsMd();
  } else {
    const staged = gitStagedAll();
    if (CONFIG.agentsMdFiles.some((f) => staged.includes(f))) {
      lintAgentsMd();
    }
  }

  const errors = issues.filter((i) => i.kind === "error");
  const warns = issues.filter((i) => i.kind === "warn");
  const byFile = new Map<string, Issue[]>();
  for (const i of issues) {
    if (!byFile.has(i.file)) byFile.set(i.file, []);
    byFile.get(i.file)!.push(i);
  }
  for (const [file, group] of byFile) {
    console.log(file);
    for (const i of group) {
      console.log(`  ${i.kind === "error" ? "✖" : "⚠"} ${i.msg}`);
    }
  }
  if (errors.length === 0 && warns.length === 0) {
    console.log(`doc-lint: clean (${files.length} file${files.length === 1 ? "" : "s"} checked)`);
    process.exit(0);
  }
  console.log(
    `doc-lint: ${errors.length} error${errors.length === 1 ? "" : "s"}, ${warns.length} warning${warns.length === 1 ? "" : "s"} across ${byFile.size} file${byFile.size === 1 ? "" : "s"}`,
  );
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
