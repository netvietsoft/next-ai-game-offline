# Galaxy Game — Google Play subscriptions

Verified package: `com.nextai.game.offline`,2026-11-17. Server readback evidence is in `Report/play-subscriptions/verified-summary.json` and the per-product after snapshots.

| Product ID | English listing | Base plan | Period | Trial offer | Trial | US recurring price | State |
| --- | --- | --- | --- | --- | --- | --- | --- |
| game_premium | Game Premium Weekly | weekly | P1W | weekly-premium | P3D | USD9.99 | ACTIVE |
| game_premium_monthly | Game Premium Monthly | monthly | P1M | monthly-premium | P5D | USD29.99 | ACTIVE |
| game_premium_yearly | Game Premium Yearly | yearly | P1Y | yearly-premium | P14D | USD99.99 | ACTIVE |

## Console changes and verification

- All three auto-renewing base plans and their existing174-region price tables were already active with the requested US prices. Weekly's3-day free offer was already active.
- Created and activated monthly-premium (5 days) and yearly-premium (14 days). Each free phase recurs once and is followed by its paid base plan.
- Updated the en-GB yearly title from Premium Yearly to Game Premium Yearly. Other existing listing fields/benefits were preserved; this change does not implement new coins or game-unlock features mentioned by existing listing benefits.
- Trial eligibility mirrors the existing weekly setup: Play-managed acquisition targeting users who have not had this subscription. It is not a guarantee every user will receive a free trial; the app uses offers returned as eligible by Play.
- Readback verifies all3 base plans/offers ACTIVE, exact periods/trials, free phase for all174 currently configured regions and unchanged regional/other-region prices. No old price-cohort migration, cancellation, refund, purchase or app release was performed.
- Region schema version was obtained from Play's conversion API:2026/01. Initial attempt using2022/02 was rejected before creation because ET is not billable under the older schema; retry used the API-returned version. The conversion quote was not applied to existing prices.

## Regional pricing

The app renders `ProductDetails` pricing phases' `formattedPrice`, currency and billing period. It does not convert from USD, use the device locale as a billing country, or show a fake price when unavailable.

Example current Play regional prices (snapshots, not hardcoded client values):

| Region | Weekly | Monthly | Yearly |
| --- | --- | --- | --- |
| US | USD9.99 | USD29.99 | USD99.99 |
| VN | VND257,000 | VND772,000 | VND2,550,000 |

Regional conversion is a Play catalog configuration, not a promise of automatic daily exchange-rate updates. Propagation to customers may take time. Each customer's Play Billing response is authoritative for the actual offer and displayed amount.

## Android implementation and remaining release gates

- Three subscription options, localized pricing, eligible free-trial disclosure, recurring terms and Play subscription-management link. Missing/unsupported offers and incomplete ownership checks leave purchase buttons disabled.
- Preserves existing lifetime INAPP purchases; restores both INAPP and SUBS. Active, pending or acknowledge-in-flight ownership prevents a second subscription purchase. Foreground reconciliation updates ads/settings; no expiry inferred from purchase date or auto-renew flag.
- Subscription cache uses a bounded24-hour offline grace window; this is not a server-verified expiry. Backend purchase-token verification and Real-time Developer Notifications remain unimplemented.
- Compile,36 unit tests, debug assemble and lint passed. Real Play Internal Testing is still required for purchase, eligibility, localized prices, renewal/cancellation/expiry and ownership UI. No real transaction was executed. The existing Play APK was not replaced or released.

References: [Subscription setup](https://support.google.com/googleplay/android-developer/answer/140504), [Billing lifecycle](https://developer.android.com/google/play/billing/lifecycle/subscriptions), [Regional pricing API](https://developers.google.com/android-publisher/api-ref/rest/v3/monetization/convertRegionPrices).
