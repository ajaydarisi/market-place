import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminAuthError } from "@/lib/admin-utils";
import { getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";
import { insertUserSchema } from "@shared/schema";
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
    const user = await storage.getUser(userId, token ?? undefined);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const profile = await storage.getProfile(userId, token ?? undefined);
    return NextResponse.json({ ...user, profile: profile || null });
  } catch (error) {
    console.error("Error fetching user:", error);
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
    const input = insertUserSchema.partial().parse(body);

    const user = await storage.getUser(userId, token ?? undefined);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updated = await storage.adminUpdateUser(userId, input, token ?? undefined);

    // Log the action
    await storage.createAuditLog(
      {
        adminId: authResult.adminId,
        action: "user_update",
        targetType: "user",
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
    console.error("Error updating user:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

  // Prevent admin from deleting themselves
  if (userId === authResult.adminId) {
    return NextResponse.json(
      { message: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  const token = await getAuthToken();

  try {
    const user = await storage.getUser(userId, token ?? undefined);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await storage.softDeleteUser(userId, authResult.adminId, token ?? undefined);
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
