import { NextRequest, NextResponse } from "next/server";
import { api } from "@shared/routes";
import { z } from "zod";
import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters: any = {};
  if (searchParams.get("category")) filters.category = searchParams.get("category");
  if (searchParams.get("minBudget")) filters.minBudget = Number(searchParams.get("minBudget"));
  if (searchParams.get("maxBudget")) filters.maxBudget = Number(searchParams.get("maxBudget"));
  if (searchParams.get("search")) filters.search = searchParams.get("search");
  if (searchParams.get("status")) filters.status = searchParams.get("status");
  if (searchParams.get("sort")) filters.sort = searchParams.get("sort");
  if (searchParams.get("clientId")) filters.clientId = searchParams.get("clientId");
  if (searchParams.get("preferredExperienceLevel")) {
    filters.preferredExperienceLevel = searchParams.get("preferredExperienceLevel");
  }
  if (searchParams.get("projectType")) filters.projectType = searchParams.get("projectType");
  if (searchParams.get("scopeSize")) filters.scopeSize = searchParams.get("scopeSize");
  if (searchParams.get("teamPreference")) filters.teamPreference = searchParams.get("teamPreference");
  if (searchParams.get("requiredSkills")) {
    filters.requiredSkills = searchParams
      .get("requiredSkills")
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }
  if (searchParams.get("technologyTags")) {
    filters.technologyTags = searchParams
      .get("technologyTags")
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  let token: string | undefined;
  if (filters.sort === "recommended") {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    filters.currentUserId = user.id;
    token = await getAuthToken();
  } else {
    token = await getAuthToken();
  }
  const projects = await storage.listProjects(filters, token ?? undefined);
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = await getAuthToken();

  try {
    const body = await request.json();
    const input = api.projects.create.input.parse(body);

    // Ensure user has a profile
    const profile = await storage.getProfile(user.id, token ?? undefined);
    if (!profile) {
      return NextResponse.json(
        { message: "Complete your profile first" },
        { status: 400 }
      );
    }

    const project = await storage.createProject(input, user.id, token ?? undefined);
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.errors[0].message, field: err.errors[0].path.join(".") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
