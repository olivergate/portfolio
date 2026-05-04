# 0024 — Linkout cards over embedded screens

- **Status:** Accepted
- **Date:** 2026-05-04
- **Deciders:** Oliver Kaikane Gate

## Context

The `/lab` page presents three secondary projects alongside the featured
Claude Code retro demo: a language-learning app (web), a habit-forming
app (Flutter mobile, in TestFlight), and a movement-focused consumer app
(React Native, alpha). The mobile apps are not browser-runnable; the
language app could in principle embed (it's a web app) but the design
treats all three identically as link cards.

Two compositions are possible:

1. **Linkout cards.** Gradient hero with a glyph + tech pills + blurb +
   "Read writeup" / "Open in TestFlight" CTA. Click goes elsewhere.
2. **Embedded screens.** iframe / video loop / interactive preview of
   each app's interface, in-page.

The featured retro demo is fully live (real Anthropic call, real output).
The question is whether the secondary cards should *imply* live by
embedding, or stay honest about their state (in flight, not browser-
runnable, not all production).

## Decision

**Secondary projects on `/lab` are linkout cards. No embedded screens, no
iframes, no video loops, no interactive previews. Each card is a single
clickable surface — gradient hero, glyph, pills, blurb, mono `→` CTA — that
navigates to a writeup or external destination (TestFlight, blog post,
GitHub).**

Mechanically:

- `components/lab/ProjectCard.tsx` is a Server Component. The whole card
  is the link (`<Link>` for internal anchors, `<a target="_blank"
  rel="noopener noreferrer">` for external `https:` URLs).
- `content/projects.json` carries a `ctaLabel` and `ctaUrl` per card.
  Placeholder `#anchor` URLs are acceptable until Oliver supplies the
  real destinations.
- The card's only visual nod to the project is its gradient + glyph (e.g.
  あ for the language app, ◐ for the habit app, ↗ for the movement app).
  Both are abstract, not screenshots.

## Consequences

**Wins**

- **Honest framing.** The featured retro demo carries the "this is live"
  signal alone; the side projects don't borrow that signal by embedding
  output they can't actually produce in-browser.
- **Performance.** No iframes, no client-side video, no per-card React
  islands — the secondary section is pure server-rendered HTML with
  CSS gradients.
- **Mobile parity.** A linkout card works identically on mobile and
  desktop; an iframe of a Flutter app only renders on devices that can run
  Flutter.
- **Editorial control.** "Read writeup" lets Oliver point to a blog post
  that frames the project on his terms rather than what an iframe of an
  in-progress UI happens to look like that week.

**Costs**

- Less wow-factor. A visitor who lands on `/lab` sees one live demo and
  three "click to read more" cards. The signal is the demo's depth, not
  surface breadth.
- Placeholder URLs (`#language-writeup`, `#habit-testflight`,
  `#movement-writeup`) ship until Oliver supplies the real destinations.
  Tracked in `docs/TODO.md`.

**Deliberately not done**

- **No per-project sub-pages.** The CTA links to wherever the writeup
  *actually lives* — Substack, blog, GitHub README, TestFlight invite.
  Spinning up `/lab/language` etc. is premature abstraction.
- **No "live" badges on linkout cards.** The badge is reserved for the
  featured demo. Linkout cards say "project / personal" in their pill,
  not "live."

## Alternatives considered

- **Embed Flutter / React Native screens via an iframe.** Rejected — the
  iframe would render a loading spinner or a TestFlight gate, neither of
  which signals competence. Worse than the linkout.
- **Loop a 5-second video preview per card.** Rejected — adds page
  weight, requires hosting infrastructure, freezes a particular state of
  an in-flight project.
- **In-page sub-route per project (`/lab/language`).** Rejected for now.
  If a card grows into a long-form writeup, the URL can move from
  external to internal without changing the card itself. Until then,
  external is fine.

## References

- `components/lab/ProjectCard.tsx` — the linkout-card primitive
- `content/projects.json` § secondary[] — placeholder URLs awaiting real
  destinations
- `design-references/source/cv-lab.html` lines 247–276 — the design
  models the cards as linkouts, not embeds
- `docs/TODO.md` — open item tracking the real CTA URLs
