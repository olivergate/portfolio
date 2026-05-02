---
description: Run all checks, report results, draft a commit message, and prompt to update the phase status table
---

You are wrapping up a phase.

Steps:

1. Run all checks in this order, reporting each as it goes:

   ```
   bun run typecheck
   bun run lint
   bun run content:validate
   bun run test
   bun run build
   ```

   If any step fails, stop and surface the failure. Do not continue to the
   next step until the failure is resolved (either by fixing it or by Oliver
   explicitly waiving it).

2. Once all checks pass, run `git status` and `git diff --stat` to show what
   changed.

3. Draft a commit message in this format (do NOT commit yet):

   ```
   Phase N — <one-line summary>

   <2–4 bullets describing what shipped at the spec level — not
   file-by-file. Reference any ADRs written this phase.>
   ```

4. Prompt Oliver to:
   - Confirm the commit message.
   - Update the status table in `docs/specs/README.md` — mark this phase
     `Done` with today's date in YYYY-MM-DD format.
   - Run a visual diff against `design-references/screenshots/` for the
     pages this phase touched. Note any intentional deviation in an ADR.

5. Only commit when Oliver confirms.

Do not skip checks. Do not use `--no-verify`. Do not amend existing commits.
