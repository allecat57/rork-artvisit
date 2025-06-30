export interface Venue {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  type: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
  hours: {
    [key: string]: string;
  };
  amenities: string[];
  featured: boolean;
  phone?: string;
  website?: string;
  tags?: string[];
  admissionFee?: {
    adult: number;
    child: number;
    senior: number;
    student: number;
  };
  specialExhibitions?: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    additionalFee?: number;
  }[];
}