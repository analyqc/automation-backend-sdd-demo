# Abre el último reporte HTML de Karate en el navegador predeterminado.
# Ejecutar después de: cd karate; .\mvnw.cmd -Dtest=KarateRunner test
# O desde la raíz demo: .\scripts\open-karate-report.ps1

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$html = Join-Path $root "karate\target\karate-reports\com.demo.pet.pet-regression.html"
if (-not (Test-Path $html)) {
  Write-Error "No existe el reporte. Primero ejecuta los tests en karate/: $html"
}
Write-Host "Abriendo: $html"
Start-Process $html
