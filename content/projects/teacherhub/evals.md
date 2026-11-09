---
slug: teacherhub/evals
status: published
---

The evaluation suite checks whether generated learning material is useful and faithful to the lesson, as well as structurally valid. It exercises three application paths: homework generation, lesson-note synthesis and learning-progress updates.

## Failures the evaluations exposed

Recorded runs in May 2026 identified concrete problems:

- **Missing lesson vocabulary:** a lesson summary omitted all of the vocabulary captured in the teacher's notes.
- **Unusable correction exercises:** a homework exercise contained identical wrong and correct sentences, leaving the student with nothing to correct.
- **Wrong difficulty for a new learner:** homework generated from an empty profile failed the beginner-level alignment check.

These historical findings provided specific cases to investigate and reproduce.

## Calibrating the evaluator

An evaluation can fail because the product is wrong or because the evaluator is too strict. I calibrated the rubrics and thresholds to distinguish those cases.

For lesson summaries, the previous summary-fidelity threshold required a score of 4 out of 5. Review of complex, multi-topic cases showed that acceptable summaries scoring 3 were being rejected. I changed that threshold to 3 while retaining the separate critical-issue failure and the stricter error-mapping threshold of 4. Missing content therefore remained a distinct failure condition; a less polished summary was no longer rejected solely by the elevated fidelity threshold.

I also switched the judge from OpenAI to Claude, using a different model family from the generator to address the risk of self-preference. The evaluator still needs scrutiny; changing model families does not remove every source of bias.

## Checks before model scoring

Deterministic assertions run before the judge. They check that a notepad containing errors or vocabulary does not produce an empty corresponding output, limit invented errors when none were recorded, and reject unknown skill identifiers in learning-progress updates. These checks make some failures explicit without spending another model call to diagnose them.

The model judge then evaluates dimensions such as learner-level alignment, instruction adherence, linguistic accuracy, lesson fidelity and pedagogical usefulness. Each suite uses criteria suited to its application path.

## What the suite establishes

The Vitest evaluations are opt-in behind `AI_TESTS=1` because they call live models. They support investigating regressions and comparing behaviour; they are not an automatic release guarantee. The homework suite also stubs database conjugation checks, so it does not establish that integration's behaviour.

Unit, integration, browser and database-policy tests complement these evaluations. Human review is still necessary where pedagogical judgments or borderline scores need interpretation.
