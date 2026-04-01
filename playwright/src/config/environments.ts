/**
 * Entornos vía TEST_ENV o PLAYWRIGHT_ENV (mismo significado).
 * API_BASE_URL siempre gana si está definida (útil para "custom").
 */
export function getActiveEnv(): string {
  return (process.env.TEST_ENV || process.env.PLAYWRIGHT_ENV || 'demo').trim().toLowerCase();
}

const DEFAULT_BASE: Record<string, string> = {
  demo: 'https://petstore.swagger.io/v2',
  staging: 'https://petstore.swagger.io/v2',
  local: 'http://localhost:8080',
};

/** baseURL con barra final (Playwright + rutas relativas tipo "pet"). */
export function resolvePlaywrightBaseURL(): string {
  if (process.env.API_BASE_URL?.trim()) {
    return process.env.API_BASE_URL.trim().replace(/\/?$/, '/');
  }
  const name = getActiveEnv();
  const base = DEFAULT_BASE[name] ?? DEFAULT_BASE.demo;
  return base.replace(/\/?$/, '/');
}
