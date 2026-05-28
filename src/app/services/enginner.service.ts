import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Enginner } from '../model/enginner';

@Injectable({
  providedIn: 'root'
})
export class EnginnerService {

  private http = inject(HttpClient);
  private apiUrl = environment.EnginnerApi;

  // 🔥 STATE STORE
  private _data$ = new BehaviorSubject<Enginner[]>([]);
  engineers$ = this._data$.asObservable();

  constructor() {
    this.load(); // optional auto-load
  }

  // --- LOAD ALL ---
  load(): void {
    const cacheBuster = `?t=${new Date().getTime()}`;

    this.http.get<Enginner[]>(this.apiUrl + cacheBuster)
      .subscribe(data => this._data$.next(data));
  }

  // --- CREATE ---
  create(name: string): Observable<Enginner> {
    return this.http.post<Enginner>(this.apiUrl, { id: 0, name }).pipe(
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

  // --- GET BY ID ---
  getById(id: number): Observable<Enginner> {
    return this.http.get<Enginner>(`${this.apiUrl}/${id}`);
  }

  // --- EXISTS ---
  exists(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${id}`);
  }
}