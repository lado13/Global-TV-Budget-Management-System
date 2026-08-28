import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { PurchaseHistory } from '../model/purchase-history';
import { BaseStoreService } from '../shared/services/base-store.service';

@Injectable({ providedIn: 'root' })
export class PurchaseHistoryService extends BaseStoreService<PurchaseHistory> {
  protected readonly apiUrl = environment.PurchaseApi;

  add(model: PurchaseHistory): Observable<unknown> {
    return this.refreshAfter(this.http.post(this.apiUrl, model));
  }

  update(model: PurchaseHistory): Observable<unknown> {
    return this.refreshAfter(this.http.put(this.apiUrl, model));
  }

  delete(model: PurchaseHistory): Observable<unknown> {
    return this.refreshAfter(
      this.http.request('delete', this.apiUrl, { body: model })
    );
  }
}
