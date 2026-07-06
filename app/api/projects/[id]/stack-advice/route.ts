import { NextRequest, NextResponse } from "next/server";

import { stackAdviceResponseSchema } from "@shared/schema";

import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";
import { aiEnabled, aiErrorResponse, aiJson, checkRateLimit, rateLimitResponse, AiUnavailableError } from "@/lib/ai";

const SYSTEM_PROMPT = `You recommend a tech stack for a freelance project.
Return JSON: { "primary": [{ "component": string, "choice": string, "reason": string (one sentence) }], "budgetAlternative": [same shape], "notes": string|null }.
"primary" is the stack you would actually build with: cover Language, Framework, Database, and Hosting (add other components only when the project demands them).
"budgetAlternative" is a simpler, cheaper way to deliver the same outcome for a small budget (e.g. an off-the-shelf platform or plugin approach) — include it always, and say in each reason what is being traded away.
"notes" is one sentence of overall guidance or null.`;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const token = await getAuthToken();

  try {
    const project = await storage.getProject(Number(id), token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const result = await aiJson(
      stackAdviceResponseSchema,
      SYSTEM_PROMPT,
      `Project: ${JSON.stringify({
        title: project.title,
        description: project.description,
        category: project.category,
        scopeSize: project.scopeSize,
        technologyTags: project.technologyTags,
        budgetMin: project.budgetMin,
        budgetMax: project.budgetMax,
        estimatedDurationWeeks: project.estimatedDurationWeeks,
      })} (budget is INR)`,
    );

    return NextResponse.json(result);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
