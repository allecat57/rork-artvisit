export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  imageUrl: string; // Added for compatibility
  category: string;
  featured: boolean;
  inventory: number;
  inStock: boolean; // Added for compatibility
  artist: string; // Added for compatibility
  medium: string; // Added for compatibility
  year: string; // Added for compatibility
  gallery: string; // Added for compatibility
  dimensions?: string;
  weight?: string;
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}