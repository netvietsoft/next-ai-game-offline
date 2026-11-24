# Download responsiveness — 2026-11-17

## Observations

- User reported roughly one minute before download starts.
- Before this change, real A07 video of Hero Match (~15.8 MB) showed the popup promptly but about12 seconds at0%, followed by data progress and completion around17 seconds. The full reported minute was not reproduced in that sample.
- PC public R2 measurements: Abalone first byte2.10s, total2.56s (2,541,743 bytes); Build Land first byte2.10s, total5.78s (23,794,577 bytes). These PC samples do not prove phone/network latency.
- Code had synchronous installation checks before showing the popup, a shared catalog-seeding mutex before GET for uncached games, and old staging cleanup before GET. These are avoidable delays, not proven to be the sole cause of all user reports.

## Changes

- Remote-game dialog is shown before disk work. Installed-game verification runs on IO.
- App-owned coordinator starts without synchronous filesystem checks, deduplicates active downloads and keeps transfers alive when the dialog closes.
- UI shows Preparing, Connecting with animation, real byte percentage/size, Installing, success or Retry. A slow-connection hint appears after4 seconds. There is no simulated percent.
- Network transfer no longer waits for the catalog mutex or old staging cleanup before GET. Installation/receipt/Room commit remains protected by the shared lock.
- Shared OkHttp4.12 client, explicit descriptive User-Agent and no redirects. A15-second startup deadline bounds waiting for DNS/headers/first body byte; after receiving bytes it is cleared, with a10-second stalled-read timeout. A progressing large transfer is not canceled merely for taking longer than15 seconds.
- Exact HTTPS allowlist, expected size, SHA-256, ZIP path/executable/expansion limits and verified receipts remain in place.100% of bytes is not treated as successful installation.

## Validation

- Android compile,30 unit tests, debug assemble and lint: PASS.
- Six transport regression tests cover actual byte progress, bad hashes, redirects, delayed DNS/headers/first body byte, a progressing transfer beyond the startup deadline and a stall after the first byte. Independent static review found no remaining blocking issue.
- Updated isolated QA APK installed on A07; original Play app/data remain intact. First post-change phone attempt was interrupted by the device switching to another app before a request started; final device timing is pending user availability.
- Notification QA from TASK-055 was cleaned up: test scheduling/receivers and analytics disabled again; original app and clock unchanged.

This does not guarantee instant first bytes on every network. The selected `r2.dev` development endpoint can be throttled and lacks production custom-domain CDN caching. Existing users need an updated Play build to receive the change; this session does not roll out a Play release.
