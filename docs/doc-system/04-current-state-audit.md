---
title: Current-State Audit
purpose: Snapshot of this project's current doc coverage — what exists, where it lives, what's missing or drifted.
audience: agents + humans
last_verified: 2026-05-03
---

# 04 — Current-State Audit

<!--
  CONSUMING PROJECT: replace this entire file with your own audit.

  This file is project-specific by design. The kit ships a placeholder; the
  consuming project owns the content. Do NOT lift TeacherHub's (or any other
  origin project's) audit — it's not yours.
-->

This file should capture a point-in-time snapshot of your project's documentation: what you have, what's missing, and what's drifted. The doc-steward agent reads this on first invocation to know what's already in scope before proposing any new doc work.

## Recommended shape

For each category in `01-taxonomy.md` that your project uses, document:

1. **What exists today.** File count and a brief list. Example:
   ```markdown
   ### Feature behavior specs
   - 12 files in `docs/features/FEATURE_*.md`
   - Coverage: payments, auth, onboarding, dashboard, search, profile, …
   - Template adherence: 8/12 use the full 11-section template
   ```

2. **What's missing or under-served.** Categories with no docs yet, or with thin coverage. Example:
   ```markdown
   ### Practice docs
   - Only 1 domain authored: `docs/practices/testing/`
   - Missing: api-design, components, migrations
   ```

3. **Known drift.** Specific docs you know are stale. Example:
   ```markdown
   ### Canonical reference
   - `docs/reference/SYSTEM_MAP.md` last_verified 2026-02-14 — multiple endpoints have shipped since
   - `README.md` setup section references a removed Stripe integration
   ```

4. **Audit date.** Set `last_verified` in frontmatter on each refresh.

## Cadence

Refresh this audit:
- After each major phase ships (feature shipped, large refactor merged, infrastructure changed).
- Before scoping a doc-system overhaul or a `/doc-sync` sweep across many docs.
- Quarterly as a default if the project is active.

The audit is not append-only — it's a snapshot. Replace contents on each refresh; rely on git history for prior snapshots.

## Why this category exists

Without an audit, the doc-steward proposes drift fixes one doc at a time but has no view of *coverage gaps*. The audit gives the steward (and humans planning doc work) a map of what's not yet documented at all, which is a different problem from what's documented but stale.

Skip authoring this file if your project is small enough that a quick `ls docs/` answers the same question. Author it when you have ≥3 categories in active use and find yourself losing track of what's covered.
