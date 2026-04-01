import type { TestInfo } from '@playwright/test';

/** Incluye request/response como adjuntos en el reporte HTML (pestaña Attachments). */
export function isHttpDebugEnabled(): boolean {
  return process.env.DEBUG_API === '1' || process.env.PW_HTTP_LOG === '1';
}

export async function attachHttpExchange(
  testInfo: TestInfo | undefined,
  stepLabel: string,
  exchange: {
    method: string;
    url: string;
    requestBody?: unknown;
    responseStatus: number;
    responseBody: string;
  }
): Promise<void> {
  if (!testInfo || !isHttpDebugEnabled()) return;

  const reqPart =
    exchange.requestBody !== undefined
      ? typeof exchange.requestBody === 'string'
        ? exchange.requestBody
        : JSON.stringify(exchange.requestBody, null, 2)
      : '(sin cuerpo)';

  const block = [
    `${exchange.method} ${exchange.url}`,
    '',
    '>>> REQUEST',
    reqPart,
    '',
    `<<< RESPONSE (HTTP ${exchange.responseStatus})`,
    exchange.responseBody.trim() ? exchange.responseBody : '(cuerpo vacío)',
  ].join('\n');

  await testInfo.attach(`${stepLabel}.http.txt`, {
    body: Buffer.from(block, 'utf-8'),
    contentType: 'text/plain; charset=utf-8',
  });
}
