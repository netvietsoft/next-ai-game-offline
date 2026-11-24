param([string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$scriptPath = Join-Path $PSScriptRoot 'configure_r2_public_url.ps1'
$fixture = Join-Path ([System.IO.Path]::GetTempPath()) ('nextai-r2-endpoint-test-' + [guid]::NewGuid().ToString('N'))
$files = @(
    'Android/src/main/java/com/nextai/gameoffline/data/remote/GamePackageSecurityPolicy.kt',
    'Android/src/main/assets/games_catalog_full_419_r2.json',
    'Android/src/main/assets/games_catalog.json',
    'Android/src/test/java/com/nextai/gameoffline/data/remote/GamePackageSecurityPolicyTest.kt',
    'Android/src/test/java/com/nextai/gameoffline/GameCatalogIntegrityTest.kt'
)

# Chỉ test trên bản sao trong temp; không đổi endpoint thật hoặc gọi mạng.
# Test only copies in a temporary fixture; never mutate the real endpoint or call the network.
function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw "FAILED: $Message" }
}

# Chụp digest để chứng minh dry-run/lỗi không ghi dữ liệu.
# Capture digests to prove dry runs and validation failures do not write data.
function Get-FixtureHashes {
    return (@($files | ForEach-Object { (Get-FileHash -LiteralPath (Join-Path $fixture $_) -Algorithm SHA256).Hash }) -join '|')
}

$null = New-Item -ItemType Directory -Path $fixture
try {
    foreach ($relative in $files) {
        $destination = Join-Path $fixture $relative
        $null = New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force
        Copy-Item -LiteralPath (Join-Path $ProjectRoot $relative) -Destination $destination
    }
    $initialHashes = Get-FixtureHashes
    $testBase = 'https://pub-0123456789abcdef0123456789abcdef.r2.dev/games'
    $output = & $scriptPath -ProjectRoot $fixture -PublicBaseUrl $testBase
    Assert-True (($output -join "`n").Contains('DRY RUN')) 'Default operation must be dry-run.'
    Assert-True ((Get-FixtureHashes) -ceq $initialHashes) 'Dry-run must preserve all bytes.'
    foreach ($invalid in @(
        'http://pub-0123.r2.dev/games', 'https://pub-0123.r2.dev/games/',
        'https://user@pub-0123.r2.dev/games', 'https://pub-0123.r2.dev:443/games',
        'https://pub-0123.r2.dev/games?x=1', 'https://pub-0123.r2.dev/games#fragment',
        'https://pub-0123.r2.dev/other/../games', 'https://127.0.0.1/games',
        'https://localhost/games', 'https://*.r2.dev/games', 'https://r2.dev/games',
        'https://not-public.r2.dev/games', 'https://sub.pub-0123.r2.dev/games',
        'https://pub-0123.r2.dev%2Fevil/games', 'https://Pub-0123.r2.dev/games',
        "https://pub-0123.r2.dev/games`n", 'https://-invalid.example.com/games'
    )) {
        $rejected = $false
        try { & $scriptPath -ProjectRoot $fixture -PublicBaseUrl $invalid -Apply | Out-Null } catch { $rejected = $true }
        Assert-True $rejected "Invalid URL should be rejected: $invalid"
        Assert-True ((Get-FixtureHashes) -ceq $initialHashes) 'Invalid URL must not modify files.'
    }

    # Catalog không đồng nhất phải thất bại trước mọi write, ngay cả khi có -Apply.
    # An inconsistent catalog must fail before every write, even with -Apply.
    $catalogPath = Join-Path $fixture $files[1]
    $catalogBytes = [System.IO.File]::ReadAllBytes($catalogPath)
    $catalogText = [System.IO.File]::ReadAllText($catalogPath)
    $badText = [regex]::Replace($catalogText, 'https://[^"\s]+/games/abalone\.zip', 'https://evil.example/games/abalone.zip')
    [System.IO.File]::WriteAllText($catalogPath, $badText, [System.Text.UTF8Encoding]::new($false))
    $badHashes = Get-FixtureHashes
    $rejected = $false
    try { & $scriptPath -ProjectRoot $fixture -PublicBaseUrl $testBase -Apply | Out-Null } catch { $rejected = $true }
    Assert-True $rejected 'Inconsistent catalog must reject apply.'
    Assert-True ((Get-FixtureHashes) -ceq $badHashes) 'Preflight failure must not alter any file.'
    [System.IO.File]::WriteAllBytes($catalogPath, $catalogBytes)

    $output = & $scriptPath -ProjectRoot $fixture -PublicBaseUrl $testBase -Apply
    $backupLine = @($output | Where-Object { $_ -like 'Applied. Original files backed up at:*' })
    Assert-True ($backupLine.Count -eq 1) 'Apply must report original backup.'
    $backupPath = $backupLine[0].Substring('Applied. Original files backed up at: '.Length)
    Assert-True (Test-Path -LiteralPath (Join-Path $backupPath $files[0])) 'Policy backup must exist.'
    Assert-True (([System.IO.File]::ReadAllText((Join-Path $backupPath $files[1]))) -ceq $catalogText) 'Catalog backup must match original.'
    $changedCatalog = [System.IO.File]::ReadAllText($catalogPath) | ConvertFrom-Json
    $remote = @($changedCatalog | Where-Object { $_.isDownloaded -eq 0 })
    Assert-True ($remote.Count -eq 319) 'Remote game count must remain unchanged.'
    foreach ($game in $remote) { Assert-True ($game.remoteUrl -ceq "$testBase/$($game.name).zip") 'All remote URLs must align.' }
    Assert-True (([System.IO.File]::ReadAllText((Join-Path $fixture $files[0]))).Contains('TRUSTED_HOST = "pub-0123456789abcdef0123456789abcdef.r2.dev"')) 'Policy must trust exactly the selected host.'
    $tests = [System.IO.File]::ReadAllText((Join-Path $fixture $files[3]))
    Assert-True ($tests.Contains('https://evil.example/games/abalone.zip')) 'Adversarial host test must remain.'
    Assert-True ($tests.Contains('assertFalse')) 'Negative assertions must remain.'
    $appliedHashes = Get-FixtureHashes
    & $scriptPath -ProjectRoot $fixture -PublicBaseUrl $testBase -Apply | Out-Null
    Assert-True ((Get-FixtureHashes) -ceq $appliedHashes) 'Repeated apply must be byte-idempotent.'
    & $scriptPath -ProjectRoot $fixture -PublicBaseUrl 'https://games.example.com/games' | Out-Null
    Assert-True ((Get-FixtureHashes) -ceq $appliedHashes) 'Custom domain dry-run must not mutate.'
    Write-Output "PASS: dry-run, 17 malformed URLs, inconsistent catalog, aligned apply, backup, idempotency and custom-domain validation. Fixture: $fixture"
} finally {
    # Giữ fixture/backup để kiểm tra; không xóa đệ quy đường dẫn tính toán.
    # Retain the fixture/backups for inspection; do not recursively delete a computed path.
}
