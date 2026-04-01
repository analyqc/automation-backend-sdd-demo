# Uso (PowerShell, desde la raíz del repo demo):
#   $env:GITHUB_TOKEN = "tu_pat_aqui"   # NO lo pegues en el código; solo en la sesión
#   .\scripts\push-github.ps1 -RepoName "nombre-del-repo-en-github"
#
# Si Windows bloquea scripts: Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
# O una sola vez: powershell -ExecutionPolicy Bypass -File .\scripts\push-github.ps1 -RepoName "..."
#
# Requisitos del token (classic PAT):
#   - scope: repo (acceso completo a repos privados)
# O crea el repo vacío en https://github.com/new y usa el mismo script para hacer push.

param(
  [Parameter(Mandatory = $true)]
  [string] $RepoName,
  [string] $GitHubUser = "analyqc"
)

$ErrorActionPreference = "Stop"

# Terminales de Cursor/VS Code a veces no heredan el PATH completo de Windows (Git "no reconocido").
$machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($machinePath) { $env:Path = "$machinePath;$env:Path" }
if ($userPath) { $env:Path = "$userPath;$env:Path" }
foreach ($dir in @(
    (Join-Path $env:ProgramFiles "Git\cmd"),
    (Join-Path $env:ProgramFiles "Git\bin")
  )) {
  if ($dir -and (Test-Path (Join-Path $dir "git.exe"))) {
    $env:Path = "$dir;$env:Path"
  }
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "No se encuentra 'git'. Instala Git desde https://git-scm.com/download/win, reinicia Cursor y vuelve a intentar."
}

$token = $env:GITHUB_TOKEN
if (-not $token) {
  Write-Error "Define GITHUB_TOKEN en esta sesión (Personal Access Token con scope 'repo')."
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if (-not (Test-Path (Join-Path $root ".git"))) {
  Write-Error "No se encontró .git en $root"
}

Push-Location $root
try {
  git remote remove origin 2>$null
  git remote add origin "https://github.com/${GitHubUser}/${RepoName}.git"
  $pushUrl = "https://${GitHubUser}:${token}@github.com/${GitHubUser}/${RepoName}.git"
  git push -u $pushUrl main
  git remote set-url origin "https://github.com/${GitHubUser}/${RepoName}.git"
  Write-Host "OK. Remoto sin credenciales: https://github.com/${GitHubUser}/${RepoName}"
} finally {
  Pop-Location
  Remove-Item Env:GITHUB_TOKEN -ErrorAction SilentlyContinue
}
