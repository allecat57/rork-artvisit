import * as Analytics from '@/utils/analytics';
import { generateConfirmationCode } from '@/utils/generateConfirmationCode';

/**
 * Create a booking in the system
 */
export const createBooking = async (
  venueId: string,
  date: string,
  time: string,
  partySize: number,
  notes?: string
) => {
  try {
    const confirmationCode = generateConfirmationCode();
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const bookingId = `booking-${Date.now()}`;
    
    // Log to analytics
    Analytics.logEvent('booking_created', {
      booking_id: bookingId,
      venue_id: venueId,
      date,
      time,
      party_size: partySize
    });
    
    return {
      id: bookingId,
      confirmationCode,
      status: 'confirmed'
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Book a venue (wrapper around createBooking for compatibility)
 */
export const bookVenue = async ({
  userId,
  venueId,
  date,
  timeSlot,
  partySize = 2,
  notes
}: {
  userId: string;
  venueId: string;
  date: Date;
  timeSlot: string;
  partySize?: number;
  notes?: string;
}) => {
  try {
    const dateString = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
    
    const result = await createBooking(venueId, dateString, timeSlot, partySize, notes);
    
    return {
      success: true,
      bookingId: result.id,
      confirmationCode: result.confirmationCode,
      message: 'Booking created successfully'
    };
  } catch (error) {
    console.error('Error booking venue:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Cancel a booking in the system
 */
export const cancelBooking = async (bookingId: string) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Log to analytics
    Analytics.logEvent('booking_cancelled', {
      booking_id: bookingId
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

/**
 * Get all bookings for the current user
 */
export const getUserBookings = async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return empty array for demo
    return [];
  } catch (error) {
    console.error('Error getting user bookings:', error);
    throw error;
  }
};

/**
 * Get a specific booking by ID
 */
export const getBookingById = async (bookingId: string) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return null for demo
    return null;
  } catch (error) {
    console.error('Error getting booking details:', error);
    throw error;
  }
};