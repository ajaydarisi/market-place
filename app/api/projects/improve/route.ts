import { NextRequest, NextResponse } from "next/server";

import { api } from "@shared/routes";
import { postImprovementResponseSchema } from "@shared/schema";
import { calculateProjectCompletenessScore } from "@shared/marketplace";

import { getAuthUser } from "@/lib/auth-utils";
import { aiEnabled, aiErrorResponse, aiJson, checkRateLimit, rateLimitResponse, AiUnavailableError } from "@/lib/ai";

const SYSTEM_PROMPT = `You review freelance job posts on an Indian marketplace (INR budgets) and suggest concrete improvements.
Look for: missing details (deadline, acceptance criteria, target users), unclear or contradictory requirements, and a budget or timeline that is unrealistic for the described scope.
Return JSON: { "suggestions": [{ "field": string|null (the post field the suggestion applies to, e.g. "description", "budgetMax", "deliverables"), "issue": string (what's wrong, one sentence), "recommendation": string (the concrete fix, one or two sentences) }], "budgetAssessment": string|null (one sentence on budget realism, null if fine), "timelineAssessment": string|null (same for timeline) }.
Maximum 6 suggestions, most important first. If the post is already strong, return fewer suggestions — never pad.`;

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!aiEnabled()) {
    return aiErrorResponse(new AiUnavailableError());
  }
  if (!checkRateLimit(user.id)) {
    return rateLimitResponse();
  }

  try {
    const body = await request.json();
    const post = api.ai.improvePost.input.parse(body);
    // deadline can be null in the draft schema; the score only truthiness-checks it
    const completeness = calculateProjectCompletenessScore(post as Parameters<typeof calculateProjectCompletenessScore>[0]);

    const result = await aiJson(
      postImprovementResponseSchema,
      SYSTEM_PROMPT,
      `Job post (completeness score ${completeness}/100):\n${JSON.stringify(post, null, 2)}`,
    );

    return NextResponse.json(result);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
