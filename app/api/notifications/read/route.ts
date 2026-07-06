import { NextResponse } from "next/server";

import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function PATCH() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getAuthToken();
    const updated = await storage.markNotificationsRead(user.id, token ?? undefined);
    return NextResponse.json({ updated });
  } catch (error) {
    console.error("Error marking notifications read:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
