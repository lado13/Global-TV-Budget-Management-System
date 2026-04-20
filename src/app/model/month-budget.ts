

export interface MonthBudget {
    id?: number;                         // Primary Key (Optional for new records)
    month: number;                       // Month number (e.g., 4 for April)
    year: number;                        // Year (e.g., 2026)
    budgetAmount: number;                // Total budget for the month
    remainingFromPreviousMonth: number;  // Carry-over amount
    createAt?: string | Date;            // Record creation timestamp
    updateAt?: string | Date;            // Record last update timestamp
}