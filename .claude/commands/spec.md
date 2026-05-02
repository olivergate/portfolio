---
description: Open the spec for a given phase and frame the session for execution
argument-hint: "<phase number 0-7>"
---

You are starting (or resuming) work on a phase of the portfolio site.

The phase to work on is: $ARGUMENTS

Steps:

1. Read `docs/specs/phase-$ARGUMENTS.md` in full.
2. Read `docs/specs/README.md` to confirm the phase's status and any
   dependencies on prior phases.
3. Read any "design references" the phase spec lists — typically
   `design-references/screenshots/<...>.png` and
   `design-references/source/<...>.jsx|html`. These are the visual and
   structural source of truth.
4. Read the most recent ADRs (`ls docs/adr/` and read the top 3) so you
   know what's already decided and shouldn't be relitigated.
5. Summarize back to Oliver:
   - The phase goal in one sentence.
   - The success criteria as a bulleted list.
   - Any open decisions the spec lists for him to confirm before coding.
   - A short proposed plan of attack — order of operations.
6. Wait for Oliver to confirm the plan before executing.

Honor the project's workflow rules from `CLAUDE.md`:

- One phase per session.
- Plan mode for non-trivial work.
- Don't redesign anything the design has settled — port faithfully.
- Server Components by default; `"use client"` only where genuinely needed.
