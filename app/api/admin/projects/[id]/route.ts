import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminAuthError } from "@/lib/admin-utils";
import { getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";
import { insertProjectSchema, projectStatuses } from "@shared/schema";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (isAdminAuthError(authResult)) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  const { id } = await params;
  const token = await getAuthToken();

  try {
    const project = await storage.getProject(Number(id), token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (isAdminAuthError(authResult)) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  const { id } = await params;
  const projectId = Number(id);
  const token = await getAuthToken();

  try {
    const body = await request.json();
    const input = insertProjectSchema
      .partial()
      .extend({ status: z.enum(projectStatuses).optional() })
      .parse(body);

    const project = await storage.getProject(projectId, token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const updated = await storage.adminUpdateProject(projectId, input, token ?? undefined);

    // Log the action
    await storage.createAuditLog(
      {
        adminId: authResult.adminId,
        action: "project_update",
        targetType: "project",
        targetId: String(projectId),
        details: { updates: input },
      },
      token ?? undefined
    );

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.errors[0].message, field: err.errors[0].path.join(".") },
        { status: 400 }
      );
    }
    console.error("Error updating project:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (isAdminAuthError(authResult)) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  const { id } = await params;
  const projectId = Number(id);
  const token = await getAuthToken();

  try {
    const project = await storage.getProject(projectId, token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    await storage.adminDeleteProject(projectId, token ?? undefined);

    // Log the action
    await storage.createAuditLog(
      {
        adminId: authResult.adminId,
        action: "project_delete",
        targetType: "project",
        targetId: String(projectId),
        details: { projectTitle: project.title },
      },
      token ?? undefined
    );

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
