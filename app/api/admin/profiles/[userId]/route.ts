import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminAuthError } from "@/lib/admin-utils";
import { getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";
import { insertProfileSchema } from "@shared/schema";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authResult = await requireAdmin();
  if (isAdminAuthError(authResult)) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  const { userId } = await params;
  const token = await getAuthToken();

  try {
    const profile = await storage.getProfile(userId, token ?? undefined);
    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authResult = await requireAdmin();
  if (isAdminAuthError(authResult)) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  const { userId } = await params;
  const token = await getAuthToken();

  try {
    const body = await request.json();
    const input = insertProfileSchema.partial().parse(body);

    const profile = await storage.getProfile(userId, token ?? undefined);
    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    const updated = await storage.adminUpdateProfile(userId, input, token ?? undefined);

    // Log the action
    await storage.createAuditLog(
      {
        adminId: authResult.adminId,
        action: "profile_update",
        targetType: "profile",
        targetId: userId,
        details: { updates: input },
      },
      token ?? undefined
    );

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.errors[0].message, field: err.errors[0].path.join(".") },
        { status: 400 }
      );
    }
    console.error("Error updating profile:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
