import type { Pet } from '../types/pet';

/**
 * Petstore devuelve `id` como entero de 64 bits; JSON.parse en JS pierde precisión.
 * Extraemos el dígito literal del cuerpo para armar la URL de GET/DELETE.
 */
export function parsePetResponseBody(text: string): { pet: Pet; idForPath: string } {
  const pet = JSON.parse(text) as Pet;
  let idForPath = '';
  for (const m of text.matchAll(/"id"\s*:\s*(\d+)/g)) {
    const candidate = m[1];
    if (candidate.length > idForPath.length) idForPath = candidate;
  }
  if (!idForPath && pet.id != null) idForPath = String(pet.id);
  return { pet, idForPath };
}
