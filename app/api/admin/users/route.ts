import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminAuthError } from "@/lib/admin-utils";
import { getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAdminAuthError(authResult)) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  const { searchParams } = new URL(request.url);
  const filters = {
    role: searchParams.get("role") || undefined,
    search: searchParams.get("search") || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 20,
    includeDeleted: searchParams.get("includeDeleted") === "true",
  };

  try {
    const token = await getAuthToken();
    const result = await storage.listAllUsers(filters, token ?? undefined);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
