# 0043 — Frontend-focused senior full-stack CV

- **Status:** Accepted
- **Date:** 2026-11-09
- **Deciders:** Oliver Kaikane Gate

## Context

Oliver requested a sharper CV targeting senior full-stack roles with a frontend focus, removal of Netherlands-specific hiring criteria, and concrete TeacherHub evaluation examples without invented achievements or metrics. The previous CV repeated an introductory biography and experience overview before showing employment, and foregrounded agent tooling over commercial engineering experience.

## Decision

Lead with one short summary, then experience, skills, two selected projects and education on both the website and PDF. Preserve the existing visual design, role citation IDs, project card treatment and print-only phone visibility. Remove the PDF's job-matcher promotional sentence and use the recovered space for larger print text.

This amends the content and ordering described in ADR-0037 and ADR-0038. The PDF still uses the existing print route and Chromium generator; selected projects still appear once in the CV. Other project pages and the JD, Tone and Lab sections remain available. The schema's concise about/overview fields remain for compatibility; the overview still supplies matcher context.

TeacherHub copy describes recorded evaluation failures and documented rubric calibration. The historical run is not presented as a current pass rate. User-attested calibration work is consistent with repository history; an incomplete review log is not evidence that human review never happened. Remove unsupported claims of a recurring, recorded human-calibration process and stale scenario counts.

## Consequences

The first employment entry follows the summary and contact details. The CV is focused on commercial frontend and full-stack work, with applied AI as supporting evidence. The website, PDF, matcher project summaries and readable draft share the revised content. Existing role citation targets remain valid.

No new employment dates, performance metrics, immigration eligibility or completed product outcomes are asserted. The removed availability line is not replaced with an assumption about work authorisation.

## Alternatives considered

- Content-only edits would leave the repeated preamble and dense print typography in place.
- A new visual design or replacement PDF generator would add scope without helping the requested positioning.
- A product-manager title would go beyond this CV's target and the established role history; product-pivot advice is separate.

## References

- ADR-0037 — CV PDF print surface
- ADR-0038 — projects shown once in the CV
- TeacherHub `evals/lesson-insights.eval.ts`, `evals/lib/eval-runner.ts`, and commits `fb89ce8` and `95a79d6`
- TeacherHub `.claude/test-runs/2026-05-14-phase11-live-run/full-run.log`
