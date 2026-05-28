import { Component, inject, OnInit } from '@angular/core';
import { ProductTypeService } from '../services/product-type.service';
import { ProductType } from '../model/product-type';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators'; // Required for reversing the stream

@Component({
  selector: 'app-product-type',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-type.component.html',
  styleUrl: './product-type.component.scss'
})
export class ProductTypeComponent implements OnInit {
  private service = inject(ProductTypeService);

  // Reversing the array to show the latest added types at the top
  types$ = this.service.productTypes$.pipe(
    map(data => data ? [...data].reverse() : [])
  );

  // Modal control variables
  isEditModalOpen = false;
  selectedType: ProductType | null = null;

  ngOnInit(): void {
    // Initial fetch of product types
    this.service.load();
  }

  // Handle adding a new product type
  addType(input: HTMLInputElement) {
    const value = input.value.trim();
    if (!value) return;

    this.service.create(value).subscribe({
      next: () => {
        input.value = ''; // Clear input on success
      },
      error: (err) => console.error('Error adding product type:', err)
    });
  }

  // Open the edit modal and set the selected item
  editType(item: ProductType) {
    // Create a copy to prevent direct mutation before saving
    this.selectedType = { ...item };
    this.isEditModalOpen = true;
  }

  // Close modal and reset selection
  closeModal() {
    this.isEditModalOpen = false;
    this.selectedType = null;
  }

  // Save changes to the product type name
  saveEdit(newName: string) {
    const trimmedName = newName.trim();

    if (this.selectedType && trimmedName && trimmedName !== this.selectedType.name) {
      this.service.update(this.selectedType.id, trimmedName).subscribe({
        next: () => {
          this.closeModal();
        },
        error: (err) => console.error('Error updating product type:', err)
      });
    } else {
      this.closeModal();
    }
  }

  // Delete product type with a confirmation prompt
  deleteType(item: ProductType) {
    if (confirm(`ნამდვილად გინდა წაშალო ${item.name}?`)) {
      this.service.delete(item.id, item.name).subscribe({
        error: (err) => console.error('Error deleting product type:', err)
      });
    }
  }
}