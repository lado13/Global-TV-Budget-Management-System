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
    map(data => data ? [...data].sort((a, b) => {
      // Sort by createAt if available, otherwise fallback to id
      const dateA = a.createAt ? new Date(a.createAt).getTime() : a.id || 0;
      const dateB = b.createAt ? new Date(b.createAt).getTime() : b.id || 0;
      return dateB - dateA;
    }) : [])
  );

  newBudget: MonthBudget = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    budgetAmount: 0,
    remainingFromPreviousMonth: 0
  };

  isEditModalOpen = false;
  selectedBudget: MonthBudget | null = null;

  ngOnInit(): void {
    this.service.getAll();
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