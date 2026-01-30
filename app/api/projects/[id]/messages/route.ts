import { NextRequest, NextResponse } from "next/server";
import { api } from "@shared/routes";
import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const token = await getAuthToken();
  const messages = await storage.listMessages(Number(id), user.id, token ?? undefined);
  return NextResponse.json(messages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const token = await getAuthToken();

  try {
    const body = await request.json();
    const input = api.messages.send.input.parse(body);

    const message = await storage.createMessage(
      {
        projectId: Number(id),
        receiverId: input.receiverId,
        content: input.content,
      },
      user.id,
      token ?? undefined
    );
    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
