import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../shared/i18n/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly router = inject(Router);

  goAddPurchase(): void {
    this.router.navigate(['/Purchase'], { queryParams: { add: '1' } });
  }

  goPurchaseHistory(): void {
    this.router.navigate(['/Purchase']);
  }
}
