# Cloudflare R2 trial deployment — 2026-11-17

Status: **Uploaded and public-byte verification passed: 319/319**.

## Destination

- Bucket: `comnextaigameoffline`.
- Public base: `https://pub-087272be70054d98a65246778849e2d0.r2.dev/games`.
- Objects: `games/<game_name>.zip`, exactly 319 keys, 1,005,530,891 bytes (~958.95 MiB).
- Original archives were uploaded without repacking. Android integrity manifest SHA-256: `c3b059f1950ace8967038a461365b8af0616a342215059fbf05e1a70795b6273`.
- Credentials remain in ignored local files (`info/r2.txt`, `.ai/r2.local.json`), never in Android or this report.

## Verification evidence

- Local: all 319 archive SHA/size records match; all 29,525 ZIP entries passed decompression/CRC and content comparison with source. See `R2_LOCAL_READINESS_2026-11-17.md`.
- Bucket: listing confirmed the exact expected 319 keys and byte sizes; HEAD confirmed size and SHA metadata for each object.
- Public: all 319 files downloaded through HTTPS without redirects; actual bytes and SHA-256 matched the Android manifest. Checkpoint: `R2_Upload/upload-state-python.json`, status `public_verified`, bucket_verified=319, public_verified=319.
- Transfer was resumed after 98 PowerShell uploads; Python uploaded the other 221, skipping the 98 matching objects without overwriting. Python verifier uses an honest application User-Agent; Cloudflare rejected the default Python client with error 1010 while PowerShell/Android and the descriptive application client worked.
- Android endpoint changed only to the exact issued host in the security policy, catalog and test expectations. No wildcard origins or bypass of ZIP security checks.
- Android `compileDebugKotlin testDebugUnitTest assembleDebug lintDebug`: PASS, 18 unit tests, zero failures/errors. Python uploader: 10 offline tests PASS; PowerShell uploader and endpoint configurator checks PASS.

## Samsung A07 QA

- QA v1.3 installed separately; existing Play v1.2 and its data were preserved.
- Abalone downloaded from R2, installed with matching SHA receipt, opened to the Play screen; download badge disappeared and remained hidden after restarting QA.
- Build Land displayed actual download progress (3%). Tapping outside dismissed the dialog while transfer continued; installation completed with matching SHA receipt, the game activity opened, and the badge disappeared.
- QA uses test ads and disabled Analytics/Crashlytics. No device network settings were changed; fully offline gameplay was not independently tested. Not all 319 games were gameplay-tested.

## Deployment limits / next steps

- `r2.dev` is the user-selected development endpoint, not a production CDN commitment. Attach a custom domain before production rollout.
- Users on the existing Play build still have the old hostname. Publish an updated signed build to give them the new source; this session did not upload or roll out a release to Google Play.
- Preserve archive bytes at these URLs for compatibility with the embedded manifest. Future package changes require a coordinated new manifest/app release (prefer versioned object keys) rather than silently replacing existing ZIPs.
- Game-specific ad/locale limitations recorded in the existing audits remain outside this storage deployment.

Official reference: [Cloudflare public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/).
