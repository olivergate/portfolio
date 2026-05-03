# 0012 — ADR editability tiers

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

ADR-0003 established the ADR practice for this project and stated, in one
sentence, that we do not edit Accepted ADRs — we supersede them. That rule is
clean as a slogan but rough in practice, because not every change to an
Accepted ADR is actually a change of decision.

Three concrete cases keep occurring as the project grows past Phase 0:

1. A file mentioned by name in an ADR gets renamed (e.g. a route file moves,
   a component is split). The ADR's *decision* hasn't changed, but a path
   reference in its body is now wrong.
2. A list of carve-outs / versions / call sites in the Consequences or
   Decision body becomes stale (e.g. ADR-0007's WCAG carve-out list grows
   when a new component adopts the muted token).
3. An ADR points forward to a spec or commit grammar that didn't exist when
   the ADR was authored.

Under ADR-0003's "supersede only" rule, every one of these would require a
new ADR — which is heavyweight for a typo or a renamed file, and would
balloon the `/decisions` page with ADRs that don't represent real decision
changes. In practice the alternative is silent edits, which both ADR-0003
and good ADR practice rule out.

The retro-claude doc-system kit (`~/Documents/Source/retro-claude/kit/`)
ships an editability doctrine that resolves this with two tiers. This ADR
adopts that doctrine for this project. The doctrine is consistent with the
goals of ADR-0003 — durability of recorded *reasoning*, public display of
*why we chose what we chose* — while letting cosmetic and factual drift be
fixed without ceremony.

## Decision

An Accepted ADR is not uniformly frozen. Two tiers apply:

**Frozen — requires a superseding ADR to change:**

- the decision itself (the X-not-Y choice in the Decision section)
- the rationale for choosing X
- the Alternatives-considered record
- the `Date:` stamp

**Editable in place — amend on a commit, no supersession:**

- current-state enumerations (lists of files, versions, modes, carve-outs,
  call sites, route paths)
- cross-references to other ADRs
- factual corrections (file renames, typo fixes, wrong line numbers)
- forward pointers to specs or commits that did not exist at authoring time

Rule of thumb: if an edit would change what a reader believes we chose or
why, write a new ADR that supersedes the old one. If it keeps that belief
intact while updating a factual detail, amend in place.

Mechanics:

- Amendments use the commit grammar `docs(adr): amend ADR-NNNN <what>`.
  One commit per ADR amended; cross-reference updates in lower-authority
  docs (e.g. `docs/specs/phase-N.md`) are separate commits.
- `Status: Accepted` does not flip on amendment. It flips only on
  supersession.
- The `Date:` stamp is the original Accepted date and is part of the
  frozen tier — amendments do not change it.

This refines, but does not replace, ADR-0003. ADR-0003's "Don't edit
accepted ADRs. Supersede them with a new ADR if the decision changes."
remains correct *for changes of decision*; this ADR carves out the case
where the decision itself isn't changing.

## Consequences

**Wins**

- Renamed files, typo fixes, and stale enumerations stop being a choice
  between "ship a noisy supersession ADR" and "edit silently and pretend
  ADR-0003 didn't say so." Both options were bad; this fixes both.
- The `/decisions` page (Phase 7) won't accumulate ceremonial supersession
  ADRs whose only purpose was to fix a wrong file path.
- The doctrine is now greppable. A reviewer asked "is this an amend or a
  supersede?" can read this ADR and the rule of thumb settles it without
  re-litigating ADR-0003.
- The doc-steward agent (introduced via the kit's `/doc-sync` command)
  reads this policy and is expected to surface the right ADR shape for a
  proposed change rather than guessing.

**Costs**

- Reviewers must judge tier per amendment. The rule of thumb usually
  decides, but borderline cases exist (e.g. a Consequences paragraph that
  starts as a current-state list and grows into a rationale). When in
  doubt, supersede — the cost of a redundant new ADR is lower than the
  cost of silently rewriting a rationale.
- ADR-0003's body still says "Don't edit accepted ADRs." That sentence is
  now narrower than its plain reading. A future amendment to ADR-0003 to
  add a forward pointer to this ADR would tighten the loop, and is
  itself an editable-tier amendment under the policy adopted here.

## Alternatives considered

- **Keep ADR-0003's rule as-is and live with silent edits.** Rejected.
  The whole point of public ADRs is that the reasoning trail is honest.
  Silent body edits to Accepted ADRs corrode that trust faster than any
  other failure mode.
- **Keep ADR-0003's rule as-is and ship supersession ADRs for every
  factual fix.** Rejected. The `/decisions` page is part of the
  portfolio. Filling it with supersession ADRs whose Decision section
  reads "fix a wrong filename in ADR-0007" makes the portfolio worse,
  not better. ADRs should represent decisions, not git commits.
- **Adopt the two-tier policy but use a different commit grammar
  (e.g. `docs(adr-amend):`).** Rejected as overspecified. The
  `docs(adr): amend ADR-NNNN <what>` grammar is parseable, scannable in
  `git log`, and consistent with how the project's other `docs(...)`
  commits are scoped.
- **Adopt the two-tier policy but mark the amendable sections inline
  in each ADR (e.g. with HTML comments).** Rejected. Inline markers
  would clutter every ADR and double the maintenance burden — every
  amendment would need to update both the body and the marker. The rule
  of thumb in this ADR is the working test; reviewers don't need a
  marker to apply it.

## References

- ADR-0003 (`docs/adr/0003-adr-format.md`) — the rule this ADR refines.
- `docs/doc-system/02-style-atlas.md §5` — the kit's style-atlas section
  for ADRs, which describes the same two-tier policy as the canonical
  source.
- `~/Documents/Source/retro-claude/kit/templates/docs/decisions/0001-editability-policy.md`
  — the upstream seed ADR shipped by the kit. This ADR is the
  portfolio's adapted, renumbered version.
- `docs/adr/INDEX.md §Editability policy` — mirrored summary for
  reviewers who land on the index.
