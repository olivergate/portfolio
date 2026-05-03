# 0019 — Bullet reorder on `/jd` is opt-in; original CV order is the truth

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

When a JD has been scored, it's tempting to automatically float Hit-supporting
bullets to the top of each role so the page "answers the JD" by reading order.
The Phase 3 spec includes a reorder feature precisely for this — WAAPI FLIP
animations float Hit-cited bullets to the top, then Stretch-cited, then uncited.

The question is whether reorder is on by default or opt-in.

If it's on by default:

- The first thing a visitor sees after scoring is a CV that's been silently
  reshuffled to look maximally relevant. That's a mild dishonesty — the CV
  isn't actually written that way; the visitor is being shown a custom view
  without being told.
- Two visitors comparing notes ("oh look, his work on Nespresso is the first
  bullet") would be looking at different orderings depending on the JD they
  pasted. The "what does Oliver's CV say" answer becomes JD-dependent.
- Search engines crawling the page (if the SSR returns the reordered version)
  would index a different bullet order than the canonical CV.

If it's opt-in:

- The default state is the CV as written — date order within each role,
  Oliver's chosen sequencing.
- The visitor pulls a switch that says "reorder by relevance" — the framing
  makes clear that this is a viewing aid, not the underlying document.
- The original ordering remains the ground truth. The "Restore original" button
  is always one click away.

Opt-in matches the design source's intent (the reorder switch label is
"Reorder by relevance to this JD" — phrased as an action, not a default state).

## Decision

The bullet reorder toggle on `/jd` defaults to **off**. The user must
explicitly turn it on per-session.

- Off state: `"Original order — The CV as written, the truth, in date order"`
- On state: `"Reordered by relevance to this JD — Hits float up, cited bullets marked"`
- A "Restore original" button appears next to the toggle when reorder is on,
  giving a one-click path back.

The reorder is purely a client-side reordering of role bullets within the
already-rendered DOM. The underlying `cv.json` is unchanged; the API does not
return reordered data. The animation uses WAAPI FLIP for the toggle-on
transition. Reduced motion swaps to instant placement.

The toggle state is **not persisted** in the URL hash or local storage —
each session starts in the off (truthful) state. This is a deliberate choice
to ensure the truthful order is what loads on every visit.

The cited-bullet visual marker (left border + accent) is also tied to the
"scored" state, not to reorder being on. A Hit-cited bullet is marked even
when bullets are in original order — so visitors who don't toggle reorder still
see *which* bullets the chips cited.

## Consequences

**Wins:**
- The default-rendered CV is the authoritative one. SSR returns the canonical
  order. Search engines index the canonical order.
- Visitors who comparing notes are looking at the same document.
- The reorder feature stands as a useful but opt-in viewing aid — clearer
  framing for what it actually is.

**Costs:**
- A visitor who would have appreciated the reorder by default now has to find
  the toggle. Mitigated by placing the toggle prominently above the experience
  section once a JD has been scored.
- Toggle state vanishing on refresh might mildly surprise visitors who left
  the page reordered and reload it. Acceptable — the truthful default is
  worth the small UX friction.

**Deliberately not done:**
- No URL parameter for the reorder state.
- No "remember my reorder preference" local storage.
- No SSR-time reorder. The original order is what ships on first paint.

## Alternatives considered

- **Reorder on by default after scoring.** More immediate "wow" effect.
  Rejected: subtle dishonesty, JD-dependent canonical view, indexing concerns.
- **Persist reorder state in URL hash.** Sharable. Rejected: the hash would
  encode a non-canonical view of Oliver's CV; sharing it means a third party
  sees a JD-tailored CV without knowing it.
- **No reorder at all.** Simplest. Rejected: the cited-bullet borders alone
  don't make Hit-supporting bullets easy to find on long roles.

## References

- Phase 3 spec: `docs/specs/phase-3.md` §Tasks 8 and 11
- Honesty guardrails: CLAUDE.md
- Conservative-bias matcher: ADR-0016
- Design source: `design-references/source/cv-jd.html` (reorder switch copy)
