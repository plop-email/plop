import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db";

// Use standard SupabaseClient type that works with the upgraded version
export type Client = SupabaseClient<Database, "public">;

export * from "./db";
