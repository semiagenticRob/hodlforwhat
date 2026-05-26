# Gate Review — scope (iteration 0)

## Overall verdict
**concerns — user decides**

## Reviewer summary

| Reviewer | Verdict | Recommendation |
|---|---|---|
| viability-skeptic | concerns | revise: separate v1 monetization, name substitutes |
| scope-cutter | pass | approve |
| reps-fit-reviewer | pass | approve |

## Blocker findings
None.

## Concern findings
- [concern] **Success criteria (personal use) and monetization model (affiliate / external users) describe two different reps.** As written, the affiliate section can leak into v0 design without serving v0's actual goal. From: `viability-skeptic`. Evidence: scope.md `Success criteria` vs `Monetization hypothesis`.
- [concern] **"Spending guilt" is asserted without external evidence.** Fine for a personal-use rep, but the same scope.md describes an affiliate model that depends on the problem being broadly felt. No forum link, anecdote, or observed pattern is cited. From: `viability-skeptic`. Evidence: scope.md `Problem statement`.
- [concern] **No `substitutes` section.** River, Strike, Swan, and major brokers already support target-price selling. The actual wedge may be psychological / opinionated-UI, not raw functionality — but scope doesn't say that. From: `viability-skeptic`. Evidence: absence of substitutes block in scope.md.

## Notable info findings (top 3)
- [info] **LocalStorage may be over-engineering for a single-user v0** — URL hash params would suffice. (`scope-cutter`)
- [info] **Affiliate program terms vary widely** — minimum payouts, KYC requirements, first-trade-only payouts. Not a v0 blocker but informs v1 design. (`viability-skeptic`)
- [info] **Portfolio diversity is high; learning value holds even on kill.** First BTC-domain rep, novel archetype combo. (`reps-fit-reviewer`)

## Disagreement
None. All three reviewers agree the scope is structurally sound. The only disagreement is whether the surfaced concerns warrant a revise pass before advancing — viability-skeptic says yes, the other two are willing to advance as-is.

## Recommended action

**revise** — apply the viability-skeptic's three changes (move monetization to v1-notes.md, add a substitutes line, add a one-line "evidence" or "this is currently a hunch" note to the problem statement). These are small textual edits, not feature changes, and they sharpen the input to the design phase. Counts as iteration 1 of 2 against the scope cap.

If Robert disagrees and wants to ship the scope as-is, that's a valid call — the concerns aren't blockers, and a personal-use rep can reasonably defer external-validation hygiene. The orchestrator gives him the final say.
