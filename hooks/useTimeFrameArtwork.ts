import { useState, useEffect, useCallback } from 'react';
import TimeFrameAPI from '@/utils/timeframe-api';
import { Product } from '@/types/product';

interface TimeFrameArtwork {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  artist_name: string;
  medium: string;
  year: number;
  dimensions: string;
  gallery_id: number;
  gallery_name: string;
  category: string;
  tags: string[];
  available: boolean;
}

interface UseTimeFrameArtworkResult {
  artworks: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Convert TimeFrame artwork to Product format
const convertToProduct = (artwork: TimeFrameArtwork, galleryId?: number): Product => {
  return {
    id: `timeframe-${galleryId || artwork.gallery_id}-${artwork.id}`,
    title: artwork.name || 'Untitled',
    description: artwork.description || 'No description available',
    price: typeof artwork.price === 'number' ? artwork.price : 0,
    image: artwork.image_url || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    imageUrl: artwork.image_url || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: artwork.category || 'Contemporary Art',
    featured: Math.random() > 0.7, // Randomly feature some artworks
    inventory: artwork.available ? 1 : 0,
    inStock: artwork.available !== false,
    artist: artwork.artist_name || 'Unknown Artist',
    medium: artwork.medium || 'Mixed Media',
    year: artwork.year?.toString() || new Date().getFullYear().toString(),
    gallery: artwork.gallery_name || 'TimeFrame Gallery',
    dimensions: artwork.dimensions || 'Not specified',
    weight: '0.5 kg', // Default weight
    tags: artwork.tags || ['timeframe', 'gallery']
  };
};

export const useTimeFrameArtwork = (): UseTimeFrameArtworkResult => {
  const [artworks, setArtworks] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtworks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎨 Fetching galleries from TimeFrame API...');
      const galleriesResponse = await TimeFrameAPI.getGalleries();
      
      if (!galleriesResponse.success) {
        throw new Error('Failed to fetch galleries');
      }

      const allArtworks: Product[] = [];
      
      // Fetch artworks from each gallery
      for (const gallery of galleriesResponse.data) {
        try {
          console.log(`🖼️ Fetching artworks for gallery: ${gallery.name}`);
          const artworksResponse = await TimeFrameAPI.getGalleryArtworks(gallery.id);
          
          if (artworksResponse.success && artworksResponse.data) {
            const galleryArtworks = artworksResponse.data
              .filter((artwork: any) => artwork && typeof artwork === 'object')
              .map((artwork: any) => {
                try {
                  return convertToProduct({
                    ...artwork,
                    gallery_id: gallery.id,
                    gallery_name: gallery.name
                  }, gallery.id);
                } catch (conversionError) {
                  console.warn('Failed to convert artwork:', artwork, conversionError);
                  return null;
                }
              })
              .filter((artwork: Product | null): artwork is Product => artwork !== null);
            allArtworks.push(...galleryArtworks);
          }
        } catch (galleryError) {
          console.warn(`Failed to fetch artworks for gallery ${gallery.name}:`, galleryError);
        }
      }
      
      console.log(`✅ Loaded ${allArtworks.length} artworks from TimeFrame`);
      setArtworks(allArtworks);
      
    } catch (err) {
      console.error('❌ Error fetching TimeFrame artworks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch artworks');
      
      // Fallback to mock data if API fails
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  return {
    artworks,
    loading,
    error,
    refetch: fetchArtworks
  };
};