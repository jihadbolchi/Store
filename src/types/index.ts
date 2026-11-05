export type DeliveryArea = 'inside_dhaka' | 'outside_dhaka';

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number; // in BDT (৳)
  discountPrice?: number; // optional discount price
  stock: number;
  inStock: boolean;
  featured: boolean;
  images: string[];
  badge?: string; // e.g. "Best Seller", "New Arrival", "Artisan Carved"
  craftType?: string; // e.g. "Resin Art", "Block Print", "Candle Making", etc.
  specifications?: Record<string, string>;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  address: string;
  deliveryArea: DeliveryArea;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'whatsapp' | 'cod';
  notes?: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface HeroBannerSettings {
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  text: string;
  isAdmin: boolean;
  createdAt: string;
}
