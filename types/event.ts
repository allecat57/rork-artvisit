export enum AccessLevel {
  ESSENTIAL = "essential",
  EXPLORER = "explorer",
  COLLECTOR = "collector"
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  endDate: string;
  location: string;
  price: number;
  capacity: number;
  remainingSpots: number;
  accessLevel: AccessLevel;
  featured?: boolean;
  isFeatured?: boolean; // For backward compatibility
  tags?: string[];
  type: string;
}

export interface EventRegistration {
  eventId: string;
  userId: string;
  registrationDate: string;
  numberOfTickets: number;
  totalPrice: number;
  confirmationCode: string;
}