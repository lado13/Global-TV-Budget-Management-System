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

  private typeSubject = new BehaviorSubject<ProductType[]>([]);
  public productTypes$ = this.typeSubject.asObservable();

  getAll(): void {
    this.http.get<ProductType[]>(this.apiUrl).subscribe(data => {
      this.typeSubject.next(data);
    });
  }

  create(name: string): Observable<ProductType> {
    return this.http.post<ProductType>(this.apiUrl, { id: 0, name }).pipe(
      tap(() => this.getAll())
    );
  }

  update(id: number, name: string): Observable<any> {
    return this.http.put(this.apiUrl, { id, name }).pipe(
      tap(() => this.getAll())
    );
  }

  delete(id: number, name: string): Observable<any> {
    // Note: Your Swagger shows DELETE accepts the full object in the body
    return this.http.delete(this.apiUrl, { body: { id, name } }).pipe(
      tap(() => this.getAll())
    );
  }
}
