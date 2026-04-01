/** Alineado a components.schemas.Pet del OpenAPI de demo. */
export interface Pet {
  id?: number;
  name: string;
  photoUrls: string[];
  status?: 'available' | 'pending' | 'sold';
  tags?: { id?: number; name?: string }[];
  category?: { id?: number; name?: string };
}
