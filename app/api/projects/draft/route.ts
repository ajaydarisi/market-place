import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { api } from "@shared/routes";

import { getAuthUser } from "@/lib/auth-utils";
import { generateProjectDraft } from "@/lib/project-drafts";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const input = api.projects.draft.input.parse(body);
    const draft = generateProjectDraft(input.rawBrief);

    return NextResponse.json(draft);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
