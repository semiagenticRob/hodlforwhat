# Build Plan — Iteration 0

## Goals for this iteration

Stand up a working Vite + TypeScript + Vitest scaffold AND implement the feature set described in design.md (targets CRUD, BTC price fetch with 60s debounce, hit-state rendering), with tests for each module per the design's Test Strategy. Aim is a single-iteration build that the verifier passes.

## Tasks

1. **[scaffold] Project root** — `package.json`, `tsconfig.json` (strict), `vite.config.ts` (with `base: '/hodlforwhat/'` and Vitest config pointing to happy-dom), `.gitignore` additions (`node_modules`, `dist`, coverage). Deps: `vite`, `typescript`, `vitest`, `happy-dom`, `gh-pages`. Deploy script in `package.json`: `"deploy": "vite build && gh-pages -d dist"`.
   - Tests: none (scaffold task).

2. **[scaffold] HTML shell** — `index.html` with the single-page structure: header (BTC price + refresh button + last-updated), main (targets list + add-new button + inline form), footer (the "No data leaves your device" disclaimer). Empty placeholders that `main.ts` populates.
   - Tests: none (rendered by main.ts).

3. **[feature] `src/types.ts`** — exported `Target`, `AppState` interfaces per design.md. `TargetStatus` type (`'pending' | 'hit'`).
   - Tests: none (type-only file).

4. **[feature] `src/evaluate.ts`** — pure helper `evaluateTarget(target, currentPriceUsd) → 'pending' | 'hit'`.
   - Tests: `src/evaluate.test.ts` — exact match (price === priceUsd → hit), 1¢ below (pending), 1¢ above (hit), very large prices (no overflow).

5. **[feature] `src/state.ts`** — `loadState()`, `saveState()`, `addTarget()`, `updateTarget()`, `deleteTarget()`. Backed by LocalStorage key `hodlforwhat.targets`. Each function pure-ish (takes/returns state).
   - Tests: `src/state.test.ts` — round-trip persistence, add/update/delete returning new state, malformed-LocalStorage returns empty state.

6. **[feature] `src/price.ts`** — `fetchBtcPrice() → Promise<{ priceUsd, at }>`. Hits CoinGecko `/simple/price?ids=bitcoin&vs_currencies=usd`. 60s client-side debounce: subsequent calls within 60s of the last successful fetch throw a typed `DebouncedError` with the remaining seconds.
   - Tests: `src/price.test.ts` — happy path (mock fetch returning the price), error path (network fail), malformed-response path (no `bitcoin.usd`), debounce enforcement (second call within 60s throws DebouncedError).

7. **[feature] `src/render.ts`** — pure render functions that produce DOM nodes from state. `renderTargets(state, currentPriceUsd)`, `renderHeader(state)`, `renderForm(...)`. Status computed from `evaluateTarget` at render time.
   - Tests: `src/render.test.ts` (happy-dom) — empty state renders empty-state copy, one pending target renders pending, one hit target renders the hit visual treatment, multiple targets render in newest-first order.

8. **[feature] `src/main.ts`** — wires DOM events to state mutations and re-renders. Refresh button click → `price.fetchBtcPrice()` (catches DebouncedError, shows countdown). Add-new form submit → `addTarget()` + re-render. Edit / delete from the per-target card.
   - Tests: `src/main.test.ts` (happy-dom) — refresh disables button for 60s with countdown text, add-new form creates a target and rerenders.

9. **[feature] `src/styles.css`** — single stylesheet. ~150 lines max. Clear visual distinction between `pending` and `hit` target cards.
   - Tests: none (visual; ux-smoke-reviewer's beat).

10. **[verify] Smoke check.** `npm install` (clean) → `npm run dev` boots without error → page renders. `npm test` all green. `npx tsc --noEmit` clean.

## Out of scope for this iteration

- Coinbase fallback (v1 per design)
- Affiliate URLs / `AFFILIATE_ACTIVE` flag (v1 per design)
- Custom domain config (v0 uses `https://semiagenticrob.github.io/hodlforwhat/`)
- E2E tests (manual UX walk handles this at the test gate)
- Charts / price history (v1+)

## Done criteria for the verifier

1. `npm test` exits 0 with all test files passing.
2. `npx tsc --noEmit` exits 0 (no type errors).
3. `npm run build` exits 0 (Vite production build succeeds).
4. `npm run dev` boots and serves `index.html` (smoke check — verifier confirms the page returns 200 and contains the expected DOM markers).
5. Every task above produced the files named, no skips.
