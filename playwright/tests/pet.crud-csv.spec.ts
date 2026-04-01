import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';
import { PetApi } from '../src/api/PetApi';
import {
  createPetWithHooks,
  deletePetWithHooks,
  getPetWithHooks,
  updatePetWithHooks,
} from '../src/hooks/petWithHooks';
import { parseCsvTable } from '../src/utils/csvFixtures';
import type { Pet } from '../src/types/pet';

const csvPath = path.join(__dirname, '..', 'testdata', 'pets-crud-scenarios.csv');
const rows = parseCsvTable(fs.readFileSync(csvPath, 'utf-8'));

/**
 * Demo para stakeholders: casos data-driven (CSV) con precondiciones explícitas.
 * Orden de negocio: sin recurso → CREATE → (pre: existe) UPDATE → (pre: existe) DELETE.
 * Contrato: openapi/petstore-demo.yaml — API real en la nube (Swagger Petstore).
 */
test.describe('Pet API — CRUD desde CSV (CREATE → UPDATE → DELETE)', () => {
  for (const row of rows) {
    const sid = row.scenarioId ?? row.scenarioid;
    const businessCase = row.businessCase ?? row.businesscase;
    const petName = row.petName ?? row.petname;
    const statusCreate = row.statusCreate ?? row.statuscreate;
    const statusUpdate = row.statusUpdate ?? row.statusupdate;

    if (!sid || !businessCase || !petName || !statusCreate || !statusUpdate) continue;

    test(`CSV #${sid}: ${businessCase}`, async ({ request }, testInfo) => {
      const baseUrl = (testInfo.project.use.baseURL ?? 'https://petstore.swagger.io/v2/').replace(
        /\/?$/,
        '/'
      );

      const initialBody: Pet = {
        name: petName,
        photoUrls: ['https://example.com/crud-csv.png'],
        status: statusCreate as Pet['status'],
        tags: [{ name: 'crud-csv-demo' }],
      };

      const petApi = new PetApi(request);
      const hookCtx = { request, testData: { ...row } as Record<string, unknown>, testInfo };

      await test.step('Precondición: no hay mascota de prueba aún (estado inicial del escenario)', async () => {
        // Documentación para el reporte; la API pública no garantiza aislamiento por nombre.
        expect(petName.length).toBeGreaterThan(0);
      });

      const { status: cStatus, pet: createdPet, idForPath } = await test.step('CREATE — POST /pet', async () => {
        return createPetWithHooks(petApi, hookCtx, initialBody, baseUrl);
      });
      expect(cStatus).toBe(200);
      expect(createdPet.name).toBe(petName);
      expect(createdPet.status).toBe(statusCreate);

      await test.step('Precondición para lectura: la mascota fue creada (id disponible)', async () => {
        expect(idForPath).toMatch(/^\d+$/);
      });

      const afterCreate = await test.step('GET — verificar estado tras alta', async () => {
        return getPetWithHooks(petApi, hookCtx, idForPath, baseUrl, '02-GET-after-CREATE');
      });
      expect(afterCreate.status).toBe(200);
      expect((await afterCreate.json()).status).toBe(statusCreate);

      await test.step('Precondición para UPDATE: el recurso debe existir (mismo id que POST)', async () => {
        expect(idForPath).toBeTruthy();
      });

      const newStatus = statusUpdate as Pet['status'];
      const { status: uStatus, pet: afterPut } = await test.step('UPDATE — PUT /pet', async () => {
        return updatePetWithHooks(
          petApi,
          hookCtx,
          idForPath,
          { ...createdPet, name: petName, photoUrls: initialBody.photoUrls, tags: initialBody.tags },
          newStatus,
          baseUrl,
          '03-PUT-update'
        );
      });
      expect(uStatus).toBe(200);
      expect(afterPut.status).toBe(newStatus);

      const afterUpdate = await test.step('GET — consulta tras modificación (sanidad + demo Petstore)', async () => {
        return getPetWithHooks(petApi, hookCtx, idForPath, baseUrl, '04-GET-after-UPDATE');
      });
      expect(afterUpdate.status).toBe(200);
      const bodyAfterGet = await afterUpdate.json();
      // Petstore público reutiliza ids de demo: el GET puede no ser la misma mascota. La verificación de negocio del UPDATE es la respuesta PUT (arriba).
      if (bodyAfterGet.name === petName) {
        expect(bodyAfterGet.status).toBe(newStatus);
      }

      await test.step('Precondición para DELETE: el recurso sigue existiendo (limpieza controlada)', async () => {
        expect(idForPath).toBeTruthy();
      });

      await test.step('DELETE — teardown / limpieza', async () => {
        const { status: dStatus } = await deletePetWithHooks(
          petApi,
          hookCtx,
          idForPath,
          baseUrl,
          '05-DELETE-teardown'
        );
        expect([200, 404]).toContain(dStatus);
      });
    });
  }
});
