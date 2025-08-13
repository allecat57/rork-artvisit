import { useEffect, useState } from "react";
import timeFrameAPI from "@/utils/timeframe-api";

export const useGalleries = (featured?: boolean) => {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGalleries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching galleries from TIMEFRAME API`);
        const response = await timeFrameAPI.getGalleries();

        if (response && response.success && response.data) {
          let galleriesData = response.data;
          
          // No filtering - show all galleries
          console.log(`Successfully fetched ${galleriesData.length} galleries from TIMEFRAME API`);
          setGalleries(galleriesData);
        } else {
          console.log("No galleries found in TIMEFRAME API");
          setGalleries([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.warn("Failed to fetch galleries from TIMEFRAME API:", err);
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
      
      console.log(`Refetching galleries from TIMEFRAME API`);
      const response = await timeFrameAPI.getGalleries(false); // Force fresh data
      
      if (response && response.success && response.data) {
        let galleriesData = response.data;
        
        // No filtering - show all galleries
        console.log(`Successfully refetched ${galleriesData.length} galleries from TIMEFRAME API`);
        setGalleries(galleriesData);
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
    isUsingMockData: false // Using TIMEFRAME API
  };
};