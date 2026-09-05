import { Component, inject, OnInit } from '@angular/core';
import { MonthBudgetService } from '../services/month-budget.service';
import { MonthBudget } from '../model/month-budget';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { TranslatePipe } from '../shared/i18n/translate.pipe';
import { LanguageService } from '../shared/i18n/language.service';

@Component({
  selector: 'app-month-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './month-budget.component.html',
  styleUrl: './month-budget.component.scss'
})
export class MonthBudgetComponent implements OnInit {
  private service = inject(MonthBudgetService);
  private readonly lang = inject(LanguageService);

  budgets$ = this.service.budgets$.pipe(
    map((data) =>
      [...data].sort((a, b) => {
        const aValue = a.year * 12 + a.month;
        const bValue = b.year * 12 + b.month;
        return bValue - aValue;
      })
    )
  );

  newBudget: MonthBudget = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    budgetAmount: 0,
    remainingFromPreviousMonth: 0,
    spentAmount: 0,
    remainingAmount: 0,
    remainingBudget: 0
  };

  isEditModalOpen = false;
  isCreateModalOpen = false;
  selectedBudget: MonthBudget | null = null;

  ngOnInit(): void {
    this.service.loadIfEmpty();
  }

  openCreateModal(): void {
    this.newBudget = {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      budgetAmount: 0,
      remainingFromPreviousMonth: 0,
      spentAmount: 0,
      remainingAmount: 0,
      remainingBudget: 0
    };
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  saveBudget(): void {
    if (this.newBudget.budgetAmount <= 0) return;

    this.service.create(this.newBudget).subscribe({
      next: () => {
        this.closeCreateModal();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  monthLabel(month: number): string {
    return this.lang.monthName(month);
  }

  onEdit(budget: MonthBudget): void {
    this.selectedBudget = { ...budget };
    this.isEditModalOpen = true;
  }

  closeModal(): void {
    this.isEditModalOpen = false;
    this.selectedBudget = null;
  }

  updateBudget(): void {
    if (!this.selectedBudget) return;

    this.service.update(this.selectedBudget).subscribe({
      next: () => this.closeModal(),
      error: (err) => console.error('Error:', err)
    });
  }

  removeBudget(budget: MonthBudget): void {
    if (
      confirm(
        this.lang.t('budget.confirmDelete', {
          month: budget.month,
          year: budget.year,
          amount: budget.budgetAmount
        })
      )
    ) {
      this.service.delete(budget).subscribe();
    }
  }
}
