import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';
import { PetApi } from '../src/api/PetApi';
import { createPetWithHooks, getPetWithHooks } from '../src/hooks/petWithHooks';
import type { Pet } from '../src/types/pet';

test.describe('Pet API — AOM, SDD y hooks', () => {
  test('precondición: JSON de testdata; postcondición: DELETE del recurso creado', async ({
    request,
  }, testInfo) => {
    const baseUrl = (testInfo.project.use.baseURL ?? 'https://petstore.swagger.io/v2/').replace(
      /\/?$/,
      '/'
    );
    const jsonPath = path.join(__dirname, '..', 'testdata', 'pet-playwright.json');
    const body = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as Pet;

    const petApi = new PetApi(request);
    const hookCtx = { request, testData: { ...body } as Record<string, unknown> };

    const { status, pet, idForPath } = await createPetWithHooks(petApi, hookCtx, body, baseUrl);
    expect(status).toBe(200);
    expect(idForPath).toMatch(/^\d+$/);
    expect(pet).toMatchObject({ name: body.name, status: 'available' });

    const read = await getPetWithHooks(petApi, hookCtx, idForPath, baseUrl);
    expect(read.status).toBe(200);
    const fetched = await read.json();
    expect(fetched.name).toBe(body.name);

    await test.step('postcondición: limpiar estado', async () => {
      const del = await petApi.deleteById(idForPath);
      expect([200, 404]).toContain(del.status());
    });
  });
});
