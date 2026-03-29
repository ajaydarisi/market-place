import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { api } from "@shared/routes";
import { getAuthToken, getAuthUser } from "@/lib/auth-utils";
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
  const reviews = await storage.listProjectReviews(Number(id), token ?? undefined);
  return NextResponse.json(reviews);
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
    const input = api.reviews.create.input.parse(await request.json());
    const project = await storage.getProject(projectId, token ?? undefined);

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    if (project.status !== "completed") {
      return NextResponse.json({ message: "Reviews are only available for completed projects" }, { status: 400 });
    }

    if (!project.assignedDeveloperId) {
      return NextResponse.json({ message: "This project does not have an assigned developer" }, { status: 400 });
    }

    const isClientReviewer = project.clientId === user.id;
    const isDeveloperReviewer = project.assignedDeveloperId === user.id;

    if (!isClientReviewer && !isDeveloperReviewer) {
      return NextResponse.json({ message: "Only project participants can leave reviews" }, { status: 403 });
    }

    const existingReviews = await storage.listProjectReviews(projectId, token ?? undefined);
    if (existingReviews.some((review) => review.reviewerId === user.id)) {
      return NextResponse.json({ message: "You have already reviewed this project" }, { status: 409 });
    }

    const review = await storage.createReview(
      {
        projectId,
        revieweeId: isClientReviewer ? project.assignedDeveloperId : project.clientId,
        rating: input.rating,
        comment: input.comment ?? null,
      },
      user.id,
      token ?? undefined,
    );

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message, field: error.errors[0].path.join(".") },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
