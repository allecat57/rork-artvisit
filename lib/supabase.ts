import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback to prevent runtime errors
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if both values are provided
export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
};

export const TABLES = {
  TODOS: 'todos',
  PROFILES: 'profiles',
  VENUES: 'venues',
  EVENTS: 'events',
};

export const fetchTodos = async () => {
  if (!supabase || !isSupabaseConfigured()) {
    console.warn("Supabase is not configured. Returning empty array.");
    return [];
  }
  const { data, error } = await supabase.from(TABLES.TODOS).select('*');
  if (error) throw error;
  return data;
};

export const createTodo = async (text: string) => {
  if (!supabase || !isSupabaseConfigured()) {
    console.warn("Supabase is not configured. Skipping operation.");
    return null;
  }
  const { data, error } = await supabase.from(TABLES.TODOS).insert([{ text }]).select();
  if (error) throw error;
  return data[0];
};

export const updateTodo = async (id: string, text: string) => {
  if (!supabase || !isSupabaseConfigured()) {
    console.warn("Supabase is not configured. Skipping operation.");
    return null;
  }
  const { data, error } = await supabase.from(TABLES.TODOS).update({ text }).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

export const deleteTodo = async (id: string) => {
  if (!supabase || !isSupabaseConfigured()) {
    console.warn("Supabase is not configured. Skipping operation.");
    return false;
  }
  const { error } = await supabase.from(TABLES.TODOS).delete().eq('id', id);
  if (error) throw error;
  return true;
};