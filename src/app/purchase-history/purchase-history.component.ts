import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PurchaseHistoryService } from '../services/purchase-history.service';
import { FileService } from '../services/file.service';

import { PurchaseHistory, Attachment } from '../model/purchase-history';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.scss']
})
export class PurchaseHistoryComponent implements OnInit {

  form!: FormGroup;

  purchases: PurchaseHistory[] = [];
  engineers: any[] = [];
  merchants: any[] = [];
  productTypes: any[] = [];
  files: Attachment[] = [];
  selectedPurchase: PurchaseHistory | null = null;
  isModalOpen = false;
  isFormModalOpen = false;

  tempFiles: File[] = [];
  searchTerm: string = '';

  // ================= PAGINATION =================
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private purchaseService: PurchaseHistoryService,
    private fileService: FileService
  ) { }

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

    this.fileService.files$.subscribe(res => {
      this.files = res ?? [];
    });
  }

  get filteredPurchases(): PurchaseHistory[] {
    if (!this.searchTerm) return this.purchases;

    const term = this.searchTerm.toLowerCase();

    return this.purchases.filter(p => {
      const buyer = this.getBuyerName(p.buyerId).toLowerCase();
      const merchant = this.getMerchantName(p.merchantId).toLowerCase();
      const amount = p.amount?.toString() || '';

      return (
        buyer.includes(term) ||
        merchant.includes(term) ||
        amount.includes(term)
      );
    });
  }

  // ================= PAGINATED DATA =================
  // get pagedPurchases(): PurchaseHistory[] {
  //   const start = (this.currentPage - 1) * this.pageSize;
  //   return this.purchases.slice(start, start + this.pageSize);
  // }
  get pagedPurchases(): PurchaseHistory[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPurchases.slice(start, start + this.pageSize);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPurchases.length / this.pageSize);
    this.currentPage = 1;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ================= NAME HELPERS =================

  getBuyerName(id: number): string {
    const user = this.engineers.find(x => x.id === id);
    return user ? (user.name || user.fullName) : 'Unknown';
  }

  getMerchantName(id: number): string {
    const m = this.merchants.find(x => x.id === id);
    return m ? m.name : 'Unknown';
  }

  getProductTypeName(id: number): string {
    const p = this.productTypes.find(x => x.id === id);
    return p ? p.name : 'Unknown';
  }

  // ================= LOAD =================

  loadAll(): void {

    this.purchaseService.load();

    this.purchaseService.data$.subscribe(res => {
      if (res) {

        const sorted = [...res].sort((a, b) => b.id - a.id);

        this.purchases = sorted;

        // this.totalPages = Math.ceil(this.purchases.length / this.pageSize);
        this.totalPages = Math.ceil(this.filteredPurchases.length / this.pageSize);
        this.currentPage = 1;

      } else {
        this.purchases = [];
        this.totalPages = 0;
      }
    });

    this.http.get<any[]>(environment.EnginnerApi)
      .subscribe(res => this.engineers = res ?? []);

    this.http.get<any[]>(environment.MerchantApi)
      .subscribe(res => this.merchants = res ?? []);

    this.http.get<any[]>(environment.ProductTypeApi)
      .subscribe(res => this.productTypes = res ?? []);
  }

  // ================= BASE64 =================

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve((reader.result as string).split(',')[1]);
      };

      reader.onerror = err => reject(err);
    });
  }

  async save(): Promise<void> {

    if (this.isSaving) return; 
    this.isSaving = true;

    try {

      const attachments = await Promise.all(
        this.tempFiles.map(async f => ({
          id: 0,
          fileName: f.name,
          fileType: f.type,
          content: await this.convertToBase64(f),
          purchaseHistoryId: 0
        }))
      );

      const payload = { ...this.form.value, attachemnts: attachments };

      const request = payload.id
        ? this.purchaseService.update(payload)
        : this.purchaseService.add(payload);

      request.subscribe({
        next: () => {
          this.loadAll();
          this.closeFormModal();
        },
        error: err => console.error('Error:', err),
        complete: () => {
          this.isSaving = false;
        }
      });

    } catch (e) {
      console.error(e);
      this.isSaving = false;
    }
  }

  // ================= DELETE =================

  delete(p: PurchaseHistory): void {
    const confirmDelete = confirm('მართლა გინდა ამ შესყიდვის წაშლა?');
    if (!confirmDelete) return;

    this.purchaseService.delete(p).subscribe(() => {
      this.loadAll();
    });
  }

  // ================= FILES =================

  onCreateFileSelect(event: any): void {
    const files: FileList = event.target.files;
    this.tempFiles = files ? Array.from(files) : [];
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

    const confirmDelete = confirm('ნამდვილად გინდა ამ ქვითრის წაშლა?');
    if (!confirmDelete) return;

    this.fileService.delete(file.id, this.selectedPurchase.id)
      .subscribe({
        next: () => {
          this.fileService.loadFiles(this.selectedPurchase!.id);
        },
        error: (err: any) => console.error(err)
      });
  }

  getImage(file: Attachment): string {
    if (!file) return '';

    if (file.content) {
      return `data:${file.fileType};base64,${file.content}`;
    }

    return `http://192.168.1.102:1121/api/FileControllers/file/download/${file.id}`;
  }

  isImage(file: Attachment): boolean {
    return !!file?.fileType?.includes('image');
  }

  // ================= MODALS =================

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
}