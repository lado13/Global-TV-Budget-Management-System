import { Observable } from 'rxjs';
import { NamedEntity } from '../models/named-entity';
import { BaseStoreService } from './base-store.service';

/**
 * CRUD helpers for entities that are identified mainly by `id` + `name`.
 * Supports optional image fields (iconUrl / imageUrl) on create/update.
 * Empty optional string fields are omitted so the API does not 400 on "".
 */
export abstract class NamedEntityService<T extends NamedEntity> extends BaseStoreService<T> {
  create(name: string, extras: Partial<T> = {}): Observable<T> {
    return this.refreshAfter(
      this.http.post<T>(this.apiUrl, {
        id: 0,
        name,
        ...this.omitEmptyStrings(extras)
      } as Partial<T>)
    );
  }

  update(id: number, name: string, extras: Partial<T> = {}): Observable<unknown> {
    return this.refreshAfter(
      this.http.put(this.apiUrl, {
        id,
        name,
        ...this.omitEmptyStrings(extras)
      })
    );
  }

  delete(id: number, name: string): Observable<unknown> {
    return this.refreshAfter(
      this.http.delete(this.apiUrl, { body: { id, name } })
    );
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${id}`);
  }

  findById(id: number): T | undefined {
    return this.snapshot.find((item) => item.id === id);
  }

  getName(id: number, fallback = 'Unknown'): string {
    return this.findById(id)?.name ?? fallback;
  }

  private omitEmptyStrings(extras: Partial<T>): Partial<T> {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(extras ?? {})) {
      if (typeof value === 'string') {
        if (value.trim()) cleaned[key] = value.trim();
        continue;
      }
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    }
    return cleaned as Partial<T>;
  }
}
