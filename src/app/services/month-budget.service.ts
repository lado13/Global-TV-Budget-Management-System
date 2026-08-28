import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { MonthBudget } from '../model/month-budget';
import { BaseStoreService } from '../shared/services/base-store.service';

@Injectable({
  providedIn: 'root'
})
export class MonthBudgetService extends BaseStoreService<MonthBudget> {
  protected readonly apiUrl = environment.MonthBudgetApi;

  /** Backward-compatible alias used by existing templates/components. */
  readonly budgets$ = this.data$;

  constructor() {
    super();
    this.load();
  }

  create(budget: MonthBudget): Observable<MonthBudget> {
    return this.refreshAfter(this.http.post<MonthBudget>(this.apiUrl, budget));
  }

  update(budget: MonthBudget): Observable<unknown> {
    return this.refreshAfter(this.http.put(this.apiUrl, budget));
  }

  delete(budget: MonthBudget): Observable<unknown> {
    return this.refreshAfter(this.http.delete(this.apiUrl, { body: budget }));
  }
}
