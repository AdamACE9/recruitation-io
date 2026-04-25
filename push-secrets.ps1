# Reads keys from .env and pushes them to Firebase Secret Manager
# Usage: .\push-secrets.ps1

$envFile = ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env file not found. Create it first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Reading keys from .env and pushing to Firebase..." -ForegroundColor Cyan
Write-Host ""

$set  = 0
$skip = 0
$fail = 0

foreach ($line in Get-Content $envFile) {
    # Skip empty lines and comments
    if ($line -match '^\s*$' -or $line -match '^\s*#') { continue }

    # Split on first = only
    $parts = $line -split '=', 2
    if ($parts.Length -lt 2) { continue }

    $name  = $parts[0].Trim()
    $value = $parts[1].Trim()

    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "  SKIP  $name (no value set)" -ForegroundColor Yellow
        $skip++
        continue
    }

    Write-Host "  Setting $name ..." -ForegroundColor Gray
    $value | firebase functions:secrets:set $name --force 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK    $name" -ForegroundColor Green
        $set++
    } else {
        Write-Host "  FAIL  $name" -ForegroundColor Red
        $fail++
    }
}

Write-Host ""
Write-Host "Done.  Set: $set   Skipped: $skip   Failed: $fail" -ForegroundColor Cyan
Write-Host ""

if ($set -gt 0) {
    Write-Host "Next: deploy functions to pick up the new secrets:" -ForegroundColor White
    Write-Host "  firebase deploy --only functions" -ForegroundColor Yellow
    Write-Host ""
}
