import { NextResponse } from "next/server";

import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getAuthToken();
    const notifications = await storage.listNotifications(user.id, token ?? undefined);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error listing notifications:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
