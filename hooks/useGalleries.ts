import { useEffect, useState } from "react";

// TimeFrame API configuration
const USE_MOCK_DATA = false; // Set to false to use real TimeFrame API data
const TIMEFRAME_API_BASE = "http://localhost:5000"; // Change to your deployed URL when ready

// TimeFrame API client
const timeframeAPI = {
  async fetchGalleries(featured?: boolean) {
    try {
      console.log(`Fetching galleries from TimeFrame API (featured: ${featured})`);
      
      const response = await fetch(`${TIMEFRAME_API_BASE}/api/mobile/galleries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`TimeFrame API: Received ${result.count || 0} galleries`);
      
      let galleries = result.data || [];
      
      // Filter for featured galleries if requested
      if (featured) {
        galleries = galleries.filter((gallery: any) => gallery.artworkCount > 2);
      }
      
      return galleries;
    } catch (error) {
      console.error('TimeFrame API Error:', error);
      throw error;
    }
  }
};

export const useGalleries = (featured?: boolean) => {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGalleries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching galleries from TimeFrame API (featured: ${featured})`);
        const data = await timeframeAPI.fetchGalleries(featured);

        if (data && data.length > 0) {
          console.log(`Successfully fetched ${data.length} galleries from TimeFrame API`);
          setGalleries(data);
        } else {
          console.log("No galleries found in TimeFrame API");
          setGalleries([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.warn("Failed to fetch galleries from TimeFrame API:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch galleries");
        setLoading(false);
        setGalleries([]);
      }
    };

    loadGalleries();
  }, [featured]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Refetching galleries from TimeFrame API (featured: ${featured})`);
      const data = await timeframeAPI.fetchGalleries(featured);
      
      if (data && data.length > 0) {
        console.log(`Successfully refetched ${data.length} galleries from TimeFrame API`);
        setGalleries(data);
      } else {
        setGalleries([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.warn("Failed to refetch galleries:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch galleries");
      setLoading(false);
    }
  };

  return { 
    galleries, 
    loading, 
    error,
    refetch,
    isUsingMockData: USE_MOCK_DATA
  };
};