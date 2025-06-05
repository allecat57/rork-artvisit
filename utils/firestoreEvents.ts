// This file now uses Supabase instead of Firestore for event tracking
import { supabase } from "@/lib/supabase";
import { getSessionUserId } from "@/utils/auth";
import * as Analytics from '@/utils/analytics';

// Generic event logging function that uses Supabase instead of Firestore
export const logFirestoreEvent = async (params: { 
  type: string, 
  userId: string, 
  galleryId?: string, 
  artworkId?: string,
  venueId?: string,
  eventId?: string,
  additionalData?: Record<string, any>
}) => {
  if (__DEV__) {
    console.log(`[Analytics Event] ${params.type}:`, params);
  }
  
  try {
    // Log to Supabase analytics table
    await supabase.from("analytics_events").insert([
      {
        event_type: params.type,
        user_id: params.userId,
        gallery_id: params.galleryId,
        artwork_id: params.artworkId,
        venue_id: params.venueId,
        event_id: params.eventId,
        additional_data: params.additionalData,
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Also forward to our analytics system
    Analytics.logEvent(params.type, {
      user_id: params.userId,
      gallery_id: params.galleryId,
      artwork_id: params.artworkId,
      venue_id: params.venueId,
      event_id: params.eventId,
      ...params.additionalData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error logging event to Supabase:", error);
  }
};

// Specific event types that were previously using Firestore
export const logEvent = async (params: { 
  type: string, 
  userId: string, 
  additionalData?: Record<string, any> 
}) => {
  await logFirestoreEvent(params);
};

export const logVisit = async (
  userId: string, 
  venueId: string, 
  additionalData?: Record<string, any>
) => {
  await logFirestoreEvent({
    type: 'visit',
    userId,
    venueId,
    additionalData
  });
};

export const logPurchase = async (
  userId: string, 
  venueId: string, 
  artworkId: string, 
  amount: number, 
  currency: string,
  additionalData?: Record<string, any>
) => {
  await logFirestoreEvent({
    type: 'purchase',
    userId,
    venueId,
    artworkId,
    additionalData: {
      amount,
      currency,
      ...additionalData
    }
  });
};

export const logBooking = async (
  userId: string,
  venueId: string,
  bookingId: string,
  date: Date,
  time: string,
  partySize: number,
  additionalData?: Record<string, any>
) => {
  await logFirestoreEvent({
    type: 'booking',
    userId,
    venueId,
    additionalData: {
      booking_id: bookingId,
      date: date.toISOString(),
      time,
      party_size: partySize,
      ...additionalData
    }
  });
};

export const logEventRegistration = async (
  userId: string,
  eventId: string,
  venueId: string,
  ticketCount: number,
  additionalData?: Record<string, any>
) => {
  await logFirestoreEvent({
    type: 'event_registration',
    userId,
    eventId,
    venueId,
    additionalData: {
      ticket_count: ticketCount,
      ...additionalData
    }
  });
};