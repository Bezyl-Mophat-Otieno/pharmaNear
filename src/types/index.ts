export type ApiResponse = {
  success: boolean;
  message: string;
  data?: unknown;
}


export interface  UploadedItem  {
    public_id: string;
    secure_url: string;
    width: string;
    height: string;
    format: string;
    resource_type: string;
    bytes: string;
}

export const RoleEnum = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  TENANT: 'tenant',
}