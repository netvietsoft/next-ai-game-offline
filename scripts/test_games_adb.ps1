# ==============================================================================
# SCRIPT KIEM THU TU DONG MINI-GAMES QUA ADB WIRELESS
# ADB AUTOMATED PLAYTEST SCRIPT FOR NEXTAI GAME OFFLINE
# ==============================================================================
param (
    [string]$DeviceAddress = "192.168.1.18:39545",
    [int]$Limit = 10,
    [int]$StartIndex = 0,
    [switch]$AllGames
)

$adb = "C:\Users\boluc\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$pkg = "com.nextai.gameoffline.debug"
$activity = "com.nextai.gameoffline.presentation.game.GameActivity"
$catalogPath = "$PSScriptRoot\..\Android\src\main\assets\games_catalog.json"
$screenshotDir = "$PSScriptRoot\..\Report\screenshots"

if (-not (Test-Path $screenshotDir)) {
    New-Item -ItemType Directory -Path $screenshotDir -Force | Out-Null
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CONNECTING & PLAYTESTING ON DEVICE: $DeviceAddress" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

& $adb connect $DeviceAddress
Start-Sleep -Seconds 1

$devicesOutput = (& $adb devices) -join "`n"
Write-Host $devicesOutput

if ($devicesOutput -notmatch [regex]::Escape($DeviceAddress)) {
    Write-Host "[ERROR] Cannot connect to ADB at $DeviceAddress!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $catalogPath)) {
    Write-Host "[ERROR] Catalog file not found: $catalogPath" -ForegroundColor Red
    exit 1
}

$rawCatalog = Get-Content $catalogPath -Raw | ConvertFrom-Json
$catalog = @($rawCatalog)
$totalCatalog = $catalog.Count
Write-Host "Total games in catalog: $totalCatalog" -ForegroundColor Yellow

$testGames = if ($AllGames) {
    $catalog
} else {
    $endIndex = [Math]::Min($StartIndex + $Limit - 1, $totalCatalog - 1)
    @($catalog[$StartIndex..$endIndex])
}

Write-Host "Testing $($testGames.Count) games (Starting at index $StartIndex)..." -ForegroundColor Green

$results = @()
$counter = 0

foreach ($game in $testGames) {
    $counter++
    $gName = $game.name
    $gTitle = $game.title
    $gHoriz = 0
    if ($null -ne $game.isHorizontal) {
        $gHoriz = [int]$game.isHorizontal
    }
    
    $orientLabel = if ($gHoriz -eq 1) { "Landscape" } else { "Portrait" }
    Write-Host "`n[$counter/$($testGames.Count)] Testing game: $gTitle ($gName) [$orientLabel]..." -ForegroundColor Cyan
    
    # 1. Clear logcat before running game
    & $adb -s $DeviceAddress logcat -c
    
    # 2. Launch game activity directly
    $amOutput = (& $adb -s $DeviceAddress shell am start -n "$pkg/$activity" --es extra_game_name "$gName" --ei extra_is_horizontal $gHoriz 2>&1) -join "`n"
    if ($amOutput -match "SecurityException" -or $amOutput -match "Error:" -or $amOutput -match "does not exist") {
        Write-Host "   [ERROR Starting Activity] $amOutput" -ForegroundColor Red
    }
    
    # 3. Wait for assets, WASM, and WebView
    Start-Sleep -Seconds 5
    
    # 4. Tap screen to simulate player interaction (Play/Start button)
    & $adb -s $DeviceAddress shell input tap 360 800
    Start-Sleep -Milliseconds 600
    & $adb -s $DeviceAddress shell input tap 360 1000
    Start-Sleep -Milliseconds 600
    & $adb -s $DeviceAddress shell input tap 360 1200
    Start-Sleep -Seconds 1
    
    # 5. Read logcat
    $logs = & $adb -s $DeviceAddress logcat -d -s "NextAIGame:*" "NextAIGameBridge:*" "GameActivity:*" "GameWebViewClient:*" "chromium:E" "AndroidRuntime:E"
    
    # Check fatal / crash / 404
    $hasAmError = $amOutput -match "SecurityException" -or $amOutput -match "Error:"
    $hasFatal = $logs | Where-Object { $_ -match "FATAL EXCEPTION" -or $_ -match "AndroidRuntime" }
    $has404 = $logs | Where-Object { $_ -match "ERR_FILE_NOT_FOUND" -or $_ -match "Loi HTTP 404" }
    $hasTypeError = $logs | Where-Object { $_ -match "Uncaught TypeError" -or $_ -match "TypeError: Android" }
    $bridgeEvents = $logs | Where-Object { $_ -match "NextAIGameBridge" }

    $status = "PASS"
    $reason = "OK"

    if ($hasAmError) {
        $status = "FAIL"
        $reason = "Launch Error: SecurityException or Activity not found"
    } elseif ($hasFatal) {
        $status = "CRASH"
        $reason = "FATAL EXCEPTION in Native"
    } elseif ($has404) {
        $status = "FAIL"
        $reason = "File/Asset 404 Not Found"
    } elseif ($hasTypeError) {
        $status = "WARN"
        $reason = "JavaScript TypeError detected"
    }

    # 6. Capture screenshot
    $screenFile = "$screenshotDir\test_${gName}.png"
    & $adb -s $DeviceAddress shell screencap -p /sdcard/temp_screen.png
    & $adb -s $DeviceAddress pull /sdcard/temp_screen.png "$screenFile" 2>$null
    & $adb -s $DeviceAddress shell rm /sdcard/temp_screen.png
    Write-Host "   -> Screenshot captured: $screenFile" -ForegroundColor DarkGray

    if ($bridgeEvents) {
        Write-Host "   -> Bridge events received: $($bridgeEvents.Count)" -ForegroundColor Green
        foreach ($ev in ($bridgeEvents | Select-Object -First 3)) {
            Write-Host "      $ev" -ForegroundColor Gray
        }
    }

    Write-Host "   -> Result: $status ($reason)" -ForegroundColor $(if ($status -eq "PASS") { "Green" } elseif ($status -eq "WARN") { "Yellow" } else { "Red" })

    $results += [PSCustomObject]@{
        Index = $counter
        Name = $gName
        Title = $gTitle
        Status = $status
        Note = $reason
    }

    # 7. Press Back to exit game
    & $adb -s $DeviceAddress shell input keyevent 4
    Start-Sleep -Milliseconds 800
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " SUMMARY PLAYTEST REPORT" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$warnCount = ($results | Where-Object { $_.Status -eq "WARN" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" -or $_.Status -eq "CRASH" }).Count

Write-Host "PASS: $passCount | WARN: $warnCount | FAIL: $failCount" -ForegroundColor Green

$results | Format-Table -AutoSize
