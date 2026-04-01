import type { Pet } from '../types/pet';
import type { PetApi } from '../api/PetApi';
import { beforeRequest, afterRequest, type HookContext } from './requestHooks';
import { readPetFromResponse } from '../utils/petResponse';

function joinBase(baseUrl: string, suffix: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const path = suffix.startsWith('/') ? suffix : `/${suffix}`;
  return `${base}${path}`;
}

/**
 * Orquesta POST /pet con hooks Before/After equivalentes a Karate.
 * Devuelve `idForPath` con el ID literal del JSON (evita pérdida de precisión en JS).
 */
export async function createPetWithHooks(
  petApi: PetApi,
  requestCtx: HookContext,
  body: Pet,
  baseUrl: string
): Promise<{ status: number; pet: Pet; idForPath: string }> {
  const url = joinBase(baseUrl, 'pet');
  await beforeRequest(requestCtx, { method: 'POST', url });
  const res = await petApi.create(body);
  const status = res.status();
  await afterRequest(requestCtx, { method: 'POST', url, status });
  const { pet, idForPath } = await readPetFromResponse(res);
  return { status, pet, idForPath };
}

export async function getPetWithHooks(
  petApi: PetApi,
  requestCtx: HookContext,
  petId: string,
  baseUrl: string
): Promise<{ status: number; json: () => Promise<Pet> }> {
  const url = joinBase(baseUrl, `pet/${petId}`);
  await beforeRequest(requestCtx, { method: 'GET', url });
  const res = await petApi.getById(petId);
  const status = res.status();
  await afterRequest(requestCtx, { method: 'GET', url, status });
  return { status, json: () => res.json() as Promise<Pet> };
}
