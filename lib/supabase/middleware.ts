import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    // First try to get/refresh the session - this handles token refresh
    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData.session) {
      // Session exists, now validate with getUser() for security
      const { data: userData, error } = await supabase.auth.getUser();
      if (!error && userData.user) {
        user = userData.user;
      }
    }
  } catch {
    // Fetch to Supabase auth can fail on cold starts or network issues;
    // treat as unauthenticated so the middleware can still proceed.
  }

  return { user, supabaseResponse, supabase };
}
