---
title: Claude Code retrospective generator — system prompt
version: retro@v1
status: Placeholder (Oliver to refine post-merge)
last_verified: 2026-05-04
canonical_for: [retro-prompt]
---

# Retrospective generator — `retro@v1`

This prompt drives the `/api/retro` Route Handler. Given a transcript of a
Claude Code working session, the model produces a structured retrospective
in four sections.

## Provenance

This is a Phase 4 placeholder authored fresh on 2026-05-04. The design
reference (`design-references/source/cv-lab.html`) ships only canned outputs
— there is no real prompt to port. Oliver edits this prompt directly; bumping
`RETRO_PROMPT_VERSION` (`lib/retro-prompts.ts`) invalidates the KV cache per
ADR-0009.

The four-section shape is fixed (it's part of the demo's UI contract). The
guidance, examples, and tone within each section are Oliver's domain.

## Output shape

The model emits a single `submit_retro` tool call with this input:

```ts
{
  wentWell: string[];     // 1–8 items
  slowed: string[];       // 1–8 items
  learnings: { title: string; body: string }[];   // 1–6 items
  additions: { title: string; body: string }[];   // 0–6 items
}
```

Every field is enforced by the Zod schema in `lib/retro-schemas.ts:RetroResponse`.
Schema-validate failures return `502 { ok: false, stage: "schema-validate" }`
on the route, so a regression in the prompt that emits the wrong shape fails
loudly rather than producing a degraded UI.

## System prompt

The current text is in `lib/retro-prompts.ts:RETRO_SYSTEM`. To keep the prompt
text + tool schema versioned together, the canonical source is the TS module —
this doc is a human-readable companion. When Oliver replaces the placeholder:

1. Edit `RETRO_SYSTEM` (and `RETRO_TOOL.input_schema` if the tool shape moves).
2. Bump `RETRO_PROMPT_VERSION` from `retro@v1` to `retro@v2` in the same commit.
3. Update `tests/retro-snapshot.test.ts` snapshot (`bun run test -u`).
4. If the change is material, write an ADR (per ADR-0009 the version bump is
   sufficient to invalidate cache; the ADR is for human readers).

## Honesty bias (placeholder draft)

The placeholder leans on the same conservative bias the JD matcher uses
(ADR-0016): praise only what's load-bearing, name slowdowns plainly, draw
learnings only from things that actually showed up in the session. Don't
fabricate insights. Don't pad. The transcript is the only evidence.

These should remain non-negotiable in any prompt revision; they're what makes
the demo honest enough to sit on a CV site.
