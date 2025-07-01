import { supabase } from "@/lib/supabaseClient";

export const fetchGalleries = async () => {
  const { data, error } = await supabase
    .from("galleries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching galleries:", error);
    return [];
  }

  return data;
};