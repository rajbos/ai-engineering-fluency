$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

function Format-TokenCount {
    param([Nullable[double]]$Value)
    if ($null -eq $Value) { return '?' }
    if ($Value -ge 1000000000) { return ('{0:0.0}b' -f ($Value / 1000000000)) }
    if ($Value -ge 1000000) { return ('{0:0.0}m' -f ($Value / 1000000)) }
    if ($Value -ge 1000) { return ('{0:0.0}k' -f ($Value / 1000)) }
    return ([int]$Value).ToString()
}

function Format-Duration {
    param([Nullable[double]]$Milliseconds)
    if ($null -eq $Milliseconds -or $Milliseconds -le 0) { return '00:00:00' }
    $duration = [TimeSpan]::FromMilliseconds($Milliseconds)
    return '{0:00}:{1:00}:{2:00}' -f [int]$duration.TotalHours, $duration.Minutes, $duration.Seconds
}

function New-Gauge {
    param([Nullable[double]]$Percent)
    if ($null -eq $Percent) { return '..........' }
    $bounded = [Math]::Max(0, [Math]::Min(100, [Math]::Round($Percent)))
    $filled = [int][Math]::Floor($bounded / 10)
    return ('#' * $filled) + ('.' * (10 - $filled))
}

$payload = [Console]::In.ReadToEnd()

try {
    $json = $payload | ConvertFrom-Json
} catch {
    Write-Host -NoNewline 'Claude status unavailable'
    exit 0
}

$context = $json.context_window
$cost    = $json.cost
$model   = $json.model

$currentTokens  = if ($null -ne $context.total_input_tokens)  { [double]$context.total_input_tokens }  else { $null }
$contextLimit   = if ($null -ne $context.context_window_size)  { [double]$context.context_window_size }  else { $null }
$contextPercent = if ($null -ne $context.used_percentage)      { [double]$context.used_percentage }      else { $null }

$linesAdded   = if ($null -ne $cost.total_lines_added)   { [int]$cost.total_lines_added }   else { 0 }
$linesRemoved = if ($null -ne $cost.total_lines_removed) { [int]$cost.total_lines_removed } else { 0 }

$costUsd   = if ($null -ne $cost.total_cost_usd) { '${0:F2}' -f [double]$cost.total_cost_usd } else { '' }
$modelName = if ($null -ne $model.display_name)  { [string]$model.display_name }              else { '' }

$env:CLAUDE_STATUS_MODEL    = $modelName
$env:CLAUDE_STATUS_CONTEXT  = "$(Format-TokenCount $currentTokens)/$(Format-TokenCount $contextLimit)"
$env:CLAUDE_STATUS_GAUGE    = New-Gauge $contextPercent
$env:CLAUDE_STATUS_DURATION = Format-Duration $cost.total_duration_ms
$env:CLAUDE_STATUS_CHANGES  = if ($linesAdded -or $linesRemoved) { "+$linesAdded/-$linesRemoved" } else { '' }
$env:CLAUDE_STATUS_COST     = $costUsd

try {
    $tokenOutput = & ai-engineering-fluency segment 2>$null
    $env:COPILOT_TOKEN_USAGE = if ($tokenOutput) { $tokenOutput.Trim() } else { '' }
} catch {
    $env:COPILOT_TOKEN_USAGE = ''
}

$theme = Join-Path $PSScriptRoot 'statusline-claude.omp.json'
$cwd   = if ($json.cwd) { [string]$json.cwd } else { (Get-Location).Path }

try {
    $output = & oh-my-posh print primary --config $theme --pwd $cwd --force --escape=false 2>$null
    if ([string]::IsNullOrWhiteSpace($output)) { throw 'Oh My Posh returned no output.' }
    Write-Host -NoNewline $output.TrimEnd()
} catch {
    $changes = if ($env:CLAUDE_STATUS_CHANGES) { " | $($env:CLAUDE_STATUS_CHANGES)" } else { '' }
    $tokens  = if ($env:COPILOT_TOKEN_USAGE)   { " | $($env:COPILOT_TOKEN_USAGE)" }   else { '' }
    $costStr = if ($env:CLAUDE_STATUS_COST)    { " | $($env:CLAUDE_STATUS_COST)" }    else { '' }
    Write-Host -NoNewline "[$($env:CLAUDE_STATUS_MODEL)] ctx $($env:CLAUDE_STATUS_CONTEXT) $($env:CLAUDE_STATUS_GAUGE) | $($env:CLAUDE_STATUS_DURATION)$changes$costStr$tokens"
}
