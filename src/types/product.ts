
export interface Product {
  product_id: string,
  name:string,
  business_name: string
  slug?: string,
  description?: string,
  stock: number,
  low_stock_threshold: number,
  total_sold: number,
  buying_price: string,  
  selling_price: string,
  discount_amount: string,
  status: productStatus,
  is_featured: boolean,
  category_name?: string,
  category_id?: string,
  sub_category_id?: string,
  sub_category_name?: string
  images: string[],
  materials?: string,
  available_sizes: string[],
  care_instructions?: string,
  created_at?: string;
  updated_at?: string;
  // Business location fields
  latitude?: number;
  longitude?: number;
  address?: string;
  // Distance field (when user location is provided)
  distance_km?: number;
}

export enum productStatus {
  available = "available",
  out_of_stock = "out_of_stock",
  unavailable = "unavailable"
}
export interface StockMovement {
  id: string;
  productId: string;
  change: number;
  reason: string;
  createdAt: string;
}
