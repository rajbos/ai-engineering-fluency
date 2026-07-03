# Pure PowerShell — no oh-my-posh required.
# Claude Code pipes JSON to stdin; this script outputs ANSI-colored lines.

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

function fg { param([int]$r,[int]$g,[int]$b,[string]$t) "`e[38;2;${r};${g};${b}m${t}`e[0m" }
function bold { param([string]$t) "`e[1m${t}`e[22m" }

function Format-TokenCount {
    param([Nullable[double]]$Value)
    if ($null -eq $Value) { return '?' }
    if ($Value -ge 1000000000) { return ('{0:0.0}b' -f ($Value / 1000000000)) }
    if ($Value -ge 1000000)    { return ('{0:0.0}m' -f ($Value / 1000000)) }
    if ($Value -ge 1000)       { return ('{0:0.0}k' -f ($Value / 1000)) }
    return ([int]$Value).ToString()
}

function Format-Duration {
    param([Nullable[double]]$Milliseconds)
    if ($null -eq $Milliseconds -or $Milliseconds -le 0) { return '00:00:00' }
    $d = [TimeSpan]::FromMilliseconds($Milliseconds)
    return '{0:00}:{1:00}:{2:00}' -f [int]$d.TotalHours, $d.Minutes, $d.Seconds
}

function Format-Countdown {
    param([Nullable[double]]$UnixEpoch)
    if ($null -eq $UnixEpoch) { return '' }
    $remaining = [DateTimeOffset]::FromUnixTimeSeconds([long]$UnixEpoch) - [DateTimeOffset]::UtcNow
    if ($remaining.TotalSeconds -le 0) { return 'now' }
    if ($remaining.TotalHours -ge 1) { return ('{0:0}h{1:00}m' -f [int]$remaining.TotalHours, $remaining.Minutes) }
    return ('{0:0}m' -f [Math]::Ceiling($remaining.TotalMinutes))
}

function New-Bar {
    param([Nullable[double]]$Percent, [int]$Width = 10)
    if ($null -eq $Percent) { return '░' * $Width }
    $bounded = [Math]::Max(0, [Math]::Min(100, $Percent))
    $filled  = [int][Math]::Floor($bounded / 100 * $Width)
    $bar     = ('█' * $filled) + ('░' * ($Width - $filled))
    if ($bounded -lt 60) { return fg 108 163  94 $bar }
    if ($bounded -lt 80) { return fg 255 165   0 $bar }
    return fg 217 87 87 $bar
}

$payload = [Console]::In.ReadToEnd()
try   { $json = $payload | ConvertFrom-Json }
catch { Write-Host -NoNewline 'Claude status unavailable'; exit 0 }

$ctx  = $json.context_window
$cost = $json.cost
$rl   = $json.rate_limits

$pct      = if ($null -ne $ctx.used_percentage)      { [double]$ctx.used_percentage }      else { $null }
$tokens   = if ($null -ne $ctx.total_input_tokens)   { [double]$ctx.total_input_tokens }   else { $null }
$limit    = if ($null -ne $ctx.context_window_size)   { [double]$ctx.context_window_size }   else { $null }
$model    = if ($null -ne $json.model.display_name)  { [string]$json.model.display_name }  else { '?' }
$duration = $cost.total_duration_ms
$added    = if ($null -ne $cost.total_lines_added)   { [int]$cost.total_lines_added }   else { 0 }
$removed  = if ($null -ne $cost.total_lines_removed) { [int]$cost.total_lines_removed } else { 0 }
$costUsd  = if ($null -ne $cost.total_cost_usd)      { '${0:F2}' -f [double]$cost.total_cost_usd } else { '' }

$fivePct  = if ($null -ne $rl.five_hour.used_percentage) { [double]$rl.five_hour.used_percentage } else { $null }
$fiveReset = $rl.five_hour.resets_at
$sevenPct  = if ($null -ne $rl.seven_day.used_percentage) { [double]$rl.seven_day.used_percentage } else { $null }
$sevenReset = $rl.seven_day.resets_at

# ── Line 1: model · context ──────────────────────────────────────────────────
$dim        = { param($t) fg 140 140 140 $t }

$modelStr   = bold (fg 217 119 87 $model)
$ctxStr     = "$(& $dim 'ctx:') $(Format-TokenCount $tokens)/$(Format-TokenCount $limit)"
$pctStr     = if ($null -ne $pct) { " $(fg 180 180 180 ('{0:0}%' -f $pct))" } else { '' }
$bar        = New-Bar $pct
$durationStr = "$(& $dim 'time:') $(fg 100 160 220 (Format-Duration $duration))"
$changes    = if ($added -or $removed) { "  $(& $dim 'lines:') $(fg 160 200 120 "+$added")$(fg 220 100 100 "/-$removed")" } else { '' }
$costStr    = if ($costUsd) { "  $(& $dim 'cost:') $(fg 200 180 100 $costUsd)" } else { '' }

Write-Host "$modelStr  $bar $ctxStr$pctStr  $durationStr$changes$costStr"

# ── Line 2: rate limits (only when data present) ─────────────────────────────
$parts = @()
if ($null -ne $fivePct) {
    $reset5 = Format-Countdown $fiveReset
    $label  = if ($reset5) { "$(& $dim "resets $reset5")" } else { '' }
    $parts += "$(& $dim '5h-limit:') $(New-Bar $fivePct 8) $(fg 180 180 180 ('{0:0}%' -f $fivePct)) $label"
}
if ($null -ne $sevenPct) {
    $reset7 = Format-Countdown $sevenReset
    $label  = if ($reset7) { "$(& $dim "resets $reset7")" } else { '' }
    $parts += "$(& $dim '7d-limit:') $(New-Bar $sevenPct 8) $(fg 180 180 180 ('{0:0}%' -f $sevenPct)) $label"
}

# ── Token totals from ai-engineering-fluency ──────────────────────────────────
try {
    $tok = & ai-engineering-fluency segment 2>$null
    if ($tok) { $parts += "$(& $dim 'tokens:') $(fg 100 150 210 $tok.Trim())" }
} catch {}

if ($parts.Count) { Write-Host ($parts -join "  $(fg 80 80 80 '|')  ") }
