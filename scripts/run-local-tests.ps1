# Ejecuta Karate + Playwright desde la raíz del repo (sin copiar rutas a mano).
# Uso: desde la carpeta demo, en PowerShell:
#   .\scripts\run-local-tests.ps1
#
# No uses "..." en cd: eso era un placeholder; este script usa la ruta real del repo.

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($machinePath) { $env:Path = "$machinePath;$env:Path" }
if ($userPath) { $env:Path = "$userPath;$env:Path" }
foreach ($dir in @(
    (Join-Path $env:ProgramFiles "Git\cmd"),
    (Join-Path $env:ProgramFiles "Git\bin"),
    (Join-Path $env:ProgramFiles "nodejs")
  )) {
  if ($dir -and (Test-Path $dir)) { $env:Path = "$dir;$env:Path" }
}

$javaCmd = Get-Command java -ErrorAction SilentlyContinue
if ($javaCmd) { $env:JAVA_HOME = Split-Path (Split-Path $javaCmd.Source) }

Write-Host "=== Raíz del repo: $root ===" -ForegroundColor Cyan

Write-Host "`n=== Karate (Maven Wrapper) ===" -ForegroundColor Cyan
Push-Location (Join-Path $root "karate")
try {
  & .\mvnw.cmd -B -Dtest=KarateRunner test
  if ($LASTEXITCODE -ne 0) { throw "Karate falló con código $LASTEXITCODE" }
  $karateReport = Join-Path $root "karate\target\karate-reports\com.demo.pet.pet-regression.html"
  Write-Host "Reporte Karate (abre en el navegador): $karateReport" -ForegroundColor Yellow
  Write-Host "  O ejecuta: .\scripts\open-karate-report.ps1" -ForegroundColor Yellow
} finally { Pop-Location }

Write-Host "`n=== Playwright (solo dentro de /playwright; usa @playwright/test del proyecto) ===" -ForegroundColor Cyan
$pw = Join-Path $root "playwright"
Push-Location $pw
try {
  if (Test-Path (Join-Path $pw "package-lock.json")) {
    npm ci
  } else {
    npm install
  }
  if ($LASTEXITCODE -ne 0) { throw "npm falló" }
  npm exec -- playwright install chromium
  if ($LASTEXITCODE -ne 0) { throw "playwright install falló" }
  # Script del package.json = CLI del @playwright/test de este repo (no uses solo `npx playwright` fuera de /playwright).
  npm run test
  if ($LASTEXITCODE -ne 0) { throw "Playwright falló con código $LASTEXITCODE" }
  Write-Host "Reporte Playwright: npm run report (desde la carpeta playwright)" -ForegroundColor Yellow
} finally { Pop-Location }

Write-Host "`n=== Listo: Karate + Playwright OK ===" -ForegroundColor Green
