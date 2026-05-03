# 0020 — localStorage replaces URL-hash sharing for the slider deck

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

Phase 1 introduced the slider deck on `/` with a URL-hash mechanism so a
visitor's tuned look could be shared as a copyable URL like
`https://olivergate.com/#d=0.5&p=0.55&h=0.55&m=0.5`. ADR-0004 captured the
choice. The deck rendered a *Share this look* button that wrote the current
state to `window.location.hash` and copied the URL to the clipboard.

In practice the hash was visible on every page load, polluted the address bar,
showed up in shared links the visitor never intended to share, and made the URL
visually noisy for what's mostly a personal CV. The "share a look" affordance
also wasn't load-bearing for the site's actual purpose — recruiters and
colleagues don't tend to swap UX-slider configurations of someone else's CV.

What the slider deck actually needs is **consistency across visits**: when a
visitor returns to `/`, they should see the configuration they left on, not a
reset to defaults. That's a localStorage problem, not a URL problem.

## Decision

Replace URL-hash sharing with localStorage persistence. Specifically:

- The `Share this look` button is **removed** from `SliderDeck.tsx`. The deck
  now has only a `↺ RESET` action.
- `lib/hash-state.ts` is **deleted**. Replaced by `lib/local-storage-state.ts`
  exposing `useLocalStorageState()` with the same hook contract (returns
  `[StyleState, setState]`) but reading and writing
  `localStorage["olg-cv-style-v1"]` instead of the URL hash.
- The bootstrap script (`lib/bootstrap-script.ts`) reads the same localStorage
  key synchronously in `<head>` to apply the cached look before hydration —
  same anti-flash purpose as before, different storage backend. Storage key
  is shared and pinned by `tests/bootstrap-parity.test.ts`.
- `ShareToast` component, `share` callback in StyleContext, `ToastContext`,
  and the `useToast` hook are all removed. They had no other consumers.
- The bootstrap script bails on non-`/` routes (added in Phase 3) — combined
  with the deck only mounting on `/` (also Phase 3), the URL bar on every
  non-`/` route stays clean of any styling state.

The localStorage value shape mirrors the in-memory `StyleState` (a JSON object
with `density / polish / hierarchy / motion` numbers in 0..1). Defensive parse
returns `null` on malformed values; the visitor falls back to defaults.

This supersedes the relevant section of **ADR-0004** (URL hash for slider state)
in spirit but not in form — ADR-0004 documented the hash as the source of truth
for *sharing*, which is no longer a feature; the persistence intent
(survive-a-reload) is what survives, now via localStorage.

## Consequences

**Wins:**
- The address bar is clean on every route.
- A returning visitor's configuration persists across visits, including
  return visits days later (localStorage has no expiration unless the visitor
  clears site data).
- One fewer surface to test (no hash-change event listeners, no popstate
  cleanup, no shareUrl helper).
- Removes the hydration-mismatch warning that the URL-hash mechanism caused
  on every page load.

**Costs:**
- No way to share a configured look as a URL. The `Share this look` button
  was the visible affordance for that; no equivalent ships.
- localStorage is per-origin, per-browser. A visitor returning on a different
  device sees defaults. Acceptable — this is a personal CV, not a multi-device
  configuration tool.
- localStorage may be unavailable (Safari private mode, quota exceeded,
  disabled). The hook silently no-ops on write failures and returns null on
  read; the visitor gets a working session with no persistence. No UI signal —
  failures are too rare to be worth surfacing.

**Deliberately not done:**
- No "export as URL" fallback — if you want to share a look, you can describe
  it in words.
- No cross-device sync. No server-side state. The slider deck is a
  client-only ornament.
- No migration path for existing shared-URL bookmarks. The `Phase 3 ship`
  audience is small enough that grandfathering isn't worth the complexity;
  old hash links just get default styling.

## Alternatives considered

- **Keep the URL hash but hide the share button.** Cosmetic fix only — the
  hash still appeared after every slider movement. Rejected.
- **URL search params instead of hash.** Same address-bar pollution; worse on
  shared URLs because search params get logged in analytics and referrers.
  Rejected.
- **Cookie-based persistence.** Sent to the server on every request,
  unnecessary load. Rejected for a client-only ornament.
- **IndexedDB.** Async, larger API surface, no benefit over localStorage at
  this scale. Rejected.
- **Don't persist at all (always start at defaults).** Simplest, but the
  rationale for the slider deck includes "the visitor's look survives reloads"
  — without persistence the deck is purely ephemeral, which felt wrong given
  how prominent it is on `/`. Rejected.

## References

- Predecessor: ADR-0004 (URL hash for slider state) — the hash-as-share-URL
  mechanism this ADR retires
- Phase 3 review surfaced both the hash-on-/jd visual conflict and the
  hydration warning that motivated this change
- `tests/bootstrap-parity.test.ts` — pins the storage key + value shape
  contract between the bootstrap script and the runtime hook
- `lib/local-storage-state.ts` — the runtime hook
- `lib/bootstrap-script.ts` — synchronous pre-hydration apply
