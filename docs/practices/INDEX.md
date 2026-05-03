---
title: Practice Docs — Index
purpose: List of every practice domain in this project, with the three-doc trio status per domain.
audience: humans + agents
last_verified: 2026-05-03
---

# Practice Docs — Index

A practice domain is a body of evergreen guidance — philosophy, tier definitions, anti-patterns, priorities — for a specific area of work (testing, API design, components, migrations, etc.). Each domain follows the **three-doc pattern** described in `docs/doc-system/02-style-atlas.md §8`:

1. **`<DOMAIN>_BEST_PRACTICES.md`** — the authoritative practices doc (`authoritative: true`)
2. **`<DOMAIN>_COVERAGE_AUDIT.md`** — point-in-time snapshot of where the project stands against the practices
3. **`PRODUCTION_GAPS_FROM_<DOMAIN>.md`** — append-only log of gaps discovered in production

## How to add a new practice domain

1. Create `docs/practices/<domain>/`.
2. Author the three docs from the templates in `docs/practices/_template.md` (the kit ships one canonical template; create the snapshot + gap-log files using the frontmatter shapes from `02-style-atlas.md §8`).
3. Add a row to the table below.
4. Update `consumed_by:` frontmatter on any agents that read this domain's practice doc.

## Domains

*No practice domains authored yet.*

<!--
  Add one row per domain as you author them. If a domain doesn't yet have
  all three docs, mark missing entries with "—" and surface as a gap in
  04-current-state-audit.md.

  Format:
  | Domain | Authoritative doc | Audit | Gap log | Last verified |
  |--------|-------------------|-------|---------|---------------|
  | testing | [TESTING_BEST_PRACTICES.md](./testing/TESTING_BEST_PRACTICES.md) | [TESTING_COVERAGE_AUDIT.md](./testing/TESTING_COVERAGE_AUDIT.md) | [PRODUCTION_GAPS_FROM_TESTING.md](./testing/PRODUCTION_GAPS_FROM_TESTING.md) | YYYY-MM-DD |
-->
