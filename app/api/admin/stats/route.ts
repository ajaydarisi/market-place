import { NextResponse } from "next/server";
import { requireAdmin, isAdminAuthError } from "@/lib/admin-utils";
import { getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function GET() {
  const authResult = await requireAdmin();
  if (isAdminAuthError(authResult)) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const token = await getAuthToken();
    const stats = await storage.getAdminStats(token ?? undefined);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
