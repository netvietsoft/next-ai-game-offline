param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [string]$SourceDir = (Join-Path $ProjectRoot 'R2_Upload\games'),
    [string]$OutputDir = (Join-Path $ProjectRoot 'R2_Upload\packages')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

# Đóng gói bằng entry '/' chuẩn ZIP thay vì '\' do .NET Framework tạo trên Windows.
# Package with standard '/' ZIP entries instead of Windows '\' entries from legacy APIs.
$sourceRoot = [System.IO.Path]::GetFullPath($SourceDir)
$outputRoot = [System.IO.Path]::GetFullPath($OutputDir)
$stagingRoot = "$outputRoot.staging"
$backupRoot = "$outputRoot.backup"
if (-not (Test-Path -LiteralPath $sourceRoot -PathType Container)) {
    throw "Source directory is missing: $sourceRoot"
}
if ([System.IO.Path]::GetPathRoot($outputRoot) -eq $outputRoot) {
    throw "Refusing unsafe output root: $outputRoot"
}
Remove-Item -LiteralPath $stagingRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $stagingRoot -Force | Out-Null

$blockedExtensions = @('.apk', '.aab', '.dex', '.jar', '.so', '.class')
$gameDirs = @(Get-ChildItem -LiteralPath $sourceRoot -Directory | Sort-Object Name)
if ($gameDirs.Count -ne 319) {
    throw "Expected 319 game directories, found $($gameDirs.Count)."
}

$manifest = foreach ($gameDir in $gameDirs) {
    if ($gameDir.Name -notmatch '^[a-z0-9_]+$') {
        throw "Unsafe game identifier: $($gameDir.Name)"
    }
    $files = @(Get-ChildItem -LiteralPath $gameDir.FullName -Recurse -File -Force | Sort-Object FullName)
    if (-not ($files | Where-Object { $_.FullName -eq (Join-Path $gameDir.FullName 'index.html') })) {
        throw "Missing root index.html: $($gameDir.Name)"
    }
    $blocked = @($files | Where-Object { $_.Extension.ToLowerInvariant() -in $blockedExtensions })
    if ($blocked.Count -gt 0) {
        throw "Executable payload is forbidden: $($blocked[0].FullName)"
    }

    $zipPath = Join-Path $stagingRoot "$($gameDir.Name).zip"
    $tempPath = "$zipPath.tmp"
    $backupPath = "$zipPath.bak"
    Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $backupPath -Force -ErrorAction SilentlyContinue

    $stream = [System.IO.File]::Open($tempPath, [System.IO.FileMode]::CreateNew)
    try {
        $archive = [System.IO.Compression.ZipArchive]::new(
            $stream,
            [System.IO.Compression.ZipArchiveMode]::Create,
            $false
        )
        try {
            foreach ($file in $files) {
                $relativePath = $file.FullName.Substring($gameDir.FullName.Length).TrimStart([char[]]@('\', '/'))
                $entryPath = $relativePath.Replace('\', '/')
                if ($entryPath -match '(^|/)\.\.(/|$)' -or $entryPath.StartsWith('/')) {
                    throw "Unsafe archive entry: $entryPath"
                }
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                    $archive,
                    $file.FullName,
                    $entryPath,
                    [System.IO.Compression.CompressionLevel]::Optimal
                ) | Out-Null
            }
        } finally {
            $archive.Dispose()
        }
    } finally {
        $stream.Dispose()
    }

    # Chỉ thay file cũ sau khi gói mới hoàn chỉnh; backup được phục hồi nếu move lỗi.
    # Replace the old ZIP only after the new archive is complete, restoring backup on failure.
    if (Test-Path -LiteralPath $zipPath -PathType Leaf) {
        Move-Item -LiteralPath $zipPath -Destination $backupPath
    }
    try {
        Move-Item -LiteralPath $tempPath -Destination $zipPath
        Remove-Item -LiteralPath $backupPath -Force -ErrorAction SilentlyContinue
    } catch {
        if (Test-Path -LiteralPath $backupPath -PathType Leaf) {
            Move-Item -LiteralPath $backupPath -Destination $zipPath -Force
        }
        throw
    }

    $zip = Get-Item -LiteralPath $zipPath
    [ordered]@{
        Name = $gameDir.Name
        ZipFile = $zip.Name
        SizeBytes = [long]$zip.Length
        SizeMB = [math]::Round($zip.Length / 1MB, 2)
        UploadPath = "games/$($zip.Name)"
    }
}

$manifestPath = Join-Path $stagingRoot 'r2_upload_manifest.json'
$json = $manifest | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText($manifestPath, $json, [System.Text.UTF8Encoding]::new($false))

# Swap cả batch sau khi đủ 319 gói để output không bao giờ trộn package cũ/mới.
# Swap the complete batch only after all 319 packages succeed, preventing mixed generations.
Remove-Item -LiteralPath $backupRoot -Recurse -Force -ErrorAction SilentlyContinue
if (Test-Path -LiteralPath $outputRoot -PathType Container) {
    Move-Item -LiteralPath $outputRoot -Destination $backupRoot
}
try {
    Move-Item -LiteralPath $stagingRoot -Destination $outputRoot
    Remove-Item -LiteralPath $backupRoot -Recurse -Force -ErrorAction SilentlyContinue
} catch {
    if (-not (Test-Path -LiteralPath $outputRoot) -and (Test-Path -LiteralPath $backupRoot)) {
        Move-Item -LiteralPath $backupRoot -Destination $outputRoot
    }
    throw
}
Write-Output "Packaged $($manifest.Count) games with portable ZIP paths."
