---
slug: teacherhub/evals
status: published
---

"The output looks right" is not a quality bar you can ship an AI feature on. TeacherHub's three AI pipelines are each covered by an LLM-as-judge eval suite: 68 scenarios in total, around 2,900 lines of eval code.

## The three suites

- **Homework generation**: 25 scenarios across CEFR levels, judged on a five-dimension rubric: CEFR alignment, instruction adherence, linguistic accuracy, pedagogical value, and structural validity.
- **Lesson insights**: 22 scenarios checking that the post-lesson synthesis stays faithful to the notepad: summary fidelity, error mapping, vocabulary categorisation, homework pedagogy, structural validity.
- **Ability-graph updates**: 21 scenarios checking that lesson events move the right skills in the right direction by proportionate amounts.

The suites run under Vitest behind an `AI_TESTS=1` flag, so they cost money only when you ask them to.

## Judging the judge

An LLM judge is itself a model that can drift, so there's a third layer: a human-review log. I periodically score a sample of outputs by hand, and the calibration rule is mechanical: if human and judge scores diverge by more than one point, the judge prompt gets revised. The log of those reviews lives in the repo next to the evals.

## The boring tests still matter

Underneath the AI layer: Vitest unit and integration tests (215 test files), Playwright end-to-end suites across 12 feature areas, and pgTAP tests for the Postgres functions and RLS policies. House rule: every test file must contain at least one test named after something a real user does, not just a function name.
