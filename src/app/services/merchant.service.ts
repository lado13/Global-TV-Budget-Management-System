import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Merchant } from '../model/merchant';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {

  private http = inject(HttpClient);
  private apiUrl = environment.MerchantApi;

  private merchantSubject = new BehaviorSubject<Merchant[]>([]);
  public merchants$ = this.merchantSubject.asObservable();

  getAll(): void {
    this.http.get<Merchant[]>(this.apiUrl).subscribe(data => {
      this.merchantSubject.next(data);
    });
  }

  create(name: string): Observable<Merchant> {
    return this.http.post<Merchant>(this.apiUrl, { id: 0, name }).pipe(
      tap(() => this.getAll())
    );
  }

  update(id: number, name: string): Observable<any> {
    return this.http.put(this.apiUrl, { id, name }).pipe(
      tap(() => this.getAll())
    );
  }

  delete(id: number, name: string): Observable<any> {
    const options = { body: { id, name } };
    return this.http.delete(this.apiUrl, options).pipe(
      tap(() => this.getAll())
    );
  }
}
