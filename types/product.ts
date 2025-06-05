export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  imageUrl?: string;
  category: string;
  featured: boolean;
  inventory: number;
  inStock?: boolean;
  artist?: string;
  medium?: string;
  year?: string;
  gallery?: string;
  dimensions?: string;
  weight?: string;
  tags?: string[];
}