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
    };
  };
}

// Validation function to check if Supabase is properly configured
export const validateSupabaseConfig = () => {
  const isConfigured = supabaseUrl !== 'https://your-supabase-url.supabase.co' && 
                      supabaseAnonKey !== 'your-supabase-anon-key';
  
  if (!isConfigured) {
    console.warn('Supabase is not properly configured. Please update the URL and anon key.');
    return false;
  }
  
  return true;
};

// Initialize Supabase connection
export const initializeSupabase = async () => {
  try {
    if (!validateSupabaseConfig()) {
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