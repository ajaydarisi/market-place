import { NextRequest, NextResponse } from "next/server";
import { api } from "@shared/routes";
import { z } from "zod";
import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getAuthToken();
  const project = await storage.getProject(Number(id), token ?? undefined);
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const token = await getAuthToken();
  const projectId = Number(id);

  try {
    const body = await request.json();
    const input = api.projects.update.input.parse(body);

    const project = await storage.getProject(projectId, token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    if (project.clientId !== user.id) {
      return NextResponse.json(
        { message: "You can only update your own projects" },
        { status: 403 }
      );
    }

    const updated = await storage.updateProject(projectId, input, token ?? undefined);
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.errors[0].message, field: err.errors[0].path.join(".") },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
