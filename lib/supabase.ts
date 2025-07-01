// Re-export supabase client and utilities from config
import { 
  supabase, 
  TABLES, 
  isSupabaseConfigured,
  fetchGalleries,
  fetchGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
  getCurrentUser,
  signOut,
  getUserProfile,
  updateUserProfile
} from '@/config/supabase';

export { 
  supabase, 
  TABLES, 
  isSupabaseConfigured,
  fetchGalleries,
  fetchGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
  getCurrentUser,
  signOut,
  getUserProfile,
  updateUserProfile
};