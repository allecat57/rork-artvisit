import { supabase } from '@/lib/supabase';
import * as Analytics from '@/utils/analytics';
import { getSessionUserId } from '@/utils/auth';

/**
 * Log an artwork view to the analytics system
 */
export const logArtworkView = async (artworkId: string, galleryId: string) => {
  try {
    const userId = await getSessionUserId();
    
    // Log to analytics
    Analytics.logEvent('artwork_view', {
      artwork_id: artworkId,
      gallery_id: galleryId,
      user_id: userId
    });
    
    // Log to Supabase
    if (userId) {
      await supabase.from('artwork_views').insert({
        user_id: userId,
        artwork_id: artworkId,
        gallery_id: galleryId,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error logging artwork view:', error);
  }
};

/**
 * Log a gallery visit to the analytics system
 */
export const logGalleryVisit = async (galleryId: string) => {
  try {
    const userId = await getSessionUserId();
    
    // Log to analytics
    Analytics.logEvent('gallery_visit', {
      gallery_id: galleryId,
      user_id: userId
    });
    
    // Log to Supabase
    if (userId) {
      await supabase.from('gallery_visits').insert({
        user_id: userId,
        gallery_id: galleryId,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error logging gallery visit:', error);
  }
};

/**
 * Log an artwork purchase to the analytics system
 */
export const logArtworkPurchase = async (
  artworkId: string, 
  galleryId: string, 
  price: number,
  currency: string = 'USD'
) => {
  try {
    const userId = await getSessionUserId();
    
    // Log to analytics
    Analytics.logEvent('artwork_purchase', {
      artwork_id: artworkId,
      gallery_id: galleryId,
      user_id: userId,
      price,
      currency
    });
    
    // Log to Supabase
    if (userId) {
      await supabase.from('artwork_purchases').insert({
        user_id: userId,
        artwork_id: artworkId,
        gallery_id: galleryId,
        price,
        currency,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error logging artwork purchase:', error);
  }
};

/**
 * Log user feedback to the analytics system
 */
export const logUserFeedback = async (
  galleryId: string,
  rating: number,
  comment: string
) => {
  try {
    const userId = await getSessionUserId();
    
    // Log to analytics
    Analytics.logEvent('user_feedback', {
      gallery_id: galleryId,
      user_id: userId,
      rating,
      has_comment: !!comment
    });
    
    // Log to Supabase
    if (userId) {
      await supabase.from('user_feedback').insert({
        user_id: userId,
        gallery_id: galleryId,
        rating,
        comment,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error logging user feedback:', error);
  }
};