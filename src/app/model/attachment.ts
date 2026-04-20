export interface Attachment {
    id: number;
    createAt?: string;
    updateAt?: string;
    fileType: string;
    fileName: string;
    content?: string;
    purchaseHistoryId: number;
}
