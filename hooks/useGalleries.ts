import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/config/supabase";

// Mock gallery data as fallback
const MOCK_GALLERIES = [
  {
    id: "1",
    name: "Modern Art Gallery",
    location: "Downtown Arts District",
    description: "Contemporary art from emerging and established artists",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "2", 
    name: "Classical Paintings Museum",
    location: "Historic Quarter",
    description: "Renaissance and classical masterpieces",
    created_at: "2024-01-02T00:00:00Z"
  },
  {
    id: "3",
    name: "Sculpture Garden",
    location: "City Park",
    description: "Outdoor sculpture installations and garden art",
    created_at: "2024-01-03T00:00:00Z"
  },
  {
    id: "4",
    name: "Photography Studio",
    location: "Creative District",
    description: "Contemporary photography exhibitions",
    created_at: "2024-01-04T00:00:00Z"
  },
  {
    id: "5",
    name: "Digital Art Space",
    location: "Tech Hub",
    description: "Interactive digital art and multimedia installations",
    created_at: "2024-01-05T00:00:00Z"
  }
];

export const useGalleries = () => {
  const [galleries, setGalleries] = useState(MOCK_GALLERIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGalleries = async () => {
      // Only try to fetch from Supabase if it's properly configured
      if (!isSupabaseConfigured()) {
        console.log("Supabase not configured, using mock galleries");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("galleries")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Error loading galleries from Supabase, using mock data:", error.message);
          // Keep using mock data on error
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          setGalleries(data);
        }
        // If no data returned, keep using mock galleries
        
        setLoading(false);
      } catch (err) {
        console.warn("Failed to fetch galleries, using mock data:", err);
        setLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  return { galleries, loading };
};