import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    }
  }
);

// Table names for reference
export const TABLES = {
  PROFILES: 'profiles',
  EVENTS: 'events',
  EVENT_REGISTRATIONS: 'event_registrations',
  FAVORITES: 'favorites',
  VISIT_HISTORY: 'visit_history',
  TODOS: 'todos',
  GALLERY_ANALYTICS: 'gallery_analytics',
  VENUE_BOOKINGS: 'venue_bookings',
  SCREEN_VIEWS: 'screen_views',
  PURCHASES: 'purchases',
};

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
};

// Mock data for when Supabase is not configured
export const MOCK_TODOS = [
  { id: '1', title: 'Learn React Native', completed: true, created_at: new Date().toISOString() },
  { id: '2', title: 'Build a mobile app', completed: false, created_at: new Date().toISOString() },
  { id: '3', title: 'Deploy to app stores', completed: false, created_at: new Date().toISOString() },
];

// Helper functions for common operations
export const fetchTodos = async () => {
  if (!isSupabaseConfigured()) {
    return { data: MOCK_TODOS, error: null };
  }
  
  try {
    return await supabase
      .from(TABLES.TODOS)
      .select('*')
      .order('created_at', { ascending: false });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return { data: null, error };
  }
};

export const createTodo = async (title: string) => {
  if (!isSupabaseConfigured()) {
    return { data: { id: Date.now().toString(), title, completed: false }, error: null };
  }
  
  try {
    return await supabase
      .from(TABLES.TODOS)
      .insert({ title, completed: false })
      .select()
      .single();
  } catch (error) {
    console.error('Error creating todo:', error);
    return { data: null, error };
  }
};

export const updateTodo = async (id: string, updates: any) => {
  if (!isSupabaseConfigured()) {
    return { data: { id, ...updates }, error: null };
  }
  
  try {
    return await supabase
      .from(TABLES.TODOS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  } catch (error) {
    console.error('Error updating todo:', error);
    return { data: null, error };
  }
};

export const deleteTodo = async (id: string) => {
  if (!isSupabaseConfigured()) {
    return { data: { id }, error: null };
  }
  
  try {
    return await supabase
      .from(TABLES.TODOS)
      .delete()
      .eq('id', id);
  } catch (error) {
    console.error('Error deleting todo:', error);
    return { data: null, error };
  }
};