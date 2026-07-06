import { createClient } from "@/lib/supabase/client";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const authHeaders = await getAuthHeaders();
  const headers = new Headers(init.headers);

  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return fetch(input, {
    ...init,
    credentials: "omit",
    headers,
  });
}

export interface ApiError extends Error {
  status?: number;
  field?: string;
}

/**
 * Extracts the server's error message from a failed Response so callers can
 * surface it instead of a generic string. API routes respond with
 * { message, field }; falls back to the caller's default for non-JSON bodies.
 */
export async function apiError(res: Response, fallback: string): Promise<ApiError> {
  let message = fallback;
  let field: string | undefined;
  try {
    const body = await res.json();
    if (body?.message) message = body.message;
    if (body?.field) field = body.field;
  } catch {
    // non-JSON body — keep the fallback message
  }
  const error = new Error(message) as ApiError;
  error.status = res.status;
  error.field = field;
  return error;
}
