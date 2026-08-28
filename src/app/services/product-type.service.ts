import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, map, tap } from 'rxjs';
import { environment } from '../../environment/environment';
import { ProductType } from '../model/product-type';
import { NamedEntityService } from '../shared/services/named-entity.service';
import { FileService } from './file.service';

@Injectable({
  providedIn: 'root'
})
export class ProductTypeService extends NamedEntityService<ProductType> {
  protected readonly apiUrl = environment.ProductTypeApi;
  private readonly fileService = inject(FileService);

  readonly productTypes$ = this.data$;

  constructor() {
    super();
    this.load();
  }

  createWithIcon(name: string, iconFile?: File | null): Observable<unknown> {
    return this.http.post<ProductType | number>(this.apiUrl, { id: 0, name }).pipe(
      switchMap(() =>
        this.http.get<ProductType[]>(`${this.apiUrl}?t=${Date.now()}`).pipe(
          tap((list) => this.setData(list ?? [])),
          map((list) => [...(list ?? [])].reverse().find((t) => t.name === name)?.id)
        )
      ),
      switchMap((typeId) => {
        if (!typeId) {
          throw new Error('Product type created but id not found');
        }
        if (!iconFile) {
          return of(null);
        }

        return this.fileService.uploadAndGetUrl(iconFile).pipe(
          switchMap((iconUrl) =>
            this.http.put(this.apiUrl, { id: typeId, name, iconUrl })
          )
        );
      }),
      tap(() => this.load())
    );
  }

  updateWithIcon(
    id: number,
    name: string,
    iconFile?: File | null,
    existingIconUrl?: string
  ): Observable<unknown> {
    if (!iconFile) {
      const extras = existingIconUrl?.trim() ? { iconUrl: existingIconUrl.trim() } : {};
      return this.update(id, name, extras as Partial<ProductType>);
    }

    return this.fileService
      .uploadAndGetUrl(iconFile)
      .pipe(switchMap((iconUrl) => this.update(id, name, { iconUrl } as Partial<ProductType>)));
  }
}
