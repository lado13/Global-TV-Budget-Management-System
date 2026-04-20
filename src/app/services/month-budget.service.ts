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

  private budgetSubject = new BehaviorSubject<MonthBudget[]>([]);
  public budgets$ = this.budgetSubject.asObservable();

  getAll(): void {
    this.http.get<MonthBudget[]>(this.apiUrl).subscribe(data => {
      this.budgetSubject.next(data);
    });
  }

  create(budget: MonthBudget): Observable<MonthBudget> {
    return this.http.post<MonthBudget>(this.apiUrl, budget).pipe(
      tap(() => this.getAll())
    );
  }

  update(budget: MonthBudget): Observable<any> {
    return this.http.put(this.apiUrl, budget).pipe(
      tap(() => this.getAll())
    );
  }

  delete(budget: MonthBudget): Observable<any> {
    // Swagger shows DELETE takes the full object in the body
    const options = { body: budget };
    return this.http.delete(this.apiUrl, options).pipe(
      tap(() => this.getAll())
    );
  }
}
