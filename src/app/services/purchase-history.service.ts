
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environment/environment';
import { PurchaseHistory } from '../model/purchase-history';


@Injectable({ providedIn: 'root' })
export class PurchaseHistoryService {

  private api = environment.PurchaseApi;

  private _data$ = new BehaviorSubject<PurchaseHistory[]>([]);
  data$ = this._data$.asObservable();

  constructor(private http: HttpClient) { }


  load() {
    const cacheBuster = `?t=${new Date().getTime()}`;

    this.http.get<PurchaseHistory[]>(this.api + cacheBuster)
      .subscribe(res => this._data$.next(res));
  }


  add(model: PurchaseHistory) {
    return this.http.post(this.api, model).pipe(
      tap(() => this.load())
    );
  }

  update(model: PurchaseHistory) {
    return this.http.put(this.api, model).pipe(
      tap(() => this.load())
    );
  }

  delete(model: PurchaseHistory) {
    return this.http.request('delete', this.api, { body: model }).pipe(
      tap(() => this.load())
    );
  }
}