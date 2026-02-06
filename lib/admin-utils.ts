import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth-utils";
import type { User } from "@supabase/supabase-js";

type AdminAuthResult =
  | { user: User; adminId: string }
  | { error: string; status: 401 | 403 };

/**
 * Validates that the current user is authenticated AND has admin role.
 * Returns the user object if successful, or an error object if not.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Forbidden: Admin access required", status: 403 };
  }

  return { user, adminId: user.id };
}

/**
 * Type guard to check if the result is an error
 */
export function isAdminAuthError(
  result: AdminAuthResult
): result is { error: string; status: 401 | 403 } {
  return "error" in result;
}
