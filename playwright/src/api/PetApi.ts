import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Pet } from '../types/pet';

/**
 * API Object Model (fachada) para /pet — encapsula paths y payloads.
 * Contrato: openapi/petstore-demo.yaml (baseURL = servers[0].url).
 */
export class PetApi {
  constructor(private readonly request: APIRequestContext) {}

  async create(body: Pet): Promise<APIResponse> {
    return this.request.post('pet', { data: body });
  } 

  async getById(petId: string | number): Promise<APIResponse> {
    return this.request.get(`pet/${petId}`);
  }

  async deleteById(petId: string | number): Promise<APIResponse> {
    return this.request.delete(`pet/${petId}`);
  }
}
