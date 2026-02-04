import { NextResponse } from "next/server";
import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = await getAuthToken();
  const conversations = await storage.listUserConversations(user.id, token ?? undefined);
  return NextResponse.json(conversations);
}
