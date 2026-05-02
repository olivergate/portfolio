export type StyleState = {
  density: number;
  polish: number;
  hierarchy: number;
  motion: number;
};

export const DEFAULT_STYLE: StyleState = {
  density: 0.5,
  polish: 0.5,
  hierarchy: 0.5,
  motion: 0.5,
};

// stateToTokens(state) is implemented in Phase 1 — see
// design-references/source/cv-app.jsx for the reference mapping.
