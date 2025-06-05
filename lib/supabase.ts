// Re-export supabase client and utilities from config
import { supabase, TABLES, isSupabaseConfigured, fetchTodos, createTodo, updateTodo, deleteTodo } from '@/config/supabase';

export { 
  supabase, 
  TABLES, 
  isSupabaseConfigured,
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo
};