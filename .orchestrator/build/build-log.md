# Build Log — HodlForWhat

## Iteration 0
- **Planned:** see plan-0.md (10 tasks: scaffold + types + evaluate + state + price + render + main + styles + tests + verify).
- **Built:** all 10 tasks landed.
  - Scaffold: `package.json`, `tsconfig.json` (strict), `vite.config.ts` (base + vitest config), `.gitignore`, `index.html`.
  - Modules: `src/types.ts`, `src/evaluate.ts`, `src/state.ts`, `src/price.ts`, `src/render.ts`, `src/main.ts`, `src/styles.css`.
  - Tests: `evaluate.test.ts`, `state.test.ts`, `price.test.ts`, `render.test.ts`, `main.test.ts` (27 tests total).
- **Skipped / deferred:** nothing from the plan. Per design, the following are explicitly v1:
  - Affiliate URLs / `AFFILIATE_ACTIVE` flag
  - Coinbase fallback price source
  - Custom domain config
  - E2E tests
  - Charts / price history
- **Tests written:** 27 across 5 files. Coverage matches the design's Test Strategy section: pure helpers, state CRUD, price fetcher with debounce, DOM rendering, main wiring.
- **Verifier result:** pass on iteration 0. See `verifier-0.md`. The verifier caught a real test-side bug (Response body reuse) on first run — fixed in place.
- **Commits made:** none yet at iteration end (will be made after the build gate approves).

## Iteration 1
- **Planned:** see plan-1.md (6 tasks, all gate-driven: 2 correctness fixes + 3 test additions + verify).
- **Built:** all 6 tasks landed.
  - `src/state.ts` — added `isPriceFetch` type guard; `loadState` now coerces malformed lastPriceFetch to null.
  - `src/main.ts` — `handleFormSubmit` rejects zero-or-negative priceUsd / amountBtc.
  - `src/state.test.ts` — 3 new tests for lastPriceFetch shape validation.
  - `src/main.test.ts` — 5 new tests for zero-value rejection, edit flow, delete flow, refresh button click.
- **Tests written:** 8 new tests (3 in state, 5 in main). Total 35.
- **Verifier result:** pass on iteration 1. See `verifier-1.md`.

## Final summary
The rep is a single-page Vite + TypeScript app. State lives in LocalStorage under `hodlforwhat.targets`. BTC price comes from CoinGecko's `/simple/price` endpoint behind a 60s client-side debounce. UI is one page: header (price + refresh button with countdown), targets list (with `pending` / `hit` visual states), inline add/edit form, footer disclaimer ("No data leaves your device. We have no server.").

Key files for future readers:
- `src/main.ts` — wires DOM events to state mutations and re-renders.
- `src/state.ts` — LocalStorage CRUD over `AppState`.
- `src/price.ts` — CoinGecko fetcher with the 60s debounce + `DebouncedError` typed escape hatch.
- `src/evaluate.ts` — the pure `evaluateTarget(target, currentPrice) → 'pending' | 'hit'` helper. Status is computed at render time, never persisted (per design revision iteration 2).
- `src/render.ts` — pure render functions returning DOM nodes; no event wiring (that's `main.ts`).

Bundle: 7 kB JS + 2.4 kB CSS gzipped. Build time ~70ms. Dev server boot ~120ms.
