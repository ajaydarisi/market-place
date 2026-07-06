import { NextRequest, NextResponse } from "next/server";
import { api } from "@shared/routes";
import { z } from "zod";
import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";
import { ALLOWED_STATUS_TRANSITIONS } from "@shared/marketplace";

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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const token = await getAuthToken();
  const projectId = Number(id);

  const project = await storage.getProject(projectId, token ?? undefined);
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  if (project.clientId !== user.id) {
    return NextResponse.json(
      { message: "You can only delete your own projects" },
      { status: 403 }
    );
  }

  // Deleting an in-progress project would silently strip it from the assigned
  // developer's list (F11). Require it to be cancelled or completed first.
  if (project.status === "in_progress") {
    return NextResponse.json(
      { message: "Cancel or complete this project before deleting it." },
      { status: 409 }
    );
  }

  await storage.deleteProject(projectId, token ?? undefined);
  return NextResponse.json({ message: "Project deleted" });
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

    if (
      input.status !== undefined &&
      input.status !== project.status &&
      !ALLOWED_STATUS_TRANSITIONS[project.status]?.includes(input.status)
    ) {
      return NextResponse.json(
        { message: `Cannot change status from ${project.status} to ${input.status}.` },
        { status: 409 }
      );
    }

    const updated = await storage.updateProject(projectId, input, token ?? undefined);

    // Tell the assigned developer when the client closes the project out (F8);
    // project_completed also serves as the review nudge (B7).
    if (
      input.status !== undefined &&
      input.status !== project.status &&
      project.assignedDeveloperId &&
      (input.status === "completed" || input.status === "cancelled")
    ) {
      await storage.createNotification(
        {
          userId: project.assignedDeveloperId,
          type: input.status === "completed" ? "project_completed" : "project_cancelled",
          projectId,
          content:
            input.status === "completed"
              ? `"${project.title}" was marked complete — leave a review`
              : `"${project.title}" was cancelled by the client`,
        },
        user.id,
        token ?? undefined
      );
    }

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
