import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Analytics from "@/utils/analytics";
import { 
  getGalleries, 
  getGalleryById, 
  getArtworksByGallery, 
  getArtworkById,
  createGallery,
  createArtwork,
  isSupabaseConfigured 
} from "@/config/supabase";

// Gallery interface
export interface Gallery {
  id: string;
  name: string;
  description?: string;
  location: string;
  image_url?: string;
  hours?: string;
  created_by: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// Artwork interface
export interface Artwork {
  id: string;
  gallery_id: string;
  title: string;
  artist: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  description?: string;
  price?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// Mock data fallback
const mockGalleries: Gallery[] = [
  {
    id: '1',
    name: 'Modern Art Gallery',
    description: 'A contemporary art gallery featuring works from emerging artists around the world.',
    location: 'New York, NY',
    image_url: 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80',
    hours: '10:00 AM - 6:00 PM',
    created_by: 'admin',
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Classical Art Museum',
    description: 'A prestigious museum housing classical art from the Renaissance to the 19th century.',
    location: 'London, UK',
    image_url: 'https://images.unsplash.com/photo-1574182245530-967d9b3831af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80',
    hours: '9:00 AM - 5:00 PM',
    created_by: 'admin',
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const mockArtworks: Artwork[] = [
  {
    id: '101',
    gallery_id: '1',
    title: 'Abstract Harmony',
    artist: 'Jane Smith',
    year: '2021',
    medium: 'Oil on canvas',
    dimensions: '120 x 90 cm',
    description: 'This abstract piece explores the harmony between color and form, creating a visual symphony that invites the viewer to interpret their own meaning.',
    price: '$5,200',
    image_url: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '102',
    gallery_id: '1',
    title: 'Urban Landscape',
    artist: 'Michael Johnson',
    year: '2019',
    medium: 'Acrylic on canvas',
    dimensions: '150 x 100 cm',
    description: 'A vibrant depiction of city life, capturing the energy and chaos of urban environments through bold colors and dynamic brushstrokes.',
    price: '$4,800',
    image_url: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '201',
    gallery_id: '2',
    title: 'Portrait of a Lady',
    artist: 'Leonardo da Vinci',
    year: '1503',
    medium: 'Oil on poplar panel',
    dimensions: '77 x 53 cm',
    description: 'A masterpiece of Renaissance portraiture, showcasing the artist\'s unparalleled skill in capturing human expression and emotion.',
    price: 'Not for sale',
    image_url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '202',
    gallery_id: '2',
    title: 'Sunset over the Sea',
    artist: 'Claude Monet',
    year: '1872',
    medium: 'Oil on canvas',
    dimensions: '50 x 65 cm',
    description: 'A stunning Impressionist seascape that captures the fleeting effects of light and color at sunset, demonstrating Monet\'s revolutionary approach to painting.',
    price: 'Not for sale',
    image_url: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

interface GalleryState {
  galleries: Gallery[];
  artworks: Artwork[];
  selectedGallery: Gallery | null;
  selectedArtwork: Artwork | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchGalleries: () => Promise<void>;
  fetchGalleryById: (id: string) => Promise<Gallery | null>;
  fetchArtworksByGallery: (galleryId: string) => Promise<Artwork[]>;
  fetchArtworkById: (id: string) => Promise<Artwork | null>;
  createNewGallery: (galleryData: any) => Promise<Gallery | null>;
  createNewArtwork: (artworkData: any) => Promise<Artwork | null>;
  setSelectedGallery: (gallery: Gallery | null) => void;
  setSelectedArtwork: (artwork: Artwork | null) => void;
  clearError: () => void;
  
  // Selectors
  getGalleryByIdFromStore: (id: string) => Gallery | undefined;
  getArtworkByIdFromStore: (id: string) => Artwork | undefined;
  getArtworksByGalleryFromStore: (galleryId: string) => Artwork[];
  getFeaturedGalleries: () => Gallery[];
}

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set, get) => ({
      galleries: [],
      artworks: [],
      selectedGallery: null,
      selectedArtwork: null,
      isLoading: false,
      error: null,
      
      fetchGalleries: async () => {
        try {
          set({ isLoading: true, error: null });
          
          let galleries: Gallery[];
          
          if (isSupabaseConfigured()) {
            galleries = await getGalleries();
          } else {
            // Use mock data if Supabase is not configured
            galleries = mockGalleries;
          }
          
          set({ galleries, isLoading: false });
          
          // Log analytics event
          Analytics.logEvent('galleries_fetched', {
            count: galleries.length,
            source: isSupabaseConfigured() ? 'supabase' : 'mock'
          });
        } catch (error: any) {
          console.error('Error fetching galleries:', error);
          set({ 
            error: error.message || 'Failed to fetch galleries',
            isLoading: false,
            galleries: mockGalleries // Fallback to mock data
          });
          
          // Log analytics event
          Analytics.logEvent('galleries_fetch_error', {
            error: error.message || 'Unknown error'
          });
        }
      },
      
      fetchGalleryById: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          let gallery: Gallery | null = null;
          
          if (isSupabaseConfigured()) {
            gallery = await getGalleryById(id);
          } else {
            // Use mock data if Supabase is not configured
            gallery = mockGalleries.find(g => g.id === id) || null;
          }
          
          if (gallery) {
            set({ selectedGallery: gallery, isLoading: false });
            
            // Log analytics event
            Analytics.logEvent('gallery_viewed', {
              gallery_id: gallery.id,
              gallery_name: gallery.name,
              source: isSupabaseConfigured() ? 'supabase' : 'mock'
            });
          } else {
            set({ error: 'Gallery not found', isLoading: false });
          }
          
          return gallery;
        } catch (error: any) {
          console.error('Error fetching gallery:', error);
          set({ 
            error: error.message || 'Failed to fetch gallery',
            isLoading: false 
          });
          return null;
        }
      },
      
      fetchArtworksByGallery: async (galleryId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          let artworks: Artwork[];
          
          if (isSupabaseConfigured()) {
            artworks = await getArtworksByGallery(galleryId);
          } else {
            // Use mock data if Supabase is not configured
            artworks = mockArtworks.filter(a => a.gallery_id === galleryId);
          }
          
          set({ artworks, isLoading: false });
          
          // Log analytics event
          Analytics.logEvent('artworks_fetched', {
            gallery_id: galleryId,
            count: artworks.length,
            source: isSupabaseConfigured() ? 'supabase' : 'mock'
          });
          
          return artworks;
        } catch (error: any) {
          console.error('Error fetching artworks:', error);
          set({ 
            error: error.message || 'Failed to fetch artworks',
            isLoading: false,
            artworks: mockArtworks.filter(a => a.gallery_id === galleryId) // Fallback to mock data
          });
          return [];
        }
      },
      
      fetchArtworkById: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          let artwork: Artwork | null = null;
          
          if (isSupabaseConfigured()) {
            artwork = await getArtworkById(id);
          } else {
            // Use mock data if Supabase is not configured
            artwork = mockArtworks.find(a => a.id === id) || null;
          }
          
          if (artwork) {
            set({ selectedArtwork: artwork, isLoading: false });
            
            // Log analytics event
            Analytics.logEvent('artwork_viewed', {
              artwork_id: artwork.id,
              artwork_title: artwork.title,
              gallery_id: artwork.gallery_id,
              source: isSupabaseConfigured() ? 'supabase' : 'mock'
            });
          } else {
            set({ error: 'Artwork not found', isLoading: false });
          }
          
          return artwork;
        } catch (error: any) {
          console.error('Error fetching artwork:', error);
          set({ 
            error: error.message || 'Failed to fetch artwork',
            isLoading: false 
          });
          return null;
        }
      },
      
      createNewGallery: async (galleryData: any) => {
        try {
          set({ isLoading: true, error: null });
          
          let gallery: Gallery | null = null;
          
          if (isSupabaseConfigured()) {
            gallery = await createGallery(galleryData);
            
            // Refresh galleries list
            const galleries = await getGalleries();
            set({ galleries });
          } else {
            // Create mock gallery
            gallery = {
              id: `gallery-${Date.now()}`,
              ...galleryData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            set(state => ({
              galleries: [gallery!, ...state.galleries]
            }));
          }
          
          set({ isLoading: false });
          
          // Log analytics event
          Analytics.logEvent('gallery_created', {
            gallery_id: gallery?.id,
            gallery_name: gallery?.name,
            source: isSupabaseConfigured() ? 'supabase' : 'mock'
          });
          
          return gallery;
        } catch (error: any) {
          console.error('Error creating gallery:', error);
          set({ 
            error: error.message || 'Failed to create gallery',
            isLoading: false 
          });
          return null;
        }
      },
      
      createNewArtwork: async (artworkData: any) => {
        try {
          set({ isLoading: true, error: null });
          
          let artwork: Artwork | null = null;
          
          if (isSupabaseConfigured()) {
            artwork = await createArtwork(artworkData);
            
            // Refresh artworks list for the gallery
            const artworks = await getArtworksByGallery(artworkData.gallery_id);
            set({ artworks });
          } else {
            // Create mock artwork
            artwork = {
              id: `artwork-${Date.now()}`,
              ...artworkData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            set(state => ({
              artworks: [artwork!, ...state.artworks]
            }));
          }
          
          set({ isLoading: false });
          
          // Log analytics event
          Analytics.logEvent('artwork_created', {
            artwork_id: artwork?.id,
            artwork_title: artwork?.title,
            gallery_id: artwork?.gallery_id,
            source: isSupabaseConfigured() ? 'supabase' : 'mock'
          });
          
          return artwork;
        } catch (error: any) {
          console.error('Error creating artwork:', error);
          set({ 
            error: error.message || 'Failed to create artwork',
            isLoading: false 
          });
          return null;
        }
      },
      
      setSelectedGallery: (gallery) => set({ selectedGallery: gallery }),
      setSelectedArtwork: (artwork) => set({ selectedArtwork: artwork }),
      clearError: () => set({ error: null }),
      
      getGalleryByIdFromStore: (id: string) => {
        const galleries = get().galleries;
        return galleries.find(gallery => gallery.id === id);
      },
      
      getArtworkByIdFromStore: (id: string) => {
        const artworks = get().artworks;
        return artworks.find(artwork => artwork.id === id);
      },
      
      getArtworksByGalleryFromStore: (galleryId: string) => {
        const artworks = get().artworks;
        return artworks.filter(artwork => artwork.gallery_id === galleryId);
      },
      
      getFeaturedGalleries: () => {
        const galleries = get().galleries;
        return galleries.filter(gallery => gallery.featured);
      },
    }),
    {
      name: "gallery-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        galleries: state.galleries,
        artworks: state.artworks,
      }),
    }
  )
);