param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [string]$AccountId = $env:CLOUDFLARE_R2_ACCOUNT_ID,
    [string]$AccessKeyId = $env:CLOUDFLARE_R2_ACCESS_KEY_ID,
    [string]$SecretAccessKey = $env:CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    [string]$Bucket = $env:CLOUDFLARE_R2_BUCKET,
    [string]$PublicBaseUrl = 'https://pub-r2.nextai.games/games',
    [string]$AwsCliPath,
    [switch]$SkipPublicVerification,
    [switch]$ValidateOnly,
    [switch]$ReplaceMismatchedObjects
)
$ErrorActionPreference = 'Stop'

# Kiểm tra toàn bộ batch trước khi ghi lên R2 / Validate the entire batch before writing to R2.
$packagesDir = Join-Path $ProjectRoot 'R2_Upload\packages'
$integrityPath = Join-Path $ProjectRoot 'Android\src\main\assets\r2_game_integrity.json'
$integrity = Get-Content -Raw -LiteralPath $integrityPath -Encoding UTF8 | ConvertFrom-Json
if ($integrity.schemaVersion -ne 1 -or $integrity.gameCount -ne 319 -or $integrity.games.Count -ne 319) {
    throw 'Integrity manifest is invalid or incomplete.'
}
$seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
foreach ($game in $integrity.games) {
    $name = [string]$game.name
    if ($name -notmatch '^[a-z0-9_]+$' -or -not $seen.Add($name)) { throw "Unsafe or duplicate game identifier: $name" }
    if ([string]$game.sha256 -cnotmatch '^[a-f0-9]{64}$' -or [long]$game.sizeBytes -le 0) { throw "Invalid package metadata: $name" }
    $zipPath = Join-Path $packagesDir "$name.zip"
    $zip = Get-Item -LiteralPath $zipPath
    $hash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($zip.Length -ne [long]$game.sizeBytes -or $hash -cne [string]$game.sha256) { throw "Local package no longer matches integrity manifest: $name" }
}
if ($ValidateOnly) {
    Write-Output "Local validation passed: $($seen.Count) packages match the Android manifest. No network requests made."
    return
}
if ([string]::IsNullOrWhiteSpace($AwsCliPath)) {
    $localCli = Join-Path $ProjectRoot '.ai\tools\awscli-v2\Amazon\AWSCLIV2\aws.exe'
    if (Test-Path -LiteralPath $localCli -PathType Leaf) { $AwsCliPath = $localCli }
    elseif (Get-Command aws -ErrorAction SilentlyContinue) { $AwsCliPath = 'aws' }
    else { throw 'AWS CLI v2 is required on PATH or in .ai/tools/awscli-v2/Amazon/AWSCLIV2/aws.exe.' }
}
if (-not (Get-Command $AwsCliPath -ErrorAction SilentlyContinue)) { throw 'Configured AWS CLI executable does not exist.' }
foreach ($setting in @{
    CLOUDFLARE_R2_ACCOUNT_ID = $AccountId
    CLOUDFLARE_R2_ACCESS_KEY_ID = $AccessKeyId
    CLOUDFLARE_R2_SECRET_ACCESS_KEY = $SecretAccessKey
    CLOUDFLARE_R2_BUCKET = $Bucket
}.GetEnumerator()) {
    if ([string]::IsNullOrWhiteSpace($setting.Value)) { throw "Missing environment variable: $($setting.Key)" }
}
if ($AccountId -notmatch '^[a-fA-F0-9]{32}$') { throw 'Invalid Cloudflare account ID.' }
if ($Bucket -notmatch '^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$') { throw 'Invalid R2 bucket name.' }
try { $publicUri = [uri]$PublicBaseUrl }
catch { throw 'PublicBaseUrl is not a valid HTTPS URL.' }
if (-not $publicUri.IsAbsoluteUri -or $publicUri.Scheme -ne 'https' -or $publicUri.Query -or $publicUri.Fragment -or $publicUri.UserInfo) {
    throw 'PublicBaseUrl must be an HTTPS URL without credentials, query or fragment.'
}
$PublicBaseUrl = $PublicBaseUrl.TrimEnd('/')
$endpoint = "https://$AccountId.r2.cloudflarestorage.com"

# Chỉ 404 cho phép tạo mới; lỗi quyền/mạng phải dừng / Only 404 permits creation; access/network failures stop.
function Invoke-R2Cli {
    param([string[]]$Arguments, [switch]$AllowMissing)
    $savedPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = & $AwsCliPath @Arguments --endpoint-url $endpoint --region auto --output json --no-cli-pager 2>&1
        $code = $LASTEXITCODE
    } finally { $ErrorActionPreference = $savedPreference }
    $body = ($output | Out-String).Trim()
    if ($code -ne 0) {
        if ($AllowMissing -and $body -match '\((404|NoSuchKey|NotFound)\)') { return $null }
        throw "R2 $($Arguments[1]) failed (exit $code). Check bucket access, credentials and network; no further writes attempted."
    }
    if ($body) { return $body | ConvertFrom-Json }
    return $null
}

# Checkpoint không chứa secret; chạy lại dùng HEAD để tiếp tục / Secret-free checkpoint; reruns resume using HEAD.
$statePath = Join-Path $ProjectRoot 'R2_Upload\upload-state.json'
$state = [ordered]@{
    startedUtc = [DateTime]::UtcNow.ToString('o')
    updatedUtc = [DateTime]::UtcNow.ToString('o')
    bucket = $Bucket
    publicBaseUrl = $PublicBaseUrl
    manifestSha256 = (Get-FileHash -LiteralPath $integrityPath -Algorithm SHA256).Hash.ToLowerInvariant()
    status = 'running'
    uploaded = 0
    skipped = 0
    bucketVerified = 0
    publicVerified = 0
    lastGame = $null
}
function Save-R2Checkpoint {
    $state.updatedUtc = [DateTime]::UtcNow.ToString('o')
    $tempState = "$statePath.tmp"
    [System.IO.File]::WriteAllText($tempState, ($state | ConvertTo-Json), [System.Text.UTF8Encoding]::new($false))
    Move-Item -LiteralPath $tempState -Destination $statePath -Force
}

# Khôi phục môi trường AWS sau upload kể cả khi lỗi / Restore AWS environment after upload, even on failure.
$overrides = @{
    AWS_ACCESS_KEY_ID = $AccessKeyId
    AWS_SECRET_ACCESS_KEY = $SecretAccessKey
    AWS_SESSION_TOKEN = $null
    AWS_DEFAULT_REGION = 'auto'
    AWS_RETRY_MODE = 'standard'
    AWS_MAX_ATTEMPTS = '5'
    # Hạn chế checksum tùy chọn để tương thích S3; SHA-256 public vẫn bắt buộc.
    # Avoid optional S3 checksum negotiation; public SHA-256 verification remains mandatory.
    AWS_REQUEST_CHECKSUM_CALCULATION = 'when_required'
    AWS_RESPONSE_CHECKSUM_VALIDATION = 'when_required'
}
$previous = @{}
foreach ($key in $overrides.Keys) {
    $previous[$key] = [Environment]::GetEnvironmentVariable($key, 'Process')
    [Environment]::SetEnvironmentVariable($key, $overrides[$key], 'Process')
}
$verificationDir = $null
try {
    Save-R2Checkpoint
    Invoke-R2Cli -Arguments @('s3api', 'head-bucket', '--bucket', $Bucket) | Out-Null
    foreach ($game in $integrity.games) {
        $name = [string]$game.name
        $key = "games/$name.zip"
        $state.lastGame = $name
        $head = Invoke-R2Cli -Arguments @('s3api', 'head-object', '--bucket', $Bucket, '--key', $key) -AllowMissing
        $matches = $null -ne $head -and [long]$head.ContentLength -eq [long]$game.sizeBytes -and [string]$head.Metadata.sha256 -ceq [string]$game.sha256
        if ($matches) {
            $state.skipped++
        } else {
            if ($null -ne $head -and -not $ReplaceMismatchedObjects) {
                throw "Existing R2 object differs: $name. Review the deployed version before using -ReplaceMismatchedObjects."
            }
            Invoke-R2Cli -Arguments @('s3api', 'put-object', '--bucket', $Bucket, '--key', $key,
                '--body', (Join-Path $packagesDir "$name.zip"), '--content-type', 'application/zip',
                '--cache-control', 'public,max-age=300,must-revalidate', '--metadata', "sha256=$($game.sha256)") | Out-Null
            $head = Invoke-R2Cli -Arguments @('s3api', 'head-object', '--bucket', $Bucket, '--key', $key)
            if ($null -eq $head -or [long]$head.ContentLength -ne [long]$game.sizeBytes -or [string]$head.Metadata.sha256 -cne [string]$game.sha256) { throw "R2 object metadata mismatch: $name" }
            $state.uploaded++
        }
        $state.bucketVerified++
        Save-R2Checkpoint
        Write-Output "R2 verified $($state.bucketVerified)/319: $name"
    }
    if (-not $SkipPublicVerification) {
        $tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
        $verificationDir = Join-Path $tempRoot ("nextai-r2-verify-" + [Guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Path $verificationDir | Out-Null
        foreach ($game in $integrity.games) {
            $state.lastGame = [string]$game.name
            $tempFile = Join-Path $verificationDir "$($game.name).zip"
            # Android từ chối redirect; xác minh đúng URL và byte / Android rejects redirects; verify the exact URL and bytes.
            Invoke-WebRequest -Uri "$PublicBaseUrl/$($game.name).zip" -OutFile $tempFile -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 180
            $download = Get-Item -LiteralPath $tempFile
            $hash = (Get-FileHash -LiteralPath $tempFile -Algorithm SHA256).Hash.ToLowerInvariant()
            if ($download.Length -ne [long]$game.sizeBytes -or $hash -cne [string]$game.sha256) { throw "Public CDN SHA-256 verification failed: $($game.name)" }
            Remove-Item -LiteralPath $tempFile -Force
            $state.publicVerified++
            Save-R2Checkpoint
        }
    }
    $state.status = if ($SkipPublicVerification) { 'bucket_verified_public_pending' } else { 'public_verified' }
    Save-R2Checkpoint
} catch {
    $state.status = 'failed'
    Save-R2Checkpoint
    throw
} finally {
    foreach ($key in $previous.Keys) { [Environment]::SetEnvironmentVariable($key, $previous[$key], 'Process') }
    if ($verificationDir -and (Test-Path -LiteralPath $verificationDir)) {
        # Chỉ xóa thư mục tạm con đã xác định / Delete only the verified temporary child directory.
        $resolved = [System.IO.Path]::GetFullPath($verificationDir)
        $safePrefix = $tempRoot.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
        if ($resolved.StartsWith($safePrefix, [StringComparison]::OrdinalIgnoreCase) -and
            [System.IO.Path]::GetFileName($resolved) -match '^nextai-r2-verify-[a-f0-9]{32}$') {
            Remove-Item -LiteralPath $resolved -Recurse -Force
        }
    }
}
Write-Output "R2 sync: status=$($state.status) uploaded=$($state.uploaded) skipped=$($state.skipped) bucket_verified=$($state.bucketVerified) public_verified=$($state.publicVerified)"
