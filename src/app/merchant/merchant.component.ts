import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MerchantService } from '../services/merchant.service';
import { Merchant } from '../model/merchant';
import { NamedEntityListBase } from '../shared/base/named-entity-list.base';
import { DEFAULT_ICON } from '../shared/constants/app.constants';
import { TranslatePipe } from '../shared/i18n/translate.pipe';
import { LanguageService } from '../shared/i18n/language.service';

@Component({
  selector: 'app-merchant',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './merchant.component.html',
  styleUrl: './merchant.component.scss'
})
export class MerchantComponent extends NamedEntityListBase<Merchant> {
  protected readonly entityService = inject(MerchantService);
  private readonly lang = inject(LanguageService);

  get merchants$() {
    return this.items$;
  }

  get selectedMerchant() {
    return this.selectedItem;
  }

  newMerchant = { name: '', iconUrl: '' };
  editIconUrl = '';
  isUploadingImage = false;

  private newIconFile: File | null = null;
  private editIconFile: File | null = null;
  private newPreviewObjectUrl: string | null = null;
  private editPreviewObjectUrl: string | null = null;

  protected getDeleteConfirmMessage(m: Merchant): string {
    return this.lang.t('merchant.confirmDelete', { name: m.name });
  }

  protected override resetCreateForm(): void {
    this.clearNewIcon();
    this.newMerchant = { name: '', iconUrl: '' };
    this.isUploadingImage = false;
  }

  onNewIconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(this.lang.t('common.pickImageFile'));
      input.value = '';
      return;
    }

    this.revokePreview(this.newPreviewObjectUrl);
    this.newIconFile = file;
    this.newPreviewObjectUrl = URL.createObjectURL(file);
    this.newMerchant.iconUrl = this.newPreviewObjectUrl;
    input.value = '';
  }

  onEditIconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(this.lang.t('common.pickImageFile'));
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
    this.newMerchant.iconUrl = '';
  }

  clearEditIcon(): void {
    this.revokePreview(this.editPreviewObjectUrl);
    this.editPreviewObjectUrl = null;
    this.editIconFile = null;
    this.editIconUrl = this.selectedItem?.iconUrl ?? '';
  }

  addMerchant(): void {
    const name = this.newMerchant.name.trim();
    if (!name) return;

    this.isUploadingImage = !!this.newIconFile;
    this.entityService.createWithIcon(name, this.newIconFile).subscribe({
      next: () => {
        this.clearNewIcon();
        this.newMerchant = { name: '', iconUrl: '' };
        this.isUploadingImage = false;
        this.closeCreateModal();
      },
      error: (err) => {
        this.isUploadingImage = false;
        console.error('Error adding merchant:', err);
        alert(this.lang.t('merchant.addFailed'));
      }
    });
  }

  override onEdit(m: Merchant): void {
    super.onEdit(m);
    this.editIconFile = null;
    this.revokePreview(this.editPreviewObjectUrl);
    this.editPreviewObjectUrl = null;
    this.editIconUrl = m.iconUrl ?? '';
  }

  saveMerchantEdit(newName: string): void {
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
          console.error('Error updating merchant:', err);
        }
      });
  }

  iconSrc(m: Merchant): string {
    return m.iconUrl || DEFAULT_ICON;
  }

  private revokePreview(url: string | null): void {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}
