import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

/**
 * Generic reactive store + HTTP load pattern shared by all entity services.
 * Subclasses only supply `apiUrl` and entity-specific create/update/delete.
 */
export abstract class BaseStoreService<T> {
  protected readonly http = inject(HttpClient);
  protected abstract readonly apiUrl: string;

  private readonly _data$ = new BehaviorSubject<T[]>([]);
  readonly data$ = this._data$.asObservable();

  /** Snapshot of the latest loaded list. */
  get snapshot(): T[] {
    return this._data$.value;
  }

  load(): void {
    const cacheBuster = `?t=${Date.now()}`;
    this.http.get<T[]>(this.apiUrl + cacheBuster).subscribe({
      next: (data) => this._data$.next(data ?? []),
      error: (err) => console.error(`Failed to load ${this.apiUrl}`, err)
    });
  }

  /** Skip network when this store already has data (cuts duplicate GETs). */
  loadIfEmpty(): void {
    if (this._data$.value.length > 0) return;
    this.load();
  }

  /** Pipe helper: reload the store after a mutating request succeeds. */
  protected refreshAfter<R>(request$: Observable<R>): Observable<R> {
    return request$.pipe(tap(() => this.load()));
  }

  protected setData(data: T[]): void {
    this._data$.next(data);
  }
}
