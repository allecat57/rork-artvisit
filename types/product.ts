export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured: boolean;
  inventory: number;
  dimensions?: string;
  weight?: string;
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}