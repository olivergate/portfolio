# 0013 — The `/` tone toggle is pre-written, not live API

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

ADR-0011 split the original Phase 2 surface into two artefacts: `/tone` ships
as a manifesto (Phase 2 proper); the 3-voice tone toggle (Pessimistic /
Honest / Absurd) over the CV bullets ships in Phase 2.5 as a separate
surface on `/`.

The original Phase 2 spec had assumed the toggle would call Anthropic at
click time to rewrite the bullets in the chosen voice. Phase 2's AI
infrastructure (`lib/anthropic.ts`, `lib/kv-cache.ts`, `lib/cost-log.ts`,
`lib/check-cost-ceiling.ts`, `lib/pricing.ts`, `app/api/smoke/route.ts`)
was built to support exactly that: server-side calls only, KV-cached by
prompt-version + input hash, monthly cost ceiling enforced. The
infrastructure works — verified end-to-end against real Anthropic +
Upstash Redis via the smoke endpoint at the start of this phase.

So the question for Phase 2.5 wasn't "can we?" — the infra is in place —
but "should we?" The toggle could ship in three modes:

1. **Live API.** Click → server-side call → cached response → bullet
   crossfade. Real spectacle: AI rewriting the CV in the user's tab.
2. **Pre-written.** Three voices drafted by the agent and edited by
   Oliver, baked into `cv.json`, swapped client-side on click. Zero API
   spend at runtime.
3. **Hybrid.** Pre-written defaults; live API as an optional
   "regenerate" button per role.

## Decision

**The Phase 2.5 tone toggle ships pre-written. Three voices live in
`cv.json` under a `TonedText` Zod schema (`honest`, `pessimistic`,
`absurd`). The client swaps between them on click via a React Context
(`ToneProvider`). No API call is made when the toggle changes. The
satire banner is a static client component that renders only when
`tone === 'absurd'`.**

The Phase 2 AI infrastructure remains live, exercised by the smoke
endpoint and ready for Phase 3 (the JD matcher), where the input is an
unknown JD and live generation is unambiguously the right surface.

## Consequences

**Wins**

- **Honesty.** Every word about Oliver is written by Oliver (or
  drafted by the agent and Oliver-edited before commit). No AI-generated
  copy claiming to be Oliver's own framing.
- **Cost.** Zero ongoing API spend on `/`. The `/api/smoke` verification
  cost ~$0.0001 once. The cost ceiling, KV cache, and cost log all sit
  intact for Phase 3.
- **No fallback UX problem.** A live toggle would need a graceful
  degradation when the monthly cost ceiling is hit: either show a
  stale cached response, or fall back to a pre-written voice, or
  refuse the click. All three are awkward. Pre-written is the floor
  case by construction — there is nothing to degrade to.
- **No prompt versioning churn.** Live tone shifts would need their own
  `PROMPT_VERSIONS` entry, evolving as the prompt was tuned. Pre-written
  copy has no prompt at all.
- **Editable copy.** Oliver can revise any voice via a normal content
  edit on `cv.json`. Live copy would be a moving target controlled by
  the prompt + the model + the cache.
- **Phase 3 is cleaner.** With `/` carrying the CV in three pre-written
  voices, Phase 3's JD matcher becomes the unambiguous AI-spectacle
  surface — and one where live generation is clearly the right tool
  (matching CV against an unknown JD, not rewriting Oliver's bio).

**Costs**

- **Less spectacle on `/`.** A static toggle with three pre-baked
  voices is less viral than "watch the AI rewrite my CV in real time."
  This is the deliberate trade-off; the spectacle moves to `/jd` where
  live generation is justified by the input being unknown.
- **The Pessimistic and Absurd voices are agent-drafted at first.**
  Same edit-cycle as the `/tone` tenets: agent seeds, Oliver edits
  before commit. The shipped copy is Oliver-approved, but anything
  slightly off-voice on first read is on the agent.
- **No "regenerate this bullet" button.** A user who wanted to see
  what a fourth voice would look like can't ask for one. We accept
  this — the three voices are the framing, not a starting point.

**Deliberately not done**

- No live API rewriting of CV bullets, anywhere on the site, ever.
  This is a stronger statement than "not in Phase 2.5" — it's a
  position about the CV itself.
- No hybrid "regenerate" button per role. The Phase 2.5 surface is
  the three voices, period. If a future phase wants to add a live
  exploration of voice on a separate page, that would be a new surface
  with its own ADR.
- No persistence of tone state to URL hash, sessionStorage, or
  localStorage. Tone is in-memory React state only. URL hash is
  reserved for Phase 3 (JD matcher input). On every page load,
  Honest is the default.

## Alternatives considered

- **Live API.** Real-time rewrite on click. Rejected for the four
  reasons above (honesty, cost, fallback UX, prompt-versioning churn).
  The spectacle is real but doesn't justify the costs.
- **Hybrid: pre-written defaults + live "regenerate" button.**
  Considered. Combines the worst of both: still has the cost-ceiling
  fallback problem, still needs prompt versioning, still introduces
  honesty risk, and dilutes the framing of the three voices being
  "Oliver's three takes" rather than "here are some samples." Rejected.
- **Single voice (Honest only) with no toggle.** This is what `/`
  shipped in Phase 1. The toggle adds something: it shows that Oliver
  is comfortable with self-deprecation (Pessimistic) and self-mockery
  (Absurd), which says something the bullets alone don't. Worth the
  Phase 2.5 cost.
- **Drop Phase 2.5 entirely; ship the manifesto and move on to
  Phase 3.** Considered. The manifesto on `/tone` already covers the
  voice question well. But the toggle on `/` is a different statement:
  the manifesto says "this is what I believe"; the toggle says "I can
  laugh at myself." Both are worth saying.

## References

- ADR-0011 — the manifesto-vs-toggle split that set up this phase
- ADR-0008 — server-side AI calls only (still holds; Phase 2.5 makes zero
  AI calls at runtime)
- ADR-0009 — cache-key prompt-version policy (unused on `/`; reserved
  for Phase 3)
- ADR-0010 — per-endpoint cost ceiling (unused on `/`; reserved for
  Phase 3)
- ADR-0014 — Anthropic key + Upstash Redis provisioning (sibling
  decision in this phase)
- `docs/specs/phase-2.5.md` — the phase spec that frames this decision
- `lib/schemas.ts` — `TonedText` Zod schema for the three voices
- `content/cv.json` — the source of truth for all three voices
- `components/cv/ToneProvider.tsx` — React Context holding tone state
- `components/cv/ToneToggle.tsx` — the segmented control
- `components/cv/SatireBanner.tsx` — the absurd-only sticky banner
- `tests/e2e/satire-banner.spec.ts` — locks the SATIRE-chip-on-absurd
  honesty guardrail
- `app/api/smoke/route.ts` — the only Phase 2.5 surface that exercises
  the AI infrastructure end-to-end
