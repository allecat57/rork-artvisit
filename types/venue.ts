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
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}