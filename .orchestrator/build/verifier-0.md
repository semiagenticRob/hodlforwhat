# Verifier — Iteration 0

## Result
pass

## Tests
- Suite: 27/27 (command: `npm test`, vitest 1.6.1)
  - evaluate.test.ts: 5/5
  - state.test.ts: 8/8
  - price.test.ts: 5/5
  - render.test.ts: 7/7
  - main.test.ts: 2/2

## Type-check / Lint
- `npx tsc --noEmit`: clean (strict mode, exactOptionalPropertyTypes, noUnusedLocals, noUnusedParameters all on)
- No separate linter configured in v0 (TS strict + tsc covers the bar for a personal-use static site of this size)

## Smoke check
- `npm run dev` boots Vite in 124ms on `http://localhost:5173/hodlforwhat/`
- `curl http://localhost:5173/hodlforwhat/` returns HTML 200 with the expected markers: `<title>HodlForWhat</title>`, `<span class="price" id="price">BTC: —</span>`, footer disclaimer present
- `npm run build` produces a 7 kB JS bundle + 2.4 kB CSS — well within "lean static site" territory

## Done-criteria match (from plan-0.md)
- `npm test` exits 0 with all test files passing — **met**
- `npx tsc --noEmit` exits 0 — **met**
- `npm run build` exits 0 — **met**
- `npm run dev` boots and serves `index.html` — **met**
- Every task above produced the files named, no skips — **met**

## Notes from this iteration
- The verifier caught a real bug on the first test run: `mockResolvedValue(okResponse(95_000))` reused the same `Response` object across calls, which fails on the second call because fetch bodies can only be consumed once. Fixed by switching to `vi.fn(async () => okResponse(...))` so a new Response is created per call. Worth remembering as a pattern note for future reps using vitest mocked fetch.
- Security hook (PreToolUse) blocked an `innerHTML` assignment in the test setup. Refactored to programmatic DOM construction. The hook fired even on static-literal content; future test scaffolds in this orchestrator should default to `document.createElement` style rather than `innerHTML`.
