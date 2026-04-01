# Instalación paso a paso (modo compañero de trabajo)

Haz **una tarea a la vez**. Cuando termines cada una, marca ✓ y pasa a la siguiente. Si algo falla, copia el mensaje de error y lo revisamos.

---

## Estado rápido (tu máquina)

| Herramienta | Para qué | ¿La tienes? |
|-------------|-----------|-------------|
| **Git** | Subir código a GitHub, versionar | Instalar (Tarea 1) si `git --version` falla |
| **Java 17** (JDK) | Karate / Maven Wrapper | Suele estar si `java -version` muestra 17 |
| **Maven Wrapper** (`mvnw.cmd`) | Karate **sin** instalar Maven a mano | Ya viene en `karate/` en este repo |
| **Node.js** | Playwright | Instalar si `node --version` falla |

---

## Tarea 1 — Git

1. Abre **PowerShell** o **Terminal** nuevo (importante después de instalar).
2. Ejecuta:

```powershell
git --version
```

- Si ves algo como `git version 2.x`: **listo**, Tarea 1 ✓.
- Si dice que no reconoce el comando:
  - Instala con: `winget install -e --id Git.Git --accept-package-agreements --accept-source-agreements`
  - **Cierra y vuelve a abrir** la terminal y repite `git --version`.

---

## Tarea 2 — Java 17

```powershell
java -version
```

- Debe indicar **17** (u 11+ como mínimo; el proyecto está pensado para **17**).
- Si falla: instala [Eclipse Temurin 17](https://adoptium.net/) y vuelve a abrir la terminal.

**JAVA_HOME (solo si `mvnw` se queja):**

```powershell
where.exe java
```

La carpeta `JAVA_HOME` es la del JDK (un nivel por encima de `bin`). Ejemplo: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`.

En PowerShell (solo sesión actual):

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
```

(Ajusta la ruta a la tuya.)

---

## Tarea 3 — Karate (Maven Wrapper, sin Maven global)

1. Ve a la carpeta `karate` del proyecto:

```powershell
cd "C:\Users\AnalyQuesquen\OneDrive - In Motion S.A\Documentos\demo\karate"
```

2. Ejecuta:

```powershell
.\mvnw.cmd -Dtest=KarateRunner test
```

La **primera vez** descargará Maven y dependencias (puede tardar un poco).

- Si termina sin `BUILD FAILURE`: **Tarea 3 ✓**.

---

## Tarea 4 — Playwright (Node)

1. Comprueba Node:

```powershell
node --version
npm --version
```

Si falta: [nodejs.org](https://nodejs.org/) (LTS).

2. En la carpeta `playwright`:

```powershell
cd "C:\Users\AnalyQuesquen\OneDrive - In Motion S.A\Documentos\demo\playwright"
npm install
npx playwright install chromium
npx playwright test
```

- Si `1 passed` (o todos verdes): **Tarea 4 ✓**.

---

## Tarea 5 — GitHub (subir el repo)

Solo después de Tarea 1 ✓.

1. Crea un repo **vacío** en GitHub (sin README generado).
2. En la raíz del proyecto (`demo`, donde está `README.md`):

```powershell
cd "C:\Users\AnalyQuesquen\OneDrive - In Motion S.A\Documentos\demo"
git init -b main
git add .
git commit -m "Initial commit: demo automatización backend"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

(Sustituye usuario y repo. La primera vez GitHub pedirá token o Git Credential Manager.)

**Tarea 5 ✓** cuando veas el código en la web de GitHub.

### Token (PAT) y permisos

- Si quieres **crear el repo por API** o hacer **push por HTTPS**, el PAT **classic** debe incluir el scope **`repo`**.
- **No** pegues el token en el chat ni lo subas al repositorio. Úsalo solo en tu máquina.

### Script incluido en el proyecto

Si aparece *«la ejecución de scripts está deshabilitada»*, elige **una** opción:

**A — Recomendado (solo tu usuario, una vez):**

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Cierra y vuelve a abrir PowerShell, luego ejecuta el script.

**B — Solo esta vez (sin cambiar la política):**

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\push-github.ps1 -RepoName "automation-backend-sdd-demo"
```

Si en la terminal de **Cursor** sale *«git no se reconoce»*, cierra y abre Cursor tras instalar Git, o ejecuta el script igualmente: `push-github.ps1` ya intenta cargar el PATH de Windows y la ruta típica de Git.

Con el repo **ya creado** en GitHub (vacío, mismo nombre que el remoto):

```powershell
cd "C:\Users\AnalyQuesquen\OneDrive - In Motion S.A\Documentos\demo"
$env:GITHUB_TOKEN = "tu_pat_con_scope_repo"
.\scripts\push-github.ps1 -RepoName "automation-backend-sdd-demo"
```

El remoto `origin` del proyecto apunta por defecto a `https://github.com/analyqc/automation-backend-sdd-demo.git`; cambia `-RepoName` si usas otro nombre.

---

## Resumen de comandos útiles

| Objetivo | Comando |
|----------|---------|
| Karate | `cd karate` → `.\mvnw.cmd -Dtest=KarateRunner test` |
| Playwright | `cd playwright` → `npm install` → `npx playwright test` |

---

## Si trabajas desde Cursor / VS Code

- Abre la carpeta `demo` como workspace.
- Terminal integrada: misma secuencia que arriba.
- Si `git` no aparece hasta reiniciar el IDE, reinicia Cursor tras instalar Git.
