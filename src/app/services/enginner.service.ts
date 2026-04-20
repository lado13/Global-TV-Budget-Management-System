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

  // Real-time State
  private dataSubject = new BehaviorSubject<Enginner[]>([]);
  public engineers$ = this.dataSubject.asObservable();

  // --- GET ALL ---
  getAll(): void {
    this.http.get<Enginner[]>(this.apiUrl).subscribe(data => {
      this.dataSubject.next(data);
    });
  }

  // --- POST (Create) ---
  create(name: string): Observable<Enginner> {
    return this.http.post<Enginner>(this.apiUrl, { id: 0, name }).pipe(
      tap(() => this.getAll()) // Refresh list after adding
    );
  }

  // --- PUT (Update) ---
  update(id: number, name: string): Observable<any> {
    return this.http.put(this.apiUrl, { id, name }).pipe(
      tap(() => this.getAll()) // Refresh list after update
    );
  }

  // --- DELETE ---
  delete(id: number, name: string): Observable<any> {
    // Note: Your Swagger shows DELETE accepts a body {id, name}
    const options = { body: { id, name } };
    return this.http.delete(this.apiUrl, options).pipe(
      tap(() => this.getAll()) // Refresh list after delete
    );
  }

  // --- GET BY ID ---
  getById(id: number): Observable<Enginner> {
    return this.http.get<Enginner>(`${this.apiUrl}/${id}`);
  }

  // --- CHECK EXISTS ---
  exists(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${id}`);
  }


}
