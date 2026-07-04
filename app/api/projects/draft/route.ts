import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { api } from "@shared/routes";
import { projectDraftSchema, engagementTypes, projectTypes, scopeSizes } from "@shared/schema";
import { PROJECT_CATEGORY_OPTIONS, TECHNOLOGY_TAG_OPTIONS, normalizeTechnologyTags } from "@shared/marketplace";

import { getAuthUser } from "@/lib/auth-utils";
import { aiJson, checkRateLimit } from "@/lib/ai";
import { computeDraftFeedback, generateProjectDraft } from "@/lib/project-drafts";

const CATEGORY_VALUES = PROJECT_CATEGORY_OPTIONS.map((option) => option.value).join(", ");
const TECHNOLOGY_VALUES = TECHNOLOGY_TAG_OPTIONS.map((option) => option.value).join(", ");

const SYSTEM_PROMPT = `You turn a client's rough project brief into a structured freelance project post for an Indian marketplace (INR budgets).
Return a single JSON object with any of these keys you can infer (omit keys you cannot):
title (string, 5-80 chars), category (one of: ${CATEGORY_VALUES}), description (professional rewrite of the brief, at least 40 chars), businessGoal (string, min 12 chars), currentState, targetUsers, projectType (one of: ${projectTypes.join(", ")}), scopeSize (one of: ${scopeSizes.join(", ")}), engagementType (one of: ${engagementTypes.join(", ")}), budgetMin (number, INR), budgetMax (number, INR), estimatedDurationWeeks (integer), requiredSkills (string[]), preferredSkills (string[]), technologyTags (string[] from: ${TECHNOLOGY_VALUES}), deliverables (string[], max 6), mustHaves (string[]), niceToHaves (string[]), successCriteria (string[]), screeningQuestions (string[], max 3).
Never invent a budget the brief does not imply. Keep deliverables concrete and testable.`;

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(user.id)) {
    return NextResponse.json({ message: "Too many AI requests, try again in a minute." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const input = api.projects.draft.input.parse(body);

    try {
      const draft = await aiJson(projectDraftSchema, SYSTEM_PROMPT, input.rawBrief);
      draft.technologyTags = normalizeTechnologyTags(draft.technologyTags ?? []);
      const { missingFields, warnings } = computeDraftFeedback(draft);
      return NextResponse.json({ draft, missingFields, warnings, source: "provider" });
    } catch {
      // Provider unavailable or returned invalid output — heuristic keeps the feature working.
      return NextResponse.json(generateProjectDraft(input.rawBrief));
    }
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
