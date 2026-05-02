/**
 * stateToTokens — maps the four slider axes to ~50 derived CSS custom properties.
 * Direct port of `computeVars` from design-references/source/cv-app.jsx:26-239.
 * Do not edit casually: the design system lives here.
 */

export type StyleState = {
  density: number;
  polish: number;
  hierarchy: number;
  motion: number;
};

export const DEFAULT_STYLE: StyleState = {
  density: 0.5,
  polish: 0.55,
  hierarchy: 0.55,
  motion: 0.5,
};

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

/** Linear-RGB hex mix. Inputs are #rrggbb. */
export function mix(a: string, b: string, t: number): string {
  const ah = a.replace("#", "");
  const bh = b.replace("#", "");
  const ar = Number.parseInt(ah.slice(0, 2), 16);
  const ag = Number.parseInt(ah.slice(2, 4), 16);
  const ab = Number.parseInt(ah.slice(4, 6), 16);
  const br = Number.parseInt(bh.slice(0, 2), 16);
  const bg = Number.parseInt(bh.slice(2, 4), 16);
  const bb = Number.parseInt(bh.slice(4, 6), 16);
  const r = Math.round(lerp(ar, br, t));
  const g = Math.round(lerp(ag, bg, t));
  const bl = Math.round(lerp(ab, bb, t));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

export function bulletCapFor(density: number): number {
  if (density < 0.18) return 2;
  if (density < 0.38) return 3;
  if (density < 0.6) return 5;
  if (density < 0.78) return 6;
  return 99;
}

export type StyleTokens = Record<string, string>;

export function stateToTokens(state: StyleState): StyleTokens {
  const { density, polish, hierarchy, motion } = state;

  // ---------- POLISH ----------
  const isBrutalist = polish < 0.28;
  const isRefined = polish > 0.72;

  const bg = mix("#ffffff", "#faf7f2", polish);
  const fg = mix("#000000", "#1c1915", polish);
  // The Phase 0 design-tokens.css proposes #7a746c here, which hits ~4.3:1 on the
  // cream bg — below WCAG AA for small text. Phase 1 spec criterion #5 mandates AA
  // at every slider position; we darken the refined endpoint to #6b645b (~5.0:1 on
  // bg) so kickers remain legible. Visually nearly indistinguishable.
  const muted = mix("#3a3a3a", "#6b645b", polish);
  const rule = mix("#000000", "#c4b9a8", polish);
  const cardBg = isBrutalist ? "#ffffff" : mix("#ffffff", "#fffdf7", polish);
  const cardBorder = isBrutalist
    ? "rgba(0,0,0,1)"
    : `rgba(28,25,21,${(0.18 - 0.1 * polish).toFixed(3)})`;
  const ruleWeight = isBrutalist ? "2px" : "1px";
  const cardBorderWidth = isBrutalist ? "2px" : "1px";

  const inverseBg = isBrutalist ? "#000000" : "#1c1915";
  const inverseFg = isBrutalist ? "#ffffff" : "#f4f0e8";

  const radius = isBrutalist ? "0px" : `${Math.round(lerp(0, 8, polish))}px`;
  const radiusChip = isBrutalist ? "0px" : polish > 0.65 ? "999px" : "3px";

  const shadow = isBrutalist
    ? "none"
    : isRefined
      ? "0 1px 2px rgba(28,25,21,0.04)"
      : "0 1px 2px rgba(0,0,0,0.03)";

  const fontDisplay = isBrutalist
    ? "var(--font-grotesk), 'Inter', sans-serif"
    : polish < 0.55
      ? "var(--font-body-next), 'Inter', sans-serif"
      : "var(--font-display-next), 'Fraunces', Georgia, serif";
  const fontBody = "var(--font-body-next), 'Inter', system-ui, sans-serif";

  const caseDisplay = isBrutalist ? "uppercase" : "none";
  const caseH2 = isBrutalist ? "uppercase" : "none";
  const caseH3 = polish < 0.18 ? "uppercase" : "none";

  const trackingDisplay = isBrutalist
    ? `${lerp(0.02, 0.0, polish / 0.28).toFixed(3)}em`
    : `${lerp(-0.01, -0.025, (polish - 0.28) / 0.72).toFixed(3)}em`;

  const ledeStyle = polish > 0.7 ? "italic" : "normal";
  const ledeWeight = polish > 0.7 ? "400" : "var(--weight-body)";
  const blurbStyle = polish > 0.78 ? "italic" : "normal";
  const taglineStyle = polish > 0.8 ? "italic" : "normal";
  const avocationStyle = polish > 0.8 ? "italic" : "normal";

  const bulletMarkerW = isBrutalist ? "0.45rem" : polish > 0.7 ? "5px" : "0.55rem";
  const bulletMarkerH = isBrutalist ? "0.45rem" : polish > 0.7 ? "5px" : "1px";
  const bulletMarkerRadius = polish > 0.7 ? "999px" : "0";
  const bulletMarkerColor = polish > 0.7 ? "var(--accent)" : "var(--fg)";

  const skillFont =
    polish > 0.55
      ? "var(--font-body-next), 'Inter', sans-serif"
      : "var(--font-mono-next), 'JetBrains Mono', ui-monospace, monospace";
  const skillBorder = isBrutalist ? "1px solid var(--fg)" : "none";
  const skillPad = isBrutalist ? "0.4rem 0.6rem" : "0";
  const skillCase = isBrutalist ? "uppercase" : "none";
  const skillTracking = isBrutalist ? "0.12em" : "0.01em";
  const skillSepDisplay = polish > 0.55 ? "inline" : "none";
  const skillGap = isBrutalist
    ? "0.4rem 0.4rem"
    : polish > 0.55
      ? "0.1rem 0.1rem"
      : "0.4rem 0.5rem";
  const skillSize = isBrutalist ? "var(--size-meta)" : "var(--size-body)";
  const chipBg = "transparent";

  const accent = mix("#000000", "#a04a26", polish);

  // ---------- HIERARCHY ----------
  const h1Min = lerp(1.6, 2.6, hierarchy);
  const h1Pref = lerp(2.2, 9, hierarchy);
  const h1Max = lerp(2.6, 7.5, hierarchy);
  const sizeH1 = `clamp(${h1Min.toFixed(2)}rem, ${h1Pref.toFixed(2)}vw, ${h1Max.toFixed(2)}rem)`;

  const sizeH2 = `${lerp(1.2, 2.6, hierarchy).toFixed(2)}rem`;
  const sizeH3 = `${lerp(1.0, 1.35, hierarchy).toFixed(2)}rem`;
  const sizeBody = "1rem";
  const sizeMeta = `${lerp(0.82, 0.74, hierarchy).toFixed(2)}rem`;
  const sizeTagline = `${lerp(1.05, 1.45, hierarchy).toFixed(2)}rem`;

  const trackingH1 = isBrutalist
    ? trackingDisplay
    : `${lerp(-0.005, -0.04, hierarchy).toFixed(3)}em`;
  const trackingH2 = `${lerp(-0.002, -0.02, hierarchy).toFixed(3)}em`;

  const weightDisplay = isBrutalist
    ? Math.round(lerp(700, 800, hierarchy))
    : Math.round(lerp(500, 700, hierarchy));
  const weightH2 = isBrutalist
    ? Math.round(lerp(700, 800, hierarchy))
    : Math.round(lerp(500, 700, hierarchy));
  const weightH3 = Math.round(lerp(500, 600, hierarchy));
  const weightBody = "400";

  // ---------- DENSITY ----------
  const gapSection = `${lerp(7.5, 2.2, density).toFixed(2)}rem`;
  const gapBlock = `${lerp(2.8, 1.0, density).toFixed(2)}rem`;
  const gapItem = `${lerp(1.1, 0.5, density).toFixed(2)}rem`;
  const padCard = `${lerp(2.4, 1.0, density).toFixed(2)}rem`;
  const line = `${lerp(1.7, 1.35, density).toFixed(2)}`;

  const bulletCap = bulletCapFor(density);
  const colCount = density > 0.55 ? 2 : 1;
  const projCols = density > 0.45 ? 2 : 1;

  // ---------- MOTION ----------
  const motionFast = `${Math.round(lerp(0, 200, motion))}ms`;
  const motionBase = `${Math.round(lerp(0, 360, motion))}ms`;
  const motionSlow = `${Math.round(lerp(0, 580, motion))}ms`;
  const motionDisplay = `${Math.round(lerp(0, 700, motion))}ms`;
  const stagger = `${Math.round(lerp(0, 75, motion))}ms`;

  return {
    "--bg": bg,
    "--fg": fg,
    "--muted": muted,
    "--rule": rule,
    "--rule-weight": ruleWeight,
    "--card-bg": cardBg,
    "--card-border": cardBorder,
    "--card-border-width": cardBorderWidth,
    "--accent": accent,
    "--inverse-bg": inverseBg,
    "--inverse-fg": inverseFg,
    "--radius": radius,
    "--radius-chip": radiusChip,
    "--shadow": shadow,
    "--font-display": fontDisplay,
    "--font-body": fontBody,
    "--case-display": caseDisplay,
    "--case-h2": caseH2,
    "--case-h3": caseH3,
    "--tracking-display": trackingDisplay,
    "--lede-style": ledeStyle,
    "--lede-weight": ledeWeight,
    "--blurb-style": blurbStyle,
    "--tagline-style": taglineStyle,
    "--avocation-style": avocationStyle,
    "--bullet-marker-w": bulletMarkerW,
    "--bullet-marker-h": bulletMarkerH,
    "--bullet-marker-radius": bulletMarkerRadius,
    "--bullet-marker-color": bulletMarkerColor,
    "--skill-font": skillFont,
    "--skill-border": skillBorder,
    "--skill-pad": skillPad,
    "--skill-case": skillCase,
    "--skill-tracking": skillTracking,
    "--skill-sep-display": skillSepDisplay,
    "--skill-gap": skillGap,
    "--skill-size": skillSize,
    "--chip-bg": chipBg,
    "--size-h1": sizeH1,
    "--size-h2": sizeH2,
    "--size-h3": sizeH3,
    "--size-body": sizeBody,
    "--size-meta": sizeMeta,
    "--size-tagline": sizeTagline,
    "--tracking-h1": trackingH1,
    "--tracking-h2": trackingH2,
    "--weight-display": String(weightDisplay),
    "--weight-h2": String(weightH2),
    "--weight-h3": String(weightH3),
    "--weight-body": weightBody,
    "--gap-section": gapSection,
    "--gap-block": gapBlock,
    "--gap-item": gapItem,
    "--pad-card": padCard,
    "--line": line,
    "--col-count": String(colCount),
    "--proj-cols": String(projCols),
    "--bullet-cap": String(bulletCap),
    "--motion-fast": motionFast,
    "--motion-base": motionBase,
    "--motion-slow": motionSlow,
    "--motion-display": motionDisplay,
    "--stagger": stagger,
    "--density": String(density),
    "--polish": String(polish),
    "--hierarchy": String(hierarchy),
    "--motion": String(motion),
  };
}
