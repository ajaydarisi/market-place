import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

// The assigned developer signals the work is ready for the client to sign off.
// This does not change project status — the client confirms by marking the
// project completed — but it records the request and notifies the client (F8).
export async function POST(
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
    const project = await storage.getProject(projectId, token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    if (project.assignedDeveloperId !== user.id) {
      return NextResponse.json(
        { message: "Only the assigned developer can request completion" },
        { status: 403 }
      );
    }

    if (project.status !== "in_progress") {
      return NextResponse.json(
        { message: "Only in-progress projects can be marked ready for sign-off" },
        { status: 409 }
      );
    }

    // Idempotency: a project reaches in_progress only once, so allow a single
    // sign-off request. Without this, repeated clicks spam the client with
    // duplicate logs, notifications, and emails.
    const logs = await storage.listProjectLogs(projectId, token ?? undefined);
    const alreadyRequested = logs.some(
      (log) => log.isSystem && log.content.includes("ready for client sign-off")
    );
    if (alreadyRequested) {
      return NextResponse.json(
        { message: "You've already requested sign-off for this project." },
        { status: 409 }
      );
    }

    await storage.createProjectLog(
      {
        projectId,
        content: "System: the developer marked the work ready for client sign-off.",
        logType: "milestone",
        isSystem: true,
      },
      user.id,
      token ?? undefined
    );

    await storage.createNotification(
      {
        userId: project.clientId,
        type: "completion_requested",
        projectId,
        content: `The work on "${project.title}" is ready for your sign-off`,
      },
      user.id,
      token ?? undefined
    );

    return NextResponse.json({ message: "Completion requested" });
  } catch (error) {
    console.error("Error requesting completion:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
