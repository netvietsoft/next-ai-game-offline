param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [string]$ConfigPath = (Join-Path $ProjectRoot '.ai\r2.local.json'),
    [switch]$ValidateOnly,
    [switch]$SkipPublicVerification,
    [switch]$ReplaceMismatchedObjects
)
$ErrorActionPreference = 'Stop'

# JSON chỉ là dữ liệu, không chạy nội dung cấu hình / Parse configuration as data, never execute it.
$arguments = @{
    ProjectRoot = $ProjectRoot
    ValidateOnly = $ValidateOnly
    SkipPublicVerification = $SkipPublicVerification
    ReplaceMismatchedObjects = $ReplaceMismatchedObjects
}
if (-not $ValidateOnly) {
    $config = $null
    if (Test-Path -LiteralPath $ConfigPath -PathType Leaf) {
        try { $config = Get-Content -LiteralPath $ConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json }
        catch { throw 'R2 config cannot be read as JSON. Check the local file without pasting credentials into logs.' }
        if ($null -eq $config -or $config -is [array] -or $config -is [string]) { throw 'R2 config must be a JSON object.' }
    }
    $fields = @(
        @('accountId', 'AccountId', 'CLOUDFLARE_R2_ACCOUNT_ID'),
        @('accessKeyId', 'AccessKeyId', 'CLOUDFLARE_R2_ACCESS_KEY_ID'),
        @('secretAccessKey', 'SecretAccessKey', 'CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
        @('bucket', 'Bucket', 'CLOUDFLARE_R2_BUCKET'),
        @('publicBaseUrl', 'PublicBaseUrl', 'CLOUDFLARE_R2_PUBLIC_BASE_URL')
    )
    foreach ($field in $fields) {
        $property = if ($config) { $config.PSObject.Properties[$field[0]] } else { $null }
        if ($property -and $null -ne $property.Value -and $property.Value -isnot [string]) {
            throw "R2 config field $($field[0]) must be a string."
        }
        $value = if ($property) { [string]$property.Value } else { $null }
        if ([string]::IsNullOrWhiteSpace($value)) { $value = [Environment]::GetEnvironmentVariable($field[2], 'Process') }
        if ([string]::IsNullOrWhiteSpace($value)) { throw "R2 setting missing: $($field[0]). Fill the local JSON or $($field[2])." }
        $arguments[$field[1]] = $value.Trim()
    }
    # Không in cấu hình/secret ra console / Never print configuration credentials to the console.
    try { $publicUri = [uri]$arguments.PublicBaseUrl }
    catch { throw 'publicBaseUrl is not a valid HTTPS URL.' }
    if (-not $publicUri.IsAbsoluteUri -or $publicUri.Scheme -ne 'https' -or $publicUri.AbsolutePath.TrimEnd('/') -ne '/games' -or
        $publicUri.Query -or $publicUri.Fragment -or $publicUri.UserInfo -or -not $publicUri.IsDefaultPort) {
        throw 'publicBaseUrl must be https://<your-public-host>/games without credentials, query, fragment or custom port.'
    }
}
& (Join-Path $PSScriptRoot 'upload_r2_games.ps1') @arguments
