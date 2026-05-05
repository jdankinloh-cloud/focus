import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key || url === "YOUR_SUPABASE_URL") {
  console.warn("Supabase not configured, using localStorage fallback");
}

export const supabase =
  url && key && url !== "YOUR_SUPABASE_URL"
    ? createClient(url, key)
    : null;

export const isSupabaseConfigured = () => supabase !== null;
