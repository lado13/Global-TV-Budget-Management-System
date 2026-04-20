import { Attachment } from "./attachment";

export interface PurchaseHistory {
    id: number;
    createAt?: string;
    updateAt?: string;
    purchaseDate: string;
    merchantId: number;
    buyerId: number;
    porductTypeId: number;
    amount: number;
    checkIsThere: boolean;
    additionalComment: string;
    attachemnts?: Attachment[];
}
export { Attachment };

