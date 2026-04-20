import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthBudgetComponent } from './month-budget.component';

describe('MonthBudgetComponent', () => {
  let component: MonthBudgetComponent;
  let fixture: ComponentFixture<MonthBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthBudgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonthBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
