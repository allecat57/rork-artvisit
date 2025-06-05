export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  imageUrl?: string; // Made optional
  category: string;
  featured: boolean;
  inventory: number;
  inStock?: boolean; // Made optional
  artist?: string; // Made optional
  medium?: string; // Made optional
  year?: string; // Made optional
  gallery?: string; // Made optional
  dimensions?: string;
  weight?: string;
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}