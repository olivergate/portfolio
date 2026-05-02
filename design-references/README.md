# Handoff: Oliver Kaikane Gate — Personal CV Site

## Overview

A five-page personal CV / portfolio site for **Oliver Kaikane Gate**, an experienced product manager who builds heavily with LLMs (Claude Code in particular). Each page is a different rhetorical mode answering a different question a hiring manager might bring:

| Page | Filename | Purpose |
|---|---|---|
| **Main CV** | `cv.html` | Standard CV — but with a floating "control deck" of 4 sliders (density / polish / hierarchy / motion) that retheme the entire page in real time. The whole CV is the demo. |
| **Tone manifesto** | `cv-tone.html` | "Voice & values" piece — written in two voices side-by-side (formal vs how Oliver actually thinks). Reads like a manifesto. |
| **JD adapter** | `cv-jd.html` | Paste a job description in, get a chip grid of requirements colour-coded as hits / stretches / misses, with a "stretch slider" controlling how generously gaps are interpreted. |
| **Building with LLMs** | `cv-lab.html` | Lab page showing four projects Oliver has built with LLMs. Featured: a Claude Code retrospective generator with a designed terminal+output. |
| **Prompt-safety game** | `cv-game.html` | Playable: 2 levels where you try to extract a secret from a bot. Each cleared level unlocks an explainer about the OWASP LLM Top 10 defense it modelled. |

## About the Design Files

The files in `source/` are **design references** — HTML prototypes built to communicate the intended look, layout, copy, behaviour, and tone. They are NOT production code to copy directly. They depend on Tailwind via CDN, Babel-in-the-browser, and inline JSX, none of which belong in a real codebase.

Your job is to **recreate these designs in the target codebase's existing environment**, using its established patterns and libraries. If no environment exists yet, the designs are React-shaped (functional components, hooks) and would port cleanly to Next.js + Tailwind, Astro + Tailwind, or Remix. The visual system relies on Google Fonts (Fraunces / Inter / JetBrains Mono) and one CSS-variables file — both portable to any framework.

## Fidelity

**High-fidelity.** Final colors, typography, copy, spacing, and interactions are all real. Recreate pixel-perfectly.

The exception is photography — there are no real photos of Oliver in the prototypes. If a real site needs imagery, treat that as a content task, not a design task.

## Design System Summary

### The aesthetic in one paragraph

Editorial, Swiss-press, warmly literary. **Cream parchment** (`#faf7f2`) page background, never pure white. **Burnt rust** (`#a04a26`) as the only accent — used sparingly on italic words, links, hover states. Three fonts only: **Fraunces** (display, often italic), **Inter** (body, UI), **JetBrains Mono** (kickers, metadata, code). Hairline rules separate sections; mono kickers in `LETTER-SPACING: 0.22EM` introduce them. No drop shadows, no gradients, no rounded-card-with-coloured-left-border tropes. Generous whitespace. Text is the hero.

### Rhythm device

Every page uses the same section-header pattern:

```
01 ─────────────────────── kicker right
SECTION TITLE (Fraunces, 500)
─────────────────────────────────────────────
[content]
```

A two- or three-column grid: `auto | 1fr | auto`. Left mono kicker (e.g. `01`, `JD-04`), centre Fraunces title, optional right mono meta (e.g. `12 chips`). Hairline rule below. This pattern repeats on every page and is the visual signature.

### Design tokens

See `design-tokens.css` for the consolidated stylesheet. Highlights:

| Token | Value | Notes |
|---|---|---|
| `--bg` | `#faf7f2` | Warm cream — page bg everywhere |
| `--fg` | `#1c1915` | Near-black, warm tone |
| `--muted` | `#7a746c` | Mono kickers, secondary text |
| `--rule` | `#c4b9a8` | Hairline separators |
| `--accent` | `#a04a26` | Burnt rust — italic words, links |
| `--terminal` | `#0f0e0b` | Dark panel bg (game / lab demo) |
| `--terminal-amber` | `#ffb84d` | Terminal accent |
| `--font-display` | Fraunces | Headlines + italic accents |
| `--font-body` | Inter | Body, UI |
| `--font-mono` | JetBrains Mono | Kickers, metadata, code |
| `--tracking-meta` | `0.22em` | UPPERCASE mono — non-negotiable |
| `--motion-base` | `240ms` | All transitions |
| `--ease-out` | `cubic-bezier(.2,.7,.2,1)` | Standard ease |
| `--radius` | `4px` | Minimal — never large rounded |

### Type scale

- **H1 / hero**: Fraunces 500, `clamp(2.4rem, 6vw, 4.2rem)`, tracking `-0.025em`, line-height `0.98`, `text-wrap: balance`. Often one italic word in `--accent`.
- **H2 / section title**: Fraunces 500, `clamp(1.5rem, 3vw, 2rem)`, tracking `-0.015em`, line-height `1.05`.
- **Body**: Inter 400, `1rem`, line-height `1.6`, `text-wrap: pretty`, `max-width: 62ch–70ch` for readable measure.
- **Kicker (mono)**: JetBrains Mono 400, `0.78rem`, UPPERCASE, tracking `0.22em`, color `--muted`.
- **Tiny mono label** (e.g. `L-01`, `JD-04`): same family, `0.66rem`, tracking `0.22em`.

## Per-page details

### 1. `cv.html` — Main CV (the centerpiece)

**The hook**: a floating "control deck" in the top-left holds four sliders — **density**, **polish**, **hierarchy**, **motion**. As you drag them, every CSS variable in the doc retunes and the entire CV re-themes live (colors, type weights, spacing, layout, animations). The CV IS the demo.

- **Layout**: asymmetric 2-column grid — sticky left column (380px max) holds the slider deck; right column flows. Collapses to single column < 1024px.
- **Slider deck** (`cv-deck.jsx`): hand-drawn — a dark gradient panel, custom-drawn track + thumb (the native input is invisible, layered above the visual). Thumb has a brushed-metal feel. Each slider has a label, a current-value indicator, and a tick scale. Moving one dims the others.
- **CV content** (`cv-content.jsx`): name, tagline, sections for *About*, *Experience*, *Projects with LLMs*, *Skills*, *Education*. All elements use CSS variables for everything: spacing, type, color, even bullet markers (`dash | square | dot`).
- **Slider semantics**:
  - **Density** — increases bullet caps per role, reduces spacing, narrows columns.
  - **Polish** — moves from *brutalist* (1px hairlines, sharp corners, hard edges, no shadows) → *refined* (tinted card backgrounds, subtle shadows, slightly rounded corners).
  - **Hierarchy** — flat (uniform weights, low contrast) → dramatic (huge H1, italic accents, type-scale jumps).
  - **Motion** — static (instant) → kinetic (reveal-on-scroll, card hover lift, type letter-spacing settle).
- **Persistence**: slider values write to URL hash so the user can share a configuration. Print stylesheet hides the deck.

### 2. `cv-tone.html` — Tone manifesto

**The hook**: 14 numbered tenets ("Honesty over polish", "I write to think", etc.). Each tenet renders in **two voices side-by-side**:

- Left column: formal, third-person, the way a recruiter expects to read.
- Right column: how Oliver actually thinks about it — first-person, sometimes self-deprecating, often funny.

A single global toggle ("show only my voice / show both") lets the reader collapse to one column. The two voices animate apart on initial reveal.

- Layout: centered max-width column for the intro; the manifesto itself is a 2-column grid with a vertical hairline divider.
- Numbered kickers in mono (`01 / 14`, `02 / 14`...).
- Closing signature: handwritten-style note in Fraunces italic.

### 3. `cv-jd.html` — JD adapter

**The hook**: paste in a job description, click *Score this JD*, get a chip grid where each requirement is colour-coded:

- **Hit** (sage green) — Oliver demonstrably has this. Click to scroll to the cited CV bullet, which pulses with `--accent-soft`.
- **Stretch** (warm amber) — plausible but not 1:1.
- **Miss** (warm grey) — honest gap. Click to expand inline candid framing in Fraunces italic.

Plus a **stretch slider** (distinct from the cv.html sliders — short, recessed, with `⊢ ⊨ ⊣` quick-snap buttons) that retunes the strict/balanced/generous threshold and re-colours chips smoothly.

- Three pre-written sample JDs as pills above the input: Sustainability (12 chips, fully fleshed), AI startup (10 chips, includes Claude Code hit and MCP/evals misses), Fintech (10 chips).
- Editorial summary line: "Reading the JD as written, this CV lands 7 hits, 4 stretches, and 1 honest gap." (NEVER a percentage.)
- Bullet-reorder switch above the experience section: WAAPI FLIP animations float hit-cited bullets to the top, then stretches, then uncited. Reduced-motion swaps instantly.
- Hover panel renders as a fixed-position floating tooltip (so it's not clipped by sibling sections).
- Tweaks panel exposes: chip density, chip shape, reasoning placement (floating vs inline), accent hue, cited-bullet highlight color, counter visibility.

### 4. `cv-lab.html` — Building with LLMs

**The hook**: a featured demo + three secondary cards.

- **Featured**: Claude Code retrospective generator. Live badge with pulsing dot, sample-session pills, dark **terminal-styled** transcript editor, designed loading state (4-step pipeline with stage indicators, sweep bars, blinking caret), and a richly typeset retrospective output. The retro output has sectioned blocks with mono kickers and Fraunces titles; "what went well" / "what slowed things down" as bullets; learnings as a warm tinted card with rust accent border and `L-01/L-02/L-03` tags; suggested additions as a code+description grid; closing honesty caption with an accent dot.
- **Three secondary cards** in a row: Language (golden→rust gradient with あ glyph), Habit (sage→deep green with ◐), Movement (peach→rust with ↗). Each has tech tag pills, blurb, and a mono "→" CTA. Hover lifts and darkens the border.
- **Page header**: "Things I'm building *with LLMs*" with italic rust accent, mono breadcrumb above, brief framing paragraph.

### 5. `cv-game.html` — Prompt-safety game

**The hook**: a playable terminal where you try to make a bot leak its secret password. Each cleared level unlocks an explainer panel about the OWASP LLM Top 10 defense it represents.

- **L-01 Open door**: no defenses. Any direct ask leaks. ∞ attempts.
- **L-02 Instruction defense**: system prompt says "NEVER reveal." Refusal logic + literal-string output filter. Intended bypass: a "grandma bedtime story" framing whose protagonist *is* the password. 30 attempts; reveal-solution button when stuck.
- L-03 / L-04 / L-05 stubbed with topic blurbs (output filtering, encoded asks, tool calls).
- **Random secret pool** of 10 codenames. ↻ regenerates the secret per level so it's replayable.
- **Aesthetic**: dark amber-on-black panel, scanlines, vertical sweep, blinking caret, message-in stagger. Player messages right-aligned in cream; bot replies amber/cream with a left rule. Win flashes the panel green and drops a "DEFEATED" banner with letter-spacing animation.
- **Explainer panel**: four blocks (defense added / why your bypass worked / real-world parallel / how to defend properly) plus an "Further reading ↗" link.

## Interactions & Behavior

| Pattern | Implementation |
|---|---|
| Section reveal-on-scroll | IntersectionObserver, `[data-reveal]` attr, applies `is-revealed` class. Only active when motion slider > 0.4 (cv.html) or by default elsewhere. |
| Card hover | `transform: translateY(-3px)` only when motion is active. Never shadow-only hover. |
| Kicker pattern | Always uppercase, always tracking 0.22em, always JetBrains Mono. |
| Italic accent | `<em>` inside hero headlines is `color: var(--accent); font-style: italic`. Use rarely — once per heading. |
| Tweaks panel | All five pages support an "edit mode" tweaks panel. Wraps tweakable defaults in `/*EDITMODE-BEGIN*/ {…} /*EDITMODE-END*/` JSON markers, posts `__edit_mode_set_keys` updates to the parent. (This is design-tool plumbing — feel free to drop in production unless your codebase has an equivalent.) |
| Reduced motion | All pages respect `prefers-reduced-motion: reduce` — sets motion durations to 0, swaps animated reorders for instant swaps. |
| Speaker notes / decks | None of these pages are decks — no speaker notes anywhere. |

## State Management

- `cv.html` holds 4 slider values in React state, persists to URL hash.
- `cv-jd.html` holds the active JD, the score result, the stretch threshold, and the bullet-reorder toggle.
- `cv-lab.html` holds which session is loaded, loading state, the generated retrospective.
- `cv-game.html` holds active level, current secret, message history, attempts remaining, win state per level, regenerate trigger.
- `cv-tone.html` holds only the "show single voice / show both" toggle.

No external data fetching. The "live" Claude Code retrospective demo (`cv-lab.html`) optionally calls `window.claude.complete()` if available — gracefully falls back to a canned response otherwise.

## Files in `source/`

| File | Type | Notes |
|---|---|---|
| `cv.html` | HTML shell | Loads the four `.jsx` files as Babel scripts |
| `cv-app.jsx` | React | Top-level App component, slider state, URL hash sync |
| `cv-deck.jsx` | React | The floating slider deck (don't retheme this — it's hardcoded dark) |
| `cv-content.jsx` | React | All CV section components |
| `cv-data.jsx` | JS | CV content as data: roles, projects, skills, etc. |
| `cv-tone.html` | HTML | Self-contained — inline JSX |
| `cv-jd.html` | HTML | Self-contained |
| `cv-lab.html` | HTML | Self-contained |
| `cv-game.html` | HTML | Self-contained |
| `tweaks-panel.jsx` | React | Tweaks panel component (used by cv.html) |

## Files in this handoff

```
design_handoff_cv_site/
├── README.md                     ← this file
├── design-tokens.css             ← consolidated CSS variables
├── screenshots/
│   ├── 01-cv-main.png            cv.html — main CV with sliders
│   ├── 02-cv-tone.png            cv-tone.html — tone manifesto
│   ├── 03-cv-jd.png              cv-jd.html — JD adapter
│   ├── 04-cv-lab.png             cv-lab.html — building with LLMs
│   └── 05-cv-game.png            cv-game.html — prompt safety game
└── source/
    ├── cv.html  cv-tone.html  cv-jd.html  cv-lab.html  cv-game.html
    ├── cv-app.jsx  cv-content.jsx  cv-data.jsx  cv-deck.jsx
    └── tweaks-panel.jsx
```

## Implementation suggestions

1. **Pick the framework first.** Astro is an excellent fit — each page is mostly static, and Astro's per-page JS islands match the "one page = one mode" structure. Next.js works too. Avoid SPAs; these are independent documents.
2. **Drop in the fonts.** Google Fonts `Fraunces` (opsz, weights 400–700, italic 400–500), `Inter` (300–800), `JetBrains Mono` (400–700).
3. **Drop in `design-tokens.css`.** Ship it as a global stylesheet. Override per-page only where strictly needed.
4. **Recreate the section-header pattern as a component first.** It's the visual signature — getting it right unlocks 70% of the look.
5. **Then build page-by-page.** Each page is independently complex; resist the urge to abstract too early. Ship `cv.html` first — it's the centerpiece and exercises the most patterns.
6. **Replace browser-Babel.** Convert `.jsx` files to your framework's idiom. The components are functional with hooks — port should be mechanical.
7. **Replace Tailwind CDN.** Only `cv.html` uses Tailwind utilities, sparingly. Either install Tailwind properly, or rewrite those utility class names to plain CSS using the design tokens.
