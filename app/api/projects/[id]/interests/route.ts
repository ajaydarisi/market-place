import { NextRequest, NextResponse } from "next/server";
import { api } from "@shared/routes";
import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const token = await getAuthToken();
  const sort = searchParams.get("sort") ?? undefined;
  const interests = await storage.listInterests(Number(id), { sort }, token ?? undefined);
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
    const projectId = Number(id);

    const project = await storage.getProject(projectId, token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    if (project.clientId === user.id) {
      return NextResponse.json({ message: "Clients cannot apply to their own projects" }, { status: 403 });
    }

    if (project.status !== "open") {
      return NextResponse.json({ message: "Only open projects accept proposals" }, { status: 400 });
    }

    const interest = await storage.createInterest(
      {
        projectId,
        message: input.message,
        proposedBudget: input.proposedBudget,
        estimatedDurationDays: input.estimatedDurationDays,
        relevantSkills: input.relevantSkills,
        screeningAnswers: input.screeningAnswers,
      },
      user.id,
      token ?? undefined
    );
    return NextResponse.json(interest, { status: 201 });
  } catch (error) {
    if ((error as Error & { code?: string }).code === "ACTIVE_PROPOSAL_EXISTS") {
      return NextResponse.json({ message: (error as Error).message }, { status: 409 });
    }
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
