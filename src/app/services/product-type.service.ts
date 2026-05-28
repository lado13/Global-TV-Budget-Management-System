import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { ProductType } from '../model/product-type';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductTypeService {

  private http = inject(HttpClient);
  private apiUrl = environment.ProductTypeApi;

  // 🔥 STATE STORE
  private _data$ = new BehaviorSubject<ProductType[]>([]);
  productTypes$ = this._data$.asObservable();

  constructor() {
    this.load(); // optional auto-load
  }

  // --- LOAD ALL ---
  load(): void {
    const cacheBuster = `?t=${new Date().getTime()}`;

    this.http.get<ProductType[]>(this.apiUrl + cacheBuster)
      .subscribe(data => this._data$.next(data));
  }

  // --- CREATE ---
  create(name: string): Observable<ProductType> {
    return this.http.post<ProductType>(this.apiUrl, { id: 0, name }).pipe(
      tap(() => this.load())
    );
  }

  // --- UPDATE ---
  update(id: number, name: string): Observable<any> {
    return this.http.put(this.apiUrl, { id, name }).pipe(
      tap(() => this.load())
    );
  }

  // --- DELETE ---
  delete(id: number, name: string): Observable<any> {
    return this.http.delete(this.apiUrl, {
      body: { id, name }
    }).pipe(
      tap(() => this.load())
    );
  }
}