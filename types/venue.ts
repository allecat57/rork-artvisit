export interface Venue {
  id: string;
  name: string;
  type: string;
  description: string;
  imageUrl: string;
  location: string;
  distance: string;
  rating: number;
  openingHours: string;
  admission: string;
  featured?: boolean;
  category?: string;
  tags?: string[];
  phone?: string;
  website?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  cost?: string;
}