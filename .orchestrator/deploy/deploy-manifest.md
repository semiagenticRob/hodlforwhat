# Deploy Manifest — HodlForWhat — Bitcoin spending planner

## Target detection
```yaml
candidates:
  - target: gh-pages-static
    confidence: high
    evidence: "gh-pages devDependency in package.json; 'deploy' script invokes vite build + gh-pages -d dist; vite.config.ts sets base: '/hodlforwhat/'; no server-side code"
selected: gh-pages-static
fallback: manual-checklist
scope_hint: static-site
design_planned_target: gh-pages-static
conflict: none
```

## Deploy result
- **Status:** deployed
- **URL:** https://semiagenticrob.github.io/hodlforwhat/
- **Deployed at:** 2026-05-26T16:50:00Z
- **Build/deploy command:** `npm run deploy` (resolves to `vite build && gh-pages -d dist`)
- **Build output:** 7.69 KB JS + 2.73 KB CSS gzipped; build time 75 ms
- **gh-pages publish:** `Published` (push to `gh-pages` branch of `semiagenticRob/hodlforwhat`)
- **GitHub Pages config:** source = `gh-pages` branch, path `/`; HTTPS enforced; build_type = `legacy`; Pages was auto-enabled by the first push (no manual API config needed beyond confirming the source branch).

## Rollback procedure

GitHub Pages serves whatever is on the `gh-pages` branch.

**Roll back to the previous build:**
```bash
cd ~/hodlforwhat
git checkout gh-pages
git reset --hard HEAD~1     # or to a specific commit
git push --force-with-lease origin gh-pages
git checkout main
```

GitHub Pages re-deploys in 1-3 minutes after the push.

**Roll forward (preferred for non-emergency):** make the fix on `main`, run `npm run deploy` again. `gh-pages` handles the branch push.

**No backup of LocalStorage data** — that's by design (no server, no data leaves the device). A rollback affects the static site, not user state.

## Manual follow-ups
None required for v0. The rep is fully deployed to its target.

Optional, deferred to v1:
- Remove `<meta name="robots" content="noindex, nofollow">` if/when ready for public discovery.
- Configure custom domain (currently uses default `*.github.io`).
- Activate affiliate URL hooks (entirely deferred per design).
- Add Coinbase fallback price source if CoinGecko outages prove painful in personal use.
