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
    const projectId = Number(id);

    // Messaging is only allowed between the two real counterparties on a project:
    // its client and a developer who applied to (or was assigned) it. Without this,
    // any authenticated user could message any other user on any project id.
    const project = await storage.getProject(projectId, token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }
    const senderIsClient = project.clientId === user.id;
    const receiverIsClient = project.clientId === input.receiverId;
    if (senderIsClient === receiverIsClient) {
      // Exactly one side must be the client (and they can't message themselves).
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    // The non-client side of this message must be a developer genuinely tied to
    // the project (sender is user.id, so this also validates the sender).
    const developerId = senderIsClient ? input.receiverId : user.id;
    const interests = await storage.listInterests(projectId, undefined, token ?? undefined);
    const developerRelated =
      project.assignedDeveloperId === developerId ||
      interests.some((interest) => interest.developerId === developerId);
    if (!developerRelated) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const message = await storage.createMessage(
      {
        projectId: Number(id),
        receiverId: input.receiverId,
        content: input.content,
      },
      user.id,
      token ?? undefined
    );

    await storage.createNotification(
      {
        userId: input.receiverId,
        type: "message_received",
        projectId: Number(id),
        content: `New message: ${input.content.slice(0, 80)}`,
      },
      user.id,
      token ?? undefined
    );

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
