/** Matches MonthBudgetDto from Global.Budget.Ge API. */
export interface MonthBudget {
  id?: number;
  month: number;
  year: number;
  budgetAmount: number;
  remainingFromPreviousMonth: number;
  spentAmount?: number;
  remainingAmount?: number;
  /** Legacy alias still used by older UI code. */
  remainingBudget?: number;
  createAt?: string | Date;
  updateAt?: string | Date;
}
