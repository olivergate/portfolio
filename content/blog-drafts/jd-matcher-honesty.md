---
slug: jd-matcher-honesty
title: "Why my JD matcher refuses to give you a percentage"
date: 2026-05-25
status: draft
summary: "Most CV-vs-JD tools sell optimism. Mine is built to survive a hiring manager asking 'which bullet is this?' It also says plainly what a single honest tool can't fix."
kicker: "Honesty as design"
length: "~1000 words"
post: 4
source_brief: "content/_six-post-roadmap-2026-05-25.md"
source_data:
  - "lib/jd-prompts.ts"
  - "docs/adr/0016-jd-matcher-conservative-bias.md"
  - "docs/adr/0017-stretch-slider-semantics.md"
  - "docs/adr/0018-no-top-line-match-percentage.md"
---

Take one CV and one JD and run them through two matchers. The first, from CV Wolf or Teal or any of a dozen alternatives, returns "75% match" in a green badge over a row of optimistic chips. The second is the matcher on this site. It returns "7 hits, 4 stretches, and 1 honest gap." No percentage. No badge.

The difference isn't accuracy. Both tools do their jobs within the constraints their designers chose. The first is optimised to look good in a screenshot. The second is optimised to survive a hiring manager asking "which bullet is this?"

## The market sells optimism

Walk the output of any popular CV-vs-JD tool and the pattern repeats. The headline is a number, and the number is high. Weak matches score as Hits. Adjacent skills inflate into direct experience. The interface invites you to screenshot and share.

There are honest reasons for this. Candidates are the customers, and candidates prefer tools that make them feel hireable. Recruiters scroll fast, and "92% match" cues "worth opening." Keyword stuffing on the candidate side rewards optimism on the matcher side, and the loop tightens. The market converges on shareable numbers.

The social pressure underneath is real but routinely misquoted. The famous statistic (women apply only when they meet 100% of the qualifications, men at 60%) appears in *Lean In* and a hundred business articles after it, and traces back to a speculative remark by a Hewlett-Packard executive, not a study. [The Behavioural Insights Team](https://www.bi.team/blogs/women-only-apply-when-100-qualified-fact-or-fake-news/) called it out as anecdata. The asymmetry itself has better evidence: [LinkedIn's behavioural data](https://abcnews.go.com/Business/women-aggressive-men-applying-jobs-hired-frequently-linkedin/story?id=61531741) shows women applying to about 20% fewer jobs than men, and 16% less likely to apply after viewing a posting. The direction of the bias is right. The numbers we quote about it usually aren't. Even our framing of the application-threshold problem is more optimistic than the evidence supports.

## What honest looks like

Three rules sit at the top of the matcher's system prompt.

A Hit requires a citation. The matcher must name a specific cite ID, either `role:<bullet-id>` pointing at a CV role bullet or `project:<id>` pointing at a CV project. No bullet, no Hit. The answer is Stretch.

A Stretch means adjacent skill or partial match. It is not a euphemism for a weak Hit. If the requirement is genuinely uncovered, the answer is Miss.

A Miss is stated plainly, in first person ("I haven't shipped X"), with no pivot away from it.

Seven worked examples anchor the rules, and the seventh carries the most weight. The requirement is production experience with Ethereum and on-chain provenance. The OpenSC role on my CV lists Ethereum in its tech stack, but no bullet substantiates direct on-chain work; the bullets are about Plotly Dash, React, and the analytics frontend. The temptation is to cite the closest-adjacent bullet and reason "the OpenSC stack included Ethereum." The example marks that as wrong. A stack-list entry is not a bullet, and citing it as one is the failure the prompt exists to prevent. It is also the trap most matcher prompts fall into. The whole conservative bias hangs on that one distinction.

The stretch slider lets a visitor tune how generously borderline cases read. It moves the Hit/Stretch boundary and nothing else. A Miss at strict is a Miss at generous; you cannot slide your way out of an honest gap. ADR-0017 spells this out, and the worked examples include a borderline case that stays a Miss at all three slider levels.

And there is no top-line percentage, by decision (ADR-0018). A score implies quantitative measurement the matcher doesn't have. It implies comparability that doesn't exist: a "73% match" against a 12-chip JD and a "73% match" against a 6-chip JD look identical and mean different things. It aggregates hard requirements and nice-to-haves as if they were the same kind of thing. And, in the ADR's words, "a '67% match' on the page, screenshotted into a recruiter Slack channel, also reads as a self-rating Oliver does not endorse."

So the page shows an editorial line in body type: "7 hits, 4 stretches, and 1 honest gap." The phrasing is hardcoded. No template prop, no configuration, no numeric score in the API response either. The ADR closes that foothold, so no future UI change can grow a percentage without a new ADR superseding the old one.

## The recruiter still runs the other matcher

A conservative matcher on the candidate's side does not fix the optimistic one on the recruiter's side. If the screening stack inflates 65% candidates into 90% candidates, my honest output passes through that asymmetry untouched. Most recruiters will never click through to the live chip grid. They'll see a screenshot, or nothing, and form their impression elsewhere.

Honesty on one side of an asymmetric system does not restore symmetry. The design constraint here was never "fix hiring." It was "add no dishonest screenshot to the stack." A single-candidate tool can honestly claim that much and no more.

## The bet

Conservatism assumes the matcher's most important second reader (the hiring manager who clicks through, the recruiter who slows down) values defensibility over optimism. That assumption is reasonable and unmeasured. Some visitors come to a matcher to feel hireable, and a tool that itemises where they fall short may land worse than a generous one. In a different context the rules would be different too: inside a recruiter-facing product where the score is internal triage, a percentage is probably fine. This matcher lives on a candidate-facing page, where a score becomes a self-rating the moment it's screenshotted. The rules are tuned to that context.

What decides it for me is the asymmetry in penalties. An inflated chip buys a marginally better first impression. One indefensible citation costs the page its credibility with exactly the reader it most wants to keep: the one reading carefully. Nobody has run the six-month head-to-head that would settle this, optimistic matcher against conservative with first-interview rates tracked. Until someone does, I'm betting on the careful reader.
