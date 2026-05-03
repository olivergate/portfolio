---
description: Criterion-by-criterion review of a completed phase — spec acceptance, visual diff, automated checks, cross-implementation parity, ADR audit
argument-hint: "<phase number 0-7>"
---

You are reviewing a phase that was just declared "done" — before commit, before
the status table is marked Done. Your job is to find what's broken, missing, or
quietly wrong **while the agent who shipped it is still in the room**.

The phase to review is: $ARGUMENTS

This command exists because Phases 0 and 1 each ended with the agent declaring
green and being wrong about it three times in a row. The pattern is:
"declared-green-too-early." Walk every check. Don't trust prior claims. Run
things, look at things, compare to the spec.

## Steps

### 1. Frame the review

Read these in order:

1. `docs/specs/phase-$ARGUMENTS.md` — the success criteria are the rubric
2. `docs/specs/README.md` — what the phase was supposed to ship
3. `git log --oneline origin/main..HEAD` (or the last 10 commits if no remote
   diff) — what the agent actually shipped this phase
4. The most recent ADRs (`ls -t docs/adr/*.md | head -5`) — what was decided

State the phase goal in one sentence and the pages/files touched. Then go
section by section through the success criteria — each one becomes a row in
the report.

### 2. Run all automated checks

Run in order, report each as it finishes. Do NOT batch results — surface
each pass/fail as it lands so failures are obvious mid-stream.

```
bun run typecheck
bun run lint
bun run content:validate
bun run test
bun run build
bun run test:e2e        # if Phase ≥ 1 and e2e tests exist
```

Any failure → stop. Don't continue with the visual review until the agent
fixes the root cause. No `--no-verify`. No bypass.

### 3. Visual diff against the design

For each page touched in this phase:

1. Identify the design reference: `design-references/screenshots/0N-cv-*.png`
2. Start `bun run dev` in the background
3. Take a screenshot of the running page at 1280×900 default and 375×800
   mobile, plus any state-relevant variants (e.g. for Phase 1 take all 16
   slider corners; for Phase 2 take both voice-toggle states)
4. Open both side-by-side and write a short visual-diff report:
   - Layout: matches / drifts / new spacing where?
   - Typography: weights and sizes correct?
   - Colors: tokens applied correctly?
   - Interactions present and working?
5. Any deviation: either fix it, or write an ADR documenting why we deviated
   (use `/adr` to scaffold). Don't leave silent deviations.

### 4. Cross-implementation parity

If the phase introduced a bootstrap script, an inline script-tag, a server
helper that mirrors a client helper, or a token mapping that exists in two
places: there must be a parity test (Phase 1's `tests/bootstrap-parity.test.ts`
is the pattern). Confirm it exists. If it doesn't, write it now or open an
issue in `docs/TODO.md`.

### 5. Acceptance criteria walk

For every numbered success criterion in the phase spec, mark:

- ✅ Met — confirmed by [test name | visual diff | manual check]
- ⚠️ Partial — what's missing
- ❌ Not met — what's broken
- ➖ Out of scope this phase — moved to phase N

Prefer "⚠️ Partial" over "✅ Met" when in doubt. The cost of a false-pass is
higher than a false-fail.

### 6. ADR audit

For each ADR the spec said to write this phase, confirm it exists. For each
ADR that exists for this phase, confirm its status is `Accepted` (not
`Proposed` if the decision is shipping). Cross-check that the spec's
"ADRs to write" list matches files on disk.

If a non-trivial decision was made this phase that isn't covered by an ADR,
flag it. Either scaffold the ADR now or note in `docs/TODO.md`.

#### 6a. ADR claims vs. same-session data

**Cross-check every load-bearing factual claim in each phase ADR against the
session's own measurements.** ADRs are the project's highest-class citizen
(per ADR-0012); a confidently-stated false claim in an Accepted ADR is worse
than no claim at all.

Specific checks:

- **Latency / performance claims** ("under N seconds", "within budget", "fast
  enough") — grep for `docs/test-runs/*.md` and any pressure-test results;
  confirm the claim matches the data.
- **Cost claims** ("approximately $X per call", "free on cache hit") — check
  the cost-log entries against the claim.
- **Capability claims** ("the matcher catches X", "the validator rejects Y")
  — find the test that proves it; if no test exists, the claim is unverified.
- **"This is unchanged" / "This stays the same"** — diff against the prior
  version; confirm.

Phase 3 surfaced this as obs_003: ADR-0015 claimed "Within the spec's <5s
budget" while the same session's pressure-test doc recorded 8.7s. The reviewer
caught it; the agent had been confident enough to ship a self-contradicted
ADR. Cross-checking before commit prevents repetition.

When a claim disagrees with the data: amend in place per ADR-0012's editable-
in-place tier (current-state enumerations, factual corrections), commit as
`docs(adr): amend ADR-NNNN <what>`. For larger amendments touching multiple
ADRs or wanting steward/reviewer audit, invoke the **`doc-sync`** skill —
hand it the named set of ADRs + the drift signal + which sections are
amendable, and let the steward propose, reviewer verify, applier commit.

If an ADR's frozen sections (Decision, Rationale, Alternatives, Date stamp)
disagree with the data, that's a supersession trigger, not an amendment —
write a new ADR superseding the old one.

### 7. Final report

End with a single section titled `## Phase $ARGUMENTS — Review verdict`:

- **Ready to commit:** yes / no / yes-with-caveats
- **Open defects:** numbered list of anything ❌ or ⚠️
- **Deferred items:** anything moved out of scope, with a target phase
- **ADRs written:** list with numbers
- **Surprises:** anything you found that the agent who shipped this didn't
  flag — cross-implementation parity opportunities, accessibility gaps,
  print stylesheet regressions, etc.

If the verdict is "no" or "yes-with-caveats," do NOT proceed to `/phase-done`.
Hand control back to the implementing agent to fix root causes.

## What this command is not

- It is not `/phase-done`. `/phase-done` runs checks and drafts a commit
  message; this command verifies the work against the spec and design.
  Run `/phase-review N` first, then `/phase-done` once verdict is "yes."
- It is not a code review. It does not audit style, naming, or
  architectural taste. It audits **whether the phase shipped what the
  spec said it would ship**.
- It is not optional. The "declared-green-three-times" pattern is the
  reason this exists; treat it as the workflow guarantee, not a courtesy.
