/** Shared shape for simple name-based CRUD entities. */
export interface NamedEntity {
  id: number;
  name: string;
  createAt?: string;
  updateAt?: string;
  iconUrl?: string;
  imageUrl?: string;
}
