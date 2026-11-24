# Cloudflare R2 trial setup

## Current status (2026-11-17)

- 319 ZIP packages (1,005,530,891 bytes) passed local SHA-256, size, CRC, path and source-content checks. See `Report/R2_LOCAL_READINESS_2026-11-17.md`.
- Bucket: `comnextaigameoffline`; public endpoint: `https://pub-087272be70054d98a65246778849e2d0.r2.dev/games`. **319/319 objects uploaded and verified by public GET/SHA-256.** Credentials are stored only in ignored local files. Completed checkpoint: `R2_Upload/upload-state-python.json`; deployment evidence: `Report/R2_DEPLOYMENT_2026-11-17.md`.
- Android now trusts this exact trial hostname. QA A07 downloaded Abalone, verified its receipt against the manifest and removed its download badge. Original Play app/data are preserved; old Play versions still need an update for the new endpoint.

## Account setup

1. Sign in to the intended Cloudflare account and activate R2 if needed. Review any billing/terms prompts yourself.
2. Create a game-only bucket (current configured bucket is `comnextaigameoffline`), default jurisdiction and Standard storage.
3. Bucket **Settings → Public Development URL → Enable**. Confirm public access for this game-only bucket, then copy the assigned `https://pub-….r2.dev` URL.
4. R2 **Manage API Tokens**: create an **Object Read & Write** token scoped only to this bucket. Save its Access Key ID, Secret Access Key and Account ID.
5. Fill `.ai/r2.local.json` locally. It is ignored by Git. Never put the secret in Android, shared documents, logs or chat. `publicBaseUrl` must be the assigned URL followed by `/games`.

```json
{
  "accountId": "<Cloudflare Account ID>",
  "accessKeyId": "<R2 Access Key ID>",
  "secretAccessKey": "<R2 Secret Access Key>",
  "bucket": "comnextaigameoffline",
  "publicBaseUrl": "https://pub-<assigned-id>.r2.dev/games"
}
```

## Execution and verification

- Use `scripts/cloudflare/run_r2_upload.ps1 -ValidateOnly` for a local check without network access.
- Once credentials and endpoint are present, review/apply the exact Android endpoint using `configure_r2_public_url.ps1`, build Android, then run `run_r2_upload.ps1`.
- Upload writes only manifest-listed `games/<name>.zip`. Existing objects with different bytes are not overwritten automatically. Reruns verify and skip matching objects.
- For faster upload using a shared connection pool: `.\.ai\r2-tools\Scripts\python.exe scripts/cloudflare/upload_r2_games.py --workers 4`. Dependencies are in `scripts/cloudflare/r2-requirements.txt`; the local environment is ignored by Git. Do not run both uploaders simultaneously.
- `R2_Upload/upload-state-python.json` records Python progress without secrets; PowerShell uses `upload-state.json`. After upload, verify all public URL bytes against the Android manifest, then test a real game download, installation, offline launch and removal of its download badge on A07 QA. Python `--public-only` retries only the public checks.
- Existing Play installations using the old hostname will need the updated application unless that hostname is configured later. Do not claim they can use a new URL without an app update.
- `r2.dev` is rate-limited and intended for development. For production, attach a custom domain rather than a CNAME pointing to `r2.dev`.

Official references: [Public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/), [R2 S3 setup](https://developers.cloudflare.com/r2/get-started/s3/).
