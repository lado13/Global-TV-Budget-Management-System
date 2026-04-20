import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Optional, but usually needed
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router'; // CRITICAL IMPORTS

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive,
    RouterModule
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  title = 'Global-TV-Budget-Management-System';
}