import { createClient } from "@supabase/supabase-js";

// Ensure we have fallbacks so createClient doesn't throw a cryptic error immediately if env variables aren't loaded yet.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Warning: Supabase URL or Anon Key is missing. Check your .env.local file and make sure to restart your dev server.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
