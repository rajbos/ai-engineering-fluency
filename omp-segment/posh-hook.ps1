# oh-my-posh Pre-Prompt Hook (PowerShell)
#
# Alternative to the `cmd` approach: this hook reads cached token usage and stores it in
# environment variables that your oh-my-posh segment reads.
#
# Use this if you prefer not to use the `{{ cmd "..." }}` template function,
# or if you want more control over formatting.
#
# HOW IT WORKS (important - read this before wiring it up)
# ----------------------------------------------------------
# Set-PoshContext NEVER calls the CLI synchronously. It only ever reads the last known
# values from a small on-disk cache file, so it is always fast and never blocks your
# shell startup or prompt rendering.
#
# When that cache is missing or older than 5 minutes, it kicks off a *fully detached*
# background process (Update-PoshContextCache.ps1) that calls
# `ai-engineering-fluency segment --json` and writes the result back to the cache for
# next time.
#
# This matters because `segment` has its own 5-minute output cache, but a cache MISS
# still re-parses every session file - which can take anywhere from a few seconds to
# well over a minute on a machine with a large session history. An earlier version of
# this hook called `ai-engineering-fluency usage --json` directly and synchronously,
# which has NO output cache at all and re-parses everything on every call - this made
# every new terminal or profile reload hang for 45-80+ seconds on machines with a lot of
# session history. Don't call the CLI synchronously from a pre-prompt hook - always
# read-from-cache-then-refresh-in-the-background, as this script does.
#
# HOW TO USE
# ----------
# 1. Copy Update-PoshContextCache.ps1 to the same folder as your PowerShell profile
#    ($PROFILE), e.g. next to $PROFILE.CurrentUserCurrentHost.
#
# 2. Add the Set-PoshContext function below to your profile ($PROFILE).
#    Open it with: notepad $PROFILE
#
# 3. Add the environment-variable segment to your oh-my-posh theme (see README.md).
#
# 4. Reload your profile: . $PROFILE

function Set-PoshContext {
    $cacheDir      = Join-Path $PSScriptRoot '.copilot-token-tracker'
    $cacheFile     = Join-Path $cacheDir 'posh-hook-cache.json'
    $lockFile      = Join-Path $cacheDir 'posh-hook-cache.lock'
    $refreshScript = Join-Path $PSScriptRoot 'Update-PoshContextCache.ps1'

    # 1. Show the last known values instantly - this never blocks shell startup.
    $lastRun = [DateTime]::MinValue
    if (Test-Path $cacheFile) {
        try {
            $cache = Get-Content $cacheFile -Raw | ConvertFrom-Json
            $env:COPILOT_TOKENS_TODAY = $cache.todayFormatted
            $env:COPILOT_TOKENS_MONTH = $cache.monthFormatted
            $env:COPILOT_TOKENS_30D   = $cache.last30DaysFormatted
        }
        catch {
            $env:COPILOT_TOKENS_TODAY = "?"
            $env:COPILOT_TOKENS_MONTH = "?"
            $env:COPILOT_TOKENS_30D   = "?"
        }
        try {
            # Get-Date (not [DateTime]::Parse) because ConvertFrom-Json may already
            # hand back a [DateTime] object for ISO-8601 strings, not a plain string.
            $lastRun = Get-Date $cache.updatedAt
        }
        catch {
            $lastRun = [DateTime]::MinValue
        }
    }
    else {
        $env:COPILOT_TOKENS_TODAY = "?"
        $env:COPILOT_TOKENS_MONTH = "?"
        $env:COPILOT_TOKENS_30D   = "?"
    }

    # 2. Refresh in a fully detached background process when the cache is stale.
    #    See the header comment above for why this must never run synchronously.
    if (([DateTime]::UtcNow - $lastRun).TotalMinutes -ge 5 -and -not (Test-Path $lockFile)) {
        if (Test-Path $refreshScript) {
            try {
                New-Item -Path $cacheDir -ItemType Directory -Force | Out-Null
                New-Item -Path $lockFile -ItemType File -Force | Out-Null
                Start-Process -FilePath (Get-Process -Id $PID).Path `
                    -ArgumentList @('-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-File', $refreshScript, $cacheFile, $lockFile) `
                    -WindowStyle Hidden -ErrorAction SilentlyContinue
            }
            catch {
                Remove-Item -Path $lockFile -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# Pre-populate token env vars so the first prompt render shows values
# (instant - reads the cache, refreshes asynchronously in the background)
Set-PoshContext
