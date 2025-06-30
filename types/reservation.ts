export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed"
}

export interface Reservation {
  id: string;
  userId: string;
  venueId: string;
  date: string;
  time: string;
  partySize: number;
  status: ReservationStatus;
  confirmationCode: string;
  createdAt?: string;
  updatedAt?: string;
  specialRequests?: string;
  totalCost?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentIntentId?: string;
}

export interface ReservationFormData {
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
}