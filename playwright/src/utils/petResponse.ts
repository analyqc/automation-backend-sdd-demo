import type { APIResponse } from '@playwright/test';
import type { Pet } from '../types/pet';

/**
 * Petstore devuelve `id` como entero de 64 bits; JSON.parse en JS pierde precisión.
 * Extraemos el dígito literal del cuerpo para armar la URL de GET/DELETE.
 */
export async function readPetFromResponse(res: APIResponse): Promise<{ pet: Pet; idForPath: string }> {
  const text = await res.text();
  const pet = JSON.parse(text) as Pet;
  // No usar el primer "id": puede ser category.id o tag.id (0). El id de Pet en Petstore es el número más largo.
  let idForPath = '';
  for (const m of text.matchAll(/"id"\s*:\s*(\d+)/g)) {
    const candidate = m[1];
    if (candidate.length > idForPath.length) idForPath = candidate;
  }
  if (!idForPath && pet.id != null) idForPath = String(pet.id);
  return { pet, idForPath };
}
