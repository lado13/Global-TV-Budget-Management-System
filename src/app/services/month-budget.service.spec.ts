import { TestBed } from '@angular/core/testing';

import { MonthBudgetService } from './month-budget.service';

describe('MonthBudgetService', () => {
  let service: MonthBudgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthBudgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
