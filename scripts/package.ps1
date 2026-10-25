$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $taskRoot
try {
  $version = (Get-Content package.json -Raw | ConvertFrom-Json).version
  npm run build
  if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
  New-Item -ItemType Directory -Force -Path dist/packages | Out-Null
  Compress-Archive -Path dist/browser-extension/* -DestinationPath "dist/packages/monja-fast-signature-browser-$version.zip" -Force
  Compress-Archive -Path dist/outlook-addin/* -DestinationPath "dist/packages/monja-fast-signature-outlook-$version.zip" -Force
  Compress-Archive -Path dist/deployment-kit/* -DestinationPath "dist/packages/monja-fast-signature-deployment-$version.zip" -Force
  Compress-Archive -Path docs/*,README.md,LICENSE -DestinationPath "dist/packages/monja-fast-signature-guides-$version.zip" -Force
  Compress-Archive -Path shared,browser-extension,outlook-addin,classic-importer,web,scripts,tests,docs,README.md,LICENSE,package.json,package-lock.json,tsconfig.json,vitest.config.ts,playwright.config.ts,release.config.json,.gitignore -DestinationPath "dist/packages/monja-fast-signature-source-$version.zip" -Force
  node scripts/hash-packages.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Package hashing failed' }
  Set-Content -LiteralPath dist/packages/LATEST.txt -Value $version -Encoding UTF8
} finally { Pop-Location }
