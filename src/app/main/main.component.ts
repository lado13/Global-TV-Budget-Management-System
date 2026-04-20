import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  accessModal = false;
  targetRoute: string = '';
  passwordInput: string = '';

  constructor(private router: Router) { }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  openAccessModal(route: string) {
    this.closeMenu();
    this.targetRoute = route;
    this.passwordInput = '';
    this.accessModal = true;
  }

  closeAccessModal() {
    this.accessModal = false;
  }

  confirmAccess() {
    if (this.passwordInput === '123') {
      this.accessModal = false;
      this.router.navigate([this.targetRoute]);
    } else {
      alert('პაროლი არასწორია!');
    }
  }
}