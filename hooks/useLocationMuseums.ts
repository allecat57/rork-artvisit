import { useState, useEffect, useCallback } from 'react';
import LocationMuseumService, { LocationBasedMuseum } from '@/utils/location-museum-service';
import { useLocationStore } from '@/store/useLocationStore';

interface UseLocationMuseumsResult {
  museums: LocationBasedMuseum[];
  nearbyMuseums: LocationBasedMuseum[];
  featuredMuseums: LocationBasedMuseum[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchMuseums: (query: string) => Promise<LocationBasedMuseum[]>;
  getMuseumsByCity: (city: string) => Promise<LocationBasedMuseum[]>;
  clearCacheAndRefetch: () => Promise<void>;
}

export const useLocationMuseums = (
  maxDistance: number = 50,
  autoFetch: boolean = true
): UseLocationMuseumsResult => {
  const [museums, setMuseums] = useState<LocationBasedMuseum[]>([]);
  const [nearbyMuseums, setNearbyMuseums] = useState<LocationBasedMuseum[]>([]);
  const [featuredMuseums, setFeaturedMuseums] = useState<LocationBasedMuseum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentLocation } = useLocationStore();

  const fetchMuseums = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🏛️ Fetching location-based museums...');
      
      // Get all museums
      const allMuseums = await LocationMuseumService.getMuseumsNearLocation(
        currentLocation || undefined,
        1000, // Large radius to get all museums
        true
      );

      // Get nearby museums (within specified distance)
      const nearby = await LocationMuseumService.getMuseumsNearLocation(
        currentLocation || undefined,
        maxDistance,
        true
      );

      // Get featured museums
      const featured = await LocationMuseumService.getFeaturedMuseums(
        currentLocation || undefined,
        5
      );

      setMuseums(allMuseums);
      setNearbyMuseums(nearby);
      setFeaturedMuseums(featured);

      console.log(`✅ Loaded ${allMuseums.length} total museums, ${nearby.length} nearby, ${featured.length} featured`);
      
    } catch (err) {
      console.error('❌ Error fetching location museums:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch museums');
    } finally {
      setLoading(false);
    }
  }, [currentLocation, maxDistance]);

  const searchMuseums = useCallback(async (query: string): Promise<LocationBasedMuseum[]> => {
    try {
      console.log(`🔍 Searching museums for: "${query}"`);
      const results = await LocationMuseumService.searchMuseums(
        query,
        currentLocation || undefined
      );
      console.log(`✅ Found ${results.length} museums matching "${query}"`);
      return results;
    } catch (err) {
      console.error('❌ Error searching museums:', err);
      return [];
    }
  }, [currentLocation]);

  const getMuseumsByCity = useCallback(async (city: string): Promise<LocationBasedMuseum[]> => {
    try {
      console.log(`🏙️ Getting museums in city: ${city}`);
      const results = await LocationMuseumService.getMuseumsByCity(city);
      console.log(`✅ Found ${results.length} museums in ${city}`);
      return results;
    } catch (err) {
      console.error(`❌ Error getting museums for city ${city}:`, err);
      return [];
    }
  }, []);

  const clearCacheAndRefetch = useCallback(async () => {
    console.log('🧹 Clearing location museum cache and refetching...');
    LocationMuseumService.clearCache();
    await fetchMuseums();
  }, [fetchMuseums]);

  // Auto-fetch when location changes or component mounts
  useEffect(() => {
    if (autoFetch) {
      fetchMuseums();
    }
  }, [fetchMuseums, autoFetch]);

  return {
    museums,
    nearbyMuseums,
    featuredMuseums,
    loading,
    error,
    refetch: fetchMuseums,
    searchMuseums,
    getMuseumsByCity,
    clearCacheAndRefetch
  };
};