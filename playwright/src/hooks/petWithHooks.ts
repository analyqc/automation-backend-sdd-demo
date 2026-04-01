import type { Pet } from '../types/pet';
import type { PetApi } from '../api/PetApi';
import { beforeRequest, afterRequest, type HookContext } from './requestHooks';
import { buildPetPutJson, parsePetResponseBody } from '../utils/petResponse';
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

export async function updatePetWithHooks(
  petApi: PetApi,
  requestCtx: HookContext,
  idForPath: string,
  pet: Pet,
  newStatus: Pet['status'],
  baseUrl: string,
  attachStepLabel = '03-PUT-pet'
): Promise<{ status: number; pet: Pet }> {
  const url = joinBase(baseUrl, 'pet');
  const putBody = buildPetPutJson(idForPath, pet, newStatus);
  await beforeRequest(requestCtx, { method: 'PUT', url });
  const res = await petApi.updateWithJsonBody(putBody);
  const status = res.status();
  const responseText = await res.text();
  await afterRequest(requestCtx, { method: 'PUT', url, status });
  await attachHttpExchange(requestCtx.testInfo, attachStepLabel, {
    method: 'PUT',
    url,
    requestBody: putBody,
    responseStatus: status,
    responseBody: responseText,
  });
  const { pet: updated } = parsePetResponseBody(responseText);
  return { status, pet: updated };
}

export async function getPetWithHooks(
  petApi: PetApi,
  requestCtx: HookContext,
  petId: string,
  baseUrl: string,
  attachStepLabel = '02-GET-pet'
): Promise<{ status: number; json: () => Promise<Pet> }> {
  const url = joinBase(baseUrl, `pet/${petId}`);
  await beforeRequest(requestCtx, { method: 'GET', url });
  const res = await petApi.getById(petId);
  const status = res.status();
  const responseText = await res.text();
  await afterRequest(requestCtx, { method: 'GET', url, status });
  await attachHttpExchange(requestCtx.testInfo, attachStepLabel, {
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
  baseUrl: string,
  attachStepLabel = '03-DELETE-pet'
): Promise<{ status: number }> {
  const url = joinBase(baseUrl, `pet/${petId}`);
  await beforeRequest(requestCtx, { method: 'DELETE', url });
  const res = await petApi.deleteById(petId);
  const status = res.status();
  const responseText = await res.text();
  await afterRequest(requestCtx, { method: 'DELETE', url, status });
  await attachHttpExchange(requestCtx.testInfo, attachStepLabel, {
    method: 'DELETE',
    url,
    responseStatus: status,
    responseBody: responseText,
  });
  return { status };
}
