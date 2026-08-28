import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
import { Attachment } from '../model/attachment';
import { environment } from '../../environment/environment';

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly api = environment.FileApi;
  private readonly mediaPurchaseId = environment.mediaPurchaseId;

  private readonly _files$ = new BehaviorSubject<Attachment[]>([]);
  readonly files$ = this._files$.asObservable();

  constructor(private http: HttpClient) {}

  loadFiles(purchaseId: number): void {
    this.getFiles(purchaseId).subscribe({
      next: (res) => this._files$.next(res),
      error: (err) => {
        console.error('Failed to load files', err);
        this._files$.next([]);
      }
    });
  }

  getFiles(purchaseId: number): Observable<Attachment[]> {
    return this.http
      .get<Attachment[]>(`${this.api}/purchase/${purchaseId}/files`)
      .pipe(map((res) => res ?? []));
  }

  upload(purchaseId: number, files: File[]): Observable<unknown> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    return this.http.post(`${this.api}/upload/${purchaseId}`, formData).pipe(
      map((res) => {
        this.loadFiles(purchaseId);
        return res;
      })
    );
  }

  /**
   * Upload image to a real purchase bucket, return short download URL
   * (EngineerProfile.imageUrl maxLength = 500 — base64 does not fit).
   */
  uploadAndGetUrl(file: File): Observable<string> {
    const stamp = Date.now();
    const safeName = `profile_${stamp}.jpg`;
    const formData = new FormData();
    formData.append('files', file, safeName);

    return this.http
      .post(`${this.api}/upload/${this.mediaPurchaseId}`, formData)
      .pipe(
        switchMap(() =>
          this.http.get<Attachment[]>(
            `${this.api}/purchase/${this.mediaPurchaseId}/files?t=${stamp}`
          )
        ),
        map((files) => {
          const list = [...(files ?? [])].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
          const match =
            list.find((f) => f.fileName === safeName) ??
            list.find((f) => f.fileName?.includes(`profile_${stamp}`)) ??
            list[0];

          if (!match?.id) {
            throw new Error('Upload ok but file id missing');
          }

          return environment.fileDownloadUrl(match.id);
        })
      );
  }

  delete(fileId: number, _purchaseId: number): Observable<unknown> {
    return this.http.delete(environment.fileDeleteUrl(fileId));
  }

  download(fileId: number, fileName: string): void {
    this.http
      .get(environment.fileDownloadUrl(fileId), { responseType: 'blob' })
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
