import { NextResponse } from "next/server";
import { getAuthToken, getAuthUser } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const token = await getAuthToken();
  const updated = await storage.markMessagesRead(Number(id), user.id, token ?? undefined);

  return NextResponse.json({ updated });
}
