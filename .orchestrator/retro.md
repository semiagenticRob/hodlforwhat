# Retro — HodlForWhat — Bitcoin spending planner

## What this rep was

A single-page static web app that lets a Bitcoin long-term holder pre-commit to specific spending goals at specific BTC price levels. The user defines a goal (e.g. "Down payment"), a target BTC price (USD), and an amount of BTC to sell at that level. The tool fetches the current BTC price from CoinGecko on demand (60-second debounce between fetches) and marks any target whose price has been reached as HIT. All state lives in the user's browser LocalStorage; no server, no accounts, no data ever leaves the device. Deployed to GitHub Pages at https://semiagenticrob.github.io/hodlforwhat/ with `noindex, nofollow` so it isn't Google-discoverable during the personal-use validation window. v0 is for personal use only; affiliate monetization (the eventual revenue model named in scope) is deferred entirely to v1.

This was the first rep run through the `multi-agent-orchestrator` (rep-023) end-to-end. It also drove most of the orchestrator's early dogfood findings.

## What worked

- **The orchestrator's scope-cutter and simplicity-reviewer actually saved work.** At the design gate, the simplicity-reviewer cut four items (AFFILIATE_ACTIVE flag, third `passed` target status, schema `version` field, export button) that would have added 2-3h of code I'd never have needed. The design pass went iteration 0 → 1 → approved, and iteration 1 was meaningfully shorter than iteration 0 would have been to build out.
- **The verifier caught a real bug on the first build run.** `mockResolvedValue(okResponse(...))` reuses the same `Response` object across calls and the second call fails because fetch bodies can only be consumed once. Fixing it to `vi.fn(async () => okResponse(...))` is a pattern note worth carrying to every future rep that mocks fetch.
- **Computing `status` instead of storing it** (cut into the design at iteration 2) eliminated a class of stale-field bugs. Saved test surface AND was simpler code. Worth doing as the default for any "is this thing in state X" question.
- **The test-gate launch-blockers-reviewer caught the missing README and LICENSE before the deploy gate did.** Caught early, fixed cheaply.

## What didn't

- **Build phase iteration 0 shipped two correctness bugs the executor missed:** unguarded `saveState` (LocalStorage throws in private mode) and zero-value form acceptance (a target with priceUsd=0 renders as permanently HIT). Both were obvious in hindsight. The build-gate's correctness-reviewer caught them, but it's a sign the build-executor agent's "TDD-leaning" instruction needs sharper teeth — these were exactly the failure modes that would have been caught by a "what if the user passes zero or LocalStorage throws" mental model during implementation.
- **Initial design.md was too rich.** It carried a fully-specified affiliate scaffold + a 3-state target enum + a future-migration schema field + an export button — all of which got cut at iteration 2. The design-agent should default to YAGNI harder, not softer.
- **Iteration counter accounting in `status.yml` is murky.** During the dogfood I had to make manual decisions about when to increment iterations.scope (after the phase agent runs? after the gate? on a revise?). The `/rep` slash command's wording is "after the agent returns increment iterations.<phase>" but doesn't clearly cover the revise-from-gate case.

## What surprised you

- **The orchestrator generated honest disagreement between reviewers in a useful way.** At the design gate, the feasibility-reviewer wanted a Coinbase fallback added in v0; the simplicity-reviewer would have resisted on YAGNI grounds. The synthesizer surfaced this as explicit "live design call" and let the user pick (deferred). This is exactly the value-add the multi-reviewer pattern is supposed to produce — and it produced it on the first real run.
- **Test-gate revise on code-shaped fixes has ambiguous semantics in the orchestrator.** The test gate raised 7 concerns; 6 of them required code changes that are really "build" work. The orchestrator design doesn't cleanly answer "test-gate revise: loop test agent? loop back to build phase?" The pragmatic answer in this run was "make the fixes directly, then re-run the test phase," but this is worth pinning down formally in the orchestrator before the next rep.
- **GitHub Pages auto-enabled the first time `gh-pages` package pushed the branch.** The `gh api ... pages` POST returned 409 "already enabled" — Pages was set up automatically on first publish. No manual repo-settings step required. Pattern note: future static-site reps don't need an explicit Pages-enable step.
- **The whole flow (scope → design → build → test → deploy → live URL) ran in a single dogfood session.** Lifecycle that would have been 1-2 weeks of hand-driven work (interview, design doc, scaffolding, multiple reviewer passes, deploy steps) compressed into one session because every checkpoint had a human (Robert) and a structured prompt for every reviewer's beat. The orchestrator's leverage is real.

## Tags

`static-site`, `vite`, `typescript`, `vitest`, `happy-dom`, `github-pages`, `coingecko`, `localstorage`, `bitcoin`, `personal-use-rep`, `mit-license`, `noindex`, `affiliate-deferred`, `orchestrator-dogfood`, `first-orchestrator-driven-rep`

## Time spent

(Approximate, based on session timestamps and iteration counts. Real "personal use" calendar time is yet to come.)

- Scope: ~20 min (interview + 3 reviewers + synthesizer + gate)
- Design: ~25 min (2 iterations + 3 reviewers + synthesizer + 2 gates)
- Build: ~50 min (2 iterations: scaffold/impl/tests + correctness fixes; 3 reviewers + synthesizer + 2 gates)
- Test: ~30 min (suite run + 3 reviewers + synthesizer + 2 gates; iteration 1 added the launch-readiness polish)
- Deploy: ~15 min (target detection + deploy + Pages-live wait + 3 reviewers + retro)
- **Total: ~2h 20min** of orchestrator-driven work to reach a live URL with tests, license, and README.

## Outcome

**shipped.** Live at https://semiagenticrob.github.io/hodlforwhat/. Personal-use validation window starts now — 3 months. Retro will be revisited at the end of that window to record actual behavior change (or kill).
