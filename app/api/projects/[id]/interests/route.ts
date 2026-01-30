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
  const interests = await storage.listInterests(Number(id), token ?? undefined);
  return NextResponse.json(interests);
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
    const input = api.interests.create.input.parse(body);

    const interest = await storage.createInterest(
      { projectId: Number(id), message: input.message },
      user.id,
      token ?? undefined
    );
    return NextResponse.json(interest, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
