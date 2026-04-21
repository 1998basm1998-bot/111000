export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  discountPercentage?: number;
  imageUrl: string;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isOffer?: boolean;
  specs?: { label: string; value: string }[];
  colors?: string[];
  sizes?: string[];
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  addresses?: Address[];
  favorites: string[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  fullAddress: string;
  milestone: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  address: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'transfer';
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
