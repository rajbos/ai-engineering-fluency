#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Background worker for the oh-my-posh PowerShell pre-prompt hook (posh-hook.ps1).

.DESCRIPTION
    Runs `ai-engineering-fluency segment --json` and writes the result atomically to the
    cache file that Set-PoshContext (posh-hook.ps1) reads. This is launched detached via
    Start-Process so it never blocks shell startup or prompt rendering.

    Even though `segment` has its own 5-minute output cache, a cache MISS still re-parses
    every session file, which can take anywhere from a few seconds to well over a minute
    on a machine with a large session history. Running it here, out-of-process, means the
    interactive shell never waits on it - it only ever reads the last known values from
    the cache file (see posh-hook.ps1).

    On failure, a placeholder ("?") entry is still written with a fresh timestamp, so a
    broken or missing CLI doesn't get retried on every single prompt/shell launch.
#>
param(
    [Parameter(Mandatory)][string]$CacheFile,
    [Parameter(Mandatory)][string]$LockFile
)

# Ensure multi-byte characters (e.g. the "·" separator) survive the round-trip through
# captured stdout, regardless of the console's default encoding.
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

try {
    $json = ai-engineering-fluency segment --json
    if ([string]::IsNullOrWhiteSpace($json)) { throw "empty output from 'ai-engineering-fluency segment --json'" }

    # Validate it round-trips as JSON before trusting/caching it
    $null = $json | ConvertFrom-Json
}
catch {
    $json = @{
        today               = 0
        month               = 0
        last30Days          = 0
        todayFormatted      = "?"
        monthFormatted      = "?"
        last30DaysFormatted = "?"
        formatted           = "?"
        updatedAt           = [DateTime]::UtcNow.ToString("o")
        cached              = $false
    } | ConvertTo-Json
}

# Write to a temp file then rename, so the hook never reads a half-written file
$cacheDir = Split-Path -Parent $CacheFile
New-Item -Path $cacheDir -ItemType Directory -Force | Out-Null
$tmp = "$CacheFile.tmp"
$json | Set-Content -Path $tmp -Encoding utf8
Move-Item -Path $tmp -Destination $CacheFile -Force

Remove-Item -Path $LockFile -Force -ErrorAction SilentlyContinue
