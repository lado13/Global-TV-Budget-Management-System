import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environment/environment';
import { Merchant } from '../model/merchant';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {

  private apiUrl = environment.MerchantApi;

  private _data$ = new BehaviorSubject<Merchant[]>([]);
  merchants$ = this._data$.asObservable();

  constructor(private http: HttpClient) { }

  // 🔥 SAME PRINCIPLE AS PURCHASE HISTORY
  load() {
    const cacheBuster = `?t=${new Date().getTime()}`;

    this.http.get<Merchant[]>(this.apiUrl + cacheBuster)
      .subscribe(res => this._data$.next(res));
  }

  create(name: string) {
    return this.http.post(this.apiUrl, { id: 0, name }).pipe(
      tap(() => this.load())
    );
  }

  update(id: number, name: string) {
    return this.http.put(this.apiUrl, { id, name }).pipe(
      tap(() => this.load())
    );
  }

  delete(id: number, name?: string) {
    return this.http.request('delete', this.apiUrl, {
      body: { id, name }
    }).pipe(
      tap(() => this.load())
    );
  }
}