// Supabase client specifically for gallery operations
import { supabase, fetchGalleries, fetchGalleryById, createGallery, updateGallery, deleteGallery } from '@/config/supabase';

export { 
  supabase,
  fetchGalleries,
  fetchGalleryById,
  createGallery,
  updateGallery,
  deleteGallery
};

export default supabase;