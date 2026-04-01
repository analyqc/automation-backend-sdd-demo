# Demo — Framework híbrido de automatización Backend (SDD + Karate + Playwright)

Contrato de referencia: `openapi/petstore-demo.yaml`. API pública de ejecución: [Swagger Petstore v2](https://petstore.swagger.io).

## Estructura de carpetas

```
demo/
├── azure-pipelines.yml          # CI/CD + PublishTestResults consolidado
├── openapi/
│   └── petstore-demo.yaml       # Fuente de verdad (subconjunto SDD)
├── karate/                      # Regresión rápida, match de esquemas
│   ├── pom.xml
│   └── src/test/
│       ├── java/com/demo/KarateRunner.java
│       └── resources/
│           ├── karate-config.js
│           ├── schemas/
│           ├── testdata/
│           └── com/demo/
│               ├── hooks/       # Before/After reutilizables
│               └── pet/*.feature
├── playwright/                  # Flujos AOM + hooks TypeScript
│   ├── playwright.config.ts
│   ├── src/api/                 # API Object Model
│   ├── src/hooks/
│   ├── src/types/
│   ├── testdata/
│   └── tests/
└── docs/
    ├── ARCHITECTURE.md
    ├── CHATOPS_TEAMS.md
    ├── OPENAPI_GUIDELINES.md
    └── prompts/MASTER_PROMPT.md
```

## Instalación guiada

Pasos en orden (estilo “compañero de trabajo”): `docs/INSTALACION_PASO_A_PASO.md`.

## Ejecución local

**Importante:** En los ejemplos, `...` era solo un atajo de explicación. En PowerShell debes usar la **ruta completa** o entrar primero a la carpeta `demo`. No existe una carpeta llamada literalmente `...`.

### Todo en uno (recomendado, Windows)

Desde la carpeta del repo (`demo`, donde está `README.md`):

```powershell
.\scripts\run-local-tests.ps1
```

Ese script ejecuta Karate y luego Playwright con las rutas correctas y evita mezclar el paquete global `playwright` con `@playwright/test` del proyecto.

### Paso a paso manual

**Karate** (JDK 17+; Maven Wrapper en `karate/`):

```powershell
cd "C:\Users\AnalyQuesquen\OneDrive - In Motion S.A\Documentos\demo\karate"
.\mvnw.cmd -Dtest=KarateRunner test
```

En Linux/macOS: `chmod +x mvnw && ./mvnw -Dtest=KarateRunner test`.

**Playwright** (siempre dentro de `playwright/`, donde está `package.json`):

```powershell
cd "C:\Users\AnalyQuesquen\OneDrive - In Motion S.A\Documentos\demo\playwright"
npm ci
npm exec -- playwright install chromium
npm run test
```

No ejecutes `npm install` solo en la raíz `demo` (ahí no hay `package.json`). No uses `npx playwright` **desde la raíz** sin haber entrado en `playwright`: puede instalarse otra versión y fallar con `test.describe()`.

## Reportes (después de ejecutar tests)

**Karate (HTML):** tras `mvnw` en `karate/`, abre en el explorador:

`karate\target\karate-reports\com.demo.pet.pet-regression.html`

O desde la raíz `demo`:

```powershell
.\scripts\open-karate-report.ps1
```

**Playwright (HTML):** en carpeta `playwright`:

```powershell
npm run report
```

JUnit para CI: `karate/target/surefire-reports/`, `playwright/results/e2e-junit.xml`.

Variables opcionales: `API_BASE_URL`, `DEBUG_API=1` (logs en hooks).

## Documentación

- Arquitectura y diagramas: `docs/ARCHITECTURE.md`
- Prompt maestro para LLM: `docs/prompts/MASTER_PROMPT.md`
- ChatOps / Teams: `docs/CHATOPS_TEAMS.md`
- Lineamientos OpenAPI para arquitectura: `docs/OPENAPI_GUIDELINES.md`

## Azure DevOps

El archivo `azure-pipelines.yml` ejecuta ambos stacks y publica resultados JUnit unificados en **Test** → **Runs** (tarea `PublishTestResults@2` con `mergeTestResults: true`).

## Publicar en GitHub

### 1. Prerrequisitos

- [Git para Windows](https://git-scm.com/download/win) instalado (marca la opción *“Git from the command line”* para tener `git` en el PATH).
- Cuenta en [github.com](https://github.com).

### 2. Crear el repositorio vacío en GitHub

1. Entra a GitHub → **New repository**.
2. Nombre (ej. `backend-test-framework-demo`), **público** o privado según tu equipo.
3. **No** marques “Add a README” (ya tienes uno local).
4. Crea el repo y copia la URL que te muestra, por ejemplo `https://github.com/TU_USUARIO/backend-test-framework-demo.git`.

### 3. Subir tu carpeta `demo` (PowerShell)

Abre PowerShell en la carpeta del proyecto (la que contiene `README.md` y `azure-pipelines.yml`):

```powershell
cd "C:\Users\AnalyQuesquen\OneDrive - In Motion S.A\Documentos\demo"

git init -b main
git add .
git status
git commit -m "Initial commit: framework híbrido Karate + Playwright (demo SDD)"

git remote add origin https://github.com/TU_USUARIO/NOMBRE_DEL_REPO.git
git push -u origin main
```

Sustituye `TU_USUARIO` y `NOMBRE_DEL_REPO` por los tuyos.

La primera vez, GitHub pedirá autenticación: puedes usar **Git Credential Manager** (incluido con Git reciente), un **Personal Access Token (classic)** en lugar de la contraseña, o **GitHub CLI** (`gh auth login`).

### 4. Si el remoto ya tiene commits (p. ej. README creado en la web)

```powershell
git pull origin main --allow-unrelated-histories
# resuelve conflictos si los hay, luego:
git push -u origin main
```

### 5. OneDrive

El proyecto está bajo OneDrive: suele funcionar con Git, pero si ves bloqueos o lentitud, considera clonar/copiar el repo a una ruta local fuera de sincronización (por ejemplo `C:\src\demo`) y trabajar ahí.

### 6. Opcional: SSH en lugar de HTTPS

```powershell
git remote set-url origin git@github.com:TU_USUARIO/NOMBRE_DEL_REPO.git
git push -u origin main
```

(Requiere [clave SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) configurada en GitHub.)
