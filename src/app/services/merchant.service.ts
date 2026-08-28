import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, map, tap } from 'rxjs';
import { environment } from '../../environment/environment';
import { Merchant } from '../model/merchant';
import { NamedEntityService } from '../shared/services/named-entity.service';
import { FileService } from './file.service';

@Injectable({
  providedIn: 'root'
})
export class MerchantService extends NamedEntityService<Merchant> {
  protected readonly apiUrl = environment.MerchantApi;
  private readonly fileService = inject(FileService);

  readonly merchants$ = this.data$;

  createWithIcon(name: string, iconFile?: File | null): Observable<unknown> {
    return this.http.post<Merchant | number>(this.apiUrl, { id: 0, name }).pipe(
      switchMap(() =>
        this.http.get<Merchant[]>(`${this.apiUrl}?t=${Date.now()}`).pipe(
          tap((list) => this.setData(list ?? [])),
          map((list) => [...(list ?? [])].reverse().find((m) => m.name === name)?.id)
        )
      ),
      switchMap((merchantId) => {
        if (!merchantId) {
          throw new Error('Merchant created but id not found');
        }
        if (!iconFile) {
          return of(null);
        }

        return this.fileService.uploadAndGetUrl(iconFile).pipe(
          switchMap((iconUrl) =>
            this.http.put(this.apiUrl, { id: merchantId, name, iconUrl })
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
      return this.update(id, name, extras as Partial<Merchant>);
    }

    return this.fileService
      .uploadAndGetUrl(iconFile)
      .pipe(switchMap((iconUrl) => this.update(id, name, { iconUrl } as Partial<Merchant>)));
  }
}
