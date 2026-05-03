# /tone — 14 tenets, draft for editing

> **Status:** APPROVED-AS-PLACEHOLDER (2026-05-03). Oliver to edit manually
> at any time after Phase 2 ships. The text below was ported into
> `content/tone.json` for Phase 2; subsequent edits to that JSON file are
> a routine content edit (no code changes, no rebuild required in dev).
> Original brief: pulled from `content/cv.json`, `source/oliver_cv_draft.md`,
> the bio + roles in `cv-tone.html` (the 3-voice toggle), the existing ADRs,
> and the project's working pattern.
>
> **Format per tenet:** short title + formal voice (third-person, recruiter-readable, ~2 sentences) + personal voice (first-person, sometimes self-deprecating, sometimes funny — the "honest" register from the existing CV).
>
> **Intended ordering logic:** start with how Oliver thinks, then how he ships, then how he leads, then how he learns, then close with the personal frame. If you want to reorder, the numbering is just for the kickers — the meaning isn't sequence-locked.

---

## Intro paragraphs (above the manifesto, centered max-width column)

These are *suggestions* — the existing bio in `cv.json` already does most of this work. Pick one or write your own.

> **Option A (philosophy-forward):**
> Engineering is a way of thinking dressed up as a way of building. These are the tenets I work by — fourteen short positions on craft, leadership, honesty, and what it actually feels like to ship. Each one is written twice: once the way a recruiter expects to read, once the way I'd say it to a friend over coffee.

> **Option B (work-forward):**
> Most CVs are a list of what you did. This is fourteen positions on how I do it — the principles that show up in the code I write, the teams I run, and the bugs I cause. Each is written in two voices side-by-side: the formal version and how I actually think about it.

> **Option C (short):**
> Fourteen things I believe about building software. Two voices each — the formal one, and the one I'd actually use.

---

## The 14 tenets

### 01 / 14 — Question the framing first

**Formal:** Eight years on from a philosophy degree, the most useful habit I retained is interrogating the question before the answer. Most engineering trouble is a well-executed solution to a misframed problem.

**Personal:** Philosophy taught me to be obnoxious about definitions. Most "we need to build X" conversations turn out to be "we don't know what X is yet" once you push gently. I will push gently.

---

### 02 / 14 — Honesty over polish

**Formal:** I would rather a CV bullet, an ADR, or a status update read truthfully than impressively. Polished claims that don't survive a follow-up question are worse than honest claims that do.

**Personal:** This site has a JD-matcher that's deliberately tuned to call my own gaps "honest gaps" instead of inventing matches. The ADRs include one that says "I made the cream slightly darker because the design was below WCAG AA, which is awkward and I want it written down." I sleep better this way.

---

### 03 / 14 — End-to-end before division of labour

**Formal:** I've spent stretches as the only frontend engineer on the system, and stretches running a team of five. The lesson from both is that someone has to hold the whole shape in their head, and it pays to be that person early on.

**Personal:** I was the sole frontend engineer on a sustainability dashboard for nearly four years. There is a Slack channel somewhere named after one of my Plotly Dash callbacks. End-to-end ownership is great when you're shipping fast and lonely at 11pm when something subtle breaks.

---

### 04 / 14 — Configuration over engineering effort

**Formal:** The most leveraged work I've done is turning bespoke per-customer engineering into configuration. The OpenSC supply-chain onboarding moved from quarter-long custom builds to an afternoon of YAML once the data-contract layer was in.

**Personal:** Onboarding a new supply chain went from "a quarter" to "an afternoon and a moderately serious lunch." The migration period — old system live, new system being trusted — needed more babysitting than I'd planned. That's the part nobody puts on the after-photo.

---

### 05 / 14 — Take the existential bug seriously

**Formal:** On a multi-tenant research platform handling sensitive investment data, cross-tenant leakage would have been existential. Most decisions I made there came back to that one constraint, including a few I'd unwind given another go at the early shared components.

**Personal:** "Cross-tenant data leakage would have been existential to the business" is a sentence I type onto a CV with one hand while a small voice inside whispers *please, no*. None of it leaked. None of it.

---

### 06 / 14 — Build with the new tools, not around them

**Formal:** I'm spending most of my current bandwidth building with LLMs across multiple side projects, learning agentic patterns, and developing a custom Claude Code setup with its own agents and telemetry. The point is to be opinionated about how this stuff works, not just fluent in the syntax.

**Personal:** Daily Claude Code user, three side projects in flight, and a slowly-thickening folder of session retrospectives. I'd rather have shipped one weird thing than have read every paper about a thing that hasn't been shipped yet.

---

### 07 / 14 — Sit with the ambiguity longer than feels comfortable

**Formal:** Philosophy of Technology trained me to hold contradictory framings open while gathering signal. The temptation in engineering is to collapse to a decision early because decisions feel productive; the discipline is to wait until the constraints have actually shown themselves.

**Personal:** I am fine spending a week not knowing the right answer if it means I avoid spending a quarter on the wrong one. This is not always a popular trait at standup.

---

### 08 / 14 — The domain is the design

**Formal:** I've shipped against the idiosyncrasies of coffee supply chains, fisheries provenance, pension fund consultants, and farmer-payment validation. The interface comes second; the part that matters is whether the model of the domain is right.

**Personal:** I now know more about the personal life of a toothfish than any human reasonably should. The London robusta price index and I are on a first-name basis. Every domain I've worked has had its own dignified weirdness; the dashboards work because someone respected it.

---

### 09 / 14 — Test the contract, not the implementation

**Formal:** When two pieces of code have to agree — a bootstrap script and a runtime, a server and a client, a prompt and its cache key — the thing worth testing is the contract between them, not either side alone.

**Personal:** Phase 1 of this site has a parity test that runs the inline pre-hydration script in a Node sandbox and asserts byte-identical CSS-token output against the runtime. I wrote it because I'd already been bitten once. Locks the lesson into the test suite instead of into my head.

---

### 10 / 14 — Lead by removing friction, not by adding rituals

**Formal:** I led a five-person frontend team at Redington and ran an external consulting engagement end-to-end. The pattern that consistently worked was clearing the path for engineers to do good work, not stacking process on top of it.

**Personal:** The team I led was consistently the highest-performing on UI work, which is the kind of compliment you put on a CV and pretend was just a normal Tuesday outcome. The actual job was mostly making sure the right person had the right context at the right time, which doesn't sound like much until you don't have it.

---

### 11 / 14 — Take the pro-bono job seriously

**Formal:** I chaired the Bristol charity committee at Redington and ran a pro-bono engagement with LifeCycle — a small charity that had been left dry by multiple high-cost agencies — running a one-day discovery workshop and migrating their database and supporting infrastructure onto Airtable.

**Personal:** Discovery workshop was rougher than I'd run it now. Airtable has limits I hadn't fully internalised when I picked it. Still: a charity that had been chewed up by three previous agencies got a stack they could actually run themselves, and I count that engagement as one of the more morally defensible things I've shipped.

---

### 12 / 14 — Write things down so future-me can argue with them

**Formal:** Decisions worth making are decisions worth recording. I keep an ADR log on every project of meaningful size, including this one — the format is public and the deviations from canonical references are documented in their own files.

**Personal:** Future-me is a different person and frequently disagrees with present-me. ADRs are the diplomatic correspondence between the two. The first ADR on this site explains why I picked Next.js over the design's recommended Astro; the seventh apologises for darkening one of the cream tones to clear WCAG AA. Both will outlive any memory I have of writing them.

---

### 13 / 14 — Run a retrospective on yourself

**Formal:** The strongest delta in my output over the last six months has come from a personal retrospective workflow — capturing what surprised me at the end of every working session, then clustering observations into rules and tools over time.

**Personal:** I run a retrospective on myself after most working sessions with Claude. The catalogue gets messy fast and most observations don't survive contact with the next session. The ones that do become slash commands, which is how this site got its `/phase-review` workflow guarantee — a pattern that started as me being annoyed with myself.

---

### 14 / 14 — The non-engineering hours are part of the job

**Formal:** Food, cooking, books, chess, travel, and running are not what I do *instead of* engineering — they're the inputs. The best framing-corrections I get tend to arrive on long runs, and the best collaboration patterns I've internalised came from watching people cook together.

**Personal:** I have caused more good architectural decisions on a 10km run than in any meeting. If you see me looking at a menu like it's a system diagram, that's because it is one.

---

## Closing signature (Fraunces italic)

> **Option A:** *Oliver Kaikane Gate — Valencia, May 2026*

> **Option B:** *— Oliver, written between sessions, Valencia 2026*

> **Option C:** *Oliver Kaikane Gate. Last revised May 2026.*

---

## Notes for Oliver

Things I deliberately did **not** invent:

- Specific quantifiable claims (no "improved deploy time by 47%" type lines).
- Any role, project, or technology not already in `cv.json` or `cv-tone.html`.
- Any personal story not already implied by the bio + tone copy.

Things I **did** synthesise (call these out if any feel wrong and I'll redo them):

- Tenet 01's "philosophy taught me to be obnoxious about definitions" — extrapolated from the bio's "question the framing first" line.
- Tenet 06's "shipped one weird thing than have read every paper" — synthesised from the AI/LLM section.
- Tenet 07's "fine spending a week not knowing" — extrapolated from the philosophy + ambiguity threads.
- Tenet 13's tie to this site's `/phase-review` workflow — accurate but synthesised; verify the framing reads true.
- Tenet 14's "10km run" + "menu like a system diagram" — invented imagery riffing on the avocations list.

If any tenet feels off-voice, the fastest reset is: write the personal voice yourself in 1–2 sentences, and I'll match the formal voice to it.
