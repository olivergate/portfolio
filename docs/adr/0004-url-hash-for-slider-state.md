# 0004 — URL hash for slider state

- **Status:** Accepted
- **Date:** 2026-05-02
- **Deciders:** Oliver Kaikane Gate

> **Later change (2026-05-03):** the URL-hash-as-share-URL mechanism described
> below — the `Share this look` button and the writable hash — was retired in
> Phase 3. See ADR-0020. The persistence intent (a returning visitor sees the
> look they left on) survives, now backed by `localStorage` rather than the
> hash. The Decision / Rationale / Alternatives below remain the historical
> record of the original choice.

## Context

Phase 1 introduces four sliders that retheme the CV (density / polish / hierarchy /
motion). The four values together describe a "look" — and a key feature of the site is
that any look should be **shareable**: paste a link, get my CV at exactly that look.

So the slider state needs to round-trip via the URL. The questions are *where* in the
URL it goes and *how* it's encoded.

Constraints:

- The page is a Server Component. Per the spec ("slider movement does not cause React
  re-renders on CV content"), the slider values must not propagate through React props
  on every move. State changes need to feel free.
- Links are pasted into chat tools, GitHub PRs, and address bars by humans. Readability
  matters — a recruiter glancing at the URL should be able to tell something theme-related
  is in there.
- The Phase 1 spec recommends `#d=0.7&p=0.3&h=0.5&m=0.2`. The HTML/JSX prototype in
  `design-references/source/cv-app.jsx` uses `#look=<base64-json>`. Both are real
  prototypes; both work.

## Decision

Use the **URL hash** (`#…`), with a **plain key=value form**:
`#d=0.7&p=0.3&h=0.5&m=0.2`. Short keys (`d/p/h/m`); values clamped to `[0, 1]`,
serialized to 3 decimals. A small custom hook (`lib/hash-state.ts`) reads the hash on
mount, writes it on change via `history.replaceState` (no entries added to back stack).

Specifically:

- **Hash, not query string.** The hash never reaches the server, so there's no SSR
  cost on every slider move. The page also doesn't get re-fetched.
- **Plain `d=&p=&h=&m=` form**, not the design's `#look=base64`. A reader scanning
  `https://olivergate.com/#d=0&p=0&h=1&m=0` can tell that's "min density, min polish,
  max hierarchy, no motion" without decoding anything.
- **Custom hook**, not `nuqs`. CLAUDE.md proposes `nuqs` for URL-as-state, but `nuqs`
  is built around query strings. For a single grouped state in the hash, a 30-line
  custom hook is less code than wiring nuqs around it, and avoids the dependency.

## Consequences

**Wins**

- Sharing is one-click (copy URL bar) or one-button (the deck's SHARE button).
- No SSR roundtrip on slider movement; visiting a deep-link doesn't double-render.
- The URL is human-grep-able. Useful for debugging, useful in writing about the site.
- Decoupled from any framework's URL state library — survives Next.js majors.

**Costs**

- The URL grows by ~30 characters when non-default. Acceptable.
- Two custom-prop sources of truth on first paint: the inline `<script>` in
  `app/layout.tsx` writes the hash's CSS vars synchronously *before* React hydrates,
  then the `StyleApplier` writes the same vars again post-hydration. Cost is one
  duplicate write; benefit is no flash for shared links.
- Browser history hygiene: every change is `replaceState`, not `pushState`. The user
  can't "back" through slider moves. That's the right tradeoff (back-spamming would
  be hostile), but worth noting.

## Alternatives considered

- **Query string (`?d=&p=&h=&m=`).** Rejected — would invalidate Next.js's request
  cache on each move and cause an SSR roundtrip, defeating the "no React re-renders"
  rule.
- **Base64-encoded JSON in `#look=`** (the design source's approach). Rejected — opaque
  to humans, requires `atob` + JSON.parse on read with a try/catch, and gains us
  nothing (the four floats fit in 30 characters plain).
- **`localStorage` only, with a "share" button that creates a one-off hash on demand.**
  Rejected — the URL *is* the share. Forcing an extra click for the canonical
  representation is friction with no upside.
- **`nuqs`.** A good library, wrong shape — query-string-oriented, designed for
  many discrete fields per page. Adds a dependency for one grouped state.
- **A dedicated route per preset.** Cute, but combinatorial: 4 axes × continuous range = ∞.

## References

- `lib/hash-state.ts` — implementation (deleted in Phase 3 per ADR-0020;
  replaced by `lib/local-storage-state.ts`)
- `lib/bootstrap-script.ts` — pre-hydration apply
- `docs/specs/phase-1.md` § "State management + URL hash sync"
- `design-references/source/cv-app.jsx` — the alternative `#look=base64` form
- ADR-0020 — retires the share-URL mechanism while preserving the
  persistence intent via `localStorage`
