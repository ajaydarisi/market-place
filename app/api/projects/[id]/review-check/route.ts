import { NextRequest, NextResponse } from "next/server";

import { api } from "@shared/routes";
import { codeReviewResponseSchema, type CodeReviewResponse } from "@shared/schema";

import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";
import { aiEnabled, aiErrorResponse, aiJson, checkRateLimit, rateLimitResponse, AiUnavailableError } from "@/lib/ai";

const SYSTEM_PROMPT = `You are a pre-delivery reviewer for freelance development work.
Given the job post's requirements and the developer's submission (a repo link, diff, or written summary), return JSON:
{ "summary": string (1-2 sentences: overall readiness), "findings": [{ "severity": "high"|"medium"|"low", "category": "bug"|"security"|"requirement", "detail": string (specific and actionable) }] }.
"requirement" findings are items from the post's deliverables, must-haves, or success criteria that the submission does not clearly cover — check every one.
Only flag what the submission gives evidence for; do not speculate beyond it. An empty findings array is a valid answer.`;

function formatReviewLog(review: CodeReviewResponse): string {
  const lines = ["AI Pre-Delivery Review", "", review.summary];
  if (review.findings.length > 0) {
    lines.push(
      "",
      ...review.findings.map(
        (finding) => `- [${finding.severity.toUpperCase()} ${finding.category}] ${finding.detail}`,
      ),
    );
  } else {
    lines.push("", "No issues flagged.");
  }
  return lines.join("\n");
}

export async function POST(
  request: NextRequest,
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
    if (project.assignedDeveloperId !== user.id) {
      return NextResponse.json({ message: "Only the assigned developer can run the pre-delivery review" }, { status: 403 });
    }

    const body = await request.json();
    const input = api.ai.codeReview.input.parse(body);

    const review = await aiJson(
      codeReviewResponseSchema,
      SYSTEM_PROMPT,
      `Job post requirements: ${JSON.stringify({
        title: project.title,
        deliverables: project.deliverables,
        mustHaves: project.mustHaves,
        successCriteria: project.successCriteria,
        technologyTags: project.technologyTags,
      })}\nDeveloper submission:\n${input.submission}`,
    );

    await storage.createProjectLog(
      { projectId, content: formatReviewLog(review), logType: "update" },
      user.id,
      token ?? undefined,
    );

    return NextResponse.json(review);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
