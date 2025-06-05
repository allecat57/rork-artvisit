import { createClient } from "@supabase/supabase-js";

// Use environment variables with fallback for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://your-supabase-url.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-supabase-anon-key";

// Check if Supabase is properly configured before creating client
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl !== "https://your-supabase-url.supabase.co" && supabaseAnonKey !== "your-supabase-anon-key";
};

export const supabase = isSupabaseConfigured() ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Table names for easy reference
export const TABLES = {
  PROFILES: 'profiles',
  EVENTS: 'events',
  EVENT_REGISTRATIONS: 'event_registrations',
  BOOKINGS: 'bookings',
  TODOS: 'todos',
};

// Helper functions for Supabase operations with fallback for unconfigured state
export const fetchTodos = async () => {
  if (!supabase || !isSupabaseConfigured()) {
    console.warn("Supabase is not configured. Using mock data or empty response.");
    return [];
  }
  const { data, error } = await supabase.from('todos').select('*');
  if (error) throw error;
  return data;
};

export const createTodo = async (text: string) => {
  if (!supabase || !isSupabaseConfigured()) {
    console.warn("Supabase is not configured. Skipping operation.");
    return null;
  }
  const { data, error } = await supabase.from('todos').insert([{ text }]).select();
  if (error) throw error;
  return data[0];
};

export const updateTodo = async (id: string, text: string) => {
  if (!supabase || !isSupabaseConfigured()) {
    console.warn("Supabase is not configured. Skipping operation.");
    return null;
  }
  const { data, error } = await supabase.from('todos').update({ text }).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

export const deleteTodo = async (id: string) => {
  if (!supabase || !isSupabaseConfigured()) {
    console.warn("Supabase is not configured. Skipping operation.");
    return false;
  }
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) throw error;
  return true;
};