import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Analytics from "@/utils/analytics";


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

// Mock data - Supabase removed
const mockGalleries: Gallery[] = [];

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
  clearCache: () => void;
  
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
          
          const galleries: Gallery[] = mockGalleries;
          
          set({ galleries, isLoading: false });
          
          Analytics.logEvent('galleries_fetched', {
            count: galleries.length,
            source: 'mock'
          });
        } catch (error: any) {
          console.error('Error fetching galleries:', error);
          set({ 
            error: error.message || 'Failed to fetch galleries',
            isLoading: false,
            galleries: [] // No fallback data
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
          
          const gallery: Gallery | null = mockGalleries.find(g => g.id === id) || null;
          
          if (gallery) {
            set({ selectedGallery: gallery, isLoading: false });
            
            Analytics.logEvent('gallery_viewed', {
              gallery_id: gallery.id,
              gallery_name: gallery.name,
              source: 'mock'
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
          
          const artworks: Artwork[] = [];
          
          set({ artworks, isLoading: false });
          
          Analytics.logEvent('artworks_fetched', {
            gallery_id: galleryId,
            count: artworks.length,
            source: 'mock'
          });
          
          return artworks;
        } catch (error: any) {
          console.error('Error fetching artworks:', error);
          set({ 
            error: error.message || 'Failed to fetch artworks',
            isLoading: false,
            artworks: []
          });
          return [];
        }
      },
      
      fetchArtworkById: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const artwork: Artwork | null = null;
          
          set({ error: 'Artwork not found', isLoading: false });
          
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
          
          const gallery: Gallery = {
            id: `gallery-${Date.now()}`,
            ...galleryData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          set(state => ({
            galleries: [gallery, ...state.galleries]
          }));
          
          set({ isLoading: false });
          
          Analytics.logEvent('gallery_created', {
            gallery_id: gallery.id,
            gallery_name: gallery.name,
            source: 'mock'
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
          
          const artwork: Artwork = {
            id: `artwork-${Date.now()}`,
            ...artworkData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          set(state => ({
            artworks: [artwork, ...state.artworks]
          }));
          
          set({ isLoading: false });
          
          Analytics.logEvent('artwork_created', {
            artwork_id: artwork.id,
            artwork_title: artwork.title,
            gallery_id: artwork.gallery_id,
            source: 'mock'
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
      
      clearCache: () => {
        console.log('🧹 Clearing gallery store cache');
        set({
          galleries: [],
          artworks: [],
          selectedGallery: null,
          selectedArtwork: null,
          error: null,
          isLoading: false
        });
      },
      
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