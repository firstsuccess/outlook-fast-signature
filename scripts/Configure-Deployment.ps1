param(
  [Parameter(Mandatory=$true)][string]$BaseUrl,
  [string]$SupportUrl = '',
  [string]$OutputDirectory = ''
)
$ErrorActionPreference = 'Stop'
function Test-PublicHttps([string]$Value) {
  $uri = $null
  if (-not [Uri]::TryCreate($Value, [UriKind]::Absolute, [ref]$uri) -or $uri.Scheme -ne 'https' -or $uri.UserInfo -or $uri.Query -or $uri.Fragment -or $uri.Host -match '(^localhost$|\.invalid$)' -or [Uri]::CheckHostName($uri.Host) -eq [UriHostNameType]::IPv4 -or [Uri]::CheckHostName($uri.Host) -eq [UriHostNameType]::IPv6) { throw "Public HTTPS URL required: $Value" }
  return $uri
}
$base = (Test-PublicHttps $BaseUrl).AbsoluteUri.TrimEnd('/')
if (-not $SupportUrl) { $SupportUrl = "$base/privacy.html" }
$support = (Test-PublicHttps $SupportUrl).AbsoluteUri
$projectRoot = Split-Path $PSScriptRoot -Parent
$source = Join-Path $projectRoot 'outlook-addin'
if (-not (Test-Path (Join-Path $source 'taskpane.html'))) { $source = Join-Path $projectRoot 'dist/outlook-addin' }
if (-not (Test-Path (Join-Path $source 'taskpane.html'))) { throw 'Built static files are missing. Use the deployment ZIP or build the source first.' }
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $projectRoot 'configured-deployment' }
$output = [IO.Path]::GetFullPath($OutputDirectory)
if (Test-Path $output) { throw "Output already exists; choose a new directory: $output" }
New-Item -ItemType Directory -Path $output | Out-Null
$site = Join-Path $output 'site'
New-Item -ItemType Directory -Path $site | Out-Null
Copy-Item -Path (Join-Path $source '*') -Destination $site -Recurse
$manifest = New-Object System.Xml.XmlDocument
$manifest.XmlResolver = $null
$manifest.Load((Join-Path $site 'manifest.xml'))
$oldBase = $manifest.SelectSingleNode('//*[local-name()="SourceLocation"]/@DefaultValue').Value -replace '/taskpane\.html$', ''
foreach ($attribute in $manifest.SelectNodes('//@DefaultValue | //@Value')) {
  if ($attribute.Value.StartsWith($oldBase + '/')) { $attribute.Value = $base + $attribute.Value.Substring($oldBase.Length) }
}
$manifest.SelectSingleNode('//*[local-name()="SupportUrl"]/@DefaultValue').Value = $support
foreach ($domain in $manifest.SelectNodes('//*[local-name()="AppDomain"]')) { $domain.InnerText = ([Uri]$base).GetLeftPart([UriPartial]::Authority) }
$manifest.Save((Join-Path $output 'manifest.xml'))
Remove-Item -LiteralPath (Join-Path $site 'manifest.xml')
$metadata = @{ product='monja-fast-signature'; baseUrl=$base; supportUrl=$support; configuredAt=[DateTime]::UtcNow.ToString('o'); realOutlookVerified=$false }
$metadata | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $output 'deployment.json') -Encoding UTF8
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Test-Deployment.ps1') -Destination $output
@"
Upload the CONTENTS of site/ to $base/
Then run: powershell -File .\Test-Deployment.ps1 -ManifestPath .\manifest.xml
Install manifest.xml through Outlook or Microsoft 365 Integrated Apps.
No Node.js, npm, Graph, or Entra app registration is required.
This is a production-environment pilot; real Outlook acceptance remains pending.
"@ | Set-Content -LiteralPath (Join-Path $output 'START-HERE.txt') -Encoding UTF8
Write-Output "Configured deployment: $output"
Write-Output "Upload site files to: $base/"
Write-Output "Outlook manifest: $(Join-Path $output 'manifest.xml')"
