import { NextRequest, NextResponse } from "next/server";
import { api } from "@shared/routes";
import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interestId: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, interestId } = await params;
  const projectId = Number(id);
  const interestIdNum = Number(interestId);
  const token = await getAuthToken();

  try {
    // Get the project to verify ownership
    const project = await storage.getProject(projectId, token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // Only project owner can accept/reject proposals
    if (project.clientId !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const input = api.interests.updateStatus.input.parse(body);

    // Get the interest to find the developer
    const interests = await storage.listInterests(projectId, undefined, token ?? undefined);
    const interest = interests.find(i => i.id === interestIdNum);
    if (!interest) {
      return NextResponse.json({ message: "Interest not found" }, { status: 404 });
    }

    // Update interest status
    const updatedInterest = await storage.updateInterestStatus(
      interestIdNum,
      input.status,
      token ?? undefined
    );

    // If accepting, also assign developer and reject other proposals
    if (input.status === "accepted") {
      await storage.assignDeveloper(projectId, interest.developerId, token ?? undefined);
      await storage.rejectOtherInterests(projectId, interestIdNum, token ?? undefined);
      await storage.createProjectLog(
        {
          projectId,
          content: `System: ${interest.developer.firstName || "Developer"} ${interest.developer.lastName || ""}`.trim() +
            " was assigned from the proposal workspace.",
          logType: "milestone",
          isSystem: true,
        },
        user.id,
        token ?? undefined
      );
    }

    await storage.createNotification(
      {
        userId: interest.developerId,
        type: input.status === "accepted" ? "proposal_accepted" : "proposal_rejected",
        projectId,
        content: input.status === "accepted"
          ? `Your proposal for "${project.title}" was accepted`
          : `Your proposal for "${project.title}" was not selected`,
      },
      user.id,
      token ?? undefined
    );

    return NextResponse.json(updatedInterest);
  } catch (error) {
    console.error("Error updating interest status:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
