import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/onboarding", "/profile", "/projects"];
// Routes that require specific roles
const clientRoutes = ["/client"];
const developerRoutes = ["/developer"];

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse, supabase } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Check if the route requires authentication
  const isProtected = [...protectedRoutes, ...clientRoutes, ...developerRoutes].some(
    (route) => pathname.startsWith(route)
  );

  if (!isProtected) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to /auth
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // Check role-based routes
  const isClientRoute = clientRoutes.some((route) => pathname.startsWith(route));
  const isDeveloperRoute = developerRoutes.some((route) => pathname.startsWith(route));

  if (isClientRoute || isDeveloperRoute) {
    // Fetch the user's profile to check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      // No profile yet, redirect to onboarding
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    if (isClientRoute && profile.role !== "client") {
      const url = request.nextUrl.clone();
      url.pathname = "/not-authorized";
      return NextResponse.redirect(url);
    }

    if (isDeveloperRoute && profile.role !== "developer") {
      const url = request.nextUrl.clone();
      url.pathname = "/not-authorized";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|favicon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
