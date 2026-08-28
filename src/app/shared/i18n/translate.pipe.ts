import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from './language.service';

/** Impure so UI refreshes when language changes. */
@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly lang = inject(LanguageService);

  transform(key: string, params?: Record<string, string | number> | null): string {
    return this.lang.t(key, params ?? undefined);
  }
}
