import { Component, inject, OnInit } from '@angular/core';
import { MonthBudgetService } from '../services/month-budget.service';
import { MonthBudget } from '../model/month-budget';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-month-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './month-budget.component.html',
  styleUrl: './month-budget.component.scss'
})
export class MonthBudgetComponent implements OnInit {
  private service = inject(MonthBudgetService);

  // Stream with sorting logic: show latest by date or ID
 budgets$ = this.service.budgets$.pipe(
  map(data =>
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
    remainingBudget: 0,
    remainingFromPreviousMonth: 0
  };

  isEditModalOpen = false;
  selectedBudget: MonthBudget | null = null;

  ngOnInit(): void {
    this.service.load();
  }

  saveBudget() {
    if (this.newBudget.budgetAmount <= 0) return;

    this.service.create(this.newBudget).subscribe({
      next: () => {
        this.newBudget.budgetAmount = 0;
        this.newBudget.remainingFromPreviousMonth = 0;
      },
      error: (err) => console.error('Error:', err)
    });
  }

  getMonthName(month: number): string {
    const months = [
      'იანვარი',
      'თებერვალი',
      'მარტი',
      'აპრილი',
      'მაისი',
      'ივნისი',
      'ივლისი',
      'აგვისტო',
      'სექტემბერი',
      'ოქტომბერი',
      'ნოემბერი',
      'დეკემბერი'
    ];

    return months[month - 1] || '';
  }

  onEdit(budget: MonthBudget) {
    this.selectedBudget = { ...budget };
    this.isEditModalOpen = true;
  }

  closeModal() {
    this.isEditModalOpen = false;
    this.selectedBudget = null;
  }

  updateBudget() {
    if (this.selectedBudget) {
      this.service.update(this.selectedBudget).subscribe({
        next: () => this.closeModal(),
        error: (err) => console.error('Error:', err)
      });
    }
  }

  removeBudget(budget: MonthBudget) {
    if (confirm(`წავშალოთ ბიუჯეტი: თარიღით ${budget.month}/${budget.year} თანხა ${budget.budgetAmount}₾?`)) {
      this.service.delete(budget).subscribe();
    }
  }
}