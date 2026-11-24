# Android subscription behavior

## Products and offers

| Product | Base plan | Trial offer identifier |
| --- | --- | --- |
| `game_premium` | `weekly` | `weekly-premium` |
| `game_premium_monthly` | `monthly` | `monthly-premium` |
| `game_premium_yearly` | `yearly` | `yearly-premium` |

The app queries these as `SUBS`. It never stores the requested USD prices, performs currency conversion, or substitutes a price when Play is unavailable. Each visible offer uses the `formattedPrice`, currency, period and pricing phases returned by Play for that user's account. The exact eligible offer token is passed to the purchase flow. An unavailable product disables only that plan.

Selection accepts the intended free-trial offer when Play returns it as eligible with a single free phase followed by the expected recurring period. Otherwise it selects the matching base plan with one recurring phase. Unknown promotions, multiple introductory phases, invalid prices and mismatched periods are not silently presented as the requested offer. Trial days are rendered from Play's actual billing period; no eligibility or free period is inferred from country or prior app usage.

The paywall shows renewal terms and a Manage subscriptions link. An active lifetime/subscription entitlement or a pending purchase prevents starting another subscription. Switching an active plan is directed to Play management; a custom upgrade/downgrade replacement flow is not implemented here. No purchase was executed by the agent.

## Entitlements and legacy purchases

- Restore and app foreground refresh query both `INAPP` and `SUBS`. The two historical Remove Ads product IDs remain supported for ownership and restore; the paywall now sells subscriptions.
- Only recognized `PURCHASED` orders that are acknowledged grant client entitlement. Pending purchases do not grant access and block stacking another purchase.
- A snapshot replaces cached ownership only after both product-type queries and all required acknowledgements succeed. Shared generation checks discard results made stale by a purchase/restore update, including pending updates.
- Lifetime and subscription ownership are stored separately. The old premium preference is migrated once as historical lifetime ownership, because the previous billing implementation supported only one-time purchases. A later complete successful Play query can revoke ownership when the product is no longer owned.
- Subscription cache has a maximum24-hour offline grace period since the last successful Play ownership check. This is **not the subscription expiry date**. The app does not infer expiry from purchase time or product period. Refresh occurs on process startup/foreground and periodically while foreground; a timer also expires the offline cache.
- All premium consumers must use `BillingEntitlements.isPremium`; the existing aggregate preference remains for compatibility and change notifications.

## Limits requiring release QA

Client Play checks and acknowledgement are not equivalent to secure server-side verification. Backend Play Developer API verification/RTDN remain a production security gate and are not implemented by this client update. Expiration, refunds, billing grace/account hold and canceled-but-still-entitled behavior need Play Internal Testing. If Play cannot be reached beyond the offline cache period, subscription benefits temporarily stop until a successful refresh; lifetime ownership is not aged out by that cache policy.

Real localized-price/trial/purchase/restore verification requires the correct signed package installed through Play with a license tester. A side-by-side QA package cannot prove the production subscription flow. Automated policy tests cover localized price retention, trial eligibility/base fallback, wrong-plan rejection and cache boundaries; they do not substitute for real purchase lifecycle tests.
