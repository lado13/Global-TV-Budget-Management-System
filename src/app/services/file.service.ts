import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Attachment } from '../model/attachment';
import { environment } from '../../environment/environment';


@Injectable({ providedIn: 'root' })
export class FileService {

  private api = environment.FileApi;

  private _files$ = new BehaviorSubject<Attachment[]>([]);
  files$ = this._files$.asObservable();

  constructor(private http: HttpClient) { }

  loadFiles(purchaseId: number) {
    this.http.get<Attachment[]>(`${this.api}/purchase/${purchaseId}/files`)
      .subscribe(res => this._files$.next(res));
  }

  upload(purchaseId: number, files: File[]) {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    this.http.post(`${this.api}/upload/${purchaseId}`, formData)
      .subscribe(() => this.loadFiles(purchaseId));
  }

  delete(fileId: number, purchaseId: number) {
    return this.http.delete(
      `http://192.168.1.102:1121/api/FileControllers/file/${fileId}`
    );
  }

  download(fileId: number, fileName: string): void {
    this.http.get(
      `http://192.168.1.102:1121/api/FileControllers/file/download/${fileId}`,
      { responseType: 'blob' }
    ).subscribe(blob => {

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();

      window.URL.revokeObjectURL(url);
    });
  }
}