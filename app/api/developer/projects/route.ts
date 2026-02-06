import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function GET(_request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = await getAuthToken();

  try {
    const projects = await storage.listAssignedProjects(user.id, token ?? undefined);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
