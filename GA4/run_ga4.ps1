<#
.SYNOPSIS
    Trình chạy nhanh công cụ kết nối & phân tích GA4 cho Game Gate Offline.
    Quick launcher for Game Gate Offline GA4 analytics toolkit.
#>
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvPython = Join-Path $ScriptDir ".venv\Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "[!] Không tìm thấy môi trường ảo tại $VenvPython. Đang sử dụng python hệ thống..." -ForegroundColor Yellow
    $PythonExe = "python"
} else {
    $PythonExe = $VenvPython
}

if ($args.Count -eq 0) {
    & $PythonExe -m src.cli --help
    exit $LASTEXITCODE
}

Push-Location $ScriptDir
try {
    & $PythonExe -m src.cli @args
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
