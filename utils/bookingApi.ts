import { Reservation, ReservationStatus } from "@/types/reservation";
import { generateConfirmationCode } from "./generateConfirmationCode";

// Mock booking API for demonstration
export class BookingAPI {
  private static instance: BookingAPI;
  private bookings: Reservation[] = [];

  static getInstance(): BookingAPI {
    if (!BookingAPI.instance) {
      BookingAPI.instance = new BookingAPI();
    }
    return BookingAPI.instance;
  }

  async createReservation(
    userId: string,
    venueId: string,
    date: string,
    time: string,
    partySize: number,
    specialRequests?: string
  ): Promise<Reservation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const reservation: Reservation = {
      id: `reservation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      venueId,
      date,
      time,
      partySize,
      status: ReservationStatus.CONFIRMED,
      confirmationCode: generateConfirmationCode(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      specialRequests,
      totalCost: partySize * 25, // $25 per person base cost
      paymentStatus: 'pending'
    };

    this.bookings.push(reservation);
    return reservation;
  }

  async updateReservation(
    reservationId: string,
    updates: Partial<Reservation>
  ): Promise<Reservation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const index = this.bookings.findIndex(booking => booking.id === reservationId);
    if (index === -1) {
      throw new Error('Reservation not found');
    }

    this.bookings[index] = {
      ...this.bookings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.bookings[index];
  }

  async cancelReservation(reservationId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.bookings.findIndex(booking => booking.id === reservationId);
    if (index === -1) {
      throw new Error('Reservation not found');
    }

    this.bookings[index] = {
      ...this.bookings[index],
      status: ReservationStatus.CANCELLED,
      updatedAt: new Date().toISOString()
    };
  }

  async getReservation(reservationId: string): Promise<Reservation | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return this.bookings.find(booking => booking.id === reservationId) || null;
  }

  async getUserReservations(userId: string): Promise<Reservation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return this.bookings.filter(booking => booking.userId === userId);
  }

  async getAvailableTimeSlots(venueId: string, date: string): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    // Mock available time slots
    const allSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ];

    // Filter out booked slots for this venue and date
    const bookedSlots = this.bookings
      .filter(booking => 
        booking.venueId === venueId && 
        booking.date === date && 
        booking.status !== ReservationStatus.CANCELLED
      )
      .map(booking => booking.time);

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  }

  async processPayment(
    reservationId: string,
    paymentMethodId: string,
    amount: number
  ): Promise<{ success: boolean; paymentIntentId?: string; error?: string }> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock payment processing (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update reservation with payment info
      const index = this.bookings.findIndex(booking => booking.id === reservationId);
      if (index !== -1) {
        this.bookings[index] = {
          ...this.bookings[index],
          paymentStatus: 'paid',
          paymentIntentId,
          updatedAt: new Date().toISOString()
        };
      }

      return { success: true, paymentIntentId };
    } else {
      return { 
        success: false, 
        error: 'Payment failed. Please check your payment method and try again.' 
      };
    }
  }
}

// Export singleton instance
export const bookingApi = BookingAPI.getInstance();

// Legacy export for backward compatibility
export const bookVenue = async (
  userId: string,
  venueId: string,
  date: string,
  time: string,
  partySize: number,
  specialRequests?: string
): Promise<Reservation> => {
  return bookingApi.createReservation(userId, venueId, date, time, partySize, specialRequests);
};