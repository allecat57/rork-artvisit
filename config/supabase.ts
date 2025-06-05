import { createClient } from "@supabase/supabase-js";

// Make sure to use environment variables for sensitive data in production
const supabaseUrl = "https://your-supabase-url.supabase.co";
const supabaseAnonKey = "your-supabase-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl !== "https://your-supabase-url.supabase.co" && supabaseAnonKey !== "your-supabase-anon-key";
};

// Table names for easy reference
export const TABLES = {
  PROFILES: 'profiles',
  EVENTS: 'events',
  EVENT_REGISTRATIONS: 'event_registrations',
  BOOKINGS: 'bookings',
};

// Helper functions for Supabase operations
export const fetchTodos = async () => {
  const { data, error } = await supabase.from('todos').select('*');
  if (error) throw error;
  return data;
};

export const createTodo = async (text: string) => {
  const { data, error } = await supabase.from('todos').insert([{ text }]).select();
  if (error) throw error;
  return data[0];
};

export const updateTodo = async (id: string, text: string) => {
  const { data, error } = await supabase.from('todos').update({ text }).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

export const deleteTodo = async (id: string) => {
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) throw error;
  return true;
};