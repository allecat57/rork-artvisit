export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Reservation {
  id: string;
  userId: string;
  venueId: string;
  eventId?: string; // Added for event reservations
  date: string; // ISO string for the date of the reservation
  time: string; // Time string like "19:30" or "7:30 PM"
  partySize: number;
  guests: number; // Alias for partySize for backward compatibility
  status: ReservationStatus;
  confirmationCode: string;
  specialRequests?: string;
  type?: "venue" | "event"; // Added to distinguish between venue and event reservations
  totalAmount?: number; // Added for payment tracking
  paymentIntentId?: string; // Added for Stripe payment tracking
  venueName: string; // Added venue name for display
  venueLocation: string; // Added venue location for display
  createdAt: string; // ISO string for when reservation was created
  updatedAt: string; // ISO string for when reservation was last updated
}