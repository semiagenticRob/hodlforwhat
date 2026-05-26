# Review — viability-skeptic

## Verdict
concerns

## Findings
- [concern] **Success criteria and monetization model don't share an audience.** Success is "Robert uses it for 3 months" but the monetization hypothesis is affiliate revenue from public users. These are different reps. If v0 is genuinely personal-use, the monetization section is aspirational v1 thinking that has no input into v0 design or build. Evidence: `Success criteria` says "personal use for 3 months"; `Monetization hypothesis` describes affiliate flow for external users.
- [concern] **"Spending guilt for BTC holders" is asserted, not evidenced.** The problem statement is well-written and emotionally resonant but contains no signal that anyone besides Robert actually feels this. No quote from a forum, no anecdote, no observed behavior pattern in the BTC community. For a personal-use rep this is fine; for a rep that ever expects affiliate revenue it's a starting-from-scratch demand-validation problem. Evidence: `Problem statement` paragraph.
- [concern] **Substitutes aren't named.** River, Strike, Swan, and several brokers already offer target-price selling and DCA-out features. Spreadsheets work. The pre-commitment behavior the tool wants to encourage might already be possible — what's missing is the discipline to use it, not the tool. If the bottleneck is psychology, a static site won't move it. Evidence: no `substitutes` section in scope; affiliate destinations listed (Coinbase, River, Kraken, Strike) but no acknowledgment those same platforms have native target-sell features.
- [info] **Affiliate path may not be honored on the destination side.** Crypto exchange affiliate programs are inconsistent — some require KYC verification of the referred user, some only pay on first-trade not crypto-to-fiat, some have minimum payout thresholds that take years to hit at low volume. Not a v0 blocker but worth knowing before designing the "ready to sell" UX in build. Evidence: monetization hypothesis names destinations without referencing program terms.

## Recommendation
revise: explicitly mark the monetization section as "v1, not informing v0 decisions" — or remove it from scope.md and put it in a separate `v1-notes.md` so the v0 build can't accidentally optimize for unproven external-user goals. Also: add a one-line `substitutes` field acknowledging existing target-sell features so the design phase can articulate the actual wedge (likely: opinionated UI, single-purpose tool, pre-commitment ritual — not raw functionality).
