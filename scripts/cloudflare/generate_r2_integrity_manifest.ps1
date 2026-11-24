param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [string]$OutputPath = (Join-Path $ProjectRoot 'Android\src\main\assets\r2_game_integrity.json')
)

$ErrorActionPreference = 'Stop'

# Tạo manifest hash bất biến để Android chỉ cài đúng gói game đã kiểm duyệt.
# Generate an immutable hash manifest so Android installs only reviewed game packages.
$catalogPath = Join-Path $ProjectRoot 'Android\src\main\assets\games_catalog_full_419_r2.json'
$packagesPath = Join-Path $ProjectRoot 'R2_Upload\packages'
$gamesPath = Join-Path $ProjectRoot 'R2_Upload\games'
$catalog = Get-Content -Raw -LiteralPath $catalogPath | ConvertFrom-Json
$remoteGames = @($catalog | Where-Object { $_.isDownloaded -eq 0 } | Sort-Object name)
$blockedExtensions = @('.apk', '.aab', '.dex', '.jar', '.so', '.class')
Add-Type -AssemblyName System.IO.Compression.FileSystem

if ($remoteGames.Count -ne 319) {
    throw "Expected 319 remote games, found $($remoteGames.Count)."
}

$entries = foreach ($game in $remoteGames) {
    if ($game.name -notmatch '^[a-z0-9_]+$') {
        throw "Unsafe game identifier: $($game.name)"
    }

    $zipPath = Join-Path $packagesPath "$($game.name).zip"
    $sourcePath = Join-Path $gamesPath $game.name
    if (-not (Test-Path -LiteralPath $zipPath -PathType Leaf)) {
        throw "Missing package: $zipPath"
    }
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Container)) {
        throw "Missing source directory: $sourcePath"
    }

    $sourceEntries = @{}
    foreach ($sourceFile in Get-ChildItem -LiteralPath $sourcePath -Recurse -File -Force) {
        $relative = $sourceFile.FullName.Substring($sourcePath.Length).TrimStart([char[]]@('\', '/')).Replace('\', '/')
        if ($sourceEntries.ContainsKey($relative)) { throw "Duplicate source path: $relative" }
        $sourceEntries[$relative] = [long]$sourceFile.Length
    }

    $zip = Get-Item -LiteralPath $zipPath
    $archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    try {
        $fileEntries = @()
        $seenEntries = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
        foreach ($entry in $archive.Entries) {
            $entryPath = $entry.FullName
            $pathWithoutTrailingSlash = $entryPath.TrimEnd('/')
            $segments = @($pathWithoutTrailingSlash -split '/')
            if ([string]::IsNullOrWhiteSpace($pathWithoutTrailingSlash) -or
                $entryPath.Contains('\') -or
                $entryPath.StartsWith('/') -or
                @($segments | Where-Object { [string]::IsNullOrWhiteSpace($_) -or $_ -eq '.' -or $_ -eq '..' }).Count -gt 0) {
                throw "Unsafe ZIP path in $($game.name): $entryPath"
            }
            if (-not $seenEntries.Add($entryPath)) {
                throw "Duplicate ZIP entry in $($game.name): $entryPath"
            }
            if (-not [string]::IsNullOrEmpty($entry.Name)) {
                if ([System.IO.Path]::GetExtension($entry.Name).ToLowerInvariant() -in $blockedExtensions) {
                    throw "Executable payload is forbidden in $($game.name): $entryPath"
                }
                $fileEntries += $entry
            }
        }
        if (-not ($fileEntries | Where-Object { $_.FullName -eq 'index.html' })) {
            throw "Missing root index.html in package: $($game.name)"
        }
        if ($fileEntries.Count -ne $sourceEntries.Count) {
            throw "ZIP/source file count mismatch for $($game.name)"
        }
        foreach ($entry in $fileEntries) {
            if (-not $sourceEntries.ContainsKey($entry.FullName) -or
                [long]$entry.Length -ne [long]$sourceEntries[$entry.FullName]) {
                throw "ZIP/source entry mismatch for $($game.name): $($entry.FullName)"
            }
        }
        $extractedSizeBytes = [long](($fileEntries | Measure-Object Length -Sum).Sum)
        if ($fileEntries.Count -gt 10000 -or $extractedSizeBytes -gt 134217728) {
            throw "ZIP extraction limits exceeded for $($game.name)"
        }
    } finally {
        $archive.Dispose()
    }

    [ordered]@{
        name = $game.name
        sizeBytes = [long]$zip.Length
        sha256 = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
        extractedSizeBytes = $extractedSizeBytes
        fileCount = $fileEntries.Count
    }
}

$manifest = [ordered]@{
    schemaVersion = 1
    gameCount = $entries.Count
    games = @($entries)
}

# Ghi UTF-8 không BOM; output được sắp xếp để có thể tái tạo và review diff.
# Write deterministic UTF-8 output sorted by game name for reproducible review.
$json = $manifest | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($OutputPath, $json, [System.Text.UTF8Encoding]::new($false))
Write-Output "Generated $($entries.Count) integrity records at $OutputPath"
