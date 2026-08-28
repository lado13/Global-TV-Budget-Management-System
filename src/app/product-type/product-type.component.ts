import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductTypeService } from '../services/product-type.service';
import { ProductType } from '../model/product-type';
import { NamedEntityListBase } from '../shared/base/named-entity-list.base';
import { DEFAULT_ICON } from '../shared/constants/app.constants';

@Component({
  selector: 'app-product-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-type.component.html',
  styleUrl: './product-type.component.scss'
})
export class ProductTypeComponent extends NamedEntityListBase<ProductType> {
  protected readonly entityService = inject(ProductTypeService);

  get types$() {
    return this.items$;
  }

  get selectedType() {
    return this.selectedItem;
  }

  newType = { name: '', iconUrl: '' };
  editIconUrl = '';
  isUploadingImage = false;

  private newIconFile: File | null = null;
  private editIconFile: File | null = null;
  private newPreviewObjectUrl: string | null = null;
  private editPreviewObjectUrl: string | null = null;

  protected getDeleteConfirmMessage(item: ProductType): string {
    return `ნამდვილად გინდა წაშალო ${item.name}?`;
  }

  onNewIconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('აირჩიე სურათის ფაილი (jpg, png, webp...)');
      input.value = '';
      return;
    }

    this.revokePreview(this.newPreviewObjectUrl);
    this.newIconFile = file;
    this.newPreviewObjectUrl = URL.createObjectURL(file);
    this.newType.iconUrl = this.newPreviewObjectUrl;
    input.value = '';
  }

  onEditIconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('აირჩიე სურათის ფაილი (jpg, png, webp...)');
      input.value = '';
      return;
    }

    this.revokePreview(this.editPreviewObjectUrl);
    this.editIconFile = file;
    this.editPreviewObjectUrl = URL.createObjectURL(file);
    this.editIconUrl = this.editPreviewObjectUrl;
    input.value = '';
  }

  clearNewIcon(): void {
    this.revokePreview(this.newPreviewObjectUrl);
    this.newPreviewObjectUrl = null;
    this.newIconFile = null;
    this.newType.iconUrl = '';
  }

  clearEditIcon(): void {
    this.revokePreview(this.editPreviewObjectUrl);
    this.editPreviewObjectUrl = null;
    this.editIconFile = null;
    this.editIconUrl = this.selectedItem?.iconUrl ?? '';
  }

  addType(): void {
    const name = this.newType.name.trim();
    if (!name) return;

    this.isUploadingImage = !!this.newIconFile;
    this.entityService.createWithIcon(name, this.newIconFile).subscribe({
      next: () => {
        this.clearNewIcon();
        this.newType = { name: '', iconUrl: '' };
        this.isUploadingImage = false;
      },
      error: (err) => {
        this.isUploadingImage = false;
        console.error('Error adding product type:', err);
        alert('პროდუქტის ტიპის დამატება ვერ მოხერხდა');
      }
    });
  }

  editType(item: ProductType): void {
    this.onEdit(item);
    this.editIconFile = null;
    this.revokePreview(this.editPreviewObjectUrl);
    this.editPreviewObjectUrl = null;
    this.editIconUrl = item.iconUrl ?? '';
  }

  deleteType(item: ProductType): void {
    this.onDelete(item);
  }

  saveTypeEdit(newName: string): void {
    const trimmedName = newName.trim();
    if (!this.selectedItem) {
      this.closeModal();
      return;
    }

    if (!trimmedName) {
      this.closeModal();
      return;
    }

    const existingUrl = this.editIconUrl.startsWith('blob:')
      ? this.selectedItem.iconUrl
      : this.editIconUrl.trim();

    this.isUploadingImage = !!this.editIconFile;
    this.entityService
      .updateWithIcon(this.selectedItem.id, trimmedName, this.editIconFile, existingUrl)
      .subscribe({
        next: () => {
          this.isUploadingImage = false;
          this.closeModal();
        },
        error: (err) => {
          this.isUploadingImage = false;
          console.error('Error updating product type:', err);
        }
      });
  }

  iconSrc(item: ProductType): string {
    return item.iconUrl || DEFAULT_ICON;
  }

  private revokePreview(url: string | null): void {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}
