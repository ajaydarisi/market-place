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
  const projectId = Number(id);
  const token = await getAuthToken();

  try {
    // Get the project to verify access
    const project = await storage.getProject(projectId, token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // Only project owner or assigned developer can view logs
    const isOwner = project.clientId === user.id;
    const isAssignedDev = project.assignedDeveloperId === user.id;

    if (!isOwner && !isAssignedDev) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const logs = await storage.listProjectLogs(projectId, token ?? undefined);
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching project logs:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
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
  const projectId = Number(id);
  const token = await getAuthToken();

  try {
    // Get the project to verify access
    const project = await storage.getProject(projectId, token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // Only project owner or assigned developer can create logs
    const isOwner = project.clientId === user.id;
    const isAssignedDev = project.assignedDeveloperId === user.id;

    if (!isOwner && !isAssignedDev) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const input = api.projectLogs.create.input.parse(body);

    const log = await storage.createProjectLog(
      {
        projectId,
        content: input.content,
        logType: input.logType || "update",
      },
      user.id,
      token ?? undefined
    );

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Error creating project log:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
