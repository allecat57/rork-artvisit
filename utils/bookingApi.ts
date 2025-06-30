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
  notes?: string,
  totalAmount?: number,
  paymentIntentId?: string
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
        total_amount: totalAmount,
        payment_intent_id: paymentIntentId,
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
      party_size: partySize,
      total_amount: totalAmount
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
  notes,
  totalAmount,
  paymentIntentId
}: {
  userId: string;
  venueId: string;
  date: Date;
  timeSlot: string;
  partySize?: number;
  notes?: string;
  totalAmount?: number;
  paymentIntentId?: string;
}) => {
  try {
    const dateString = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
    
    const result = await createBooking(
      venueId, 
      dateString, 
      timeSlot, 
      partySize, 
      notes, 
      totalAmount, 
      paymentIntentId
    );
    
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
      party_size: bookingData.party_size,
      total_amount: bookingData.total_amount
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

/**
 * Process payment for a booking
 */
export const processBookingPayment = async (
  venueId: string,
  date: Date,
  timeSlot: string,
  partySize: number,
  totalAmount: number,
  paymentMethodId: string
) => {
  try {
    const userId = await getSessionUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to process payment');
    }
    
    // Log payment attempt
    Analytics.logEvent('booking_payment_started', {
      venue_id: venueId,
      user_id: userId,
      total_amount: totalAmount,
      party_size: partySize
    });
    
    // In a real app, this would integrate with your payment processor
    // For now, we'll simulate a successful payment
    const mockPaymentIntent = {
      id: `pi_${Math.random().toString(36).substring(2, 15)}`,
      status: 'succeeded',
      amount: totalAmount * 100, // Convert to cents
      currency: 'usd'
    };
    
    // Create the booking with payment information
    const result = await bookVenue({
      userId,
      venueId,
      date,
      timeSlot,
      partySize,
      totalAmount,
      paymentIntentId: mockPaymentIntent.id
    });
    
    if (result.success) {
      // Log successful payment
      Analytics.logEvent('booking_payment_success', {
        booking_id: result.bookingId,
        venue_id: venueId,
        user_id: userId,
        total_amount: totalAmount,
        payment_intent_id: mockPaymentIntent.id
      });
    }
    
    return {
      ...result,
      paymentIntent: mockPaymentIntent
    };
  } catch (error) {
    console.error('Error processing booking payment:', error);
    
    // Get userId for error logging
    const userId = await getSessionUserId();
    
    // Log payment error
    Analytics.logEvent('booking_payment_error', {
      venue_id: venueId,
      user_id: userId,
      total_amount: totalAmount,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
};