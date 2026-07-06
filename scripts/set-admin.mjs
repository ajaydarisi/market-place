// Promote a user to admin. This is the ONLY legitimate way to create an admin
// — the self-service profile API and RLS both refuse to set role 'admin'
// (see migration 20260705000000_fix_role_escalation_rls.sql). Run with the
// service-role key, which bypasses RLS.
//
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   NEXT_PUBLIC_SUPABASE_URL=... \
//   node scripts/set-admin.mjs user@example.com
//
// The user must have signed up already (so their profile row exists).

import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !url || !serviceRoleKey) {
  console.error(
    "Usage: SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... node scripts/set-admin.mjs <email>",
  );
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: user, error: userErr } = await admin
  .from("users")
  .select("id, email")
  .eq("email", email)
  .single();

if (userErr || !user) {
  console.error(`No user found for ${email}. Have they signed up?`, userErr?.message ?? "");
  process.exit(1);
}

const { error: updateErr } = await admin
  .from("profiles")
  .update({ role: "admin", updated_at: new Date().toISOString() })
  .eq("user_id", user.id);

if (updateErr) {
  console.error("Failed to set admin role:", updateErr.message);
  process.exit(1);
}

console.log(`✓ ${email} (${user.id}) is now an admin.`);
