# Scope — HodlForWhat — Bitcoin spending planner

## Problem statement

Long-term Bitcoin holders feel real guilt about spending appreciating coins. They have life expenses where BTC is the most logical source of funds (down payment, family expenses, big purchases), but the act of selling feels like a failure — "I should have held longer" is the default emotional response, regardless of the actual sale price. The result: either selling impulsively at suboptimal moments and regretting it, or never selling and missing the life moments BTC was supposed to fund. HodlForWhat reframes selling as **goal-met selling** rather than "wasting BTC" — by pre-committing in advance to specific spending goals at specific price levels, the decision is made before emotion takes over.

## Target user / who pays

**Users:** Bitcoin long-term holders ("hodlers") with 1+ BTC and at least one identified life goal they would consider funding with BTC. Skews self-directed (not advisor-managed) and crypto-native.

**Payers:** End users pay nothing. The monetization path is **affiliate-driven** — when a user is ready to act on a hit target, the tool routes them to a fiat off-ramp (Coinbase, River, Kraken, Strike) via affiliate links. Revenue accrues per-conversion on the off-ramp side.

## Success criteria

**Personal use for 3 months.** v0 is "done" when:
- The tool is live (static site, GitHub Pages or equivalent).
- Robert is using it for his own BTC holdings continuously for 3 calendar months from launch.
- "Using" means: at least one target configured, returning to check it at least weekly.

This is intentionally a small bar. Public success is a v1 question, gated on whether the personal-use signal is positive.

## Kill criteria

Kill the rep when **both** signals fire:
1. **Effort cap hit** — hours_hard_cap (20) reached.
2. **No personal behavior change** — Robert has not, as a result of using the tool, either (a) configured a real target tied to a real life goal, or (b) altered his own spending or selling behavior.

The combination matters. Hitting the cap alone doesn't kill (might just mean estimate was tight). Behavior change without cap-hit means it's working. Both together = the premise didn't hold and the rep should stop.

## Archetype hint

**static-site**

Pure client-side. No backend, no user accounts, no server-side storage. State lives in LocalStorage / IndexedDB. BTC price comes from a public API (CoinGecko, Coinbase public ticker). Deploy target: GitHub Pages.

## Effort budget

- **hours_to_mvp:** 10 (range 8–12)
- **hours_hard_cap:** 20 (hours_to_mvp × 2)

The orchestrator should surface a kill-recommendation gate if cumulative hours across phases hit 20 without the rep being in personal-use-validated state.

## Monetization hypothesis

**Affiliate-ready, but not active in v0.**

- v0 builds the **structural** affiliate path: the deploy URL pattern, the "ready to sell" UX, the schema for affiliate destinations. The hooks exist.
- v0 does **not** ship live affiliate links or affiliate UI. Adding them would complicate the personal-use validation (selection bias on which exchanges, perception of the tool as "ad-funded" before it's even useful).
- Affiliate activation is a **v1 decision**, gated on personal-use success criteria being met.

This is honest about where the revenue path is supposed to come from while preventing v0 scope creep around it.

## Related prior reps

None applicable. First BTC-domain rep in the catalog. First static-site-with-affiliate-monetization-shape rep. Future related reps (if any) should reference this one's retro.
