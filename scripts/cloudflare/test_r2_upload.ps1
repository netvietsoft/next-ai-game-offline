$ErrorActionPreference = 'Stop'
$uploadScript = Join-Path $PSScriptRoot 'upload_r2_games.ps1'
$wrapperScript = Join-Path $PSScriptRoot 'run_r2_upload.ps1'
$tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$testRoot = Join-Path $tempRoot ('nextai-r2-test-' + [guid]::NewGuid().ToString('N'))
$originalAccess = $env:AWS_ACCESS_KEY_ID
$originalSession = $env:AWS_SESSION_TOKEN
$global:NextAiR2UploadTest = @{apiCalls=0; putCalls=0; mode=''; objects=@{}; fixtureHash=''}

# Fake AWS để kiểm tra lỗi/quy trình, tuyệt đối không có request mạng / Fake AWS tests never perform network requests.
function aws {
    $global:NextAiR2UploadTest.apiCalls++
    $operation = $args[1]
    $global:LASTEXITCODE = 0
    if ($operation -eq 'head-bucket') { return '{}' }
    if ($global:NextAiR2UploadTest.mode -eq 'denied') {
        $global:LASTEXITCODE = 254
        return 'An error occurred (403) when calling the HeadObject operation: Forbidden'
    }
    $keyIndex = [Array]::IndexOf($args, '--key')
    $key = $args[$keyIndex + 1]
    if ($operation -eq 'put-object') {
        $global:NextAiR2UploadTest.putCalls++
        $global:NextAiR2UploadTest.objects[$key] = $true
        return '{}'
    }
    if ($global:NextAiR2UploadTest.mode -eq 'missing' -and -not $global:NextAiR2UploadTest.objects.ContainsKey($key)) {
        $global:LASTEXITCODE = 254
        return 'An error occurred (404) when calling the HeadObject operation: Not Found'
    }
    if ($global:NextAiR2UploadTest.mode -eq 'mismatch') { return '{"ContentLength":999,"Metadata":{"sha256":"wrong"}}' }
    return (@{ ContentLength = 3; Metadata = @{ sha256 = $global:NextAiR2UploadTest.fixtureHash } } | ConvertTo-Json)
}

# Tải public giả để kiểm tra byte/hash mà không ra mạng / Fake public downloads test hashes without network access.
function Invoke-WebRequest {
    param($Uri, $OutFile, [switch]$UseBasicParsing, $MaximumRedirection, $TimeoutSec)
    Assert-True ($MaximumRedirection -eq 0) 'Public verification must reject redirects.'
    $bytes = if ($global:NextAiR2UploadTest.mode -eq 'bad-public') { [byte[]]@(4,5,6) } else { [byte[]]@(1,2,3) }
    [IO.File]::WriteAllBytes($OutFile, $bytes)
}

# Assertion fail luôn dừng bài thử / Failed assertions stop the test run.
function Assert-True([bool]$Value, [string]$Message) { if (-not $Value) { throw "FAILED: $Message" } }
function Reset-Fake([string]$Mode) {
    $global:NextAiR2UploadTest.mode = $Mode
    $global:NextAiR2UploadTest.apiCalls = 0
    $global:NextAiR2UploadTest.putCalls = 0
    $global:NextAiR2UploadTest.objects = @{}
}

try {
    $packages = Join-Path $testRoot 'R2_Upload\packages'
    $assets = Join-Path $testRoot 'Android\src\main\assets'
    New-Item -ItemType Directory -Path $packages,$assets -Force | Out-Null
    $manifestPath = Join-Path $assets 'r2_game_integrity.json'
    $games = @(1..319 | ForEach-Object {
        $name = "test_$_"
        $path = Join-Path $packages "$name.zip"
        [IO.File]::WriteAllBytes($path, [byte[]]@(1,2,3))
        $global:NextAiR2UploadTest.fixtureHash = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
        @{ name = $name; sizeBytes = 3; sha256 = $global:NextAiR2UploadTest.fixtureHash }
    })
    @{schemaVersion = 1; gameCount = 319; games = $games} | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
    $parameters = @{ ProjectRoot = $testRoot; AccountId = ('a' * 32); AccessKeyId = 'fake-access'; SecretAccessKey = 'fake-secret'; Bucket = 'test-bucket'; SkipPublicVerification = $true }
    $env:AWS_ACCESS_KEY_ID = 'prior-access'
    $env:AWS_SESSION_TOKEN = 'prior-session'

    Reset-Fake 'missing'
    & $wrapperScript -ProjectRoot $testRoot -ValidateOnly | Out-Null
    Assert-True ($global:NextAiR2UploadTest.apiCalls -eq 0) 'ValidateOnly must not call AWS or require secrets.'

    [IO.File]::WriteAllBytes((Join-Path $packages 'test_319.zip'), [byte[]]@(4,5,6))
    $failed = $false
    try { & $uploadScript @parameters | Out-Null } catch { $failed = $_.Exception.Message -match 'Local package' }
    Assert-True ($failed -and $global:NextAiR2UploadTest.apiCalls -eq 0) 'A final-package mismatch must stop before the first network request.'
    [IO.File]::WriteAllBytes((Join-Path $packages 'test_319.zip'), [byte[]]@(1,2,3))

    Reset-Fake 'denied'
    $failed = $false
    try { & $uploadScript @parameters | Out-Null } catch { $failed = $_.Exception.Message -match 'head-object failed' }
    Assert-True ($failed -and $global:NextAiR2UploadTest.putCalls -eq 0) 'HEAD 403 must never be treated as missing.'
    Assert-True ($env:AWS_ACCESS_KEY_ID -eq 'prior-access' -and $env:AWS_SESSION_TOKEN -eq 'prior-session') 'Environment must be restored on errors.'

    Reset-Fake 'mismatch'
    $failed = $false
    try { & $uploadScript @parameters | Out-Null } catch { $failed = $_.Exception.Message -match 'Existing R2 object differs' }
    Assert-True ($failed -and $global:NextAiR2UploadTest.putCalls -eq 0) 'Mismatched deployed objects must not be overwritten by default.'

    Reset-Fake 'missing'
    & $uploadScript @parameters | Out-Null
    Assert-True ($global:NextAiR2UploadTest.putCalls -eq 319) 'Missing objects must upload.'
    $checkpoint = Get-Content -Raw (Join-Path $testRoot 'R2_Upload\upload-state.json') | ConvertFrom-Json
    Assert-True ($checkpoint.bucketVerified -eq 319 -and $checkpoint.status -eq 'bucket_verified_public_pending') 'Checkpoint must distinguish public verification pending.'
    Assert-True ($env:AWS_ACCESS_KEY_ID -eq 'prior-access' -and $env:AWS_SESSION_TOKEN -eq 'prior-session') 'Environment must be restored after success.'

    $global:NextAiR2UploadTest.putCalls = 0
    & $uploadScript @parameters | Out-Null
    Assert-True ($global:NextAiR2UploadTest.putCalls -eq 0) 'Second run must resume without uploading matching objects.'

    $configPath = Join-Path $testRoot 'config.json'
    $config = @{accountId=('a' * 32); accessKeyId='fake-access'; secretAccessKey='fake-secret'; bucket='test-bucket'; publicBaseUrl='https://pub-test.r2.dev/games'}
    $config | ConvertTo-Json | Set-Content -LiteralPath $configPath -Encoding UTF8
    Reset-Fake 'matching'
    & $wrapperScript -ProjectRoot $testRoot -ConfigPath $configPath | Out-Null
    $checkpoint = Get-Content -Raw (Join-Path $testRoot 'R2_Upload\upload-state.json') | ConvertFrom-Json
    Assert-True ($checkpoint.publicVerified -eq 319 -and $checkpoint.status -eq 'public_verified') 'Wrapper must support r2.dev and verify public bytes.'

    Reset-Fake 'bad-public'
    $failed = $false
    try { & $wrapperScript -ProjectRoot $testRoot -ConfigPath $configPath | Out-Null } catch { $failed = $_.Exception.Message -match 'Public CDN SHA-256' }
    Assert-True $failed 'A wrong public payload must fail verification.'

    $config.publicBaseUrl = 'https://user:password@pub-test.r2.dev/games'
    $config | ConvertTo-Json | Set-Content -LiteralPath $configPath -Encoding UTF8
    Reset-Fake 'matching'
    $failed = $false
    try { & $wrapperScript -ProjectRoot $testRoot -ConfigPath $configPath | Out-Null } catch { $failed = $_.Exception.Message -match 'publicBaseUrl must' }
    Assert-True ($failed -and $global:NextAiR2UploadTest.apiCalls -eq 0) 'Wrapper must reject credentials embedded in public URL.'
    Write-Output 'R2 uploader checks passed: preflight, validation-only, auth failure, overwrite protection, resume, checkpoint, env restore, local JSON, public SHA and URL checks.'
} finally {
    Remove-Variable -Name NextAiR2UploadTest -Scope Global -ErrorAction SilentlyContinue
    [Environment]::SetEnvironmentVariable('AWS_ACCESS_KEY_ID', $originalAccess, 'Process')
    [Environment]::SetEnvironmentVariable('AWS_SESSION_TOKEN', $originalSession, 'Process')
    $resolved = [IO.Path]::GetFullPath($testRoot)
    $prefix = $tempRoot.TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
    if ($resolved.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase) -and [IO.Path]::GetFileName($resolved) -match '^nextai-r2-test-[a-f0-9]{32}$') {
        Remove-Item -LiteralPath $resolved -Recurse -Force -ErrorAction SilentlyContinue
    }
}
