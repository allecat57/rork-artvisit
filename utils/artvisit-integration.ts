import { supabase, isSupabaseConfigured } from '@/config/supabase';
import * as Analytics from '@/utils/analytics';
import { getCurrentUser } from '@/config/supabase';

/**
 * Log an artwork view to the analytics system
 */
export const logArtworkView = async (artworkId: string, galleryId: string) => {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    
    // Log to analytics
    Analytics.logEvent('artwork_view', {
      artwork_id: artworkId,
      gallery_id: galleryId,
      user_id: userId
    });
    
    // Log to Supabase if configured and user is logged in
    if (isSupabaseConfigured() && userId) {
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
    const user = await getCurrentUser();
    const userId = user?.id;
    
    // Log to analytics
    Analytics.logEvent('gallery_visit', {
      gallery_id: galleryId,
      user_id: userId
    });
    
    // Log to Supabase if configured and user is logged in
    if (isSupabaseConfigured() && userId) {
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
    const user = await getCurrentUser();
    const userId = user?.id;
    
    // Log to analytics
    Analytics.logEvent('artwork_purchase', {
      artwork_id: artworkId,
      gallery_id: galleryId,
      user_id: userId,
      price,
      currency
    });
    
    // Log to Supabase if configured and user is logged in
    if (isSupabaseConfigured() && userId) {
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
    const user = await getCurrentUser();
    const userId = user?.id;
    
    // Log to analytics
    Analytics.logEvent('user_feedback', {
      gallery_id: galleryId,
      user_id: userId,
      rating,
      has_comment: !!comment
    });
    
    // Log to Supabase if configured and user is logged in
    if (isSupabaseConfigured() && userId) {
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

/**
 * Gallery Analytics class for tracking user interactions
 */
export class GalleryAnalytics {
  private galleryData: {
    id: string;
    name: string;
    location: string;
  };
  private startTime: number;
  
  constructor(galleryData: { id: string; name: string; location: string }) {
    this.galleryData = galleryData;
    this.startTime = Date.now();
  }
  
  /**
   * Track gallery view
   */
  trackGalleryView() {
    logGalleryVisit(this.galleryData.id);
  }
  
  /**
   * Track artwork view
   */
  trackArtworkView(artworkId: string, artworkTitle: string) {
    logArtworkView(artworkId, this.galleryData.id);
    
    // Additional analytics for artwork view
    Analytics.logEvent('artwork_detail_view', {
      artwork_id: artworkId,
      artwork_title: artworkTitle,
      gallery_id: this.galleryData.id,
      gallery_name: this.galleryData.name
    });
  }
  
  /**
   * Track user interaction
   */
  trackInteraction(action: string, artworkId?: string, metadata?: any) {
    Analytics.logEvent('gallery_interaction', {
      action,
      gallery_id: this.galleryData.id,
      gallery_name: this.galleryData.name,
      artwork_id: artworkId,
      ...metadata
    });
  }
  
  /**
   * Track purchase
   */
  trackPurchase(artworkId: string, price: number, currency: string = 'USD') {
    logArtworkPurchase(artworkId, this.galleryData.id, price, currency);
  }
  
  /**
   * Track time spent in gallery
   */
  trackTimeSpent(artworkId?: string) {
    const timeSpent = Date.now() - this.startTime;
    
    Analytics.logEvent('time_spent', {
      gallery_id: this.galleryData.id,
      gallery_name: this.galleryData.name,
      artwork_id: artworkId,
      time_spent_ms: timeSpent,
      time_spent_seconds: Math.round(timeSpent / 1000)
    });
  }
}