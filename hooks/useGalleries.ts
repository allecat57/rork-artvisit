import { useEffect, useState } from "react";
import { isSupabaseConfigured, fetchGalleries } from "@/config/supabase";

// TimeFrame API integration - no local mock data needed

export const useGalleries = (featured?: boolean) => {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGalleries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching galleries from Supabase (featured: ${featured})`);
        const data = await fetchGalleries(featured);

        if (data && data.length > 0) {
          console.log(`Successfully fetched ${data.length} galleries from Supabase`);
          setGalleries(data);
        } else {
          console.log("No galleries found in Supabase");
          setGalleries([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.warn("Failed to fetch galleries from Supabase:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch galleries");
        setLoading(false);
        setGalleries([]);
      }
    };

    // Only load if Supabase is configured
    if (isSupabaseConfigured()) {
      loadGalleries();
    } else {
      console.log("Supabase not configured, no galleries available");
      setGalleries([]);
      setLoading(false);
    }
  }, [featured]);

  const refetch = async () => {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Refetching galleries from Supabase (featured: ${featured})`);
      const data = await fetchGalleries(featured);
      
      if (data && data.length > 0) {
        console.log(`Successfully refetched ${data.length} galleries from Supabase`);
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
    isUsingMockData: !isSupabaseConfigured()
  };
};