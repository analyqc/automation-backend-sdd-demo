import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'results/e2e-junit.xml' }],
  ],
  use: {
    // Barra final: rutas relativas tipo "pet" se resuelven bajo /v2/ ("/pet" reemplazaría el path y rompe el prefijo).
    baseURL: (process.env.API_BASE_URL ?? 'https://petstore.swagger.io/v2').replace(/\/?$/, '/'),
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },
});
