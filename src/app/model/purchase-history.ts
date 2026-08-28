import { Attachment } from './attachment';

/** Matches PurchaseHistoryDto from Global.Budget.Ge API. */
export interface PurchaseHistory {
  id: number;
  purchaseDate: string;
  merchantId: number;
  buyerId: number;
  /** API spelling (typo kept for backend compatibility). */
  porductTypeId: number;
  amount: number;
  checkIsThere: boolean;
  additionalComment: string;
  createAt?: string;
  updateAt?: string;
  merchantName?: string;
  buyerName?: string;
  productTypeName?: string;
  /** Legacy client-side attachments field (typo kept). */
  attachemnts?: Attachment[];
}

export { Attachment };
