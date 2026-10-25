param([Parameter(Mandatory=$true)][string]$ManifestPath)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$manifest = New-Object System.Xml.XmlDocument
$manifest.XmlResolver = $null
$manifest.Load([IO.Path]::GetFullPath($ManifestPath))
$urls = @($manifest.SelectNodes('//@DefaultValue | //@Value') | ForEach-Object { $_.Value } | Where-Object { $_ -match '^https://' } | Sort-Object -Unique)
$source = $manifest.SelectSingleNode('//*[local-name()="SourceLocation"]/@DefaultValue').Value
$base = $source -replace '/taskpane\.html$', ''
$urls += "$base/app.js", "$base/style.css", "$base/health.html"
$results = @()
foreach ($url in ($urls | Sort-Object -Unique)) {
  try {
    $uri = [Uri]$url
    if ($uri.Scheme -ne 'https' -or $uri.Host -match '(localhost|\.invalid$)') { throw 'Public HTTPS required' }
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -UserAgent 'Monja-Fast-Signature-DeploymentCheck/0.2' -TimeoutSec 20 -MaximumRedirection 3
    if ($response.StatusCode -ne 200) { throw "HTTP $($response.StatusCode)" }
    $type = [string]$response.Headers['Content-Type']
    if ($uri.AbsolutePath -match '\.js$' -and $type -notmatch '(javascript|ecmascript)') { throw "Incorrect JavaScript MIME: $type" }
    if ($uri.AbsolutePath -match '\.html$' -and $type -notmatch 'text/html') { throw "Incorrect HTML MIME: $type" }
    if ($uri.AbsolutePath -match '\.png$' -and $type -notmatch 'image/png') { throw "Incorrect PNG MIME: $type" }
    if ($url -eq $source -and ([string]$response.Headers['X-Frame-Options']) -match '(DENY|SAMEORIGIN)') { throw 'X-Frame-Options blocks Outlook embedding' }
    $results += [pscustomobject]@{ url=$url; passed=$true; detail=$type }
  } catch { $results += [pscustomobject]@{ url=$url; passed=$false; detail=$_.Exception.Message } }
}
$report = Join-Path (Split-Path ([IO.Path]::GetFullPath($ManifestPath)) -Parent) 'deployment-check.json'
$results | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $report -Encoding UTF8
$results | Format-Table -AutoSize
Write-Output "Report: $report"
if (@($results | Where-Object { -not $_.passed }).Count -gt 0) { exit 1 }
Write-Output 'HTTPS resources passed. Outlook compose/save/send acceptance still must be tested.'
