# Build Plan — Iteration 1

## Goals for this iteration

Address the four concerns from iteration 0's build gate. No new features. Targeted fixes + tests.

## Tasks

1. **[fix] `src/state.ts` — shape-validate `lastPriceFetch` in `loadState()`.** Add a helper `isPriceFetch(x)` that checks for an object with a finite numeric `priceUsd` and a string `at`. If `parsed.lastPriceFetch` fails the check, set it to `null` rather than passing the bogus value through.
   - Tests: extend `state.test.ts` with two cases — malformed lastPriceFetch (string), missing fields on lastPriceFetch object.

2. **[fix] `src/main.ts` — reject zero-or-negative `priceUsd` and `amountBtc` in `handleFormSubmit`.** Strengthen the validation gate from `Number.isFinite(...)` to `Number.isFinite(...) && ... > 0`.
   - Tests: extend `main.test.ts` with a case that submits a zero-priceUsd and asserts the form rejects (no target appears, LocalStorage empty).

3. **[test] `main.test.ts` — edit flow.** Add a test: create a target → click its edit button → form populates with that target's values → change priceUsd → submit → target's priceUsd is updated and LocalStorage reflects it.

4. **[test] `main.test.ts` — delete flow.** Add a test: create a target → click its delete button → target disappears from the DOM and LocalStorage.

5. **[test] `main.test.ts` — refresh button click.** Add a test that stubs `globalThis.fetch` to return a known price, clicks `#refresh`, awaits the microtask, and asserts `#price` displays the formatted USD value and `#refresh` becomes disabled with a countdown label.

6. **[verify] Re-run the full verifier:** `npm test`, `npx tsc --noEmit`, `npm run build`, dev-server smoke.

## Out of scope for this iteration

- Anything not in the four gate concerns. No new features. No refactoring of working code beyond what the fixes require.

## Done criteria for the verifier

1. All previously-passing 27 tests still pass.
2. New tests (5+ new cases across state + main) all pass.
3. `npx tsc --noEmit` exits 0.
4. `npm run build` exits 0.
5. Dev server still boots cleanly.
