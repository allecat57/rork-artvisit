import { 
  createGallery, 
  getGalleries, 
  getGalleryById, 
  getArtworksByGallery, 
  getArtworkById,
  createArtwork,
  isSupabaseConfigured,
  getCurrentUser
} from '@/config/supabase';
import * as Analytics from '@/utils/analytics';

/**
 * Create a new gallery
 */
export const createNewGallery = async (galleryData: {
  name: string;
  description?: string;
  location: string;
  image_url?: string;
  hours?: string;
  featured?: boolean;
}) => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User must be logged in to create a gallery');
    }
    
    const newGallery = await createGallery({
      ...galleryData,
      created_by: user.id,
      featured: galleryData.featured || false
    });
    
    // Log analytics event
    Analytics.logEvent('gallery_created', {
      gallery_id: newGallery.id,
      gallery_name: newGallery.name,
      created_by: user.id
    });
    
    return newGallery;
  } catch (error) {
    console.error('Error creating gallery:', error);
    throw error;
  }
};

/**
 * Create a new artwork
 */
export const createNewArtwork = async (artworkData: {
  gallery_id: string;
  title: string;
  artist: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  description?: string;
  price?: string;
  image_url?: string;
}) => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User must be logged in to create an artwork');
    }
    
    const newArtwork = await createArtwork(artworkData);
    
    // Log analytics event
    Analytics.logEvent('artwork_created', {
      artwork_id: newArtwork.id,
      artwork_title: newArtwork.title,
      gallery_id: newArtwork.gallery_id,
      created_by: user.id
    });
    
    return newArtwork;
  } catch (error) {
    console.error('Error creating artwork:', error);
    throw error;
  }
};

/**
 * Fetch all galleries
 */
export const fetchAllGalleries = async () => {
  try {
    const galleries = await getGalleries();
    
    // Log analytics event
    Analytics.logEvent('galleries_fetched', {
      count: galleries.length
    });
    
    return galleries;
  } catch (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
};

/**
 * Fetch gallery by ID
 */
export const fetchGallery = async (id: string) => {
  try {
    const gallery = await getGalleryById(id);
    
    // Log analytics event
    Analytics.logEvent('gallery_fetched', {
      gallery_id: gallery.id,
      gallery_name: gallery.name
    });
    
    return gallery;
  } catch (error) {
    console.error('Error fetching gallery:', error);
    throw error;
  }
};

/**
 * Fetch artworks by gallery
 */
export const fetchGalleryArtworks = async (galleryId: string) => {
  try {
    const artworks = await getArtworksByGallery(galleryId);
    
    // Log analytics event
    Analytics.logEvent('gallery_artworks_fetched', {
      gallery_id: galleryId,
      count: artworks.length
    });
    
    return artworks;
  } catch (error) {
    console.error('Error fetching gallery artworks:', error);
    throw error;
  }
};

/**
 * Fetch artwork by ID
 */
export const fetchArtwork = async (id: string) => {
  try {
    const artwork = await getArtworkById(id);
    
    // Log analytics event
    Analytics.logEvent('artwork_fetched', {
      artwork_id: artwork.id,
      artwork_title: artwork.title,
      gallery_id: artwork.gallery_id
    });
    
    return artwork;
  } catch (error) {
    console.error('Error fetching artwork:', error);
    throw error;
  }
};

/**
 * Check if gallery functionality is available
 */
export const isGalleryFunctionalityAvailable = () => {
  return isSupabaseConfigured();
};