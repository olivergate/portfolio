---
slug: jd-matcher-honesty
title: "Why my JD matcher refuses to give you a percentage"
date: 2026-05-25
status: draft
summary: "Most CV-vs-JD tools optimise for higher match scores. Mine optimises for honest gaps. Conservative bias as a design choice, the percentage as the wrong UI, and what an honest single-candidate tool still can't fix."
kicker: "Honesty as design"
length: "~1800 words"
post: 4
source_brief: "content/_six-post-roadmap-2026-05-25.md"
source_data:
  - "lib/jd-prompts.ts"
  - "docs/adr/0016-jd-matcher-conservative-bias.md"
  - "docs/adr/0017-stretch-slider-semantics.md"
  - "docs/adr/0018-no-top-line-match-percentage.md"
---

Two outputs from the same CV and the same JD. One comes from a generic CV-vs-JD matcher you can buy from CV Wolf or Teal or any of a dozen alternatives. It says "75% match" in a green badge, with a row of optimistic chips below it claiming most of the requirements as Hits. The other comes from the matcher on my own portfolio. It says "7 hits, 4 stretches, and 1 honest gap." No percentage. No green badge.

The difference between them isn't accuracy. Both matchers are doing their job within the constraints their designers gave them. The difference is that they're optimising for different things. The first is optimised to look good on a screenshot. The second is optimised to be defensible if a hiring manager asks me "which bullet is this?"

This post is about why the second design choice exists, what social pressure it's fighting, and what it still can't fix.

## The market is optimising for optimism

Walk through the output of any popular CV vs JD tool and the pattern is consistent. CV Wolf, Teal, recruitRyte, MyJobMag, and the rest. The headline is a number. The number is high. The chip grid below it is optimistic, with weak matches scored as Hits and adjacent skills inflated into direct experience. The chip language is upbeat. The interface invites you to screenshot and share.

There are good reasons for this. Candidates are the customers, and candidates prefer tools that make them feel hireable. Recruiters scroll fast, and a "92% match" cues "worth opening." Keyword stuffing on the candidate side gets rewarded by optimism on the matcher side, and the loop accelerates. The market converges on tools that produce shareable numbers.

The underlying social pressure these tools are responding to is well documented, but only partly understood. There's a widely cited statistic that "women apply for jobs only when they meet 100% of the qualifications, while men apply at 60%." It shows up in Sheryl Sandberg's *Lean In* and a hundred subsequent business articles. The trouble is that the original source is a speculative comment from a Hewlett-Packard executive, not a quantitative study. The [Behavioural Insights Team](https://www.bi.team/blogs/women-only-apply-when-100-qualified-fact-or-fake-news/) and others have called this out as anecdata.

The asymmetry the statistic is trying to describe is real, though, and there's more solid evidence for it. [LinkedIn's behavioural data](https://abcnews.go.com/Business/women-aggressive-men-applying-jobs-hired-frequently-linkedin/story?id=61531741) shows women applying to about 20% fewer jobs than men, and women being 16% less likely to apply after viewing a job posting. The shape of the bias is right. The specific numbers we quote about it usually aren't. That gap is itself revealing: even our cultural framing of the application-threshold asymmetry is more optimistic than the underlying evidence supports.

A conservative matcher is fighting all of these pressures at once. Candidate self-presentation. Recruiter-tool aesthetics. The keyword-stuffing arms race that the market converges on. And the broader pattern where any tool that produces a confident number gets believed at the confidence its number implies, regardless of what the number actually measures.

## What honest looks like, concretely

The matcher prompt encodes three rules at the top of the system message.

A Hit requires concrete cited evidence. The matcher must name a specific cite ID, either `role:<bullet-id>` pointing to a CV role bullet or `project:<id>` pointing to a CV project. If no such bullet exists, the matcher returns Stretch. Hit is not available without a citation.

A Stretch is "adjacent skill or partial match," not a euphemism for a weak Hit. If the requirement is genuinely not covered, the answer is Miss.

A Miss is "no concrete evidence in the CV." The matcher says so plainly in the gap framing, in first person ("I haven't shipped X"), without pivoting away from it.

Seven worked examples in the prompt anchor the rules. Example 7 is the one that matters most for honesty. It walks through a case where the requirement is "production experience with Ethereum / on-chain provenance." The OpenSC role on my CV lists Ethereum in its tech stack array, but no bullet substantiates direct on-chain work. The bullets are about Plotly Dash, React, and the analytics frontend. The example explicitly marks the temptation as wrong: citing the closest-adjacent bullet (one about Plotly Dash and React) with the reasoning "OpenSC stack included Ethereum" is dishonest, because the cited bullet doesn't substantiate the Ethereum claim. The tech list at the role level is not a bullet. Citing it as if it were is the failure mode the prompt exists to prevent.

That trap is the one most matcher prompts fall into. The cite has to be a bullet, not a stack-list entry the role happened to ship with. The matcher's whole conservative bias hangs off this one distinction.

The stretch slider on the page lets a visitor tune how generously the matcher reads borderline cases. It moves the Hit/Stretch boundary. It does not move the Stretch/Miss floor. It can't. A Miss at strict is a Miss at generous. The visitor cannot slide their way out of an honest gap. ADR-0017 spells this out in the rule set the prompt encodes, and the worked examples include a borderline case that stays a Miss across all three slider levels.

There is no top-line percentage. ADR-0018 makes the call explicit. A score implies quantitative measurement the matcher doesn't have. It implies comparability across JDs that doesn't exist (a "73% match" against a 12-chip JD and a "73% match" against a 6-chip JD look identical but mean different things). It implies aggregation across requirement types that's category-confused (a hard-requirement Hit and a nice-to-have Hit aren't equivalent). And, in the words of the ADR, "a '67% match' on the page, screenshotted into a recruiter Slack channel, also reads as a self-rating Oliver does not endorse."

The page displays an editorial line in body type instead: "7 hits, 4 stretches, and 1 honest gap." The phrasing is hardcoded. There's no template prop, no configuration, no way to swap the line for a number through a future UI change without a new ADR superseding the old one. The numeric score doesn't appear in the API response either. ADR-0018 closes that foothold deliberately: "no exposed numeric score in the JSON response either, even for downstream consumers, to avoid creating a foothold for future percentage UI."

## What this tool can't fix

The hardest thing to be honest about is what an honest tool doesn't change.

A candidate's conservative matcher doesn't fix the recruiter's optimistic one. If the screening side runs a generous match-scorer that inflates 65% candidates into 90% candidates and screens accordingly, my honest output reaches them through that asymmetry intact. The recruiter sees the chip grid in context only if they click through to the live page. Most won't. Most will see a screenshot, or no screenshot, and form a separate impression.

Honesty on one side of an asymmetric system doesn't restore symmetry. The matcher's design constraint is not "fix hiring." It's "don't add a dishonest screenshot to the hiring stack." That's a narrower claim. It is also, I think, the only claim a single-candidate tool can honestly make.

The same shape of bias shows up one level up the loop, too. The agent-rates-outputs versus user-rates-experience finding from my retro-claude corpus (a separate post explains this in more detail) has a direct candidate-side parallel. The candidate rates their own CV's match generously; the recruiter reads the generous output as evidence; the actual fit gap is invisible until first contact. The matcher's conservative bias is a partial check on the first step of that loop. It cannot reach the loop's later steps.

## What I might be wrong about

I might be wrong that conservative bias is the right design choice for every visitor. Some visitors come to a JD matcher precisely to feel hireable, and a tool that systematically tells them where they fall short might land worse than a generous one. The argument for conservatism rests on the assumption that the matcher's most likely second reader (a hiring manager who clicks through, a recruiter who scrolls slowly) values defensibility over optimism. That assumption is reasonable. It is not measured.

I might be wrong about the application-threshold framing. The HP statistic is unreliable, as above; the LinkedIn data is more solid but doesn't directly support a "candidates' self-screening drives matcher design" argument the way the stat is usually quoted to. The underlying pressure I'm describing (candidates over-claiming hireability in some directions and under-claiming in others) is real, but the chain from there to "therefore my matcher should be conservative" is structural reasoning, not measured causality.

I might be wrong about percentages being the wrong UI in all contexts. Inside a paid product where the user is a recruiter and the score is an internal triage signal, a percentage is probably fine. The second-reader assumptions are different. The case against percentages is strongest on a candidate-facing page where the score becomes a self-rating the moment it's screenshotted. My matcher lives in that specific context. A score-bearing matcher in a different context might be defensible.

What would change my mind: a head-to-head where the same candidate uses both an optimistic and a conservative matcher across a six-month job search, with first-interview rates tracked. If the conservative framing systematically loses candidates at the screening stage despite producing more defensible outputs, the design constraint is fighting the wrong thing. The conservative-bias prompt is a bet on what the second reader values. The bet might be wrong.

I'm betting it's right because the cost of an indefensible Hit is high. A hiring manager who reads the chip grid carefully and notices a citation that doesn't bear scrutiny is a hiring manager who stops trusting the page. The asymmetry in penalties (small upside from a marginally inflated chip count, large downside from one indefensible claim) points the same direction the matcher already does. But "I'm betting it's right" isn't the same as "I know it's right."
