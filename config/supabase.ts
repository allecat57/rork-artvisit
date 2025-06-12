import { createClient } from "@supabase/supabase-js";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Environment variables - replace with your actual values
const supabaseUrl = "https://ypbenhervlquswwacmuj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYmVuaGVydmxxdXN3d2FjbXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTE4MjUsImV4cCI6MjA2MzMyNzgyNX0.uTiKbj-Zj2_nUOOebKHDYSi5fb4T-x_V9ryr52r2UiA";

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your configuration.');
}

// Create Supabase client with AsyncStorage for React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Type definitions for your database schema
export interface Todo {
  id: string;
  text: string;
  completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  // Add your profile fields here
}

export interface Event {
  id: string;
  // Add your event fields here
}

export interface EventRegistration {
  id: string;
  // Add your registration fields here
}

export interface Booking {
  id: string;
  // Add your booking fields here
}

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== "https://your-supabase-url.supabase.co" && 
    supabaseAnonKey !== "your-supabase-anon-key");
};

// Table names for easy reference
export const TABLES = {
  PROFILES: 'profiles',
  EVENTS: 'events',
  EVENT_REGISTRATIONS: 'event_registrations',
  BOOKINGS: 'bookings',
  TODOS: 'todos',
} as const;

// Enhanced helper functions with better error handling and types
export const fetchTodos = async (): Promise<Todo[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.TODOS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error fetching todos:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};

export const createTodo = async (text: string): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.TODOS)
      .insert([{ text, completed: false }])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating todo:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
};

export const updateTodo = async (id: string, updates: Partial<Omit<Todo, 'id'>>): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.TODOS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error updating todo:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const deleteTodo = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(TABLES.TODOS)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error deleting todo:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

// Authentication helpers (since you have secure storage available)
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};