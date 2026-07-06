import { NextRequest, NextResponse } from "next/server";
import { api } from "@shared/routes";
import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";
import { parsePositiveInt } from "@/lib/utils";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; interestId: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, interestId } = await params;
  const projectId = parsePositiveInt(id);
  const interestIdNum = parsePositiveInt(interestId);
  if (projectId === null || interestIdNum === null) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }
  const token = await getAuthToken();

  try {
    // Ownership check, pending check, client notification, and delete happen
    // atomically inside the RPC. It returns false when there is no still-pending
    // interest owned by this developer (already actioned / lost race).
    const withdrawn = await storage.withdrawProposal(projectId, interestIdNum, token ?? undefined);
    if (!withdrawn) {
      return NextResponse.json(
        { message: "This proposal can no longer be withdrawn." },
        { status: 409 }
      );
    }
    return NextResponse.json({ message: "Proposal withdrawn" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("PROJECT_NOT_FOUND")) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }
    console.error("Error withdrawing proposal:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interestId: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, interestId } = await params;
  const projectId = parsePositiveInt(id);
  const interestIdNum = parsePositiveInt(interestId);
  if (projectId === null || interestIdNum === null) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }
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

    // A proposal can only be actioned while it is still pending; this fast-fails
    // the reject path. The accept path is guarded atomically inside the RPC.
    if (interest.status !== "pending") {
      return NextResponse.json(
        { message: `This proposal has already been ${interest.status}.` },
        { status: 409 }
      );
    }

    if (input.status === "rejected") {
      const updatedInterest = await storage.updateInterestStatus(
        interestIdNum,
        "rejected",
        token ?? undefined
      );
      await storage.createNotification(
        {
          userId: interest.developerId,
          type: "proposal_rejected",
          projectId,
          content: `Your proposal for "${project.title}" was not selected`,
        },
        user.id,
        token ?? undefined
      );
      return NextResponse.json(updatedInterest);
    }

    // Accept: do the interest+assignment+auto-reject atomically so a crash can't
    // leave an accepted proposal on an unassigned project (F5). The RPC returns
    // the developers it auto-rejected.
    let rejectedDeveloperIds: string[];
    try {
      rejectedDeveloperIds = await storage.acceptProposal(
        projectId,
        interestIdNum,
        token ?? undefined
      );
    } catch (rpcError) {
      const message = rpcError instanceof Error ? rpcError.message : "";
      if (message.includes("PROJECT_NOT_OPEN")) {
        return NextResponse.json(
          { message: "This project is no longer open for assignment." },
          { status: 409 }
        );
      }
      if (message.includes("INTEREST_NOT_PENDING")) {
        return NextResponse.json(
          { message: "This proposal has already been actioned." },
          { status: 409 }
        );
      }
      if (message.includes("FORBIDDEN")) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      if (message.includes("NOT_FOUND")) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
      throw rpcError;
    }

    await storage.createNotification(
      {
        userId: interest.developerId,
        type: "proposal_accepted",
        projectId,
        content: `Your proposal for "${project.title}" was accepted`,
      },
      user.id,
      token ?? undefined
    );
    // Notify the auto-rejected developers the RPC reported (F7).
    for (const developerId of rejectedDeveloperIds) {
      await storage.createNotification(
        {
          userId: developerId,
          type: "proposal_rejected",
          projectId,
          content: `Your proposal for "${project.title}" was not selected`,
        },
        user.id,
        token ?? undefined
      );
    }
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

    // Re-fetch to return a consistent post-RPC record (the RPC performed the mutation)
    const refreshed = await storage.listInterests(projectId, undefined, token ?? undefined);
    const updated = refreshed.find((i) => i.id === interestIdNum) ?? { ...interest, status: "accepted" as const };
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating interest status:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
