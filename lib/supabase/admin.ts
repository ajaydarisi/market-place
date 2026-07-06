import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only service-role client. Bypasses RLS — use ONLY for trusted
// server-side work that can't run under a user token (e.g. looking up a
// notification recipient's email to send them mail). Never import into client
// components.
let cached: SupabaseClient | undefined;

export function createAdminClient(): SupabaseClient {
  if (cached) return cached;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  cached = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
