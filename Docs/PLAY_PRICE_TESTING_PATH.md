# Real Google Play prices: testing path

Verified 18 November 2026 for `com.nextai.game.offline`.

## Why the side-by-side QA app has no price

`com.nextai.game.offline.qa` is a different application to Google Play. The three product IDs belong to `com.nextai.game.offline`; copying those IDs into the QA package cannot make Play return the production products. Neither hardcoded USD prices nor values copied from the Developer API can prove the offer/price eligible for the user's Play account. The paywall must render `ProductDetails` from Play Billing.

The current query requests all three products as `SUBS` and selects only the configured base plan/eligible offer with the expected recurring period. No package-independent price fallback has been added. `BillingManager` now separates catalog loading/availability/service error from ownership readiness and logs safe diagnostic codes, requested package, fetched product counts and unfetched product status codes in debug builds.

Ownership has a separate LOADING/READY/PENDING/ERROR callback. Failed queries, acknowledgement failure, service disconnection or a query that has not completed after20 seconds leave purchase readiness false and allow the UI to show Retry instead of an indefinite “Checking purchases” state. Retry does not grant Premium. A generation guard rejects stale ownership responses after a disconnect/timeout/close; a separate generation guard prevents an older product query from replacing newer eligible offers and price data.

## Correct paths

1. **Preserve the existing Play app and its data on A07:** build a new signed AAB with the production package; use a unique version code higher than uploaded/released artifacts; distribute via Google Play Internal Testing. Google Play signs the delivered APK with the established app signing certificate so it can update the existing installation. Tester must be opted into the track and use the eligible Google account. Add that account separately as a license tester before test purchases to avoid real charges.
2. **Developer sideload on a clean test device/emulator:** official Billing documentation permits debug-signed sideloads for license testers when the package matches the configured Play app. This is not a way to install over A07's existing Play-signed application: Android signature compatibility still applies. Do not uninstall the existing app or erase its data without explicit user authorization.

Product queries and rendering are safe to test without completing a purchase. Testing free-trial eligibility, renewals, refunds and entitlement expiry requires the documented Play testing environment and must not be claimed based solely on client compilation.

## Signing evidence and readiness

- Production package: `com.nextai.game.offline`.
- Local debug signing SHA-1: `5A:95:3A:F1:87:02:72:6B:9F:31:59:26:DA:93:9E:B1:42:A4:30:43`.
- Local release/upload certificate SHA-1: `7D:75:58:32:44:A6:5E:1F:86:FB:C4:30:5F:8B:21:87:7D:C9:1C:C6`.
- Play app signing SHA-1 observed from A07's existing v1.2 APK: `BD:F4:7B:1D:CC:21:F4:6B:92:6B:03:D3:69:76:5A:2A:E6:49:1F:FE`.
- These differing certificates explain why directly installing the debug/upload-signed APK over the Play installation failed.
- Existing local release v10 artifacts dated13 November predate the current subscription UI and cannot serve as the updated app. Root has separately recovered the relevant local signing configuration; secrets must remain in ignored local files and are not reproduced here.
- Root read track configuration: production v9 and internal v3 at audit time. The uploaded bundle list contains versions1,2,3,4,5,7,8,9 and no10; the source's version10 was available at that check. Recheck before uploading if the Console is modified concurrently.
- No app was published, installed or deleted by this investigation. Actual upload/rollout and license-tester configuration belong to the root agent/user workflow.

## Remaining caveats

Localized prices reflect the user's Google Play billing country and Play's regional catalog, not phone language or inferred IP location. Trial eligibility comes from Play's returned offer list. The current backend still lacks authoritative token verification/RTDN; the client24-hour offline cache is not a server-verified subscription expiry.

Sources: [Google Billing test guidance](https://developer.android.com/google/play/billing/test), [Internal test setup](https://support.google.com/googleplay/android-developer/answer/9845334), [Product details and unfetched product diagnostics](https://developer.android.com/google/play/billing/integrate).
