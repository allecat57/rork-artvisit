import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = 'https://ypbenhervlquswwacmuj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYmVuaGVydmxxdXN3d2FjbXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTE4MjUsImV4cCI6MjA2MzMyNzgyNX0.uTiKbj-Zj2_nUOOebKHDYSi5fb4T-x_V9ryr52r2UiA';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      venues: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          location: string;
          latitude: number;
          longitude: number;
          image_url: string;
          rating: number;
          price_range: string;
          opening_hours: string;
          amenities: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: string;
          location: string;
          latitude: number;
          longitude: number;
          image_url: string;
          rating?: number;
          price_range: string;
          opening_hours: string;
          amenities?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          location?: string;
          latitude?: number;
          longitude?: number;
          image_url?: string;
          rating?: number;
          price_range?: string;
          opening_hours?: string;
          amenities?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          image: string;
          date: string;
          end_date: string;
          location: string;
          price: number;
          capacity: number;
          remaining_spots: number;
          access_level: string;
          is_featured: boolean;
          tags: string[];
          type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image: string;
          date: string;
          end_date?: string;
          location: string;
          price: number;
          capacity: number;
          remaining_spots?: number;
          access_level: string;
          is_featured?: boolean;
          tags?: string[];
          type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image?: string;
          date?: string;
          end_date?: string;
          location?: string;
          price?: number;
          capacity?: number;
          remaining_spots?: number;
          access_level?: string;
          is_featured?: boolean;
          tags?: string[];
          type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          registration_date: string;
          number_of_tickets: number;
          total_price: number;
          confirmation_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          registration_date: string;
          number_of_tickets: number;
          total_price: number;
          confirmation_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          registration_date?: string;
          number_of_tickets?: number;
          total_price?: number;
          confirmation_code?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          profile_image: string;
          payment_method: any;
          subscription_id: string;
          subscription_name: string;
          subscription_price: number;
          subscription_renewal_date: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          stripe_customer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          profile_image?: string;
          payment_method?: any;
          subscription_id?: string;
          subscription_name?: string;
          subscription_price?: number;
          subscription_renewal_date?: string;
          stripe_subscription_id?: string;
          stripe_price_id?: string;
          stripe_customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          profile_image?: string;
          payment_method?: any;
          subscription_id?: string;
          subscription_name?: string;
          subscription_price?: number;
          subscription_renewal_date?: string;
          stripe_subscription_id?: string;
          stripe_price_id?: string;
          stripe_customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Table names constants
export const TABLES = {
  VENUES: 'venues',
  EVENTS: 'events',
  EVENT_REGISTRATIONS: 'event_registrations',
  PROFILES: 'profiles',
} as const;

// Validation function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  // Check if we have actual values instead of placeholder values
  const hasValidUrl = supabaseUrl && 
                     supabaseUrl.length > 0 && 
                     supabaseUrl.includes('supabase.co') &&
                     !supabaseUrl.includes('your-supabase-url');
                     
  const hasValidKey = supabaseAnonKey && 
                     supabaseAnonKey.length > 0 &&
                     !supabaseAnonKey.includes('your-supabase-anon-key');
  
  const isConfigured = hasValidUrl && hasValidKey;
  
  if (!isConfigured) {
    console.warn('Supabase is not properly configured. Please update the URL and anon key.');
    return false;
  }
  
  return true;
};

// Validation function using the old name for backward compatibility
export const validateSupabaseConfig = isSupabaseConfigured;

// Initialize Supabase connection
export const initializeSupabase = async () => {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase configuration is invalid');
    }
    
    // Test the connection
    const { data, error } = await supabase.from('venues').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return false;
  }
};

export default supabase;