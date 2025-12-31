import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

export const createClient = () =>
  createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      global: {
        headers: {
          "sb-lb-routing-mode": "alpha-all-services",
        },
      },
    },
  );
