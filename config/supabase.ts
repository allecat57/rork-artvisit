import { createClient } from "@supabase/supabase-js";

// Make sure to use environment variables for sensitive data in production
const supabaseUrl = "https://your-supabase-url.supabase.co";
const supabaseAnonKey = "your-supabase-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);