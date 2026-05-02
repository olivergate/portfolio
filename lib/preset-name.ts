import type { StyleState } from "@/lib/style-tokens";

/** Diagnostic readout shown on the deck. Port of getPresetName from cv-deck.jsx. */
export function getPresetName({ density, polish, hierarchy, motion }: StyleState): string {
  if (polish < 0.22 && hierarchy > 0.7 && density > 0.55) return "EDITORIAL";
  if (polish > 0.72 && hierarchy < 0.32 && density < 0.4 && motion < 0.3) return "QUIET DOCUMENT";
  if (motion > 0.78 && density > 0.7) return "KINETIC";
  if (polish < 0.22 && hierarchy > 0.65) return "FASHION HOUSE";
  if (polish < 0.25) return "BRUTALIST";
  if (polish > 0.78) return "REFINED";
  if (density > 0.78) return "DENSE";
  if (density < 0.22) return "SPARSE";
  if (hierarchy > 0.78) return "DRAMATIC";
  if (
    Math.abs(density - 0.5) < 0.05 &&
    Math.abs(polish - 0.5) < 0.05 &&
    Math.abs(hierarchy - 0.5) < 0.05
  )
    return "RESTING";
  return "BALANCED";
}
