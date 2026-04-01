import type { APIResponse } from '@playwright/test';
import type { Pet } from '../types/pet';

/**
 * Petstore devuelve `id` como entero de 64 bits; JSON.parse en JS pierde precisión.
 * Extraemos el dígito literal del cuerpo para armar la URL de GET/DELETE.
 */
export async function readPetFromResponse(res: APIResponse): Promise<{ pet: Pet; idForPath: string }> {
  const text = await res.text();
  const idMatch = text.match(/"id"\s*:\s*(\d+)/);
  const pet = JSON.parse(text) as Pet;
  const idForPath = idMatch?.[1] ?? (pet.id != null ? String(pet.id) : '');
  return { pet, idForPath };
}
