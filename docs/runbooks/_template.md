---
kind: runbook
title: <Procedure name — e.g. "Local database setup">
status: active
date: <YYYY-MM-DD>
---

# <Procedure name>

<!--
  One-paragraph "why this exists" — when does the reader run this runbook?
  What problem does it solve? What's the expected end state?

  Example:
    "Run this when setting up a local database for the first time on a new
    machine. The end state is a running local Postgres with the project's
    schema applied and seed data loaded."
-->

## Prerequisites

<!--
  What needs to be true before starting?
  - Software installed (with version requirements)
  - Environment variables set
  - Access tokens / credentials available
-->

## Steps

<!--
  Numbered, imperative. Each step is a concrete action with an expected
  outcome the reader can verify before moving to the next.

  Code blocks must be runnable as-is — no `<placeholder>` syntax where
  concrete values are needed. If a value is environment-specific, explain
  how to derive it inline.
-->

1. **<Action description>**

   ```bash
   <runnable command>
   ```

   Expected: <observable outcome>.

2. **<Next action>**

   <details>

3. ...

## Known symptoms / fallbacks

<!--
  What goes wrong, what to do about it.
  Each entry: symptom (what the user sees) + diagnosis + fix.

  Example:
    Symptom: "supabase start fails with 'port 54321 already in use'"
    Diagnosis: An earlier supabase instance is still running.
    Fix: `supabase stop` and retry.
-->

## Related

<!--
  Cross-references to feature docs, ADRs, or other runbooks the reader
  may want to follow up with.
-->
