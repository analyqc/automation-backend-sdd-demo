# Lineamientos OpenAPI/Swagger para equipos de arquitectura (IA y automatización)

Estas prácticas reducen ambigüedad cuando un LLM o herramientas generan pruebas a partir del contrato.

## 1. Identidad y versionado

- Incluir `openapi: 3.0.x` o `3.1.x`, `info.title`, `info.version` semántica y **descripción** del dominio de negocio en `info.description`.
- Versionar la API en la ruta (`/v1/...`) **o** en header; documentar una sola convención y usar `servers` con URLs de ejemplo claras.

## 2. Operaciones y nombres

- `operationId` **único y estable** (snake_case o camelCase consistente); la IA lo usa como nombre de escenario o método AOM.
- `summary` corto y `description` con reglas de negocio, códigos de error esperados y precondiciones (ej. "Requiere recurso padre existente").

## 3. Parámetros y cuerpos

- Todos los query/path/header con `required`, `schema` completo (`type`, `format`, `enum`, `minLength`, `pattern`).
- Request bodies con `content.application/json.schema` que referencie `#/components/schemas/...`, no esquemas inline duplicados.
- Ejemplos: usar `example` o `examples` en componentes para datos representativos (sin secretos reales).

## 4. Respuestas

- Documentar **al menos** `200`, `201`, `400`, `401`, `403`, `404`, `409`, `422` según aplique, cada una con `description` y `content` + schema.
- Reutilizar respuestas de error comunes en `components/responses`.

## 5. Modelos (`components/schemas`)

- Nombres de esquema = vocabulario de dominio (`Pet`, `Order`), no `Model1`.
- `required` explícito en objetos; `nullable` o `oneOf` cuando el negocio lo exija.
- Evitar `additionalProperties: true` sin necesidad; si es mapa dinámico, documentar claves esperadas en `description`.

## 6. Seguridad

- Declarar `securitySchemes` (Bearer, OAuth2, ApiKey) y `security` a nivel global y overrides por operación.
- Indicar scopes OAuth2 por operación cuando aplique.

## 7. Tags y agrupación

- `tags` alineados a bounded contexts o recursos; orden lógico en `tags` con descripciones (facilita generación de carpetas `pets/`, `store/`).

## 8. Entregables para el repo de pruebas

- Un archivo **canónico** `openapi.yaml` (o JSON) en el repositorio de contratos o submódulo; CI valida con Spectral/Redocly.
- Changelog de breaking changes junto al bump de `info.version`.

## 9. Metadatos para IA (opcional)

- Extensiones `x-` documentadas en el README del contrato, por ejemplo `x-business-rule-id`, `x-test-priority`, si el equipo las adopta de forma uniforme.

Cumplir lo anterior permite que Karate reutilice esquemas JSON exportados del OpenAPI y que los prompts al LLM produzcan aserciones alineadas al contrato sin adivinar comportamiento.
