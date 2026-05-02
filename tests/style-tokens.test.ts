import { describe, expect, it } from "vitest";
import {
  bulletCapFor,
  clamp,
  DEFAULT_STYLE,
  lerp,
  mix,
  type StyleState,
  stateToTokens,
} from "@/lib/style-tokens";

const corner = (d: number, p: number, h: number, m: number): StyleState => ({
  density: d,
  polish: p,
  hierarchy: h,
  motion: m,
});

const REQUIRED_KEYS = [
  "--bg",
  "--fg",
  "--muted",
  "--rule",
  "--card-bg",
  "--card-border",
  "--card-border-width",
  "--accent",
  "--radius",
  "--shadow",
  "--font-display",
  "--font-body",
  "--case-display",
  "--size-h1",
  "--size-h2",
  "--size-body",
  "--weight-display",
  "--gap-section",
  "--gap-block",
  "--gap-item",
  "--pad-card",
  "--line",
  "--col-count",
  "--proj-cols",
  "--bullet-cap",
  "--motion-base",
  "--stagger",
  "--bullet-marker-w",
  "--skill-font",
  "--lede-style",
];

describe("helpers", () => {
  it("lerp interpolates linearly", () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it("clamp respects bounds", () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(2, 0, 1)).toBe(1);
  });

  it("mix returns endpoints exactly", () => {
    expect(mix("#000000", "#ffffff", 0)).toBe("#000000");
    expect(mix("#000000", "#ffffff", 1)).toBe("#ffffff");
  });

  it("mix at midpoint averages channels", () => {
    expect(mix("#000000", "#ffffff", 0.5)).toBe("#808080");
  });

  it("bulletCapFor matches the design's stepped scale", () => {
    expect(bulletCapFor(0)).toBe(2);
    expect(bulletCapFor(0.17)).toBe(2);
    expect(bulletCapFor(0.18)).toBe(3);
    expect(bulletCapFor(0.37)).toBe(3);
    expect(bulletCapFor(0.38)).toBe(5);
    expect(bulletCapFor(0.59)).toBe(5);
    expect(bulletCapFor(0.6)).toBe(6);
    expect(bulletCapFor(0.77)).toBe(6);
    expect(bulletCapFor(0.78)).toBe(99);
    expect(bulletCapFor(1)).toBe(99);
  });
});

describe("stateToTokens — surface", () => {
  it("returns every required key at default", () => {
    const tokens = stateToTokens(DEFAULT_STYLE);
    for (const key of REQUIRED_KEYS) {
      expect(tokens, `missing token: ${key}`).toHaveProperty(key);
    }
  });

  it("stamps the input axes onto custom-prop mirrors", () => {
    const tokens = stateToTokens(corner(0.3, 0.7, 0.2, 0.9));
    expect(tokens["--density"]).toBe("0.3");
    expect(tokens["--polish"]).toBe("0.7");
    expect(tokens["--hierarchy"]).toBe("0.2");
    expect(tokens["--motion"]).toBe("0.9");
  });
});

describe("stateToTokens — polish thresholds", () => {
  it("brutalist (polish=0) → square corners, no shadow, hairline cards", () => {
    const t = stateToTokens(corner(0.5, 0, 0.5, 0.5));
    expect(t["--radius"]).toBe("0px");
    expect(t["--radius-chip"]).toBe("0px");
    expect(t["--shadow"]).toBe("none");
    expect(t["--card-bg"]).toBe("#ffffff");
    expect(t["--card-border-width"]).toBe("2px");
    expect(t["--rule-weight"]).toBe("2px");
    expect(t["--case-display"]).toBe("uppercase");
    expect(t["--case-h2"]).toBe("uppercase");
    expect(t["--case-h3"]).toBe("uppercase");
  });

  it("refined (polish=1) → rounded, soft shadow, italic asides, dot bullets", () => {
    const t = stateToTokens(corner(0.5, 1, 0.5, 0.5));
    expect(t["--radius"]).toBe("8px");
    expect(t["--radius-chip"]).toBe("999px");
    expect(t["--shadow"]).toBe("0 1px 2px rgba(28,25,21,0.04)");
    expect(t["--case-display"]).toBe("none");
    expect(t["--case-h2"]).toBe("none");
    expect(t["--case-h3"]).toBe("none");
    expect(t["--lede-style"]).toBe("italic");
    expect(t["--blurb-style"]).toBe("italic");
    expect(t["--tagline-style"]).toBe("italic");
    expect(t["--bullet-marker-radius"]).toBe("999px");
    expect(t["--bullet-marker-color"]).toBe("var(--accent)");
  });
});

describe("stateToTokens — density thresholds", () => {
  it("sparse (density=0) → 1 col, big gaps, bullet cap 2", () => {
    const t = stateToTokens(corner(0, 0.5, 0.5, 0.5));
    expect(t["--col-count"]).toBe("1");
    expect(t["--proj-cols"]).toBe("1");
    expect(t["--bullet-cap"]).toBe("2");
    expect(t["--gap-section"]).toBe("7.50rem");
  });

  it("dense (density=1) → 2 cols, tight gaps, no bullet cap", () => {
    const t = stateToTokens(corner(1, 0.5, 0.5, 0.5));
    expect(t["--col-count"]).toBe("2");
    expect(t["--proj-cols"]).toBe("2");
    expect(t["--bullet-cap"]).toBe("99");
    expect(t["--gap-section"]).toBe("2.20rem");
  });
});

describe("stateToTokens — motion thresholds", () => {
  it("static (motion=0) → all motion durations are 0ms", () => {
    const t = stateToTokens(corner(0.5, 0.5, 0.5, 0));
    expect(t["--motion-fast"]).toBe("0ms");
    expect(t["--motion-base"]).toBe("0ms");
    expect(t["--motion-slow"]).toBe("0ms");
    expect(t["--stagger"]).toBe("0ms");
  });

  it("kinetic (motion=1) → meaningful durations", () => {
    const t = stateToTokens(corner(0.5, 0.5, 0.5, 1));
    expect(t["--motion-fast"]).toBe("200ms");
    expect(t["--motion-base"]).toBe("360ms");
    expect(t["--motion-slow"]).toBe("580ms");
    expect(t["--stagger"]).toBe("75ms");
  });
});

describe("stateToTokens — every corner renders", () => {
  it("all 16 corners produce a valid record", () => {
    for (const d of [0, 1]) {
      for (const p of [0, 1]) {
        for (const h of [0, 1]) {
          for (const m of [0, 1]) {
            const t = stateToTokens(corner(d, p, h, m));
            for (const key of REQUIRED_KEYS) {
              expect(t[key], `corner ${d}/${p}/${h}/${m} missing ${key}`).toBeTruthy();
            }
          }
        }
      }
    }
  });
});
