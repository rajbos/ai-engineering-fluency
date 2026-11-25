<#
.SYNOPSIS
  Publish a Visual Studio IDE extension (.vsix) to the Visual Studio Marketplace
  using Marketplace Trusted Publishing (GitHub OIDC) instead of a PAT.

.DESCRIPTION
  1. Requests a GitHub Actions OIDC token for the audience marketplace.visualstudio.com.
  2. Exchanges it at the Marketplace token endpoint for a short-lived (~15 min)
     publish credential, scoped to the publisher named in the publish manifest.
  3. Runs VsixPublisher.exe with that credential: the copy in the restored
     Microsoft.VSSDK.BuildTools NuGet package when present, else the runner's
     Visual Studio install (see Find-VsixPublisher).

  Doing the exchange here (rather than VsixPublisher's -oidc switch) works with
  any VsixPublisher.exe that accepts -personalAccessToken. Same flow as
  madskristensen/publish-marketplace.

  Requires: the job has `permissions: id-token: write`, and the publisher has a
  Trusted Publishing policy for this repository + the calling workflow file.
#>
param(
  [Parameter(Mandatory)] [string] $Vsix,
  [Parameter(Mandatory)] [string] $PublishManifest
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $Vsix -PathType Leaf)) {
  Write-Host "::error::VSIX not found: $Vsix"
  exit 1
}
if (-not (Test-Path -LiteralPath $PublishManifest -PathType Leaf)) {
  Write-Host "::error::Publish manifest not found: $PublishManifest"
  exit 1
}
if (-not $env:ACTIONS_ID_TOKEN_REQUEST_URL -or -not $env:ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
  Write-Host "::error::No GitHub OIDC token available. The publishing job needs 'permissions: id-token: write'."
  exit 1
}

$publisher = (Get-Content -LiteralPath $PublishManifest -Raw | ConvertFrom-Json).publisher
if ([string]::IsNullOrWhiteSpace($publisher)) {
  Write-Host "::error::No 'publisher' in $PublishManifest; Trusted Publishing needs it."
  exit 1
}

# 1. GitHub OIDC token for the Marketplace audience.
try {
  $oidcUri = [System.UriBuilder]::new($env:ACTIONS_ID_TOKEN_REQUEST_URL)
  $query = @($oidcUri.Query.TrimStart('?') -split '&' | Where-Object { $_ -and $_ -notmatch '^audience=' })
  $oidcUri.Query = ($query + 'audience=marketplace.visualstudio.com') -join '&'
  $oidc = Invoke-RestMethod -Method Get -Uri $oidcUri.Uri.AbsoluteUri -Headers @{
    Authorization = "Bearer $env:ACTIONS_ID_TOKEN_REQUEST_TOKEN"
    Accept        = 'application/json'
  }
} catch {
  Write-Host "::error::Failed to request a GitHub OIDC token: $($_.Exception.Message)"
  exit 1
}
if ([string]::IsNullOrWhiteSpace($oidc.value)) {
  Write-Host "::error::GitHub OIDC token request returned no token."
  exit 1
}
Write-Host "::add-mask::$($oidc.value)"

# 2. Exchange it for a short-lived Marketplace publish credential.
try {
  $exchange = Invoke-RestMethod -Method Post `
    -Uri 'https://marketplace.visualstudio.com/_apis/gallery/token?api-version=7.2-preview.1' `
    -Headers @{
      Authorization           = "FederatedToken $($oidc.value)"
      Accept                  = 'application/json'
      'X-Market-CI-Provider'  = 'github-actions'
    } `
    -ContentType 'application/json' `
    -Body (@{ publisherName = $publisher } | ConvertTo-Json -Compress)
} catch {
  Write-Host "::error::Marketplace OIDC token exchange failed for publisher '$publisher'. Check its Trusted Publishing policy matches this repository and workflow file. $($_.Exception.Message)"
  exit 1
}
if ([string]::IsNullOrWhiteSpace($exchange.credential)) {
  Write-Host "::error::Marketplace OIDC token exchange returned no credential."
  exit 1
}
Write-Host "::add-mask::$($exchange.credential)"
Write-Host "✅ Obtained Marketplace credential for publisher '$publisher' via Trusted Publishing"

# 3. Publish with VsixPublisher.exe (VS Code's vsce is not for VS IDE extensions).
#
# Prefer the copy in the Microsoft.VSSDK.BuildTools NuGet package that the build job
# already restored (version pinned by packages.lock.json). It takes the token through the
# Azure DevOps client libraries and ships no Microsoft.Identity.Client (MSAL) at all.
# The copy installed with Visual Studio changes with every runner image: the VS 18 one on
# windows-2025-vs2026 (image 2026-11-16) fails before publishing with VsixPub0031,
# "Could not load ... Microsoft.Identity.Client, Version=4.85.2.0". It stays as a fallback
# for a job that did not restore the package.
function Find-VsixPublisher {
  $packagesRoot = if ($env:NUGET_PACKAGES) { $env:NUGET_PACKAGES } else { Join-Path $env:USERPROFILE '.nuget\packages' }
  $fromPackage = Get-ChildItem -LiteralPath (Join-Path $packagesRoot 'microsoft.vssdk.buildtools') -Directory -ErrorAction SilentlyContinue |
    Sort-Object { $v = $null; if ([version]::TryParse($_.Name, [ref]$v)) { $v } else { [version]'0.0' } } -Descending |
    ForEach-Object { Join-Path $_.FullName 'tools\vssdk\bin\VsixPublisher.exe' } |
    Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } |
    Select-Object -First 1
  if ($fromPackage) { return $fromPackage }

  Write-Host "::warning::Microsoft.VSSDK.BuildTools is not restored under $packagesRoot; falling back to the runner's Visual Studio VsixPublisher.exe."
  return Get-ChildItem "C:\Program Files\Microsoft Visual Studio" `
    -Recurse -Filter "VsixPublisher.exe" -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName
}

$vsixPublisher = Find-VsixPublisher
if (-not $vsixPublisher) {
  Write-Host "::error::VsixPublisher.exe not found: restore Microsoft.VSSDK.BuildTools (nuget restore) before publishing."
  exit 1
}
Write-Host "Found: $vsixPublisher"
Write-Host "Publishing $Vsix to Visual Studio Marketplace..."
& $vsixPublisher publish -payload $Vsix -publishManifest $PublishManifest -personalAccessToken $exchange.credential
if ($LASTEXITCODE -ne 0) {
  Write-Host "::error::VsixPublisher.exe exited with code $LASTEXITCODE"
  exit $LASTEXITCODE
}
Write-Host "✅ Published to Visual Studio Marketplace"
