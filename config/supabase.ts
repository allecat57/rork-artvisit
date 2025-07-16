import { createClient } from '@supabase/supabase-js';

// Supabase configuration
export const SUPABASE_URL = 'https://ypbenhervlquswwacmuj.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYmVuaGVydmxxdXN3d2FjbXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTE4MjUsImV4cCI6MjA2MzMyNzgyNX0.uTiKbj-Zj2_nUOOebKHDYSi5fb4T-x_V9ryr52r2UiA';

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  GALLERIES: 'galleries',
  FEATURED_GALLERIES: 'featured_galleries',
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
          location: string;
          description?: string;
          image_url?: string;
          rating?: number;
          hours?: string;
          category?: string;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          location: string;
          description?: string;
          image_url?: string;
          rating?: number;
          hours?: string;
          category?: string;
          featured?: boolean;
        };
        Update: {
          name?: string;
          location?: string;
          description?: string;
          image_url?: string;
          rating?: number;
          hours?: string;
          category?: string;
          featured?: boolean;
          updated_at?: string;
        };
      };
      featured_galleries: {
        Row: {
          id: string;
          gallery_id: string;
          is_active: boolean;
          expires_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          gallery_id: string;
          is_active?: boolean;
          expires_at?: string;
        };
        Update: {
          gallery_id?: string;
          is_active?: boolean;
          expires_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description?: string;
          events_date: string;
          end_date?: string;
          location: string;
          price: number;
          capacity: number;
          remaining_spots: number;
          image_url?: string;
          type: string;
          access_level: 'free' | 'essential' | 'collector';
          tags?: string[];
          is_featured?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description?: string;
          events_date: string;
          end_date?: string;
          location: string;
          price?: number;
          capacity: number;
          remaining_spots?: number;
          image_url?: string;
          type: string;
          access_level?: 'free' | 'essential' | 'collector';
          tags?: string[];
          is_featured?: boolean;
        };
        Update: {
          title?: string;
          description?: string;
          events_date?: string;
          end_date?: string;
          location?: string;
          price?: number;
          capacity?: number;
          remaining_spots?: number;
          image_url?: string;
          type?: string;
          access_level?: 'free' | 'essential' | 'collector';
          tags?: string[];
          is_featured?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}

// Create Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const hasValidUrl = SUPABASE_URL && SUPABASE_URL.startsWith('https://') && SUPABASE_URL.includes('.supabase.co');
  const hasValidKey = SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20;
  
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

// Gallery-specific helper functions
export const fetchGalleries = async (featured?: boolean) => {
  try {
    if (featured) {
      // Use the custom SQL query for featured galleries
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(TABLES.GALLERIES)
        .select(`
          *,
          featured_galleries!inner(
            is_active,
            expires_at
          )
        `)
        .eq('featured_galleries.is_active', true)
        .or(`featured_galleries.expires_at.is.null,featured_galleries.expires_at.gt.${now}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching featured galleries:', error);
        throw error;
      }
      
      return data;
    } else {
      // Fetch all galleries
      const { data, error } = await supabase
        .from(TABLES.GALLERIES)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching galleries:', error);
        throw error;
      }
      
      return data;
    }
  } catch (error) {
    console.error('Error in fetchGalleries:', error);
    throw error;
  }
};

export const fetchGalleryById = async (id: string) => {
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

export const createGallery = async (gallery: Database['public']['Tables']['galleries']['Insert']) => {
  const { data, error } = await supabase
    .from(TABLES.GALLERIES)
    .insert({
      ...gallery,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating gallery:', error);
    throw error;
  }
  
  return data;
};

export const updateGallery = async (id: string, updates: Database['public']['Tables']['galleries']['Update']) => {
  const { data, error } = await supabase
    .from(TABLES.GALLERIES)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating gallery:', error);
    throw error;
  }
  
  return data;
};

export const deleteGallery = async (id: string) => {
  const { error } = await supabase
    .from(TABLES.GALLERIES)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting gallery:', error);
    throw error;
  }
};

// Featured galleries helper functions
export const addFeaturedGallery = async (galleryId: string, expiresAt?: string) => {
  const { data, error } = await supabase
    .from(TABLES.FEATURED_GALLERIES)
    .insert({
      gallery_id: galleryId,
      is_active: true,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding featured gallery:', error);
    throw error;
  }
  
  return data;
};

export const removeFeaturedGallery = async (galleryId: string) => {
  const { error } = await supabase
    .from(TABLES.FEATURED_GALLERIES)
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('gallery_id', galleryId);
  
  if (error) {
    console.error('Error removing featured gallery:', error);
    throw error;
  }
};

// Events helper functions
export const fetchEvents = async (accessLevel?: 'free' | 'essential' | 'collector') => {
  try {
    let query = supabase
      .from(TABLES.EVENTS)
      .select('*')
      .order('events_date', { ascending: true });

    if (accessLevel) {
      // Filter events based on access level
      if (accessLevel === 'free') {
        query = query.eq('access_level', 'free');
      } else if (accessLevel === 'essential') {
        query = query.in('access_level', ['free', 'essential']);
      }
      // collector can see all events, so no filter needed
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchEvents:', error);
    throw error;
  }
};

export const fetchEventById = async (id: string) => {
  const { data, error } = await supabase
    .from(TABLES.EVENTS)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
  
  return data;
};

export default supabase;
