import { useEffect, useState } from "react";
import timeFrameAPI from "@/utils/timeframe-api";

export const useGalleries = (featured?: boolean) => {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    const loadGalleries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching galleries from TIMEFRAME API`);
        const response = await timeFrameAPI.getGalleries();

        if (response && response.success && response.data) {
          let galleriesData = response.data;
          
          // Check if we're using mock data by looking at the API response
          const usingMock = response.data.length > 0 && response.data[0].id === 1 && response.data[0].name === "Modern Art Collective";
          setIsUsingMockData(usingMock);
          
          // No filtering - show all galleries
          console.log(`Successfully fetched ${galleriesData.length} galleries from TIMEFRAME API${usingMock ? ' (mock data)' : ''}`);
          setGalleries(galleriesData);
        } else {
          console.log("No galleries found in TIMEFRAME API");
          setGalleries([]);
          setIsUsingMockData(false);
        }
        
        setLoading(false);
      } catch (err) {
        console.warn("Failed to fetch galleries from TIMEFRAME API:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch galleries";
        console.log("Error details:", errorMessage);
        setError(`TIMEFRAME API Error: ${errorMessage}`);
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
        
        // Check if we're using mock data
        const usingMock = response.data.length > 0 && response.data[0].id === 1 && response.data[0].name === "Modern Art Collective";
        setIsUsingMockData(usingMock);
        
        // No filtering - show all galleries
        console.log(`Successfully refetched ${galleriesData.length} galleries from TIMEFRAME API${usingMock ? ' (mock data)' : ''}`);
        setGalleries(galleriesData);
      } else {
        setGalleries([]);
        setIsUsingMockData(false);
      }
      
      setLoading(false);
    } catch (err) {
      console.warn("Failed to refetch galleries:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch galleries";
      console.log("Refetch error details:", errorMessage);
      setError(`TIMEFRAME API Error: ${errorMessage}`);
      setLoading(false);
    }
  };

  return { 
    galleries, 
    loading, 
    error,
    refetch,
    isUsingMockData
  };
};