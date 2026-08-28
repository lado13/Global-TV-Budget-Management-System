import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ACCESS_PASSWORD, NAV_ITEMS, NavItem } from '../shared/config/nav.config';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    FormsModule
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  title = 'Global-TV-Budget-Management-System';
  isMenuOpen = false;
  readonly navItems: NavItem[] = NAV_ITEMS;

  accessModal = false;
  targetRoute = '';
  passwordInput = '';

  constructor(private router: Router) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onNavClick(item: NavItem, event?: Event): void {
    if (item.requiresAccess) {
      event?.preventDefault();
      this.openAccessModal(item.path);
      return;
    }
    this.closeMenu();
  }

  openAccessModal(route: string): void {
    this.closeMenu();
    this.targetRoute = route;
    this.passwordInput = '';
    this.accessModal = true;
  }

  closeAccessModal(): void {
    this.accessModal = false;
  }

  confirmAccess(): void {
    if (this.passwordInput === ACCESS_PASSWORD) {
      this.accessModal = false;
      this.router.navigate([this.targetRoute]);
    } else {
      alert('პაროლი არასწორია!');
    }
  }
}
