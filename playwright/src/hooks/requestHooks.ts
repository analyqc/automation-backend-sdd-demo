import type { APIRequestContext, TestInfo } from '@playwright/test';
import { isHttpDebugEnabled } from '../utils/httpReportAttach';

export type HookContext = {
  request: APIRequestContext;
  testData?: Record<string, unknown>;
  /** Si viene informado + DEBUG_API=1, se adjuntan request/response al reporte HTML. */
  testInfo?: TestInfo;
};

/**
 * Ejemplo de hooks Before/After por petición: inyectar cabeceras o log de auditoría.
 * Para Playwright, el patrón es envolver el APIRequestContext o centralizar en fixtures.
 */
export async function beforeRequest(
  ctx: HookContext,
  meta: { method: string; url: string }
): Promise<void> {
  if (isHttpDebugEnabled()) {
    console.log(`[before] ${meta.method} ${meta.url}`, ctx.testData ?? {});
  }
}

export async function afterRequest(
  _ctx: HookContext,
  meta: { method: string; url: string; status: number }
): Promise<void> {
  if (isHttpDebugEnabled()) {
    console.log(`[after] ${meta.method} ${meta.url} -> ${meta.status}`);
  }
}
