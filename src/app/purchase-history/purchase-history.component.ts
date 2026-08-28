import { Component, OnDestroy, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PurchaseHistoryService } from '../services/purchase-history.service';
import { FileService } from '../services/file.service';
import { EnginnerService } from '../services/enginner.service';
import { MerchantService } from '../services/merchant.service';
import { ProductTypeService } from '../services/product-type.service';

import { PurchaseHistory, Attachment } from '../model/purchase-history';
import { Enginner } from '../model/enginner';
import { EngineerProfile } from '../model/engineer-profile';
import { Merchant } from '../model/merchant';
import { ProductType } from '../model/product-type';
import { environment } from '../../environment/environment';
import {
  DEFAULT_AVATAR,
  DEFAULT_ICON,
  DEFAULT_PAGE_SIZE
} from '../shared/constants/app.constants';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.scss']
})
export class PurchaseHistoryComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly purchaseService = inject(PurchaseHistoryService);
  private readonly fileService = inject(FileService);
  private readonly enginnerService = inject(EnginnerService);
  private readonly merchantService = inject(MerchantService);
  private readonly productTypeService = inject(ProductTypeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly subscriptions = new Subscription();

  form!: FormGroup;

  purchases: PurchaseHistory[] = [];
  engineers: Enginner[] = [];
  merchants: Merchant[] = [];
  productTypes: ProductType[] = [];
  files: Attachment[] = [];
  profiles: EngineerProfile[] = [];

  selectedPurchase: PurchaseHistory | null = null;
  isModalOpen = false;
  isFormModalOpen = false;

  tempFiles: File[] = [];
  searchTerm = '';

  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  totalPages = 0;

  isSaving = false;
  previewImageUrl: string | null = null;

  /** Check file image URL by purchase id (list column). */
  checkThumbById: Record<number, string> = {};
  private readonly thumbLoading = new Set<number>();
  private readonly thumbDone = new Set<number>();

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [0],
      purchaseDate: ['', Validators.required],
      merchantId: [null, Validators.required],
      buyerId: [null, Validators.required],
      porductTypeId: [null, Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      checkIsThere: [false],
      additionalComment: ['']
    });

    this.loadAll();

    this.subscriptions.add(
      this.fileService.files$.subscribe((res) => {
        this.files = res ?? [];
      })
    );

    this.subscriptions.add(
      this.enginnerService.engineerProfiles$.subscribe((res) => {
        this.profiles = res ?? [];
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openImagePreview(file: Attachment): void {
    const url = this.getImage(file);
    if (url && this.isImage(file)) {
      this.previewImageUrl = url;
    }
  }

  openProfilePreview(buyerId: number): void {
    const url = this.getProfileImage(buyerId);
    if (url) {
      this.previewImageUrl = url;
    }
  }

  openCheckPreview(purchaseId: number): void {
    const url = this.checkThumbById[purchaseId];
    if (url) {
      this.previewImageUrl = url;
    }
  }

  closeImagePreview(): void {
    this.previewImageUrl = null;
  }

  get filteredPurchases(): PurchaseHistory[] {
    if (!this.searchTerm) return this.purchases;

    const term = this.searchTerm.toLowerCase();

    return this.purchases.filter((p) => {
      const buyer = this.getBuyerName(p.buyerId, p).toLowerCase();
      const merchant = this.getMerchantName(p.merchantId, p).toLowerCase();
      const amount = p.amount?.toString() || '';

      return buyer.includes(term) || merchant.includes(term) || amount.includes(term);
    });
  }

  get pagedPurchases(): PurchaseHistory[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPurchases.slice(start, start + this.pageSize);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPurchases.length / this.pageSize);
    this.currentPage = 1;
    this.scheduleLoadCheckThumbs();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.scheduleLoadCheckThumbs();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.scheduleLoadCheckThumbs();
    }
  }

  getBuyerName(id: number, purchase?: PurchaseHistory): string {
    if (purchase?.buyerName) return purchase.buyerName;
    const user = this.engineers.find((x) => x.id === id);
    return user?.name || 'Unknown';
  }

  getMerchantName(id: number, purchase?: PurchaseHistory): string {
    if (purchase?.merchantName) return purchase.merchantName;
    return this.merchantService.getName(id);
  }

  getProductTypeName(id: number, purchase?: PurchaseHistory): string {
    if (purchase?.productTypeName) return purchase.productTypeName;
    return this.productTypeService.getName(id);
  }

  loadAll(): void {
    this.purchaseService.load();
    this.enginnerService.load();
    this.enginnerService.loadProfiles();
    this.merchantService.load();
    this.productTypeService.load();

    this.subscriptions.add(
      this.purchaseService.data$.subscribe((res) => {
        if (res) {
          const sorted = [...res].sort((a, b) => {
            const dateA = a.purchaseDate ? Date.parse(a.purchaseDate) : 0;
            const dateB = b.purchaseDate ? Date.parse(b.purchaseDate) : 0;
            return dateB - dateA;
          });

          this.purchases = sorted;
          this.totalPages = Math.ceil(this.filteredPurchases.length / this.pageSize);
          this.currentPage = 1;
          this.scheduleLoadCheckThumbs();
        } else {
          this.purchases = [];
          this.totalPages = 0;
        }
      })
    );

    this.subscriptions.add(
      this.enginnerService.engineers$.subscribe((res) => {
        this.engineers = res ?? [];
      })
    );

    this.subscriptions.add(
      this.merchantService.merchants$.subscribe((res) => {
        this.merchants = res ?? [];
      })
    );

    this.subscriptions.add(
      this.productTypeService.productTypes$.subscribe((res) => {
        this.productTypes = res ?? [];
      })
    );
  }

  async save(): Promise<void> {
    if (this.isSaving) return;
    this.isSaving = true;

    try {
      const formValue = this.form.value;
      const isEdit = !!formValue.id && formValue.id !== 0;

      const payload: PurchaseHistory = {
        ...formValue,
        buyerName: this.getBuyerName(formValue.buyerId),
        merchantName: this.getMerchantName(formValue.merchantId),
        productTypeName: this.getProductTypeName(formValue.porductTypeId)
      };

      const request = isEdit
        ? this.purchaseService.update(payload)
        : this.purchaseService.add(payload);

      request.subscribe({
        next: (response: any) => {
          let purchaseId: number | null = null;

          if (isEdit) {
            purchaseId = formValue.id;
          } else if (typeof response === 'number') {
            purchaseId = response;
          } else if (response && typeof response === 'object') {
            purchaseId = response.id || response.purchaseHistoryId || response.Id || null;
          }

          if (this.tempFiles.length > 0 && purchaseId) {
            const id = purchaseId;
            this.fileService.upload(id, this.tempFiles).subscribe({
              next: () => {
                this.thumbDone.delete(id);
                this.thumbLoading.delete(id);
                delete this.checkThumbById[id];
                this.loadCheckThumb(id);
              },
              error: (err) => console.error('Failed to upload files', err)
            });
            this.tempFiles = [];
          }

          this.purchaseService.load();
          this.closeFormModal();
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Error saving purchase:', err);
          this.isSaving = false;
        }
      });
    } catch (e) {
      console.error(e);
      this.isSaving = false;
    }
  }

  delete(p: PurchaseHistory): void {
    if (!confirm('მართლა გინდა ამ შესყიდვის წაშლა?')) return;

    this.purchaseService.delete(p).subscribe();
  }

  onCreateFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.tempFiles = input.files ? Array.from(input.files) : [];
  }

  openDetails(p: PurchaseHistory): void {
    this.selectedPurchase = p;
    this.isModalOpen = true;
    this.fileService.loadFiles(p.id);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedPurchase = null;
    this.files = [];
    this.tempFiles = [];
  }

  download(file: Attachment): void {
    this.fileService.download(file.id, file.fileName);
  }

  deleteFile(file: Attachment): void {
    if (!this.selectedPurchase) return;
    if (!confirm('ნამდვილად გინდა ამ ქვითრის წაშლა?')) return;

    const purchaseId = this.selectedPurchase.id;

    this.fileService.delete(file.id, purchaseId).subscribe({
      next: () => {
        this.fileService.loadFiles(purchaseId);
        this.thumbDone.delete(purchaseId);
        this.thumbLoading.delete(purchaseId);
        delete this.checkThumbById[purchaseId];
        this.loadCheckThumb(purchaseId);
      },
      error: (err) => console.error(err)
    });
  }

  getImage(file: Attachment): string {
    if (!file) return '';

    if (file.content) {
      return `data:${file.fileType};base64,${file.content}`;
    }

    return environment.fileDownloadUrl(file.id);
  }

  isImage(file: Attachment): boolean {
    return !!file?.fileType?.includes('image');
  }

  openCreateModal(): void {
    this.form.reset({
      id: 0,
      purchaseDate: '',
      merchantId: null,
      buyerId: null,
      porductTypeId: null,
      amount: 0,
      checkIsThere: false,
      additionalComment: ''
    });

    this.tempFiles = [];
    this.isFormModalOpen = true;
  }

  edit(p: PurchaseHistory): void {
    this.form.patchValue(p);
    this.tempFiles = [];
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
  }

  getMerchantIcon(id: number): string {
    return this.merchants.find((x) => x.id === id)?.iconUrl || DEFAULT_ICON;
  }

  getProductTypeIcon(id: number): string {
    return this.productTypes.find((x) => x.id === id)?.iconUrl || DEFAULT_ICON;
  }

  getProfileImage(buyerId: number): string {
    const profile = this.profiles.find((p) => p.engineerId === buyerId);
    return profile?.imageUrl || DEFAULT_AVATAR;
  }

  /** Defer so SSR / first paint are not blocked. */
  private scheduleLoadCheckThumbs(): void {
    if (!this.isBrowser) return;
    setTimeout(() => this.loadCheckThumbsForPage(), 0);
  }

  private loadCheckThumbsForPage(): void {
    if (!this.isBrowser) return;

    for (const p of this.pagedPurchases) {
      if (p.checkIsThere) {
        this.loadCheckThumb(p.id);
      }
    }
  }

  private loadCheckThumb(purchaseId: number): void {
    if (!this.isBrowser) return;
    if (this.thumbDone.has(purchaseId) || this.thumbLoading.has(purchaseId)) return;

    this.thumbLoading.add(purchaseId);

    this.subscriptions.add(
      this.fileService.getFiles(purchaseId).subscribe({
        next: (files) => {
          const image = (files ?? []).find((f) => f.fileType?.includes('image'));
          if (image) {
            this.checkThumbById = {
              ...this.checkThumbById,
              [purchaseId]: this.getImage(image)
            };
            this.cdr.markForCheck();
          }
          this.thumbDone.add(purchaseId);
          this.thumbLoading.delete(purchaseId);
        },
        error: () => {
          this.thumbDone.add(purchaseId);
          this.thumbLoading.delete(purchaseId);
        }
      })
    );
  }
}
