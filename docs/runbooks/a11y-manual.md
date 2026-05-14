---
kind: runbook
title: Manual accessibility check (Phase 4.5)
status: active
date: 2026-05-14
---

# Manual accessibility check

Run this before every `/phase-done` from Phase 4.5 onward, and before each
production release. It complements the automated bar (`bun run a11y` +
`bun run a11y:lhci`) — the automated tooling catches roughly half of
real-world accessibility issues; the rest are surfaced only by walking the
site with assistive tech.

End state: every checklist item below is signed off (pass / fail + date +
tester). Any failure becomes a Phase 7 bug or — if it predates 4.5 — gets
filed against the spec it originated in.

## Prerequisites

- A local production build is running: `bun run build && bun run start --port 3100`
  (the dev server has different focus/animation timings; release-track checks
  should hit the prod build).
- macOS Safari + VoiceOver available (Cmd+F5 toggles VO).
- Either: Windows Firefox + NVDA, OR Edge with the "forced colors" devtool
  emulation enabled (faster, but the Windows pair is the canonical check).
- An iOS device with Safari + VoiceOver (Settings → Accessibility → VoiceOver).
- The current Phase 4.5 conformance claim: WCAG 2.2 AA across every page and
  every reachable slider state.

## Steps

The checks are organised by environment, not by page. Each environment
covers all routes in one sweep.

### 1. Keyboard-only walkthrough (no assistive tech)

Disconnect or ignore the mouse. Tab through every route from a cold load.

| Route | Verify |
|---|---|
| `/` | Skip link is the first tab stop; activating it lands focus on the main content. Every section nav link reachable; the rethemer FAB pill is reachable; opening the panel exposes four sliders, each operable with arrow keys. Visible focus ring at every step. |
| `/jd` | Sample-JD pills tab-able with visible focus. Textarea has an accessible name (turn on VO briefly to confirm "Paste a job description"). Score button reachable; chips in result grid reachable; expanding a miss chip works without mouse. |
| `/lab` | Project cards reachable; featured demo's interactive elements all reachable. |
| `/blog` | Post links reachable. |
| `/blog/[slug]` | Body links + back link reachable. |
| `/accessibility` | Mail link reachable; in-page anchors function. |
| `/game` (when implemented) | See Phase 5 §13. |

**Pass condition:** every interactive element is reachable in a logical order
matching visual layout, the focus ring is visible at every step, and Escape
closes any overlay (rethemer panel, miss-chip disclosure).

**Pass / fail:** ____   **Date:** ____   **Tester:** ____

### 2. macOS Safari + VoiceOver

Cmd+F5 to start VO. Use VO+→ to navigate, VO+Space to activate, VO+U to open
the rotor.

| Verify | How |
|---|---|
| Page titles announce on route change | Tab between routes; VO should speak the new `<title>` (Next.js route announcer) plus, on first focus shift, the `<main>` landmark. |
| `<h1>` per page is unique and descriptive | VO+U → Headings. One H1 per page. |
| JD live region announces on Score | `/jd`, paste a 200-char JD, click Score. After ~5–15s VO should speak "Scored. N hits, N stretches, N honest gaps." once — not per token. |
| JD textarea has a real label | Click into textarea. VO speaks "Paste a job description, edit text." |
| Chip-grid reads as a list | After scoring, VO should announce "List, N items" before reading individual chips. |
| Chip categories carried by text, not color | Each chip announces e.g. "Hit: built data platform from scratch" — the category word is in the announcement. |
| Slider deck values announce | Open panel, focus a slider, drag with arrow keys. VO announces the value via the native `<input type=range>` aria-valuetext (or the value attribute). |
| Skip link works | First tab, then enter. Focus lands on the page content and VO announces "main". |

**Pass / fail:** ____   **Date:** ____   **Tester:** ____

### 3. Windows Firefox + NVDA

Same matrix as §2, on the NVDA + Firefox pairing. Differences to watch for:

- NVDA reads aria-live regions slightly more aggressively than VO; verify the
  JD region doesn't double-announce on level-change rescores (it shouldn't —
  level changes don't update `announce`).
- NVDA may read aria-expanded toggle state on miss chips ("collapsed" /
  "expanded"). Verify this on expand-toggle.
- NVDA + Firefox surfaces `display: contents` listitem-role differences if
  any — verify the chip grid still announces as a list.

**Pass / fail:** ____   **Date:** ____   **Tester:** ____

### 4. Browser zoom to 400%

Set browser zoom to 400% on `/`, `/jd`, `/lab`. Each route should:

- Not lose content
- Not introduce a horizontal scrollbar at the viewport level (in-page scroll
  inside a `<pre>` block is fine)
- Keep all interactive controls visible and operable

Note: the rethemer FAB at 400% zoom may overlap content — that's an
acceptable trade-off documented in the FAB's existing layout rules. As long
as the underlying content is reachable (close the panel; the FAB pill is
small enough not to block), this passes.

**Pass / fail:** ____   **Date:** ____   **Tester:** ____

### 5. Reduced motion (OS pref)

macOS: System Settings → Accessibility → Display → Reduce motion. Reload `/`.

Verify:
- The CV-surface transitions are instant (no fade-in on bullet reveals, no
  scroll-spy underline tweens)
- The motion slider has no visible effect on transitions (the
  `prefers-reduced-motion: reduce` block in `tokens.css` zeroes the motion
  tokens regardless of slider position)
- Chip enter animations on `/jd` are skipped
- The slider thumb on `/jd`'s StretchSlider doesn't smooth-slide (it jumps
  to the new position)

The slider controls themselves remain at their user-chosen position. The
reduced-motion pref only kills timing, not state.

**Pass / fail:** ____   **Date:** ____   **Tester:** ____

### 6. Forced colors / Windows High Contrast Mode

Easiest path: Edge devtools → Rendering panel → "Emulate CSS media feature
forced-colors: active". Walk through `/`, `/jd`, `/lab`, `/accessibility`.

Verify:
- Body, headings, mono kickers all paint in CanvasText against Canvas
- Links/CTAs paint in LinkText
- Chip categories on `/jd` differentiate via system colors (Highlight for
  hits, Mark for stretches, GrayText for misses) — the symbol+label text
  carries the meaning when colors collapse
- The rethemer FAB pill + panel keep their custom dark chrome (the
  `forced-color-adjust: none` opt-out per ADR-0032)
- The skip link keeps its custom appearance (also opt-out)
- Slider thumbs are visible and operable

Real Windows HCM is the canonical check if available; the Edge emulation is
a reasonable preview.

**Pass / fail:** ____   **Date:** ____   **Tester:** ____

### 7. Tab order audit

Open axe DevTools (Chrome/Firefox extension) on `/`. Run the "Tab order"
inspection.

Verify the visual order matches the DOM order. Anything reading right-to-left
(e.g. the meta block in the JD section header) should follow the visible
layout cue, not the source order.

**Pass / fail:** ____   **Date:** ____   **Tester:** ____

### 8. iOS Safari + VoiceOver

On a real device (simulator suffices for routine checks but doesn't catch
gesture-trap regressions). Settings → Accessibility → VoiceOver.

Walk `/`, `/jd`, `/accessibility`. Verify:
- Headings rotor (two-finger twist → headings) lists every H1/H2/H3
- Swipe-right reads through each element; landmark announcement on `<main>` entry
- The JD textarea is operable (single-tap to focus, soft keyboard appears)
- The rethemer FAB is reachable via swipe and the panel opens with double-tap

**Pass / fail:** ____   **Date:** ____   **Tester:** ____

## Known symptoms / fallbacks

**Symptom:** VO doesn't announce the JD score summary.
**Diagnosis:** Live region might not have been in the DOM on first render
(SRs subscribe to live regions at mount, not at content-change). Confirm via
DOM inspector that the `<div role="status">` exists outside any conditional.
**Fix:** see `components/jd/JDAdapter.tsx` — the region renders unconditionally
right after the opening `<div>` of the component.

**Symptom:** Axe Playwright fails on `color-contrast` for a slider corner
position that the contrast Vitest passed.
**Diagnosis:** Axe samples rendered pixel colors, not token values; an
animation in flight may have intermediate opacity. The existing 1.6s timeout
in `tests/e2e/a11y.spec.ts` is calibrated for the kinetic reveal stagger —
if the test still flakes, bump the wait.
**Fix:** raise the `waitForTimeout` in the corresponding test block; do not
suppress the violation.

**Symptom:** Forced-colors emulation makes the chip grid unreadable.
**Diagnosis:** The chip background (color-mix with --hit/--stretch/--miss)
is opt-in via `forced-color-adjust: auto` (default); the browser substitutes
system colors. The chip's symbol + label text should still carry meaning.
**Fix:** if a real user reports illegibility, add a per-chip
`forced-color-adjust: none` and file as a Phase 7 follow-up.

## Related

- Phase 4.5 spec: `docs/specs/phase-4.5.md`
- ADR-0032 — Accessibility approach
- Conformance statement: `/accessibility`
- Automated bar: `bun run a11y` (see `package.json` scripts)
