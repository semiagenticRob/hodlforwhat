# Design — HodlForWhat — Bitcoin spending planner

> **Revision note (iteration 2):** Applied the 4 cuts (no AFFILIATE_ACTIVE flag, no `passed` status, no schema version field, no export button). Added 60s refresh debounce. Added "no data leaves your device" footer. Coinbase fallback deferred to v1 per simplicity-reviewer's prevailing YAGNI.

## Architecture

Single-page static web app. No backend. No user accounts. All state lives in the browser's LocalStorage. BTC price is fetched on demand from a public API.

```
┌────────────────────────────────────────────────────────────────┐
│                    Browser (the entire app)                     │
│                                                                 │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│   │  index.html  │ →  │  main.ts     │ →  │  state.ts    │    │
│   │  (one page)  │    │  (DOM wiring)│    │  (storage,   │    │
│   │              │    │              │    │   targets)   │    │
│   └──────────────┘    └──────────────┘    └──────────────┘    │
│                              │                                  │
│                              ▼                                  │
│                       ┌──────────────┐                          │
│                       │  price.ts    │                          │
│                       │  (CoinGecko  │                          │
│                       │   fetcher,   │                          │
│                       │   60s debounce)                         │
│                       └──────────────┘                          │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────┐
                   │  api.coingecko   │
                   │  /simple/price   │
                   └──────────────────┘
```

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Build / dev loop | **Vite 5+** | Familiar from cardio-route-finder. `base: '/hodlforwhat/'` makes GH Pages deploy trivial. |
| Language | **TypeScript** (strict mode) | Money math benefits from type safety. |
| Framework | **None — vanilla DOM** | One page, ~5 interactive elements. React would be ceremony. |
| Styling | **Plain CSS, single stylesheet** | ~200 lines of CSS max. |
| State persistence | **LocalStorage** under `hodlforwhat.targets`, JSON-serialized | Simple, sufficient for personal use. |
| BTC price source | **CoinGecko `/simple/price`** | Free, no key, ~30 calls/min unauthenticated. v0 manual-refresh stays well under. |
| Refresh debounce | **60-second minimum interval** between price fetches | Prevents a click-spam from blowing the per-IP rate limit. Button visibly disables and shows countdown. |
| Number formatting | **`Intl.NumberFormat`** (built-in) | No dependencies. |
| Tests | **Vitest** + **happy-dom** | Vite-native; happy-dom for DOM tests. |
| Deploy | **GitHub Pages** via `gh-pages` branch | `"deploy": "vite build && gh-pages -d dist"` in `package.json`. |

## Data model

Single typed shape, persisted as JSON in LocalStorage under the key `hodlforwhat.targets`:

```typescript
type TargetStatus = 'pending' | 'hit';
//   pending: current BTC price is below the target price
//   hit:     current BTC price is at or above the target price (action moment)

interface Target {
  id: string;              // crypto.randomUUID()
  goal: string;            // user-facing: "Down payment", "Sabbatical fund"
  priceUsd: number;        // BTC price (USD) that triggers this target
  amountBtc: number;       // how much BTC the target represents selling
  createdAt: string;       // ISO timestamp
}

interface AppState {
  targets: Target[];
  lastPriceFetch: {
    priceUsd: number;
    at: string;            // ISO timestamp
  } | null;
}
```

`status` is **computed**, not stored — it's derived from `target.priceUsd` vs `lastPriceFetch.priceUsd` at render time via a pure `evaluateTarget(target, currentPrice)` helper. Storing it would require keeping it in sync with the price, which is the bug surface this cut eliminates.

## UX flow

One page. No routing.

```
┌─────────────────────────────────────────────────────┐
│  HodlForWhat                                        │
│  BTC: $XX,XXX  (last updated 5m ago)  [↻ Refresh]   │
├─────────────────────────────────────────────────────┤
│  Your targets                          [+ Add new]  │
│                                                     │
│  ┌────────────────────────────────────────────┐    │
│  │ Down payment                       [edit]  │    │
│  │ When BTC ≥ $180,000  •  sell 0.5 BTC       │    │
│  │ Status: pending  ($XX,XXX more to go)      │    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  ┌────────────────────────────────────────────┐    │
│  │ Sabbatical fund                   [edit]   │    │
│  │ When BTC ≥ $250,000  •  sell 1.0 BTC       │    │
│  │ Status: HIT — ready to act                 │    │
│  └────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│   No data leaves your device. We have no server.    │
└─────────────────────────────────────────────────────┘
```

Add-new is an inline form. Edit reuses it. Targets render newest-first. A `hit` status card visually distinguishes itself (color/border) but has no dismiss flow — it just stays visible until edited or deleted.

The refresh button visibly disables for 60 seconds after a successful fetch, with a small countdown affordance (`Refresh available in 42s`).

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| CoinGecko rate-limits or goes down | Medium | High | Show last-known price + age. Manual refresh shows error inline rather than blocking the UI. **60s client-side debounce** between refresh attempts prevents accidental self-limit. Coinbase fallback deferred to v1. |
| LocalStorage cleared (browser settings, private window, OS wipe) | Medium | High | Footer disclaimer: "No data leaves your device" — the tradeoff is explicit. v0 has no backup mechanism; if Robert loses targets once during personal-use, that's a v1 signal to add export. |
| User trust on the no-account model | Low | Medium | Same footer disclaimer doubles as a trust signal. |
| Money math bugs (rounding, target comparison) | Low | High | Strict TS. Unit-test the pure `evaluateTarget(target, currentPrice)` with edge values: exact match, 1¢ below/above, very large prices. |

## Test strategy

- **Unit tests (Vitest):**
  - `price.ts` — fetch happy path (mocked), error path, malformed response path, debounce enforcement (rejects calls within 60s).
  - `state.ts` — add/edit/delete target, LocalStorage round-trip.
  - `evaluateTarget(target, currentPrice)` pure helper — edge values: exact match, 1¢ below/above, very large prices.
- **DOM tests (Vitest + happy-dom):**
  - Rendering: empty state, one target, multiple targets, a `hit` target visually distinct from `pending`.
  - Add-new form: submit creates a target and re-renders the list.
  - Refresh button: disables after click, shows countdown, re-enables after 60s.
- **No e2e tests in v0.** Manual UX walk by `ux-smoke-reviewer` covers the few flows that matter.
- **Smoke check by `build-verifier`:** `npm run dev` boots and renders the page without console errors.

## Deploy target plan

**Detected/planned target: `gh-pages-static`.**

- Build artifact: `dist/` from `vite build`
- Deploy method: `gh-pages` npm package, deploy script in `package.json`: `"deploy": "vite build && gh-pages -d dist"`
- Vite config: `base: '/hodlforwhat/'` so asset paths resolve under `https://semiagenticrob.github.io/hodlforwhat/`
- Custom domain: not in v0
- Env vars: none (CoinGecko free tier needs no key)
- Affiliate URLs: **not in v0** — deferred entirely to v1 with its own design pass

`release-readiness-reviewer` will cross-check the detector's pick at the deploy gate.
