import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const requester = await getAuthUser();
  if (!requester) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const token = await getAuthToken();

  // Email is PII: only the user themselves or an admin may see it.
  let includeEmail = requester.id === userId;
  if (!includeEmail) {
    const profile = await storage.getProfile(requester.id, token ?? undefined);
    includeEmail = profile?.role === "admin";
  }

  const user = await storage.getUser(userId, token ?? undefined, includeEmail);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}
