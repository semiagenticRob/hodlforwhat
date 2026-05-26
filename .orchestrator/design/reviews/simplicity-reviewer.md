# Review — simplicity-reviewer (iteration 2)

## Verdict
pass

## Findings
- [info] **All four cuts landed cleanly.** AFFILIATE_ACTIVE gone, `passed` status gone, `version: 1` gone, export button gone (footer disclaimer in its place). The design.md is tighter and easier to read. Evidence: design.md diff vs iteration 1.
- [info] **Computing `status` instead of storing it goes further than the original cut request.** I asked for `pending | hit` only; the revised design also pulled `status` out of the persisted shape and made it a pure function. That's a stronger version of the simplification — no field to keep in sync. Worth noting as a design improvement, not just compliance. Evidence: design.md `Data model` note on computed status.
- [info] **Footer disclaimer doubles as cut + signal.** "No data leaves your device. We have no server." earns its place: trust message for users, replacement for the export button, and an honest acknowledgment of the LocalStorage tradeoff. One line for three purposes. Evidence: design.md `UX flow` footer; `Risk register` LocalStorage row mitigation.
- [info] **Coinbase fallback deferral is right for v0.** YAGNI says wait for the problem. For personal use the cost of a CoinGecko outage is "Robert can't refresh today" — annoying but not rep-ending. v1 can add the fallback if outages actually bite. Evidence: design.md `Risk register` row 1.

## Recommendation
approve. The design now reflects exactly what the rep needs, no more. The build phase will be shorter and have fewer states to test.
