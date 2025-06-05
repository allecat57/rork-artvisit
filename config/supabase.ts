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
  TODOS: 'todos',
};

// Helper functions for Supabase operations
export const fetchTodos = async () => {
  try {
    const { data, error } = await supabase.from('todos').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};

export const createTodo = async (text: string) => {
  try {
    const { data, error } = await supabase.from('todos').insert([{ text }]).select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
};

export const updateTodo = async (id: string, text: string) => {
  try {
    const { data, error } = await supabase.from('todos').update({ text }).eq('id', id).select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const deleteTodo = async (id: string) => {
  try {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};