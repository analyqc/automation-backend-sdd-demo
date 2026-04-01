# Uso (PowerShell, desde la raíz del repo demo):
#   $env:GITHUB_TOKEN = "tu_pat_aqui"
#   .\scripts\push-github.ps1 -RepoName "nombre-del-repo-en-github"
#
# Si sigue 403, fuerza borrar credenciales guardadas de github.com y reintenta:
#   .\scripts\push-github.ps1 -RepoName "..." -ClearGithubCredentials
#
# PAT classic: marca el scope "repo" (o para repo público al menos "public_repo").
# PAT fine-grained: repositorio seleccionado + Contents Read and write.

param(
  [Parameter(Mandatory = $true)]
  [string] $RepoName,
  [string] $GitHubUser = "analyqc",
  [switch] $ClearGithubCredentials
)

$ErrorActionPreference = "Stop"

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

# Comprueba token (PAT classic devuelve cabecera X-OAuth-Scopes; fine-grained a veces no).
try {
  $wr = Invoke-WebRequest -UseBasicParsing -Uri "https://api.github.com/user" -Headers @{
    Authorization  = "Bearer $token"
    Accept         = "application/vnd.github+json"
    "User-Agent"   = "push-github-script"
  }
  $scopes = $wr.Headers["X-OAuth-Scopes"]
  if ($scopes) {
    Write-Host "GitHub API: token OK. Scopes del PAT (classic): $scopes"
    if ($scopes -notmatch "\brepo\b" -and $scopes -notmatch "\bpublic_repo\b") {
      Write-Warning "No aparece 'repo' ni 'public_repo'. Para hacer push necesitas un PAT classic con 'repo' (recomendado) o 'public_repo' si el repo es solo público."
    }
  } else {
    Write-Host "GitHub API: token OK (posible PAT fine-grained; asegúrate de Contents Read/Write en este repo)."
  }
} catch {
  Write-Warning "No se pudo validar el token en api.github.com/user. ¿Token copiado completo? Error: $($_.Exception.Message)"
}

if ($ClearGithubCredentials) {
  Write-Host "Quitando credenciales guardadas para github.com..."
  $cred = "protocol=https`nhost=github.com`n"
  $cred | & git credential reject 2>$null
  $cred | & git credential-manager erase 2>$null
  $cred | & git credential-manager-core erase 2>$null
}

Push-Location $root
try {
  git remote remove origin 2>$null
  git remote add origin "https://github.com/${GitHubUser}/${RepoName}.git"
  # Sin EscapeDataString: algunos PAT fallan si se codifican mal. Concatenar evita que PowerShell interprete $ dentro del token.
  $pushUrl = "https://x-access-token:" + $token + "@github.com/${GitHubUser}/${RepoName}.git"
  $gitArgs = @("-c", "credential.helper=", "push", "-u", $pushUrl, "main")
  & git @gitArgs
  if ($LASTEXITCODE -ne 0) {
    Write-Error @"
Push falló (código $LASTEXITCODE).

1) PAT classic nuevo: https://github.com/settings/tokens → Generate (classic) → marca "repo".
2) Repo público: como mínimo marca "public_repo" si no quieres marcar todo "repo".
3) Ejecuta de nuevo con: .\scripts\push-github.ps1 -RepoName "$RepoName" -ClearGithubCredentials
4) Panel de control → Administrador de credenciales → borra entradas git:https://github.com
"@
  }
  git remote set-url origin "https://github.com/${GitHubUser}/${RepoName}.git"
  Write-Host "OK. Remoto sin credenciales: https://github.com/${GitHubUser}/${RepoName}"
} finally {
  Pop-Location
  Remove-Item Env:GITHUB_TOKEN -ErrorAction SilentlyContinue
}
