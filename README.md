# HodlForWhat

A Bitcoin spending planner for long-term holders.

Pre-commit to specific spending goals at specific BTC price levels. Make the sell decision *before* emotion takes over, not during it. When the market hits your target, the tool says so — your only job at that point is to choose whether to act.

## Usage

Visit the live site (link TBD post-deploy). Add targets — each one is a goal (e.g. "Down payment"), a BTC price (USD), and an amount of BTC to sell at that level. The tool fetches the current BTC price from CoinGecko on demand (click the refresh button; rate-limited to one fetch per minute). When the current price meets or exceeds any of your targets, that target is marked HIT.

All data lives in your browser's LocalStorage. **No data leaves your device. There is no server.** Clearing your browser data clears your targets.

## Run locally

```bash
git clone https://github.com/semiagenticRob/hodlforwhat.git
cd hodlforwhat
npm install
npm run dev
```

Open `http://localhost:5173/hodlforwhat/`.

## Tests

```bash
npm test
```

35 tests across 5 files. `npm run typecheck` for strict-mode TS check. `npm run build` for production bundle.

## Status

v0 — personal use. Public affiliate / live monetization deferred to v1, gated on personal-use validation. Part of [The 100 Reps Project](https://github.com/semiagenticRob) (rep-015).

## License

MIT — see `LICENSE`.
