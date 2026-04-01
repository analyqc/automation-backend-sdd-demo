import path from 'path';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from '@playwright/test';
import { getActiveEnv, resolvePlaywrightBaseURL } from './src/config/environments';

loadEnv({ path: path.join(__dirname, '.env') });

const debugHttp = process.env.DEBUG_API === '1' || process.env.PW_HTTP_LOG === '1';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: 'playwright-report',
      },
    ],
    ['junit', { outputFile: 'results/e2e-junit.xml' }],
  ],
  metadata: {
    'TEST_ENV': getActiveEnv(),
    'DEBUG_HTTP': debugHttp ? 'on' : 'off',
    'API_BASE_URL': resolvePlaywrightBaseURL(),
  },
  use: {
    baseURL: resolvePlaywrightBaseURL(),
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    trace: debugHttp ? 'on' : 'retain-on-failure',
  },
});
