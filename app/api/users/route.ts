import { NextRequest, NextResponse } from "next/server";
import { api } from "@shared/routes";
import { z } from "zod";
import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function PUT(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = await getAuthToken();

  try {
    const body = await request.json();
    const input = api.users.update.input.parse(body);
    const updated = await storage.updateUser(user.id, input, token ?? undefined);
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.errors[0].message, field: err.errors[0].path.join(".") },
        { status: 400 }
      );
    }
    console.error("Error in PUT /api/users:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
