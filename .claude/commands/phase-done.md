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
   bun run lint        # second pass — see note below
   ```

   If any step fails, stop and surface the failure. Do not continue to the
   next step until the failure is resolved (either by fixing it or by Oliver
   explicitly waiving it).

   **Why two `lint` passes:** `next build` will silently rewrite
   `tsconfig.json` (e.g. expanding single-line arrays into multi-line) to
   match its required defaults. Biome formatter then sees the file as dirty.
   Run `bun run lint:fix` after `build` if the second `lint` reports
   `tsconfig.json` formatting diffs — these are not real issues, just
   reformat noise. CI will catch the same thing if missed.

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
