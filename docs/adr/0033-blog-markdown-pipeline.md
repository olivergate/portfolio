# 0033 — Blog rendering pipeline (markdown source over blog.json)

- **Status:** Accepted
- **Date:** 2026-05-26
- **Deciders:** Oliver Kaikane Gate

## Context

Phase 7's spec explicitly lists "Blog system" as out of scope, so the work
this ADR records is scope addition past the current plan. Two prose drafts
landed in `content/blog-drafts/` (`01-semble-bench.md` ~2500 words with
two inline SVG charts, fenced code, ordered lists, and `**bold**` marks;
`05-claude-gui.md` ~900 words with similar features). Both were authored
as standard markdown.

The existing publish surface — `content/blog.json` parsed by
`lib/blog-schemas.ts` and rendered by `app/(site)/blog/[slug]/page.tsx` —
models a post body as a discriminated union of four block kinds: `p`,
`h2`, `list` (unordered only), `pull`. Block `text` is a plain string;
there is no inline-mark model, no `code`, no `ol`, no `h3`, no figure
or svg surface. The drafts as written cannot be converted into the
current JSON shape without losing the chart figures and the ordered
lists, or degrading the prose to a less expressive subset.

Two paths forward: extend the JSON model until it carries every markdown
affordance the drafts use (effectively reinventing markdown as JSON), or
read markdown directly. The drafts are the de-facto content format
already, and the prose voice of the site (`/build`, `/decisions`, the
manifesto on `/tone`) reads like editorial writing, not structured data.
A second JSON-shaped representation between the author and the page
is a translation step that earns nothing.

The single non-trivial cost of reading markdown directly is that the
drafts include raw `<svg>` blocks. Allowing arbitrary HTML in
author-controlled content is acceptable, but the sanitiser still has to
be wired correctly so the surface doesn't drift if a third-party draft
is ever accepted.

## Decision

**Read markdown from `content/blog-drafts/*.md` as the canonical blog
source.** Frontmatter (gray-matter) carries the post metadata; body
markdown is processed through `remark` → `remark-gfm` →
`remark-rehype` → `rehype-raw` → `rehype-sanitize` → `rehype-stringify`.
The sanitiser uses an allowlist extended for the SVG subset the existing
drafts use (`svg`, `style`, `text`, `line`, `rect`, plus the attributes
they need). `blog.json` is deleted and the existing four-sliders TODO
entry is removed with it.

Specifically:

1. **Single folder, status-gated.** All posts live in
   `content/blog-drafts/`. Publication is controlled by frontmatter
   `status: published`. `draft` and `review` posts are excluded from
   production builds; in development they remain visible so the author
   can render-test in-flight work. Filename is the slug
   (`semble-bench.md`, not `01-semble-bench.md`); the ordinal from the
   roadmap brief lives in the optional `post:` frontmatter field.

2. **Required frontmatter:** `slug` (kebab, must match filename),
   `title`, `date` (YYYY-MM-DD), `status` (`draft|review|published`),
   `summary` (1–2 sentence card text). Optional: `kicker`, `length`,
   `source_brief`, `source_data[]`, `post`.

3. **Body conventions:** H1 is omitted in source (frontmatter `title`
   is the heading rendered on the page); section headings start at H2.
   Standard markdown lists (ordered and unordered) are supported. Fenced
   code blocks pass through. Pull quotes are written as blockquotes
   whose first line is `[!pull]` (rehype rewrites the first-line marker
   into a `blog-pull` class). Raw inline `<svg>` is permitted and
   sanitised; the allowlist sits in `lib/blog-sanitize.ts` so future
   expansions are diff-traceable.

4. **`blog.json` is deleted.** The four-sliders TODO placeholder is
   removed; nothing was depending on it, and the FAB linkout that
   targeted it has either already moved or will be redirected as part of
   this change.

## Consequences

**Wins.** Authoring stops being a translation step — drafts are the
artefact. Charts in posts work natively. The schema delta when a new
block kind appears (footnotes, callouts, an `<iframe>` for live demos)
is a sanitiser allowlist entry rather than a discriminated-union case
plus a renderer case plus a Zod validator change.

**Costs.** The page now injects sanitised HTML strings directly into
the DOM, which is exactly the surface that careless additions to the
sanitiser allowlist would compromise. The mitigation is keeping the
allowlist in its own module with a comment explaining the principle
(`if you don't recognise this tag, don't add it`). The build also gains
a small markdown pipeline; the deps are mainstream (remark/rehype
family) so the supply-chain surface is modest.

**Scope creep guard.** This ADR does not promise: blog comments, tag
indices, RSS, author profiles, draft preview signed URLs, or live MDX
React components. Adding any of those is its own ADR.

## Alternatives considered

- **Extend blog.json schema.** Add `code`, `ol`, `h3`, `figure`, and an
  inline-mark sub-grammar. Rejected: at the point where the JSON model
  carries every markdown feature the drafts use, it is just markdown
  with extra steps, and the author is paying the translation cost on
  every edit.

- **Switch to MDX.** Read drafts as MDX so SVGs can be replaced with
  typed React components. Rejected for now: the SVG figures in the
  current drafts are one-offs, not a reusable chart system, so the MDX
  ergonomics earn less than they cost. Revisitable if a future post
  needs interactive components.

- **Do nothing / keep drafts in `blog-drafts/` indefinitely.** Rejected:
  the user asked for "something ready to go," and the current pipeline
  cannot publish the drafts even if status were flipped.

## References

- `content/blog-drafts/01-semble-bench.md`,
  `content/blog-drafts/05-claude-gui.md` — drafts that motivated the change
- `content/_six-post-roadmap-2026-05-25.md` — six-post brief
- `lib/blog-schemas.ts`, `lib/content.ts`,
  `app/(site)/blog/[slug]/page.tsx` — pre-change reader/renderer
- `docs/specs/phase-7.md` — Phase 7 spec listing "Blog system" out of scope
