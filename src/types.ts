export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
  icon: string;
  categoryId: string; // تم إضافة معرف التصنيف لربط المنتج بالقسم المناسب
  demoUrl?: string;
  rating?: number;
  salesCount?: number;
  demoComponent?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  senderAccount: string;
  amountEgp: number;
  amountUsd: number;
  createdAt: string;
  status: OrderStatus;
  licenseKey?: string;
}

