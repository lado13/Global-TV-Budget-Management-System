import { Directive, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { NamedEntity } from '../models/named-entity';
import { NamedEntityService } from '../services/named-entity.service';

/**
 * Shared list + modal CRUD behavior for name-based entity screens.
 * Feature components extend this and only customize labels / extras.
 */
@Directive()
export abstract class NamedEntityListBase<T extends NamedEntity> implements OnInit {
  protected abstract readonly entityService: NamedEntityService<T>;

  items$!: Observable<T[]>;
  isEditModalOpen = false;
  isCreateModalOpen = false;
  selectedItem: T | null = null;

  ngOnInit(): void {
    this.items$ = this.entityService.data$.pipe(
      map((data) => (data ? [...data].reverse() : []))
    );
    this.entityService.load();
    this.onInitExtra();
  }

  /** Hook for feature-specific init (e. g. engineer profiles). */
  protected onInitExtra(): void {}

  protected abstract getDeleteConfirmMessage(item: T): string;

  /** Override to reset feature create form state. */
  protected resetCreateForm(): void {}

  openCreateModal(): void {
    this.resetCreateForm();
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.resetCreateForm();
  }

  onAdd(nameInput: HTMLInputElement): void {
    const name = nameInput.value.trim();
    if (!name) return;

    this.entityService.create(name).subscribe({
      next: () => {
        nameInput.value = '';
        this.closeCreateModal();
      },
      error: (err) => console.error('Error creating item:', err)
    });
  }

  onEdit(item: T): void {
    this.selectedItem = { ...item };
    this.isEditModalOpen = true;
  }

  closeModal(): void {
    this.isEditModalOpen = false;
    this.selectedItem = null;
  }

  saveEdit(newName: string): void {
    const trimmedName = newName.trim();

    if (this.selectedItem && trimmedName && trimmedName !== this.selectedItem.name) {
      this.entityService.update(this.selectedItem.id, trimmedName).subscribe({
        next: () => this.closeModal(),
        error: (err) => console.error('Error updating item:', err)
      });
    } else {
      this.closeModal();
    }
  }

  onDelete(item: T): void {
    if (!confirm(this.getDeleteConfirmMessage(item))) return;

    this.entityService.delete(item.id, item.name).subscribe({
      error: (err) => console.error('Error deleting item:', err)
    });
  }
}
