# 0005 — CSS custom properties as the styling layer

- **Status:** Accepted
- **Date:** 2026-05-02
- **Deciders:** Oliver Kaikane Gate

## Context

Phase 1 introduces sliders that retheme the entire CV in real time. Four input axes
drive ~50 derived design tokens. The CV body is sizable: header, about, experience,
education, skills, projects, avocations, footer — many subtrees, each with several
typographic and spacing decisions.

There are two natural ways to wire that up:

1. **Top-down React props.** State lives in a Context; every CV component reads
   tokens from `useStyleContext()` and applies them inline.
2. **CSS custom properties.** State lives in Context, but a single client component
   writes derived values onto `document.documentElement.style.setProperty(...)`. CV
   components read them via `var(--…)` in their stylesheets and are otherwise
   indifferent to slider state.

The Phase 1 spec is explicit (criterion #7): *"slider movement does not cause React
re-renders on CV content — only CSS variables on `document.documentElement.style`."*
That phrasing already implies option (2). This ADR documents *why* — partly because
the constraint matters across phases, and partly to capture what we're giving up.

## Decision

Use **CSS custom properties** as the styling layer. State lives in a small client
context (`StyleContext`); a single tiny island (`StyleApplier`) writes the derived
tokens to `<html>.style` on every state change. CV components are Server Components
that consume those properties via inline `style` and CSS rules in `globals.css`.

Specifically:

- `lib/style-tokens.ts:stateToTokens(state)` is the single source of truth for the
  mapping (axes → ~50 named CSS properties).
- `components/controls/StyleApplier.tsx` writes those properties into the DOM. It's
  the only React component that re-renders on slider movement.
- All CV components stay Server Components and reference `var(--gap-block)`,
  `var(--font-display)`, etc. directly.

## Consequences

**Wins**

- **No re-renders on slider movement.** Moving a slider 200 times in a second
  triggers 200 calls to `setProperty` on one element — fast and GPU-friendly. The
  CV's React tree never re-renders.
- **CV stays SSR'd.** Initial paint on `/` ships the same HTML to every visitor.
  The slider is an island; the document is static.
- **One source of truth.** The token-mapping is a pure function (`stateToTokens`)
  that's testable in isolation (see `tests/style-tokens.test.ts`). Visual debugging
  is "what is `--polish` right now" in DevTools.
- **Accessible to print.** The print stylesheet hides the deck and the
  `var(--…)` values just resolve to whatever the cascade says.
- **Survives Next.js / framework changes.** CSS variables are a web platform feature.

**Costs we're explicitly accepting**

- **Less type safety on the values.** A typo in `var(--gap-blok)` doesn't fail the
  TypeScript compile — it silently falls back to `unset`. Mitigation: tests assert
  `stateToTokens` returns every required key (`tests/style-tokens.test.ts`), and
  the inline-style mistake-rate is low because most usages are stable strings.
- **No build-time tree-shaking of unused tokens.** Every token is always defined.
  This is fine — there are ~50 of them.
- **Synchronization.** The bootstrap inline script in `app/layout.tsx` and
  `lib/bootstrap-script.ts` mirror the runtime `stateToTokens` logic to avoid a
  flash for non-default URLs. Two places to update if the mapping ever changes.
  Worth it: the alternative (no bootstrap) gives a visible flash on every shared link.
- **Data-attr toggles for class-style behaviour.** `data-brutalist="true"` and
  `data-kinetic="true"` on `.cv-surface` give us CSS hooks for things that don't
  fit cleanly into a custom property. Acceptable, lightly used.

## Alternatives considered

- **Top-down props.** Rejected — would require every CV component to be a Client
  Component (or at least to take tokens as props from one), drastically inflating
  the client bundle and forcing re-renders of the entire CV tree on every slider tick.
- **CSS-in-JS with a runtime theme provider** (Emotion, styled-components). Same
  problem as top-down props plus a runtime cost; also at odds with the Server
  Components default.
- **Tailwind arbitrary values driven by data attributes** (e.g.
  `data-density="dense" class="data-[density=dense]:gap-2"`). Combinatorially silly
  for continuous values; works only for discrete switches.
- **Static CSS file regenerated per look.** Doesn't work for live interactivity.
- **A worklet/Houdini-style typed custom property layer.** Over-engineered for what
  is fundamentally "set 50 strings on `:root`."

## References

- `lib/style-tokens.ts` — `stateToTokens` and the helpers (`mix`, `lerp`, `clamp`).
- `components/controls/StyleApplier.tsx` — the one client island that writes vars.
- `tests/style-tokens.test.ts` — corner + threshold tests.
- `docs/specs/phase-1.md` § "Token mapping function" + "StyleApplier component".
- ADR-0004 — URL hash for slider state.
