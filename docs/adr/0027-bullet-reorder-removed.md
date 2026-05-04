# 0027 — Bullet reorder removed; original CV order is the only order

- **Status:** Accepted
- **Date:** 2026-05-04
- **Deciders:** Oliver Kaikane Gate

## Context

ADR-0019 chose to make bullet reorder *opt-in* rather than on-by-default — the
honesty argument being that visitors comparing notes about Oliver's CV should be
looking at the same document, not a JD-tailored view.

In practice the toggle plus the WAAPI FLIP animation it drove created a real
problem: clicking evidence chips and toggling reorder caused the experience
section to visibly rearrange, which (combined with miss-chip inline expansion
reflowing the chip grid) made the page feel jumpy. The "Original order" /
"Reordered by relevance" header label flicker on every sample-pill switch was
also noisy chrome.

The honesty argument from 0019 still holds, and is in fact strengthened by
removing the feature entirely: there is now exactly one bullet order — the one
in `cv.json` — and no UI toggle that could mislead.

## Decision

Remove the bullet reorder feature outright. Bullets always render in
`cv.json` order.

Concrete deletions:
- `components/jd/ReorderToggle.tsx` (file deleted)
- `rankBullets` in `components/jd/JDExperience.tsx` (function deleted)
- The `reorder` prop on `<JDExperience />` and the `reorder` state in
  `<JDAdapter />`
- The WAAPI FLIP `useLayoutEffect` in `<Role />` (only fired during reorder
  transitions; dead weight without reorder)
- `.jd-switch` CSS in `styles/globals.css`
- The "reordered by relevance" / "original order" header meta label

The cited-bullet visual marker (left border + accent) is unchanged — it remains
tied to the "scored" state. Visitors still see *which* bullets the chips cite;
they just don't see the bullets re-sequenced.

## Consequences

**Wins:**
- One canonical bullet order, period. No JD-dependent view of the CV.
- Layout stability: the experience section never reflows on chip click,
  sample-pill change, or stretch-slider change.
- Less code: one fewer client-only file, one fewer `useLayoutEffect`,
  ~40 lines of CSS, two e2e test cases collapsed.
- Search engines and link-sharers always see the same document.

**Costs:**
- A visitor on a long role can no longer pull cited bullets to the top to
  scan them quickly. Mitigation: the cited-bullet left-border accent + the
  "click hits to jump" behavior in `<JDAdapter />` already gives an
  evidence-traversal path that doesn't require reordering.

**Deliberately not done:**
- No replacement "highlight all hits" mode — the cited-bullet borders are the
  highlight.

## Alternatives considered

- **Keep opt-in (ADR-0019 status quo).** Rejected — the toggle + animation are
  the source of layout jump on chip interactions, and the honesty win of
  removing the toggle entirely is real.
- **Default-on reorder.** Same dishonesty concerns 0019 already rejected.
- **Reorder without animation.** Removes the most visible jump but keeps the
  JD-dependent-canonical-view problem from 0019.

## References

- Supersedes ADR-0019.
- Honesty guardrails: CLAUDE.md.
- Conservative-bias matcher: ADR-0016.
- Cited-bullet markers (visual): unchanged from Phase 3.
