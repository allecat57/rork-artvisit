// Supabase client specifically for gallery operations
import { 
  supabase, 
  fetchGalleries, 
  fetchGalleryById, 
  createGallery, 
  updateGallery, 
  deleteGallery,
  addFeaturedGallery,
  removeFeaturedGallery
} from '@/config/supabase';

export { 
  supabase,
  fetchGalleries,
  fetchGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
  addFeaturedGallery,
  removeFeaturedGallery
};

export default supabase;