import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { EnginnerService } from '../services/enginner.service';
import { Enginner } from '../model/enginner';

@Component({
  selector: 'app-enginner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './enginner.component.html',
  styleUrl: './enginner.component.scss'
})
export class EnginnerComponent implements OnInit {
  private service = inject(EnginnerService);

  engineers$ = this.service.engineers$.pipe(
    map(data => {
      if (!data) return [];


      return [...data].reverse();
    })
  );

  isEditModalOpen = false;
  selectedEngineer: Enginner | null = null;

  ngOnInit(): void {
    this.service.getAll();
  }

  addNew(nameInput: HTMLInputElement) {
    const name = nameInput.value.trim();
    if (!name) return;

    this.service.create(name).subscribe({
      next: () => {
        nameInput.value = '';

      },
      error: (err) => console.error('Error:', err)
    });
  }

  remove(eng: Enginner) {
    if (confirm(`წავშალოთ ${eng.name}?`)) {
      this.service.delete(eng.id, eng.name).subscribe();
    }
  }

  edit(eng: Enginner) {
    this.selectedEngineer = { ...eng };
    this.isEditModalOpen = true;
  }

  closeModal() {
    this.isEditModalOpen = false;
    this.selectedEngineer = null;
  }

  saveEdit(newName: string) {
    const trimmedName = newName.trim();
    if (this.selectedEngineer && trimmedName && trimmedName !== this.selectedEngineer.name) {
      this.service.update(this.selectedEngineer.id, trimmedName).subscribe({
        next: () => this.closeModal(),
        error: (err) => console.error('Error:', err)
      });
    } else {
      this.closeModal();
    }
  }




}