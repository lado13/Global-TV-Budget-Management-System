export interface NavItem {
  path: string;
  label: string;
  /** When true, route requires the access password modal. */
  requiresAccess?: boolean;
}

/** Single source of truth for main navigation links. */
export const NAV_ITEMS: NavItem[] = [
  { path: '/Purchase', label: 'შესყიდვები და ისტორია' },
  { path: '/enginner', label: 'ინჟინრები' },
  { path: '/merchant', label: 'მაღაზიები' },
  { path: '/product-type', label: 'პროდუქტის კატეგორიები' },
  { path: '/budget', label: 'ბიუჯეტი' }
];

/** Access gate password — move to a real auth flow when ready. */
export const ACCESS_PASSWORD = '123';
