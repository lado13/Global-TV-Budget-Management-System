import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';

/**
 * Lazy-loaded feature routes — keeps the initial bundle smaller
 * and makes adding new screens a one-line config change.
 */
export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'enginner',
        loadComponent: () =>
          import('./enginner/enginner.component').then((m) => m.EnginnerComponent)
      },
      {
        path: 'merchant',
        loadComponent: () =>
          import('./merchant/merchant.component').then((m) => m.MerchantComponent)
      },
      {
        path: 'budget',
        loadComponent: () =>
          import('./month-budget/month-budget.component').then((m) => m.MonthBudgetComponent)
      },
      {
        path: 'product-type',
        loadComponent: () =>
          import('./product-type/product-type.component').then((m) => m.ProductTypeComponent)
      },
      {
        path: 'Purchase',
        loadComponent: () =>
          import('./purchase-history/purchase-history.component').then(
            (m) => m.PurchaseHistoryComponent
          )
      },
      { path: '', redirectTo: 'Purchase', pathMatch: 'full' }
    ]
  }
];
