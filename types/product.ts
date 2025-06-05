export interface Product {
  id: string;
  title: string;
  artist: string;
  description: string;
  price: number;
  imageUrl: string;
  gallery: string;
  medium: string;
  dimensions: string;
  year: string;
  inStock: boolean;
  category: string;
  featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  orderDate: string;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled"
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  cardType: string;
  last4: string;
  expirationDate: string;
  stripePaymentMethodId?: string;
}