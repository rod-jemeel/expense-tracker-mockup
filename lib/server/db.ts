import { createClient } from "@supabase/supabase-js"

if (!process.env.SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL environment variable")
}

if (!process.env.SUPABASE_SECRET_KEY) {
  throw new Error("Missing SUPABASE_SECRET_KEY environment variable")
}

/**
 * Supabase client with secret key for server-side operations.
 * Uses the new sb_secret_... key format (replaces legacy service_role).
 * NEVER expose this to the client.
 */
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
