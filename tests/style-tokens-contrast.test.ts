/**
 * Phase 4.5 — Slider state space contrast safety net.
 *
 * The four UX style sliders (density, polish, hierarchy, motion) feed
 * `stateToTokens()` which produces ~50 CSS custom properties. ADR-0007 fixed
 * a single pair (muted/bg at refined polish); ADR-0017 covers the stretch
 * slider's a11y. Neither addresses the combinatorial state space.
 *
 * This test enumerates a 0.1-step grid over all four axes (11^4 = 14,641
 * combinations) and asserts that every load-bearing color pair meets WCAG 2.1
 * contrast minima:
 *   - body text on background  ≥ 4.5:1   (AA 1.4.3 small text)
 *   - mono kickers on background ≥ 4.5:1
 *   - accent (links/CTAs) on background ≥ 4.5:1
 *   - inverse-fg on inverse-bg ≥ 4.5:1
 *   - chip semantic colors (--hit, --stretch) on background ≥ 4.5:1
 *
 * The static --hit and --stretch values are not produced by stateToTokens —
 * they come from `styles/tokens.css`. We re-declare them here as constants and
 * test against the *dynamic* --bg the sliders produce; if a slider trajectory
 * drives bg into a region where chip text loses contrast, the test fails.
 *
 * Implementation note: hand-rolls the WCAG sRGB → linear → relative luminance
 * → contrast ratio formula. No external dependency.
 */

import { describe, expect, it } from "vitest";
import { type StyleState, stateToTokens } from "@/lib/style-tokens";

// ─── WCAG 2.1 contrast (hand-rolled) ─────────────────────────────────────

function srgbToLin(c8: number): number {
  const c = c8 / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relLum(rgb: readonly [number, number, number]): number {
  const r = rgb[0];
  const g = rgb[1];
  const b = rgb[2];
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) {
    throw new Error(`expected 6-digit hex, got ${hex}`);
  }
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return [r, g, b];
}

function contrast(a: string, b: string): number {
  const la = relLum(parseHex(a));
  const lb = relLum(parseHex(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// ─── Static :root values (mirror styles/tokens.css) ─────────────────────
//
// These ship on every route that doesn't run the rethemer bootstrap (i.e.
// everything except `/`). The Vitest's primary sweep covers the dynamic
// stateToTokens output; this constant + the third test below covers the
// static fallback so axe-on-/blog can't silently regress (Phase 4.5
// learning from the first axe Playwright run).
const STATIC_ROOT = {
  bg: "#faf7f2",
  fg: "#1c1915",
  fgSoft: "#3a3530",
  muted: "#6b645b",
  muted2: "#5a544b",
  accent: "#a04a26",
  inverseBg: "#1c1915",
  inverseFg: "#f4f0e8",
  hit: "#2f6b3a",
  stretch: "#7a4d10",
  miss: "#8a8278",
} as const;

/**
 * sRGB color-mix(in srgb, fg pct%, bg) computed numerically. The chip
 * components in `components/jd/Chip.tsx` use this exact mixing to produce
 * subtly-tinted chip backgrounds (14% hit, 16% stretch, 12% miss). The
 * tinting reduces contrast against the chip's foreground text, so the
 * load-bearing AA check is fg-on-chip-bg, not fg-on-page-bg.
 */
function mixSrgb(fg: string, bg: string, pct: number): string {
  const [fr, fg_, fb] = parseHex(fg);
  const [br, bg_, bb] = parseHex(bg);
  const r = Math.round(fr * pct + br * (1 - pct));
  const g = Math.round(fg_ * pct + bg_ * (1 - pct));
  const b = Math.round(fb * pct + bb * (1 - pct));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const STATIC = {
  hit: STATIC_ROOT.hit,
  stretch: STATIC_ROOT.stretch,
} as const;

// ─── Pairs to check ──────────────────────────────────────────────────────

type Tokens = Record<string, string>;

/** Asserting accessor — stateToTokens is exhaustive, so a missing key is a bug. */
function tok(t: Tokens, key: string): string {
  const v = t[key];
  if (v === undefined) {
    throw new Error(`expected token "${key}" to be present in stateToTokens output`);
  }
  return v;
}

type PairCheck = {
  name: string;
  fg: (t: Tokens) => string;
  bg: (t: Tokens) => string;
  min: number;
};

const PAIRS: PairCheck[] = [
  { name: "fg / bg", fg: (t) => tok(t, "--fg"), bg: (t) => tok(t, "--bg"), min: 4.5 },
  { name: "muted / bg", fg: (t) => tok(t, "--muted"), bg: (t) => tok(t, "--bg"), min: 4.5 },
  { name: "accent / bg", fg: (t) => tok(t, "--accent"), bg: (t) => tok(t, "--bg"), min: 4.5 },
  {
    name: "inverse-fg / inverse-bg",
    fg: (t) => tok(t, "--inverse-fg"),
    bg: (t) => tok(t, "--inverse-bg"),
    min: 4.5,
  },
  { name: "hit / bg", fg: () => STATIC.hit, bg: (t) => tok(t, "--bg"), min: 4.5 },
  { name: "stretch / bg", fg: () => STATIC.stretch, bg: (t) => tok(t, "--bg"), min: 4.5 },
];

// ─── Grid enumeration ────────────────────────────────────────────────────

const STEP = 0.1;
const POINTS_PER_AXIS = Math.round(1 / STEP) + 1; // 11
const TOTAL = POINTS_PER_AXIS ** 4; // 14,641

function* grid(): Generator<StyleState> {
  for (let d = 0; d < POINTS_PER_AXIS; d++) {
    for (let p = 0; p < POINTS_PER_AXIS; p++) {
      for (let h = 0; h < POINTS_PER_AXIS; h++) {
        for (let m = 0; m < POINTS_PER_AXIS; m++) {
          yield {
            density: d * STEP,
            polish: p * STEP,
            hierarchy: h * STEP,
            motion: m * STEP,
          };
        }
      }
    }
  }
}

type Violation = {
  pair: string;
  state: StyleState;
  fg: string;
  bg: string;
  ratio: number;
  min: number;
};

describe("slider state space — WCAG 2.1 contrast safety net (Phase 4.5)", () => {
  it("every reachable slider combination passes AA on load-bearing pairs", () => {
    const violations: Violation[] = [];
    const minByPair = new Map<string, number>();

    let count = 0;
    for (const state of grid()) {
      count++;
      const t = stateToTokens(state);
      for (const pair of PAIRS) {
        const fg = pair.fg(t);
        const bg = pair.bg(t);
        const ratio = contrast(fg, bg);
        const current = minByPair.get(pair.name);
        if (current === undefined || ratio < current) {
          minByPair.set(pair.name, ratio);
        }
        if (ratio < pair.min) {
          violations.push({ pair: pair.name, state, fg, bg, ratio, min: pair.min });
        }
      }
    }

    expect(count).toBe(TOTAL);

    if (violations.length > 0) {
      // Worst-10 surfaces the most acute failures; full list available in stdout.
      violations.sort((a, b) => a.ratio - b.ratio);
      const worst = violations.slice(0, 10);
      const table = worst
        .map(
          (v) =>
            `  ${v.pair.padEnd(28)} d=${v.state.density.toFixed(1)} p=${v.state.polish.toFixed(1)} h=${v.state.hierarchy.toFixed(1)} m=${v.state.motion.toFixed(1)} → ${v.ratio.toFixed(2)}:1 (need ${v.min}) [fg=${v.fg} bg=${v.bg}]`,
        )
        .join("\n");
      throw new Error(
        `${violations.length} contrast violations across ${TOTAL} slider states. Worst:\n${table}`,
      );
    }

    expect(violations).toEqual([]);
  });

  it("static :root values (rendered on routes without the rethemer bootstrap) meet AA", () => {
    // Routes other than `/` ship the literal :root values from styles/tokens.css.
    // axe Playwright caught a 4.32:1 regression on /blog (muted=#7a746c on
    // bg=#faf7f2) the first time this matrix ran — the dynamic sweep above
    // wouldn't have caught it because stateToTokens lerps muted from a darker
    // brutalist endpoint. This test mirrors the published :root values to
    // make sure they never regress against the same AA floor.
    // Chip kicker labels (Hit / Stretch / Honest gap) are mono uppercase text
    // painted in --hit/--stretch/--muted on top of the chip's tinted bg
    // (color-mix in srgb with --bg). The tinting tightens the contrast pair
    // beyond what `fg / bg` alone reveals — these chip-bg checks caught the
    // original 4.2:1 stretch regression in Phase 4.5.
    const hitChipBg = mixSrgb(STATIC_ROOT.hit, STATIC_ROOT.bg, 0.14);
    const stretchChipBg = mixSrgb(STATIC_ROOT.stretch, STATIC_ROOT.bg, 0.16);
    const missChipBg = mixSrgb(STATIC_ROOT.miss, STATIC_ROOT.bg, 0.12);
    const pairs: Array<{ name: string; fg: string; bg: string; min: number }> = [
      { name: "fg / bg", fg: STATIC_ROOT.fg, bg: STATIC_ROOT.bg, min: 4.5 },
      { name: "fg-soft / bg", fg: STATIC_ROOT.fgSoft, bg: STATIC_ROOT.bg, min: 4.5 },
      { name: "muted / bg", fg: STATIC_ROOT.muted, bg: STATIC_ROOT.bg, min: 4.5 },
      { name: "muted-2 / bg", fg: STATIC_ROOT.muted2, bg: STATIC_ROOT.bg, min: 4.5 },
      { name: "accent / bg", fg: STATIC_ROOT.accent, bg: STATIC_ROOT.bg, min: 4.5 },
      { name: "inverse-fg / inverse-bg", fg: STATIC_ROOT.inverseFg, bg: STATIC_ROOT.inverseBg, min: 4.5 },
      { name: "hit / bg", fg: STATIC_ROOT.hit, bg: STATIC_ROOT.bg, min: 4.5 },
      { name: "stretch / bg", fg: STATIC_ROOT.stretch, bg: STATIC_ROOT.bg, min: 4.5 },
      { name: "hit / hit-chip-bg", fg: STATIC_ROOT.hit, bg: hitChipBg, min: 4.5 },
      { name: "stretch / stretch-chip-bg", fg: STATIC_ROOT.stretch, bg: stretchChipBg, min: 4.5 },
      { name: "muted / miss-chip-bg", fg: STATIC_ROOT.muted, bg: missChipBg, min: 4.5 },
    ];
    const failures: string[] = [];
    for (const pair of pairs) {
      const ratio = contrast(pair.fg, pair.bg);
      if (ratio < pair.min) {
        failures.push(
          `  ${pair.name.padEnd(28)} ${ratio.toFixed(2)}:1 (need ${pair.min}) [fg=${pair.fg} bg=${pair.bg}]`,
        );
      }
    }
    if (failures.length > 0) {
      throw new Error(`static :root contrast violations:\n${failures.join("\n")}`);
    }
    expect(failures).toEqual([]);
  });

  it("emits a snapshot of the worst-case ratio per pair across the grid", () => {
    const worst: Record<string, number> = {};
    for (const state of grid()) {
      const t = stateToTokens(state);
      for (const pair of PAIRS) {
        const ratio = contrast(pair.fg(t), pair.bg(t));
        const current = worst[pair.name];
        if (current === undefined || ratio < current) {
          worst[pair.name] = ratio;
        }
      }
    }
    // Round to 2 dp so snapshots stay stable across micro-arithmetic drift.
    const rounded: Record<string, number> = {};
    for (const k of Object.keys(worst).sort()) {
      const v = worst[k];
      if (v === undefined) continue;
      rounded[k] = Math.round(v * 100) / 100;
    }
    expect(rounded).toMatchSnapshot();
  });
});
