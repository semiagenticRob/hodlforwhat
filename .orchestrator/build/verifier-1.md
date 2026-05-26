# Verifier — Iteration 1

## Result
pass

## Tests
- Suite: 35/35 (command: `npm test`)
  - evaluate.test.ts: 5/5 (unchanged)
  - state.test.ts: 11/11 (3 new: malformed lastPriceFetch — string, missing fields, non-numeric priceUsd)
  - price.test.ts: 5/5 (unchanged)
  - render.test.ts: 7/7 (unchanged)
  - main.test.ts: 7/7 (5 new: zero-priceUsd reject, zero-amountBtc reject, edit flow, delete flow, refresh click)

## Type-check / Lint
- `npx tsc --noEmit`: clean
- Strict mode + exactOptionalPropertyTypes still happy with the `isPriceFetch` type guard

## Smoke check
- `npm run build`: 7.20 KB JS + 2.4 KB CSS, build time 72 ms. Bundle grew by ~210 bytes (the validation logic + new error paths).

## Done-criteria match (from plan-1.md)
- All previously-passing 27 tests still pass — **met** (now 35 with the additions).
- New tests all pass — **met**.
- `npx tsc --noEmit` exits 0 — **met**.
- `npm run build` exits 0 — **met**.
- Dev server still boots — **met** (no changes to vite.config or entry).

## Notes from this iteration
- All four iteration-0 concerns directly addressed:
  1. `loadState()` now uses `isPriceFetch` type guard to shape-check `lastPriceFetch`, coercing malformed values to `null`.
  2. `handleFormSubmit` rejects when `priceUsd <= 0` or `amountBtc <= 0`.
  3. Edit and delete flows are tested at the DOM level in `main.test.ts`.
  4. Refresh-click integration test uses `vi.stubGlobal('fetch', ...)` to verify the click → fetch → rerender chain end-to-end.
- The refresh-click test reveals a small but useful detail: the test had to `await new Promise(r => setTimeout(r, 0))` after the click to let the awaited fetch + state save + rerender resolve. Documenting because every future "click → async → DOM" test in this rep (or future reps) needs the same microtask-yield pattern.
