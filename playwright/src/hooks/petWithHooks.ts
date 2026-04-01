import type { Pet } from '../types/pet';
import type { PetApi } from '../api/PetApi';
import { beforeRequest, afterRequest, type HookContext } from './requestHooks';
import { parsePetResponseBody } from '../utils/petResponse';
import { attachHttpExchange } from '../utils/httpReportAttach';

function joinBase(baseUrl: string, suffix: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const path = suffix.startsWith('/') ? suffix : `/${suffix}`;
  return `${base}${path}`;
}

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
  const responseText = await res.text();
  await afterRequest(requestCtx, { method: 'POST', url, status });
  await attachHttpExchange(requestCtx.testInfo, '01-POST-pet', {
    method: 'POST',
    url,
    requestBody: body,
    responseStatus: status,
    responseBody: responseText,
  });
  const { pet, idForPath } = parsePetResponseBody(responseText);
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
  const responseText = await res.text();
  await afterRequest(requestCtx, { method: 'GET', url, status });
  await attachHttpExchange(requestCtx.testInfo, '02-GET-pet', {
    method: 'GET',
    url,
    responseStatus: status,
    responseBody: responseText,
  });
  const { pet } = parsePetResponseBody(responseText);
  return {
    status,
    json: () => Promise.resolve(pet),
  };
}

export async function deletePetWithHooks(
  petApi: PetApi,
  requestCtx: HookContext,
  petId: string,
  baseUrl: string
): Promise<{ status: number }> {
  const url = joinBase(baseUrl, `pet/${petId}`);
  await beforeRequest(requestCtx, { method: 'DELETE', url });
  const res = await petApi.deleteById(petId);
  const status = res.status();
  const responseText = await res.text();
  await afterRequest(requestCtx, { method: 'DELETE', url, status });
  await attachHttpExchange(requestCtx.testInfo, '03-DELETE-pet', {
    method: 'DELETE',
    url,
    responseStatus: status,
    responseBody: responseText,
  });
  return { status };
}
