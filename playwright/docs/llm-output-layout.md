# Layout esperado para salida del LLM (integración con el repo)

Para que un agente pueda escribir archivos sin conflictos:

| Artefacto | Ruta sugerida |
|-----------|----------------|
| Casos Karate | `karate/src/test/resources/com/demo/<contexto>/<nombre>.feature` |
| Datos JSON Karate | `karate/src/test/resources/testdata/<nombre>.json` |
| Esquemas JSON | `karate/src/test/resources/schemas/<recurso>.schema.json` |
| Tests Playwright | `playwright/tests/<recurso>.<tipo>.spec.ts` |
| API Objects | `playwright/src/api/<Recurso>Api.ts` |
| Tipos desde OpenAPI | `playwright/src/types/<recurso>.ts` (manual o generado) |

El pipeline CI valida compilación Maven + `npx playwright test`.
