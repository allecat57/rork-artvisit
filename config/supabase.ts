import { createClient } from '@supabase/supabase-js';

// Supabase configuration
export const SUPABASE_URL = 'https://ypbenhervlquswwacmuj.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYmVuaGVydmxxdXN3d2FjbXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTE4MjUsImV4cCI6MjA2MzMyNzgyNX0.uTiKbj-Zj2_nUOOebKHDYSi5fb4T-x_V9ryr52r2UiA';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  VENUES: 'venues',
  EVENTS: 'events',
  RESERVATIONS: 'reservations',
  EVENT_REGISTRATIONS: 'event_registrations',
  FAVORITES: 'favorites',
  VISIT_HISTORY: 'visit_history',
  PURCHASE_HISTORY: 'purchase_history',
  PRODUCTS: 'products',
  CART_ITEMS: 'cart_items',
  NOTIFICATIONS: 'notifications',
  PRIVACY_SETTINGS: 'privacy_settings',
  GALLERIES: 'galleries',
  ARTWORKS: 'artworks',
  GALLERY_VISITS: 'gallery_visits',
  ARTWORK_VIEWS: 'artwork_views',
  ARTWORK_PURCHASES: 'artwork_purchases',
  USER_FEEDBACK: 'user_feedback',
} as const;

// Database schemas
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string;
          subscription_id: string;
          subscription_name: string;
          subscription_price: number;
          subscription_renewal_date: string;
          stripe_customer_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string;
          subscription_id?: string;
          subscription_name?: string;
          subscription_price?: number;
          subscription_renewal_date?: string;
          stripe_customer_id?: string;
        };
        Update: {
          name?: string;
          email?: string;
          avatar_url?: string;
          subscription_id?: string;
          subscription_name?: string;
          subscription_price?: number;
          subscription_renewal_date?: string;
          stripe_customer_id?: string;
          updated_at?: string;
        };
      };
      galleries: {
        Row: {
          id: string;
          name: string;
          description?: string;
          location: string;
          image_url?: string;
          hours?: string;
          created_by: string;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string;
          location: string;
          image_url?: string;
          hours?: string;
          created_by: string;
          featured?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          location?: string;
          image_url?: string;
          hours?: string;
          featured?: boolean;
          updated_at?: string;
        };
      };
      artworks: {
        Row: {
          id: string;
          gallery_id: string;
          title: string;
          artist: string;
          year?: string;
          medium?: string;
          dimensions?: string;
          description?: string;
          price?: string;
          image_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          gallery_id: string;
          title: string;
          artist: string;
          year?: string;
          medium?: string;
          dimensions?: string;
          description?: string;
          price?: string;
          image_url?: string;
        };
        Update: {
          title?: string;
          artist?: string;
          year?: string;
          medium?: string;
          dimensions?: string;
          description?: string;
          price?: string;
          image_url?: string;
          updated_at?: string;
        };
      };
      gallery_visits: {
        Row: {
          id: string;
          user_id: string;
          gallery_id: string;
          timestamp: string;
        };
        Insert: {
          user_id: string;
          gallery_id: string;
          timestamp?: string;
        };
        Update: {
          timestamp?: string;
        };
      };
      artwork_views: {
        Row: {
          id: string;
          user_id: string;
          artwork_id: string;
          gallery_id: string;
          timestamp: string;
        };
        Insert: {
          user_id: string;
          artwork_id: string;
          gallery_id: string;
          timestamp?: string;
        };
        Update: {
          timestamp?: string;
        };
      };
      artwork_purchases: {
        Row: {
          id: string;
          user_id: string;
          artwork_id: string;
          gallery_id: string;
          price: number;
          currency: string;
          timestamp: string;
        };
        Insert: {
          user_id: string;
          artwork_id: string;
          gallery_id: string;
          price: number;
          currency?: string;
          timestamp?: string;
        };
        Update: {
          price?: number;
          currency?: string;
          timestamp?: string;
        };
      };
      user_feedback: {
        Row: {
          id: string;
          user_id: string;
          gallery_id: string;
          rating: number;
          comment?: string;
          timestamp: string;
        };
        Insert: {
          user_id: string;
          gallery_id: string;
          rating: number;
          comment?: string;
          timestamp?: string;
        };
        Update: {
          rating?: number;
          comment?: string;
          timestamp?: string;
        };
      };
    };
  };
}

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const hasValidUrl = SUPABASE_URL && SUPABASE_URL !== 'https://your-supabase-url.supabase.co';
  const hasValidKey = SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'your-supabase-anon-key';
  
  return hasValidUrl && hasValidKey;
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
  
  return data;
};

// Helper function to update user profile
export const updateUserProfile = async (userId: string, updates: Database['public']['Tables']['profiles']['Update']) => {
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return data;
};

// Gallery helper functions
export const createGallery = async (galleryData: Database['public']['Tables']['galleries']['Insert']) => {
  const { data, error } = await supabase
    .from(TABLES.GALLERIES)
    .insert(galleryData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating gallery:', error);
    throw error;
  }
  
  return data;
};

export const getGalleries = async () => {
  const { data, error } = await supabase
    .from(TABLES.GALLERIES)
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
  
  return data;
};

export const getGalleryById = async (id: string) => {
  const { data, error } = await supabase
    .from(TABLES.GALLERIES)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching gallery:', error);
    throw error;
  }
  
  return data;
};

export const getArtworksByGallery = async (galleryId: string) => {
  const { data, error } = await supabase
    .from(TABLES.ARTWORKS)
    .select('*')
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching artworks:', error);
    throw error;
  }
  
  return data;
};

export const getArtworkById = async (id: string) => {
  const { data, error } = await supabase
    .from(TABLES.ARTWORKS)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching artwork:', error);
    throw error;
  }
  
  return data;
};

export const createArtwork = async (artworkData: Database['public']['Tables']['artworks']['Insert']) => {
  const { data, error } = await supabase
    .from(TABLES.ARTWORKS)
    .insert(artworkData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating artwork:', error);
    throw error;
  }
  
  return data;
};

export default supabase;