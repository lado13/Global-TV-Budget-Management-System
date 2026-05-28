import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MonthBudget } from '../model/month-budget';

@Injectable({
  providedIn: 'root'
})
export class MonthBudgetService {

  private http = inject(HttpClient);
  private apiUrl = environment.MonthBudgetApi;

  // 🔥 STATE STORE
  private _data$ = new BehaviorSubject<MonthBudget[]>([]);
  budgets$ = this._data$.asObservable();

  constructor() {
    this.load(); // optional auto-load
  }

  // --- LOAD ALL ---
  load(): void {
    const cacheBuster = `?t=${new Date().getTime()}`;

    this.http.get<MonthBudget[]>(this.apiUrl + cacheBuster)
      .subscribe(data => this._data$.next(data));
  }

  // --- CREATE ---
  create(budget: MonthBudget): Observable<MonthBudget> {
    return this.http.post<MonthBudget>(this.apiUrl, budget).pipe(
      tap(() => this.load())
    );
  }

  // --- UPDATE ---
  update(budget: MonthBudget): Observable<any> {
    return this.http.put(this.apiUrl, budget).pipe(
      tap(() => this.load())
    );
  }

  // --- DELETE ---
  delete(budget: MonthBudget): Observable<any> {
    return this.http.delete(this.apiUrl, {
      body: budget
    }).pipe(
      tap(() => this.load())
    );
  }
}