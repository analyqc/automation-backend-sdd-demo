import type { APIRequestContext } from '@playwright/test';

export type HookContext = {
  request: APIRequestContext;
  testData?: Record<string, unknown>;
};

/**
 * Ejemplo de hooks Before/After por petición: inyectar cabeceras o log de auditoría.
 * Para Playwright, el patrón es envolver el APIRequestContext o centralizar en fixtures.
 */
export async function beforeRequest(
  ctx: HookContext,
  meta: { method: string; url: string }
): Promise<void> {
  if (process.env.DEBUG_API === '1') {
    console.log(`[before] ${meta.method} ${meta.url}`, ctx.testData ?? {});
  }
}

export async function afterRequest(
  _ctx: HookContext,
  meta: { method: string; url: string; status: number }
): Promise<void> {
  if (process.env.DEBUG_API === '1') {
    console.log(`[after] ${meta.method} ${meta.url} -> ${meta.status}`);
  }
}
