param(
    [Parameter(Mandatory = $true)][string]$PublicBaseUrl,
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [switch]$Apply
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# Chỉ chấp nhận một origin HTTPS canonical cụ thể, không wildcard/port/query/redirect.
# Accept one exact canonical HTTPS origin, never wildcard hosts, ports, queries, or redirects.
function Get-EndpointHost([string]$BaseUrl) {
    $match = [regex]::Match($BaseUrl, '\Ahttps://(?<host>[a-z0-9.-]+)/games\z')
    if (-not $match.Success) { throw 'Expected an exact lowercase HTTPS URL ending in /games, with no credentials, port, query or fragment.' }
    $endpointHost = $match.Groups['host'].Value
    $labels = $endpointHost.Split('.')
    if ($endpointHost.Length -gt 253 -or $labels.Count -lt 2 -or $labels[-1] -notmatch '^[a-z]{2,63}$') {
        throw 'A public DNS hostname is required; IP addresses and local hostnames are not accepted.'
    }
    foreach ($label in $labels) {
        if ($label -notmatch '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$') { throw 'Invalid DNS hostname.' }
    }
    if ($labels[-1] -in @('localhost', 'local', 'internal', 'invalid', 'test')) { throw 'A public DNS hostname is required.' }
    if (($endpointHost -eq 'r2.dev' -or $endpointHost.EndsWith('.r2.dev')) -and
        $endpointHost -notmatch '^pub-[a-z0-9]+\.r2\.dev$') {
        throw 'Use the exact Public Development URL issued for the bucket (pub-....r2.dev).'
    }
    return $endpointHost
}

# Giữ nguyên byte gốc để backup/rollback không mất encoding hoặc thay đổi khác của người dùng.
# Preserve original bytes so backup/rollback retains encoding and unrelated user edits.
function Read-ChangeEntry([string]$RelativePath, [string]$Root) {
    $path = Join-Path $Root $RelativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Required file missing: $RelativePath" }
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $hasBom = $bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191
    $offset = if ($hasBom) { 3 } else { 0 }
    return [pscustomobject]@{
        RelativePath = $RelativePath; Path = $path; Bytes = $bytes; HasBom = $hasBom
        Text = [System.Text.UTF8Encoding]::new($false, $true).GetString($bytes, $offset, $bytes.Length - $offset)
        NewText = ''; NewBytes = $null
        OriginalHash = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash
    }
}

# Kiểm tra catalog đầy đủ trước khi thay URL, không viết lại metadata/SHA hay game cục bộ.
# Validate the complete catalog before replacing URLs; do not rewrite metadata, SHA, or bundled games.
function Set-CatalogUrl($Entry, [string]$OldBase, [string]$NewBase, [int]$ExpectedTotal, [int]$ExpectedRemote) {
    $catalog = $Entry.Text | ConvertFrom-Json
    if ($catalog.Count -ne $ExpectedTotal) { throw "Unexpected catalog count: $($Entry.RelativePath)" }
    $seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
    $remoteCount = 0
    foreach ($game in $catalog) {
        if ($game.name -notmatch '^[a-z0-9_]+$' -or -not $seen.Add([string]$game.name)) { throw 'Invalid or duplicate catalog identifier.' }
        if ($game.isDownloaded -eq 0) {
            $remoteCount++
            if ([string]$game.remoteUrl -cne "$OldBase/$($game.name).zip") { throw "Catalog endpoint is inconsistent for $($game.name)." }
        } elseif ($game.isDownloaded -eq 1) {
            if (-not [string]::IsNullOrEmpty([string]$game.remoteUrl)) { throw "Bundled game has an unexpected remote URL: $($game.name)" }
        } else { throw 'Unsupported downloaded state in catalog.' }
    }
    if ($remoteCount -ne $ExpectedRemote) { throw "Unexpected remote count in $($Entry.RelativePath)." }
    $Entry.NewText = $Entry.Text.Replace("$OldBase/", "$NewBase/")
    if (([regex]::Matches($Entry.NewText, [regex]::Escape("$NewBase/"))).Count -ne $ExpectedRemote) {
        throw "Unexpected replacement count in $($Entry.RelativePath)."
    }
}

$newHost = Get-EndpointHost $PublicBaseUrl
$root = (Resolve-Path -LiteralPath $ProjectRoot).Path
$policy = Read-ChangeEntry 'Android/src/main/java/com/nextai/gameoffline/data/remote/GamePackageSecurityPolicy.kt' $root
$hostMatches = [regex]::Matches($policy.Text, 'private const val TRUSTED_HOST = "([a-z0-9.-]+)"')
if ($hostMatches.Count -ne 1 -or -not $policy.Text.Contains('private const val TRUSTED_BASE_URL = "https://$TRUSTED_HOST/games"')) {
    throw 'The Android policy structure changed; review the configuration script before applying.'
}
$oldHost = $hostMatches[0].Groups[1].Value
$oldBase = "https://$oldHost/games"
$null = Get-EndpointHost $oldBase
$policy.NewText = $policy.Text.Replace('private const val TRUSTED_HOST = "' + $oldHost + '"', 'private const val TRUSTED_HOST = "' + $newHost + '"')
$releaseCatalog = Read-ChangeEntry 'Android/src/main/assets/games_catalog_full_419_r2.json' $root
Set-CatalogUrl $releaseCatalog $oldBase $PublicBaseUrl 419 319
$bundledCatalog = Read-ChangeEntry 'Android/src/main/assets/games_catalog.json' $root
Set-CatalogUrl $bundledCatalog $oldBase $PublicBaseUrl 100 0
$entries = @($policy, $releaseCatalog, $bundledCatalog)

# Chỉ cập nhật hostname kỳ vọng trong test; giữ toàn bộ assertion chống URL độc hại.
# Update only expected hostnames in tests; retain all adversarial URL assertions.
foreach ($relative in @(
    'Android/src/test/java/com/nextai/gameoffline/data/remote/GamePackageSecurityPolicyTest.kt',
    'Android/src/test/java/com/nextai/gameoffline/GameCatalogIntegrityTest.kt'
)) {
    $entry = Read-ChangeEntry $relative $root
    if (-not $entry.Text.Contains($oldHost)) { throw "Test no longer contains the expected host: $relative" }
    $entry.NewText = $entry.Text.Replace($oldHost, $newHost)
    $entries += $entry
}
$changes = @($entries | Where-Object { $_.Text -cne $_.NewText })
Write-Output "Endpoint: $oldBase -> $PublicBaseUrl"
Write-Output "Verified 319 remote games and 100 bundled games; changed files: $($changes.Count)."
foreach ($entry in $changes) { Write-Output "  $($entry.RelativePath)" }
if (-not $Apply) {
    Write-Output 'DRY RUN: no files were changed. Re-run with -Apply only after confirming this bucket URL.'
    return
}
if ($changes.Count -eq 0) { Write-Output 'Already configured; no changes or backups required.'; return }

# Backup hoàn chỉnh trước khi ghi; không ghi credential hoặc đụng ZIP/manifest integrity.
# Back up every file before any write; never store credentials or modify ZIP/integrity data.
$backupRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('nextai-r2-endpoint-' + [guid]::NewGuid().ToString('N'))
$null = New-Item -ItemType Directory -Path $backupRoot
foreach ($entry in $changes) {
    if ((Get-FileHash -LiteralPath $entry.Path -Algorithm SHA256).Hash -cne $entry.OriginalHash) {
        throw 'A source file changed during planning; no changes applied. Retry after resolving concurrent edits.'
    }
    $backupPath = Join-Path $backupRoot $entry.RelativePath
    $null = New-Item -ItemType Directory -Path (Split-Path -Parent $backupPath) -Force
    [System.IO.File]::WriteAllBytes($backupPath, $entry.Bytes)
    $encoding = [System.Text.UTF8Encoding]::new([bool]$entry.HasBom, $true)
    $entry.NewBytes = [byte[]](@($encoding.GetPreamble()) + @($encoding.GetBytes($entry.NewText)))
}
$applied = [System.Collections.Generic.List[object]]::new()
try {
    foreach ($entry in $changes) {
        if ((Get-FileHash -LiteralPath $entry.Path -Algorithm SHA256).Hash -cne $entry.OriginalHash) {
            throw "Concurrent edit detected: $($entry.RelativePath)"
        }
        $applied.Add($entry)
        [System.IO.File]::WriteAllBytes($entry.Path, $entry.NewBytes)
    }
} catch {
    # Chỉ phục hồi nội dung do script vừa ghi; không ghi đè sửa đổi đồng thời khác.
    # Restore only bytes this script wrote; never overwrite another concurrent edit.
    foreach ($entry in $applied) {
        $current = [System.IO.File]::ReadAllBytes($entry.Path)
        if ([Convert]::ToBase64String($current) -ceq [Convert]::ToBase64String($entry.NewBytes)) {
            [System.IO.File]::WriteAllBytes($entry.Path, $entry.Bytes)
        }
    }
    throw "Endpoint update failed; matching writes rolled back. Originals remain at $backupRoot. $($_.Exception.Message)"
}
[System.IO.File]::WriteAllText((Join-Path $backupRoot 'endpoint-change.txt'), "Old: $oldBase`r`nNew: $PublicBaseUrl`r`nRebuild and test Android before deployment.`r`n", [System.Text.UTF8Encoding]::new($false))
Write-Output "Applied. Original files backed up at: $backupRoot"
Write-Output 'Rebuild/test Android and use the SAME PublicBaseUrl in .ai/r2.local.json before upload verification.'
