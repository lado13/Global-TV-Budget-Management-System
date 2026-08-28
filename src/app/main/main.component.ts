import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ACCESS_PASSWORD, NAV_ITEMS, NavItem } from '../shared/config/nav.config';
import { LanguageService } from '../shared/i18n/language.service';
import { TranslatePipe } from '../shared/i18n/translate.pipe';
import { AppLang } from '../shared/i18n/translations';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    FormsModule,
    TranslatePipe
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

  readonly langService = inject(LanguageService);
  private readonly router = inject(Router);

  setLang(lang: AppLang): void {
    this.langService.setLang(lang);
  }

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
      alert(this.langService.t('access.wrongPassword'));
    }
  }
}
