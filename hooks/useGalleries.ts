import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured, fetchGalleries } from "@/config/supabase";

// Mock gallery data as fallback
const MOCK_GALLERIES = [
  {
    id: "1",
    name: "Modern Art Gallery",
    location: "Downtown Arts District",
    description: "Contemporary art from emerging and established artists",
    image_url: null,
    rating: 4.8,
    hours: "Open today 10AM - 6PM",
    category: "Gallery",
    featured: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "2", 
    name: "Classical Paintings Museum",
    location: "Historic Quarter",
    description: "Renaissance and classical masterpieces",
    image_url: null,
    rating: 4.9,
    hours: "Open today 10AM - 6PM",
    category: "Museum",
    featured: true,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z"
  },
  {
    id: "3",
    name: "Sculpture Garden",
    location: "City Park",
    description: "Outdoor sculpture installations and garden art",
    image_url: null,
    rating: 4.7,
    hours: "Open today 10AM - 6PM",
    category: "Garden",
    featured: true,
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z"
  },
  {
    id: "4",
    name: "Photography Studio",
    location: "Creative District",
    description: "Contemporary photography exhibitions",
    image_url: null,
    rating: 4.6,
    hours: "Open today 10AM - 6PM",
    category: "Studio",
    featured: false,
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-04T00:00:00Z"
  },
  {
    id: "5",
    name: "Digital Art Space",
    location: "Tech Hub",
    description: "Interactive digital art and multimedia installations",
    image_url: null,
    rating: 4.5,
    hours: "Open today 10AM - 6PM",
    category: "Digital",
    featured: false,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z"
  }
];

export const useGalleries = (featured?: boolean) => {
  const [galleries, setGalleries] = useState(MOCK_GALLERIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGalleries = async () => {
      // Only try to fetch from Supabase if it's properly configured
      if (!isSupabaseConfigured()) {
        console.log("Supabase not configured, using mock galleries");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchGalleries(featured);

        if (data && data.length > 0) {
          setGalleries(data);
        } else {
          // If no data returned from Supabase, keep using mock galleries
          console.log("No galleries found in Supabase, using mock data");
        }
        
        setLoading(false);
      } catch (err) {
        console.warn("Failed to fetch galleries from Supabase, using mock data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch galleries");
        setLoading(false);
        // Keep using mock galleries on error
      }
    };

    loadGalleries();
  }, [featured]);

  const refetch = async () => {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchGalleries(featured);
      
      if (data && data.length > 0) {
        setGalleries(data);
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