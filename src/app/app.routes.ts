import { Routes } from '@angular/router';
import { EnginnerComponent } from './enginner/enginner.component';
import { MerchantComponent } from './merchant/merchant.component';
import { MonthBudgetComponent } from './month-budget/month-budget.component';
import { ProductTypeComponent } from './product-type/product-type.component';
import { PurchaseHistoryComponent } from './purchase-history/purchase-history.component';
import { MainComponent } from './main/main.component';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        children: [
            { path: 'enginner', component: EnginnerComponent },
            { path: 'merchant', component: MerchantComponent },
            { path: 'budget', component: MonthBudgetComponent },
            { path: 'product-type', component: ProductTypeComponent },
            { path: 'Purchase', component: PurchaseHistoryComponent },
            { path: '', redirectTo: 'Purchase', pathMatch: 'full' }
        ]
    }
];