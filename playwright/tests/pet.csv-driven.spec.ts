import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';
import { PetApi } from '../src/api/PetApi';
import {
  createPetWithHooks,
  deletePetWithHooks,
  getPetWithHooks,
} from '../src/hooks/petWithHooks';
import { parseCsvTable } from '../src/utils/csvFixtures';
import type { Pet } from '../src/types/pet';

const csvPath = path.join(__dirname, '..', 'testdata', 'pets-scenarios.csv');
const rows = parseCsvTable(fs.readFileSync(csvPath, 'utf-8'));

/**
 * Casos alimentados por CSV (diagrama: "casos de pruebas alimentados por un csv").
 * Cada fila = un escenario de negocio reutilizando AOM + hooks.
 */
test.describe('Pet API — data-driven (CSV)', () => {
  for (const row of rows) {
    const id = row.scenarioId ?? row.scenarioid;
    const name = row.petName ?? row.petname;
    const status = row.status as Pet['status'];
    if (!id || !name || !status) continue;

    test(`fila CSV #${id}: ${name} [${status}]`, async ({ request }, testInfo) => {
      const baseUrl = (testInfo.project.use.baseURL ?? 'https://petstore.swagger.io/v2/').replace(
        /\/?$/,
        '/'
      );
      const body: Pet = {
        name,
        photoUrls: ['https://example.com/csv.png'],
        status,
        tags: [{ name: 'csv-driven' }],
      };

      const petApi = new PetApi(request);
      const hookCtx = { request, testData: { ...row } as Record<string, unknown>, testInfo };

      const { status: httpStatus, pet, idForPath } = await createPetWithHooks(
        petApi,
        hookCtx,
        body,
        baseUrl
      );
      expect(httpStatus).toBe(200);
      expect(pet.name).toBe(name);
      expect(pet.status).toBe(status);

      const read = await getPetWithHooks(petApi, hookCtx, idForPath, baseUrl);
      expect(read.status).toBe(200);

      await test.step('postcondición: limpiar', async () => {
        await deletePetWithHooks(petApi, hookCtx, idForPath, baseUrl);
      });
    });
  }
});
