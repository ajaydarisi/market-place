import { headers } from "next/headers";
import { createAuthenticatedClient, createClient } from "@/lib/supabase/server";

async function getBearerTokenFromHeaders() {
  const headerStore = await headers();
  const authorization = headerStore.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

export async function getAuthUser() {
  const bearerToken = await getBearerTokenFromHeaders();

  if (bearerToken) {
    const supabase = createAuthenticatedClient(bearerToken);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user) return user;
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getAuthToken() {
  const bearerToken = await getBearerTokenFromHeaders();
  if (bearerToken) return bearerToken;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}
