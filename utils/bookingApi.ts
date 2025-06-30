import { supabase } from '@/lib/supabase';
import * as Analytics from '@/utils/analytics';
import { getSessionUserId } from '@/utils/auth';
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
    const userId = await getSessionUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to create a booking');
    }
    
    const confirmationCode = generateConfirmationCode();
    
    // Create booking in Supabase
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        venue_id: venueId,
        date,
        time,
        party_size: partySize,
        notes,
        confirmation_code: confirmationCode,
        status: 'confirmed',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Log to analytics
    Analytics.logEvent('booking_created', {
      booking_id: data.id,
      venue_id: venueId,
      user_id: userId,
      date,
      time,
      party_size: partySize
    });
    
    return {
      id: data.id,
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
    const userId = await getSessionUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to cancel a booking');
    }
    
    // Get booking details first for analytics
    const { data: bookingData, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Update booking status in Supabase
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', bookingId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Log to analytics
    Analytics.logEvent('booking_cancelled', {
      booking_id: bookingId,
      venue_id: bookingData.venue_id,
      user_id: userId,
      date: bookingData.date,
      time: bookingData.time,
      party_size: bookingData.party_size
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
    const userId = await getSessionUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to get bookings');
    }
    
    // Get bookings from Supabase
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        venues:venue_id (
          id,
          name,
          image,
          location
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Log to analytics
    Analytics.logEvent('view_bookings', {
      user_id: userId,
      count: data.length
    });
    
    return data;
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
    const userId = await getSessionUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to get booking details');
    }
    
    // Get booking from Supabase
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        venues:venue_id (
          id,
          name,
          image,
          location,
          description,
          phone,
          website
        )
      `)
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    // Log to analytics
    Analytics.logEvent('view_booking_details', {
      booking_id: bookingId,
      venue_id: data.venue_id,
      user_id: userId
    });
    
    return data;
  } catch (error) {
    console.error('Error getting booking details:', error);
    throw error;
  }
};