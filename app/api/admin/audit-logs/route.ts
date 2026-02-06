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
    adminId: searchParams.get("adminId") || undefined,
    action: searchParams.get("action") || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 50,
  };

  try {
    const token = await getAuthToken();
    const result = await storage.listAuditLogs(filters, token ?? undefined);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing audit logs:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
