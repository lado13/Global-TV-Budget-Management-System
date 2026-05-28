import { Component, inject, OnInit } from '@angular/core';
import { MerchantService } from '../services/merchant.service';
import { Merchant } from '../model/merchant';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators'; // Required for stream transformation

@Component({
  selector: 'app-merchant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './merchant.component.html',
  styleUrl: './merchant.component.scss'
})
export class MerchantComponent implements OnInit {

  private service = inject(MerchantService);

  // Transform the stream to reverse the order (latest added on top)
  merchants$ = this.service.merchants$.pipe(
    map(data => data ? [...data].reverse() : [])
  );

  isEditModalOpen = false;
  selectedMerchant: Merchant | null = null;

  ngOnInit(): void {
    // Initial data load
    this.service.load();
  }

  // Handle adding a new merchant
  onAdd(nameInput: HTMLInputElement) {
    const name = nameInput.value.trim();
    if (!name) return;

    this.service.create(name).subscribe({
      next: () => {
        nameInput.value = ''; // Reset input on success
      },
      error: (err) => console.error('Error adding merchant:', err)
    });
  }

  // Open modal for editing
  onEdit(m: Merchant) {
    // Create a shallow copy to avoid direct binding mutation
    this.selectedMerchant = { ...m };
    this.isEditModalOpen = true;
  }

  // Close the edit modal
  closeModal() {
    this.isEditModalOpen = false;
    this.selectedMerchant = null;
  }

  // Save edited merchant details
  saveEdit(newName: string) {
    const trimmedName = newName.trim();

    if (this.selectedMerchant && trimmedName && trimmedName !== this.selectedMerchant.name) {
      this.service.update(this.selectedMerchant.id, trimmedName).subscribe({
        next: () => {
          this.closeModal();
        },
        error: (err) => console.error('Error updating merchant:', err)
      });
    } else {
      this.closeModal();
    }
  }

  // Delete a merchant with confirmation
  onDelete(m: Merchant) {
    if (confirm(`ნამდვილად გინდა წაშლო ${m.name}?`)) {
      this.service.delete(m.id, m.name).subscribe({
        error: (err) => console.error('Error deleting merchant:', err)
      });
    }
  }
}