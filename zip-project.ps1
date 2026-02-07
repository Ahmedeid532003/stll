# Zip full project for manual upload (excludes node_modules, .next, .git)
$projectRoot = $PSScriptRoot
$zipName = "sutra-project-full.zip"
$zipPath = Join-Path $projectRoot $zipName

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$exclude = @("node_modules", ".next", ".git", "out", "sutra-project-full.zip", "zip-project.ps1", "_zip_temp")
$allFiles = Get-ChildItem -Path $projectRoot -Recurse -File -ErrorAction SilentlyContinue
$files = $allFiles | Where-Object {
    $rel = $_.FullName.Substring($projectRoot.Length + 1)
    $skip = $false
    foreach ($e in $exclude) {
        if ($rel -like "*\$e\*" -or $rel -like "$e\*") { $skip = $true; break }
    }
    -not $skip
}

$tempDir = Join-Path $projectRoot "_zip_temp"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$baseName = "sutra"
$destFolder = Join-Path $tempDir $baseName
New-Item -ItemType Directory -Path $destFolder -Force | Out-Null

foreach ($f in $files) {
    $relative = $f.FullName.Substring($projectRoot.Length + 1)
    $destFile = Join-Path $destFolder $relative
    $destSubDir = Split-Path $destFile -Parent
    if (-not (Test-Path $destSubDir)) { New-Item -ItemType Directory -Path $destSubDir -Force | Out-Null }
    Copy-Item $f.FullName -Destination $destFile -Force
}

Compress-Archive -Path (Join-Path $tempDir $baseName) -DestinationPath $zipPath -Force
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "Done. File: $zipPath ($sizeMB MB)"
