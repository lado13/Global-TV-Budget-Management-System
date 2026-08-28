/** Tiny inline SVG placeholders — avoids missing /assets/*.png 404s. */
export const DEFAULT_AVATAR =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="32" fill="#334155"/>
      <circle cx="32" cy="24" r="12" fill="#94a3b8"/>
      <path d="M12 54c4-12 14-18 20-18s16 6 20 18" fill="#94a3b8"/>
    </svg>`
  );

export const DEFAULT_ICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="12" fill="#334155"/>
      <rect x="16" y="22" width="32" height="24" rx="4" fill="#94a3b8"/>
      <rect x="24" y="14" width="16" height="8" rx="2" fill="#64748b"/>
    </svg>`
  );

export const DEFAULT_PAGE_SIZE = 10;

/** Georgian month names (1-indexed via getMonthName). Prefer LanguageService.monthName. */
export const GEORGIAN_MONTHS = [
  'იანვარი',
  'თებერვალი',
  'მარტი',
  'აპრილი',
  'მაისი',
  'ივნისი',
  'ივლისი',
  'აგვისტო',
  'სექტემბერი',
  'ოქტომბერი',
  'ნოემბერი',
  'დეკემბერი'
] as const;

export const ENGLISH_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const;

export function getMonthName(month: number, lang: 'en' | 'ka' = 'ka'): string {
  const list = lang === 'en' ? ENGLISH_MONTHS : GEORGIAN_MONTHS;
  return list[month - 1] ?? '';
}
