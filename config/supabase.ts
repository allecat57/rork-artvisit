import { createClient } from '@supabase/supabase-js';

// Supabase configuration
export const SUPABASE_URL = 'https://ypbenhervlquswwacmuj.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYmVuaGVydmxxdXN3d2FjbXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTE4MjUsImV4cCI6MjA2MzMyNzgyNX0.uTiKbj-Zj2_nUOOebKHDYSi5fb4T-x_V9ryr52r2UiA';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  GALLERIES: 'galleries',
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

// Gallery-specific helper functions
export const fetchGalleries = async (featured?: boolean) => {
  let query = supabase
    .from(TABLES.GALLERIES)
    .select('*')
    .order('created_at', { ascending: false });
  
  if (featured !== undefined) {
    query = query.eq('featured', featured);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
  
  return data;
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

export default supabase;