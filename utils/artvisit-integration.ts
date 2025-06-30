import * as Analytics from '@/utils/analytics';

interface GalleryInfo {
  id: string;
  name: string;
  location: string;
}

/**
 * Gallery Analytics class for tracking gallery-specific events
 */
export class GalleryAnalytics {
  private galleryInfo: GalleryInfo;
  private startTime: number;

  constructor(galleryInfo: GalleryInfo) {
    this.galleryInfo = galleryInfo;
    this.startTime = Date.now();
  }

  /**
   * Track gallery view
   */
  trackGalleryView() {
    Analytics.logEvent('gallery_view', {
      gallery_id: this.galleryInfo.id,
      gallery_name: this.galleryInfo.name,
      gallery_location: this.galleryInfo.location
    });
  }

  /**
   * Track artwork view
   */
  trackArtworkView(artworkId: string, artworkTitle: string) {
    Analytics.logEvent('artwork_view', {
      gallery_id: this.galleryInfo.id,
      gallery_name: this.galleryInfo.name,
      artwork_id: artworkId,
      artwork_title: artworkTitle
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(action: string, target?: string | null, metadata?: Record<string, any>) {
    Analytics.logEvent('gallery_interaction', {
      gallery_id: this.galleryInfo.id,
      gallery_name: this.galleryInfo.name,
      action,
      target,
      ...metadata
    });
  }

  /**
   * Track time spent in gallery
   */
  trackTimeSpent() {
    const timeSpent = Date.now() - this.startTime;
    Analytics.logEvent('gallery_time_spent', {
      gallery_id: this.galleryInfo.id,
      gallery_name: this.galleryInfo.name,
      time_spent_ms: timeSpent,
      time_spent_seconds: Math.round(timeSpent / 1000)
    });
  }
}

/**
 * Log an artwork view to the analytics system
 */
export const logArtworkView = async (artworkId: string, galleryId: string) => {
  try {
    // Log to analytics
    Analytics.logEvent('artwork_view', {
      artwork_id: artworkId,
      gallery_id: galleryId
    });
  } catch (error) {
    console.error('Error logging artwork view:', error);
  }
};

/**
 * Log a gallery visit to the analytics system
 */
export const logGalleryVisit = async (galleryId: string) => {
  try {
    // Log to analytics
    Analytics.logEvent('gallery_visit', {
      gallery_id: galleryId
    });
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
    // Log to analytics
    Analytics.logEvent('artwork_purchase', {
      artwork_id: artworkId,
      gallery_id: galleryId,
      price,
      currency
    });
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
    // Log to analytics
    Analytics.logEvent('user_feedback', {
      gallery_id: galleryId,
      rating,
      has_comment: !!comment
    });
  } catch (error) {
    console.error('Error logging user feedback:', error);
  }
};