---
slug: owasp-trainer/technology
status: published
---

## A static SPA with a thin server seam

React 18 + TypeScript (strict) on Vite, hash-routed, no router library and no state library on purpose, the app is small and meant to stay that way. The course itself is typed data: each module is a `ModuleDef` object, so adding a risk is editing a file, not wiring a page. CodeMirror 6 drives the lab editors. The build is relocatable (`base: './'`), so the whole thing can drop onto any static host.

## The sandbox

Running learner-written code safely is the heart of it. **JavaScript labs** execute in a sandboxed Web Worker with no DOM and no network and a 4-second timeout to contain infinite loops; the exploit tests call the patched functions with real attack inputs. **Python labs** load Pyodide (CPython in WebAssembly) on demand and run against a real in-memory SQLite database. If a sandbox can't start, labs fall back to static pattern checks where available. `new Function()` is essential here — the whole point is to execute the learner's fix — so the threat model is "untrusted code in your own browser tab", never on a server.

## The optional sync layer

The trainer was backend-free by design (its ADR-0002). Hosting it as a public demo made cross-device progress worth the first server surface, added without compromising the sandbox boundary:

- **Vercel serverless functions** under `api/` handle a magic-link sign-in (email → one-click link), a session cookie, and progress read/write. Sessions are opaque ids in an httpOnly cookie looked up in Redis, no JWT.
- **Upstash Redis** stores one JSON progress blob per user plus a few counters for owner-only usage stats. **Resend** sends the magic link.
- The boundary that matters held: only the progress *summary* and a verified email sync. Lab code, quiz answers, anything typed into an editor, never leaves the browser. That reversal is written up as ADR-0011, which supersedes the original "no backend" decision and restates the security core it keeps.

## Tested like it ships

A lab-verification harness runs every lab's starter and solution through a Node replica of the in-browser test runner: the starter must fail its exploits, the solution must pass. On top of that, Vitest unit and content-integrity tests (including the new sync handlers, with Redis and Resend mocked) and Playwright end-to-end journeys with axe accessibility scans. `npm run check` runs the type-check, the lab contract, and the unit tests together.
