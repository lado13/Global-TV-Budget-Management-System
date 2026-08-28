import { ApplicationRef, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import {
  AppLang,
  LANG_STORAGE_KEY,
  TRANSLATIONS
} from './translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly langSubject = new BehaviorSubject<AppLang>(this.readInitial());
  readonly lang$ = this.langSubject.asObservable();

  get lang(): AppLang {
    return this.langSubject.value;
  }

  setLang(lang: AppLang): void {
    if (lang === this.langSubject.value) return;
    this.langSubject.next(lang);
    if (this.isBrowser) {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
    this.applyDocumentLang(lang);
    // Refresh impure `| t` pipes in routed components
    queueMicrotask(() => this.appRef.tick());
  }

  toggle(): void {
    this.setLang(this.lang === 'en' ? 'ka' : 'en');
  }

  t(key: string, params?: Record<string, string | number>): string {
    const dict = TRANSLATIONS[this.lang] ?? TRANSLATIONS.ka;
    let text = dict[key] ?? TRANSLATIONS.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
      }
    }
    return text;
  }

  monthName(month: number): string {
    return this.t(`month.${month}`);
  }

  private readInitial(): AppLang {
    if (this.isBrowser) {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'ka') {
        this.applyDocumentLang(saved);
        return saved;
      }
    }
    this.applyDocumentLang('ka');
    return 'ka';
  }

  private applyDocumentLang(lang: AppLang): void {
    this.document.documentElement.lang = lang === 'en' ? 'en' : 'ka';
  }
}
