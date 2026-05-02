---
description: Scaffold a new ADR file under docs/adr/ with the next number, copying from the template
argument-hint: "<adr title>"
---

You are scaffolding a new Architecture Decision Record.

The title of the new ADR is: $ARGUMENTS

Steps:

1. Read `docs/adr/0000-template.md` so you have the exact format.
2. List `docs/adr/` and find the highest-numbered ADR file. Increment by 1
   (4-digit, zero-padded). If only the template exists, the next number is
   `0001`.
3. Slugify the title: lowercase, spaces → hyphens, drop non-alphanumeric
   except hyphens. Examples: "JD matcher prompt" → `jd-matcher-prompt`;
   "Use Vercel KV for caching" → `use-vercel-kv-for-caching`.
4. The filename is `docs/adr/NNNN-slug.md`.
5. Write the file using the template structure with:
   - `# NNNN — <title in title case>`
   - **Status:** Proposed
   - **Date:** today's date in YYYY-MM-DD
   - **Deciders:** Oliver Kaikane Gate
   - All other sections present but empty placeholders ("TBD" is fine).
6. Open the file (i.e. report the path back to the user) and offer to fill
   in the body if Oliver hands you the rationale.

Conventions to honor:

- ADRs are immutable once Accepted. If the user is asking for an ADR that
  supersedes an existing one, scaffold a new ADR with `Superseded by NNNN`
  noted, and update the old ADR's status line in a separate edit.
- Don't write to `docs/adr/0000-template.md` — that's the canonical template.
