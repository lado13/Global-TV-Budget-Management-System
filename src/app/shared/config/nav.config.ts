export interface NavItem {
  path: string;
  /** i18n key, e.g. nav.purchases */
  labelKey: string;
  /** Font Awesome icon class, e.g. fa-receipt */
  icon: string;
  /** When true, route requires the access password modal. */
  requiresAccess?: boolean;
}

/** Single source of truth for main navigation links. */
export const NAV_ITEMS: NavItem[] = [
  { path: '/Purchase', labelKey: 'nav.purchases', icon: 'fa-receipt' },
  { path: '/enginner', labelKey: 'nav.engineers', icon: 'fa-user-gear' },
  { path: '/merchant', labelKey: 'nav.merchants', icon: 'fa-store' },
  { path: '/product-type', labelKey: 'nav.productTypes', icon: 'fa-tags' },
  { path: '/budget', labelKey: 'nav.budget', icon: 'fa-wallet' }
];

/** Access gate password — move to a real auth flow when ready. */
export const ACCESS_PASSWORD = '123';
