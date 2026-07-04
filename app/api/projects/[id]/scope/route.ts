import { NextRequest, NextResponse } from "next/server";

import { scopeOfWorkResponseSchema, type ScopeOfWorkResponse } from "@shared/schema";

import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";
import { aiEnabled, aiErrorResponse, aiJson, checkRateLimit, rateLimitResponse, AiUnavailableError } from "@/lib/ai";

const SYSTEM_PROMPT = `You turn a freelance project's post plus its client-developer message thread into a written scope of work (INR costs).
Return JSON: { "summary": string (2-3 sentences), "deliverables": string[] (concrete and testable, include anything agreed in messages that the post missed), "assumptions": string[], "exclusions": string[], "timelineWeeks": number|null, "costEstimate": number|null (INR) }.
Where the messages changed or extended the original post, the messages win. Be conservative with estimates.`;

function formatScopeLog(scope: ScopeOfWorkResponse): string {
  const lines = [
    "AI Scope of Work",
    "",
    scope.summary,
    "",
    "Deliverables:",
    ...scope.deliverables.map((item) => `- ${item}`),
  ];
  if (scope.assumptions.length > 0) {
    lines.push("", "Assumptions:", ...scope.assumptions.map((item) => `- ${item}`));
  }
  if (scope.exclusions.length > 0) {
    lines.push("", "Exclusions:", ...scope.exclusions.map((item) => `- ${item}`));
  }
  if (scope.timelineWeeks) lines.push("", `Timeline: ~${scope.timelineWeeks} weeks`);
  if (scope.costEstimate) lines.push(`Estimated cost: ₹${scope.costEstimate.toLocaleString("en-IN")}`);
  return lines.join("\n");
}

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
  const projectId = Number(id);
  const token = await getAuthToken();

  try {
    const project = await storage.getProject(projectId, token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }
    if (project.clientId !== user.id && project.assignedDeveloperId !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const messages = await storage.listMessages(projectId, user.id, token ?? undefined);
    const thread = messages
      .map((message) => `${message.senderId === project.clientId ? "Client" : "Developer"}: ${message.content}`)
      .join("\n");

    const scope = await aiJson(
      scopeOfWorkResponseSchema,
      SYSTEM_PROMPT,
      `Project post: ${JSON.stringify({
        title: project.title,
        description: project.description,
        businessGoal: project.businessGoal,
        deliverables: project.deliverables,
        mustHaves: project.mustHaves,
        budgetMin: project.budgetMin,
        budgetMax: project.budgetMax,
        estimatedDurationWeeks: project.estimatedDurationWeeks,
      })}\nMessage thread:\n${thread || "(no messages yet)"}`,
    );

    await storage.createProjectLog(
      { projectId, content: formatScopeLog(scope), logType: "milestone" },
      user.id,
      token ?? undefined,
    );

    return NextResponse.json(scope);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
