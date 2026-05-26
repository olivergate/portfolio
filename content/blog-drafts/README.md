# Blog drafts

Markdown source for blog posts. The build reads this directory directly
(via `lib/content.ts` → `getBlog()`) and renders posts at `/blog`. See
ADR-0033 for the rationale.

## Frontmatter

Every file must start with a YAML frontmatter block. All keys are
Zod-validated by `lib/blog-schemas.ts`; `bun run content:validate`
catches anything broken.

```yaml
---
slug: my-post                       # required, must match filename
title: "Post title"                 # required
date: 2026-05-26                    # required, YYYY-MM-DD
status: draft                       # required: draft | review | published
summary: "One- or two-sentence card description."  # required
kicker: "Topic"                     # optional, small label on the card and post header
length: "~1200 words"               # optional, informational
post: 1                             # optional, ordinal from the roadmap brief
source_brief: "content/_six-post-roadmap-2026-05-25.md"  # optional
source_data:                        # optional, pointers to source material
  - "path/to/source.md"
---
```

## File name

The filename **must** equal `${slug}.md`. There is no numeric prefix —
the optional `post:` ordinal lives in frontmatter. Readers and the
static-build path both derive the URL from `slug`.

## Body conventions

- **No H1 in the body.** The `title:` frontmatter is rendered as the
  page H1. Start the body with prose or an H2.
- **Headings start at H2** for sections, H3 for sub-sections.
- **Lists.** Both ordered (`1.`) and unordered (`-`) are supported.
- **Code.** Fenced code blocks with a language tag pass through.
- **Inline marks.** `**bold**`, `*em*`, `` `code` ``, and links work.
- **Pull quotes.** Write a blockquote whose first line is `[!pull]`. The
  marker is stripped and the blockquote renders as a styled pull quote.
  ```
  > [!pull]
  > The cleverest decision in the UI is the one I am least sure about.
  ```
- **Inline SVG.** Allowed for charts. The sanitiser allowlist in
  `lib/blog-sanitize.ts` permits `<svg>`, `<text>`, `<line>`, `<rect>`,
  `<style>` and the attributes the existing chart drafts use. New tags or
  attributes require editing that allowlist; expansion is a deliberate
  choice each time.

## Publishing

Posts are surfaced based on `status`:

- `draft` and `review`: visible in development (`bun run dev`), hidden
  in production.
- `published`: visible everywhere.

To publish a post, change its frontmatter `status` to `published` and
commit. No file moves.
