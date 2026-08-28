const apiBaseUrl = 'http://192.168.1.102:1121/api';

export const environment = {
  production: false,
  apiBaseUrl,

  EnginnerApi: `${apiBaseUrl}/Enginner`,
  MerchantApi: `${apiBaseUrl}/Merchant`,
  MonthBudgetApi: `${apiBaseUrl}/MonthBudget`,
  ProductTypeApi: `${apiBaseUrl}/ProductType`,
  PurchaseApi: `${apiBaseUrl}/PurchaseHistory`,
  FileApi: `${apiBaseUrl}/FileControllers`,
  EnginerProfileApi: `${apiBaseUrl}/EngineerProfile`,

  /** Real PurchaseHistory id for profile/merchant image uploads (FileControllers FK). */
  mediaPurchaseId: 288,

  fileDownloadUrl(fileId: number): string {
    return `${apiBaseUrl}/FileControllers/file/download/${fileId}`;
  },

  fileDeleteUrl(fileId: number): string {
    return `${apiBaseUrl}/FileControllers/file/${fileId}`;
  }
};
