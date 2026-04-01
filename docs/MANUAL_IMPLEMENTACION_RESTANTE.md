# Manual — Implementar lo restante del framework (CI, Teams, LLM)

Este documento describe **paso a paso** cómo llevar a producción las piezas que no son solo código en el repo: **integración continua**, **ChatOps con Teams** (opcional) y **flujo con LLM** para generar casos.

**Alcance:** no incluye validación SQL ni bases de datos.

---

## Índice

1. [Opción A — Azure DevOps (pipeline ya incluido)](#1-opción-a--azure-devops-pipeline-ya-incluido)
2. [Opción B — GitHub Actions](#2-opción-b--github-actions)
3. [Generación de casos con LLM (prompt maestro)](#3-generación-de-casos-con-llm-prompt-maestro)
4. [Microsoft Teams + disparo de pipeline (ChatOps)](#4-microsoft-teams--disparo-de-pipeline-chatops)
5. [Variables útiles del pipeline](#5-variables-útiles-del-pipeline)
6. [Comprobación final](#6-comprobación-final)

---

## 1. Opción A — Azure DevOps (pipeline ya incluido)

**Qué consigues:** cada push a `main`/`develop` ejecuta Karate + Playwright y publica resultados en **Test Plans → Runs** (JUnit unificado) y artefactos de reportes HTML.

### 1.1 Prerrequisitos

- Cuenta en [Azure DevOps](https://dev.azure.com) (gratis para equipos pequeños).
- El código en un repositorio accesible por Azure DevOps:
  - **Azure Repos** (importar o clonar), o
  - **GitHub** conectado como servicio (OAuth / GitHub App).

### 1.2 Crear proyecto y pipeline

1. Entra a **https://dev.azure.com** → **New organization** (si no tienes) → **New project**.
2. Si el código está solo en GitHub:
   - **Project settings** → **Service connections** → **New service connection** → **GitHub** → autoriza la org/usuario donde está el repo.
3. **Pipelines** → **New pipeline**:
   - Elige **GitHub** o **Azure Repos Git**.
   - Selecciona el repositorio `automation-backend-sdd-demo` (o el tuyo).
   - **Existing Azure Pipelines YAML file** → rama `main` → path **`/azure-pipelines.yml`** (raíz del repo).

### 1.3 Primera ejecución

1. **Run pipeline** → rama `main` → **Run**.
2. Espera a que termine el job **HybridAPI**.
3. Revisa:
   - **Pipelines** → el run → pestaña **Tests** (resultados JUnit).
   - **Published artifacts**: `playwright-html-report`, `karate-reports` (descarga y abre el HTML localmente si lo necesitas).

### 1.4 Si fallan tests en CI pero pasan en local

- Revisa logs del paso **Karate** y **Playwright** (red, timeouts, Petstore caído).
- El YAML usa `continueOnError: true` en los scripts de test pero `PublishTestResults` con `failTaskOnFailedTests: true`: el pipeline puede marcar fallo si hay tests en rojo.
- Variables: en **Run pipeline** → **Variables** puedes definir `API_BASE_URL` o `PLAYWRIGHT_GREP` si las añades como variables de pipeline (hoy el YAML usa `API_BASE_URL` en el script de Playwright vía `export`; para `PLAYWRIGHT_GREP` ya está cableado en `azure-pipelines.yml`).

### 1.5 Permisos y PAT (solo si automatizas desde fuera)

- Para **Teams / Power Automate** llamando a la API de builds, necesitarás un **PAT** de Azure DevOps con scope **Build (Read & execute)** o un flujo con **Managed Identity** (avanzado). No pegues el PAT en el repositorio.

---

## 2. Opción B — GitHub Actions

**Qué consigues:** mismo tipo de ejecución al hacer push o PR, sin Azure DevOps (útil si todo el equipo vive en GitHub).

### 2.1 Archivo del workflow

En el repo está el workflow:

**`.github/workflows/api-regression.yml`**

Hace checkout, Java 17, Node 20, Karate (`mvnw`), Playwright (`npm ci` + Chromium), sube JUnit y reportes HTML como artefactos, y marca el job en rojo si falla Karate o Playwright.

### 2.2 Pasos en GitHub

1. Haz **commit** y **push** del workflow a la rama `main`.
2. Ve a la pestaña **Actions** del repositorio.
3. Abre el workflow **API regression** (o el nombre que defina el YAML) y revisa el último run.
4. Descarga el artefacto **playwright-junit** / **test-results** si los configuraste.

### 2.3 Azure DevOps vs GitHub Actions

| Necesidad                         | Azure DevOps | GitHub Actions |
|----------------------------------|--------------|----------------|
| Ya tienes `azure-pipelines.yml`  | Directo      | Opcional       |
| Repo solo en GitHub              | Conectar ADO | Nativo         |
| Test tab unificada estilo AzDO   | Sí           | Resumen en Actions + artifacts |

Puedes usar **solo una** de las dos opciones para CI, o ambas si el equipo lo pide (duplica ejecuciones en cada push).

---

## 3. Generación de casos con LLM (prompt maestro)

**Qué consigues:** textos de negocio + OpenAPI → borradores de `.feature` Karate y `.spec.ts` Playwright alineados al repo.

### 3.1 Herramientas (gratis o capa free)

- ChatGPT, Google Gemini, Copilot en el IDE, u otro LLM con el que trabajes.

### 3.2 Procedimiento

1. Abre **`docs/prompts/MASTER_PROMPT.md`** en el editor.
2. Copia el bloque **Prompt (plantilla)** completo.
3. Sustituye:
   - Historia de usuario entre corchetes.
   - Fragmento OpenAPI o referencia al archivo `openapi/petstore-demo.yaml`.
   - Reglas explícitas (códigos HTTP, errores, precondiciones).
4. Pega todo en el LLM y pide la salida en el orden que indica el propio prompt (tabla de trazabilidad + bloques Karate y Playwright).
5. Revisa el código generado:
   - Rutas sugeridas están en la sección **Rutas de archivos (salida del agente / LLM)** del mismo `MASTER_PROMPT.md`.
6. Crea o edita archivos en el repo manualmente (o con el asistente del IDE) y ejecuta localmente:
   - `.\scripts\run-local-tests.ps1` o los comandos por carpeta `karate` / `playwright`.
7. Haz **commit** y **push** cuando los tests pasen.

### 3.3 Buenas prácticas

- No pegues secretos en el prompt ni en los tests generados.
- Compara siempre el output del LLM con el contrato OpenAPI real del equipo.

---

## 4. Microsoft Teams + disparo de pipeline (ChatOps)

**Qué consigues:** desde un canal de Teams (o comando), encolar una ejecución del pipeline sin abrir el portal.

### 4.1 Prerrequisitos

- Microsoft Teams y, idealmente, **Power Automate** (incluido en muchos planes Microsoft 365; revisa límites del tier gratuito).
- **Pipeline ya funcionando** en Azure DevOps (sección 1).
- **PAT de Azure DevOps** o conector oficial **Azure DevOps** en Power Automate (recomendado en lugar de pegar el PAT en el flujo si tu tenant lo permite).

### 4.2 Datos que necesitas anotar

- **Organization URL:** `https://dev.azure.com/{tu-org}`
- **Project name**
- **Pipeline definition id:** en Azure DevOps → **Pipelines** → selecciona el pipeline → **Edit** → en la URL aparece un número `definitionId=...`, o en **Manage** del pipeline.
- Rama por defecto (ej. `refs/heads/main`).

### 4.3 Flujo mínimo con Power Automate

1. Entra a [Power Automate](https://make.powerautomate.com).
2. **Create** → **Automated cloud flow** (o **Instant cloud flow** con trigger manual para pruebas).
3. Trigger: según diseño del equipo, por ejemplo **When an HTTP request is received** (recibirá un JSON desde Teams / un adaptador) o **Microsoft Teams** si usas plantillas de “Workflow in Teams”.
4. Acción: **Azure DevOps** → **Run a build** (si existe el conector) **o** **HTTP**:
   - Método: `POST`
   - URL: `https://dev.azure.com/{org}/{project}/_apis/build/builds?api-version=7.0`
   - Cabecera: `Authorization: Basic {base64('':PAT)}` o OAuth según documentación actual de Microsoft.
   - Cuerpo JSON mínimo:
     ```json
     {
       "definition": { "id": DEFINITION_ID },
       "sourceBranch": "refs/heads/main"
     }
     ```
5. Respuesta: guarda `id` del build y construye el enlace:  
   `https://dev.azure.com/{org}/{project}/_build/results?buildId={id}`
6. Opcional: envía ese enlace a un canal de Teams con la acción **Post message in a chat or channel**.

### 4.4 Conectar Teams al flujo

- **Opción simple:** publicar en el canal un **enlace** o **botón** que abra un formulario Power Automate / Power Apps que dispare el flujo.
- **Opción avanzada:** **Azure Bot** registrado + Messaging Extension; arquitectura descrita en **`docs/CHATOPS_TEAMS.md`** y flujo extendido en **`docs/FLUJO_EQUIPO_CSV_TEAMS.md`**.

### 4.5 Seguridad

- Restringe qué ramas y qué `definitionId` acepta el flujo.
- Rota el PAT periódicamente; usa identidades administradas cuando sea posible.

---

## 5. Variables útiles del pipeline

| Variable / tema        | Dónde se usa              | Ejemplo / notas |
|------------------------|---------------------------|-----------------|
| `API_BASE_URL`         | Playwright en CI          | `https://petstore.swagger.io/v2/` |
| `PLAYWRIGHT_GREP`      | Filtrar tests Playwright  | Texto del título del test o regex Playwright |
| `NODE_VERSION`         | `azure-pipelines.yml`     | `20.x` |
| `JAVA_VERSION`         | Karate                    | `17` |

Para definir variables en Azure DevOps: **Pipelines** → el pipeline → **Edit** → **Variables**, o al **Run pipeline** → **Variables**.

---

## 6. Comprobación final

Usa esta lista como checklist:

- [ ] **Local:** `.\scripts\run-local-tests.ps1` termina sin error.
- [ ] **CI:** al menos un run verde en Azure DevOps **o** GitHub Actions.
- [ ] **Resultados:** ves tests publicados (AzDO Tests o artifact JUnit en GitHub).
- [ ] **LLM:** generaste al menos un escenario de prueba con `MASTER_PROMPT.md` y lo validaste localmente.
- [ ] **Teams (opcional):** un flujo encola un build y devuelve enlace al run.

---

## Referencias en el repo

| Documento | Contenido |
|-----------|-----------|
| `docs/INSTALACION_PASO_A_PASO.md` | Git, Java, Node, Karate, Playwright local |
| `docs/ARCHITECTURE.md` | Visión general del framework |
| `docs/CHATOPS_TEAMS.md` | Arquitectura Teams ↔ ADO |
| `docs/FLUJO_EQUIPO_CSV_TEAMS.md` | CSV, grep, ciclo con reporte |
| `docs/prompts/MASTER_PROMPT.md` | Prompt + rutas de salida del LLM |
| `azure-pipelines.yml` | Pipeline Azure DevOps |
| `.github/workflows/api-regression.yml` | Pipeline GitHub Actions (si está presente) |
