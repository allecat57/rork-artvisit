export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Reservation {
  id: string;
  userId: string;
  venueId: string;
  eventId?: string; // Added for event reservations
  date: string; // ISO string for the date of the reservation
  time: string; // ISO string for the time of the reservation
  partySize: number;
  status: ReservationStatus;
  confirmationCode: string;
  specialRequests?: string;
  type?: "venue" | "event"; // Added to distinguish between venue and event reservations
}