---
title: Architectural Decision Records — Index
purpose: Authoritative list of all Accepted, Proposed, and Superseded ADRs for this project.
audience: humans + agents
last_verified: 2026-05-26
canonical_for: [architectural-decisions, adr-process]
---

# Architectural Decision Records — Index

An Architectural Decision Record (ADR) captures one significant architectural decision: the context that prompted it, the choice that was made, and the consequences that follow. Each ADR is a single page in Nygard format (Status / Context / Decision / Consequences / Alternatives considered) stored as `docs/adr/NNNN-<slug>.md`. ADRs explain *why* — they are the second-highest authority in this repo, losing only to tests, type schemas, and Zod schemas.

The format itself is established by ADR-0003. The `/decisions` page (Phase 7) renders these as a public list.

## How to propose a new ADR

1. Copy the template at `docs/adr/0000-template.md` (or use `/adr <title>` to scaffold).
2. Create `docs/adr/NNNN-<slug>.md` using the next unused four-digit number.
3. Set `Status: Proposed`, fill Context and Decision, open a PR (or commit directly if working solo).
4. Discuss / iterate while `Status: Proposed`.
5. On accept, flip to `Status: Accepted`, set `Date:`, and add a row to the table below.

## Editability policy

An Accepted ADR is not uniformly frozen. Two tiers (see ADR-0012 for the full policy):

**Frozen** — requires a superseding ADR to change:

- the decision itself (the X-not-Y choice in the Decision section)
- the rationale for choosing X
- the Alternatives-considered record
- the `Date:` stamp

**Editable in place** — amend on a commit, no supersession:

- current-state enumerations (lists of files, versions, modes, carve-outs, call sites, route paths)
- cross-references to other ADRs
- factual corrections (file renames, typo fixes, wrong line numbers)
- forward pointers to specs or commits that did not exist at authoring time

Rule of thumb: if the edit would change what a reader believes we chose or why, write a new ADR. If it keeps that belief intact while updating a factual detail, amend in place. Scope amendment commits `docs(adr): amend ADR-NNNN <what>`. `Status: Accepted` does not flip on amendment — it flips only on supersession.

## ADRs

| ADR | Title | Status | Date | Supersedes | Superseded by |
|-----|-------|--------|------|------------|---------------|
| [0001](./0001-stack.md) | Stack: Next.js 16 (App Router) on Vercel, with Bun as the package manager | Accepted | 2026-05-02 | — | — |
| [0002](./0002-design-system.md) | Design system locked from the claude.ai handoff | Accepted | 2026-05-02 | — | — |
| [0003](./0003-adr-format.md) | ADR format and the public `/decisions` page | Accepted | 2026-05-02 | — | — |
| [0004](./0004-url-hash-for-slider-state.md) | URL hash for slider state | Accepted | 2026-05-02 | — | — |
| [0005](./0005-css-custom-properties-as-styling-layer.md) | CSS custom properties as the styling layer | Accepted | 2026-05-02 | — | — |
| [0006](./0006-slider-deck-is-design-locked.md) | The slider deck is design-locked | Superseded | 2026-05-02 | — | 0026 |
| [0007](./0007-muted-color-wcag-aa-deviation.md) | `--muted` color deviation for WCAG AA at refined polish | Accepted | 2026-05-03 | — | — |
| [0008](./0008-server-side-ai-calls-only.md) | Server-side AI calls only | Accepted | 2026-05-03 | — | — |
| [0009](./0009-cache-key-includes-prompt-version.md) | Cache key includes prompt version; no TTLs | Accepted | 2026-05-03 | — | — |
| [0010](./0010-cost-ceiling-per-endpoint.md) | Cost ceiling enforced per-endpoint, not via global rate limiting | Accepted | 2026-05-03 | — | — |
| [0011](./0011-tone-as-manifesto-not-live-toggle.md) | `/tone` ships as a manifesto; the live AI toggle is a separate surface | Accepted | 2026-05-03 | — | — |
| [0012](./0012-adr-editability-tiers.md) | ADR editability tiers | Accepted | 2026-05-03 | — | — |
| [0013](./0013-pre-written-tone-toggle.md) | The `/` tone toggle is pre-written, not live API | Superseded | 2026-05-03 | — | 0030 |
| [0014](./0014-anthropic-key-redis-provisioning.md) | Anthropic key + Upstash Redis provisioning model | Accepted | 2026-05-03 | — | — |
| [0015](./0015-jd-two-stage-pipeline.md) | JD adapter uses a two-stage parse-then-match pipeline | Accepted | 2026-05-03 | — | — |
| [0016](./0016-jd-matcher-conservative-bias.md) | JD matcher prompt is conservative-biased | Accepted | 2026-05-03 | — | — |
| [0017](./0017-stretch-slider-semantics.md) | Stretch slider adjusts only the Hit/Stretch boundary; API receives a discrete level | Accepted | 2026-05-03 | — | — |
| [0018](./0018-no-top-line-match-percentage.md) | No top-line match percentage on `/jd` | Accepted | 2026-05-03 | — | — |
| [0019](./0019-bullet-reorder-opt-in.md) | Bullet reorder on `/jd` is opt-in; original CV order is the truth | Superseded | 2026-05-03 | — | 0027 |
| [0020](./0020-localstorage-replaces-url-hash-share.md) | localStorage replaces URL-hash sharing for the slider deck | Accepted | 2026-05-03 | — | — |
| [0021](./0021-demo-isolation.md) | Demo isolation: each demo is its own Route Handler + component pair | Accepted | 2026-05-04 | — | — |
| [0022](./0022-per-route-ratelimit-additive-to-cost-ceiling.md) | Per-route rate limit (10/h/IP on `/api/retro`), additive to ADR-0010 | Accepted | 2026-05-04 | — | — |
| [0023](./0023-no-real-world-side-effects-from-demos.md) | No real-world side effects from demos | Accepted | 2026-05-04 | — | — |
| [0024](./0024-linkout-cards-not-embedded-screens.md) | Linkout cards over embedded screens for `/lab` secondary projects | Accepted | 2026-05-04 | — | — |
| [0025](./0025-canned-fallback-for-retro-demo.md) | Canned-response fallback for retro demo on failure paths | Accepted | 2026-05-04 | — | — |
| [0026](./0026-rethemer-fab-supersedes-deck.md) | Rethemer FAB supersedes the design-locked slider deck | Accepted | 2026-05-04 | 0006 | — |
| [0027](./0027-bullet-reorder-removed.md) | Bullet reorder removed; original CV order is the only order | Accepted | 2026-05-04 | 0019 | — |
| [0028](./0028-single-page-consolidation.md) | Single-page consolidation; `/jd`, `/tone`, `/lab` redirect to `/#section` | Accepted | 2026-05-04 | — | — |
| [0029](./0029-jd-no-duplicate-cv.md) | JD adapter no longer renders a duplicate CV; chip evidence resolves to canonical CV bullets | Accepted | 2026-05-04 | — | — |
| [0030](./0030-remove-live-cv-tone-toggle.md) | Remove the live CV tone toggle; CV ships single-voice | Accepted | 2026-05-05 | 0013 | — |
| [0031](./0031-manifesto-pledges-single-voice.md) | Manifesto rewritten as six pledges, single-voice | Accepted | 2026-05-06 | — | — |
| [0032](./0032-accessibility-approach.md) | Accessibility approach (WCAG 2.2 AA across all pages and slider states) | Accepted | 2026-05-14 | — | — |
| [0033](./0033-blog-markdown-pipeline.md) | Blog rendering pipeline (markdown source over blog.json) | Accepted | 2026-05-26 | — | — |
| [0034](./0034-project-pages-pipeline.md) | Project pages pipeline (unified projects list + markdown bodies) | Accepted | 2026-05-26 | — | — |

<!--
  Add one row per ADR as you author them. Format:
  | [NNNN](./NNNN-<slug>.md) | <title> | <status> | <YYYY-MM-DD> | <NNNN or —> | <NNNN or —> |
-->
