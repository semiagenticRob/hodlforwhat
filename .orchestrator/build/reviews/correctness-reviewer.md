# Review — correctness-reviewer (iteration 1)

## Verdict
pass

## Findings
- [info] **`lastPriceFetch` shape validation landed cleanly.** `src/state.ts:11-19` defines an `isPriceFetch` type guard; `loadState()` uses it to coerce malformed values to `null`. The TS user-defined type guard (`value is PriceFetch`) means downstream code stays type-safe at compile time too, not just at runtime. Evidence: `src/state.ts:11-19, 27`.
- [info] **Zero-or-negative rejection landed.** `handleFormSubmit` now bails when `priceUsd <= 0` or `amountBtc <= 0` in addition to the existing finite-number check. Evidence: `src/main.ts:78-86`.
- [info] **Iteration-0 info findings still stand but don't merit re-flagging.** DebouncedError catch is still defensive-but-dead-path in the happy flow; `crypto.randomUUID` is still assumed; both are unchanged and acceptable. No new findings introduced by the iteration-1 edits.

## Recommendation
approve. Both concrete correctness concerns from iteration 0 are addressed and tested.
