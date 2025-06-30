import { supabase, isSupabaseConfigured } from '@/config/supabase';
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
    
    // Create booking in Supabase if configured
    if (isSupabaseConfigured()) {
      try {
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
          console.log("Supabase booking table doesn't exist, using local storage:", error.message);
          // Fall back to local storage or mock behavior
        } else {
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
        }
      } catch (supabaseError) {
        console.log("Supabase not available, using local storage:", supabaseError);
      }
    }
    
    // Fallback to local behavior
    const mockId = `booking_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Log to analytics
    Analytics.logEvent('booking_created', {
      booking_id: mockId,
      venue_id: venueId,
      user_id: userId,
      date,
      time,
      party_size: partySize,
      total_amount: totalAmount,
      source: 'local'
    });
    
    return {
      id: mockId,
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
 * Book an event
 */
export const bookEvent = async ({
  userId,
  eventId,
  numberOfTickets,
  paymentMethodId,
  price
}: {
  userId: string;
  eventId: string;
  numberOfTickets: number;
  paymentMethodId?: string;
  price: number;
}) => {
  try {
    const totalAmount = price * numberOfTickets;
    
    // In a real app, this would integrate with your payment processor
    // For now, we'll simulate a successful payment
    const mockPaymentIntent = {
      id: `pi_${Math.random().toString(36).substring(2, 15)}`,
      status: 'succeeded',
      amount: totalAmount * 100, // Convert to cents
      currency: 'usd'
    };
    
    // Log payment attempt
    Analytics.logEvent('event_payment_started', {
      event_id: eventId,
      user_id: userId,
      total_amount: totalAmount,
      number_of_tickets: numberOfTickets
    });
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Log successful payment
    Analytics.logEvent('event_payment_success', {
      event_id: eventId,
      user_id: userId,
      total_amount: totalAmount,
      payment_intent_id: mockPaymentIntent.id
    });
    
    return {
      success: true,
      paymentIntentId: mockPaymentIntent.id,
      message: 'Payment processed successfully'
    };
  } catch (error) {
    console.error('Error booking event:', error);
    
    // Log payment error
    Analytics.logEvent('event_payment_error', {
      event_id: eventId,
      user_id: userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
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
    
    // Try to cancel in Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        // Get booking details first for analytics
        const { data: bookingData, error: fetchError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .eq('user_id', userId)
          .single();
        
        if (fetchError) {
          console.log("Supabase booking table doesn't exist or booking not found:", fetchError.message);
        } else {
          // Update booking status in Supabase
          const { error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
            .eq('id', bookingId)
            .eq('user_id', userId);
          
          if (error) {
            console.log("Error updating booking in Supabase:", error.message);
          } else {
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
          }
        }
      } catch (supabaseError) {
        console.log("Supabase not available:", supabaseError);
      }
    }
    
    // Fallback to local behavior
    Analytics.logEvent('booking_cancelled', {
      booking_id: bookingId,
      user_id: userId,
      source: 'local'
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
    
    // Try to get bookings from Supabase if configured
    if (isSupabaseConfigured()) {
      try {
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
          console.log("Supabase booking table doesn't exist:", error.message);
        } else {
          // Log to analytics
          Analytics.logEvent('view_bookings', {
            user_id: userId,
            count: data.length
          });
          
          return data;
        }
      } catch (supabaseError) {
        console.log("Supabase not available:", supabaseError);
      }
    }
    
    // Fallback to empty array
    Analytics.logEvent('view_bookings', {
      user_id: userId,
      count: 0,
      source: 'local'
    });
    
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
    const userId = await getSessionUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to get booking details');
    }
    
    // Try to get booking from Supabase if configured
    if (isSupabaseConfigured()) {
      try {
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
          console.log("Supabase booking table doesn't exist or booking not found:", error.message);
        } else {
          // Log to analytics
          Analytics.logEvent('view_booking_details', {
            booking_id: bookingId,
            venue_id: data.venue_id,
            user_id: userId
          });
          
          return data;
        }
      } catch (supabaseError) {
        console.log("Supabase not available:", supabaseError);
      }
    }
    
    // Fallback to null
    return null;
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
    try {
      const userId = await getSessionUserId();
      
      // Log payment error
      Analytics.logEvent('booking_payment_error', {
        venue_id: venueId,
        user_id: userId,
        total_amount: totalAmount,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch (authError) {
      console.error('Error getting user ID for error logging:', authError);
    }
    
    throw error;
  }
};