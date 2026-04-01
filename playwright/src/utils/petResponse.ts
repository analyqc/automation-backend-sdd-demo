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

/**
 * Cuerpo JSON para PUT /pet sin perder precisión del `id` (enteros grandes del Petstore).
 */
export function buildPetPutJson(idForPath: string, pet: Pet, status: Pet['status']): string {
  const chunks = [`"id":${idForPath}`, `"name":${JSON.stringify(pet.name)}`, `"photoUrls":${JSON.stringify(pet.photoUrls)}`];
  if (pet.category != null) chunks.push(`"category":${JSON.stringify(pet.category)}`);
  chunks.push(`"status":${JSON.stringify(status)}`);
  if (pet.tags != null) chunks.push(`"tags":${JSON.stringify(pet.tags)}`);
  return `{${chunks.join(',')}}`;
}
