import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const useGalleries = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleries = async () => {
      const { data, error } = await supabase
        .from("galleries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading galleries:", error);
        setLoading(false);
        return;
      }

      setGalleries(data);
      setLoading(false);
    };

    fetchGalleries();
  }, []);

  return { galleries, loading };
};