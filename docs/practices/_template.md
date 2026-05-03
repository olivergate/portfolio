---
domain: <domain-slug>
title: <Domain> Best Practices
status: active
date: <YYYY-MM-DD>
authoritative: true
consumed_by:
  - .claude/agents/<agent-1>.md
  - .claude/agents/<agent-2>.md
---

# <Domain> Best Practices

**Date:** <YYYY-MM-DD> · **Status:** Active

<!--
  This is the AUTHORITATIVE practice doc for the <domain> domain. The
  three-doc pattern (see docs/doc-system/02-style-atlas.md §8) requires
  TWO additional companion docs alongside this one:

    1. <DOMAIN>_COVERAGE_AUDIT.md — point-in-time measurement (snapshot_of: this file)
    2. PRODUCTION_GAPS_FROM_<DOMAIN>.md — append-only gap log (log_for: this file)

  Author both companions as separate files in this directory using the
  frontmatter shapes in 02-style-atlas.md §8. Without all three, the
  feedback loop the agents depend on is incomplete.
-->

## Part I — Philosophy

<!--
  What's the core question this domain answers?
  Examples:
    - Testing: "What gives the team confidence that production behaves correctly?"
    - API design: "What contract does the consumer rely on, and what can change without breaking it?"
    - Components: "What is reusable, what is local, and what's the cost of getting it wrong?"
  Keep this short — 2–3 paragraphs. The rest of the doc operationalises it.
-->

## Part II — The adapted framework

<!--
  Optional. If the domain has an established framework (testing pyramid,
  API maturity model, component composition tree, etc.), describe how
  this project adapts it. Skip if no framework is being adapted.
-->

## Part III–N — Per-tier or per-pattern guidance

<!--
  One Part per tier or pattern. For each:
    1. The principle (philosophy, why it matters).
    2. A concrete code example showing the right way.
    3. An anti-example showing the wrong way.
    4. Practical guidance on edge cases or tradeoffs.

  Redundancy is deliberate — humans read the principle, agents read the
  code examples and anti-examples for specification.
-->

## Part (N+1) — Implementation priorities

<!--
  A ranked top-N list (typically 5–10 items) of the highest-leverage
  improvements for this domain right now. Prioritise by risk × impact,
  not by how interesting the work is.
-->

## Part (N+2) — Anti-patterns

<!--
  Named anti-patterns specific to this domain. Each entry: name,
  description, example, why it's wrong, what to do instead.
-->

## Appendices

<!--
  Tooling reference, naming conventions, further reading. Optional but
  helpful for new contributors.
-->
