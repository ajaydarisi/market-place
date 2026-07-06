import { NextRequest, NextResponse } from "next/server";

import { proposalDraftResponseSchema } from "@shared/schema";

import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";
import { aiEnabled, aiErrorResponse, aiJson, checkRateLimit, rateLimitResponse, AiUnavailableError } from "@/lib/ai";

const SYSTEM_PROMPT = `You write a tailored freelance proposal (bid) for a developer on an Indian marketplace (INR budgets).
Using the job post and the developer's profile, return JSON:
{ "message": string (3-6 sentences, references the client's stated goal, names the developer's most relevant experience, professional but human — no generic filler),
  "relevantSkills": string[] (skills from the developer's profile that this project actually needs, max 8),
  "proposedBudget": number|null (INR, inside the post's budget range; null if no range given),
  "estimatedDurationDays": number|null (realistic for the scope),
  "screeningAnswers": [{ "question": string, "answer": string }] (one entry per screening question in the post, answered from the profile; empty array if the post has none) }.
Never invent experience the profile does not support.`;

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

    const profile = await storage.getProfile(user.id, token ?? undefined);
    const developer = await storage.getUser(user.id, token ?? undefined);

    const result = await aiJson(
      proposalDraftResponseSchema,
      SYSTEM_PROMPT,
      `Job post: ${JSON.stringify({
        title: project.title,
        description: project.description,
        businessGoal: project.businessGoal,
        category: project.category,
        requiredSkills: project.requiredSkills,
        technologyTags: project.technologyTags,
        deliverables: project.deliverables,
        budgetMin: project.budgetMin,
        budgetMax: project.budgetMax,
        estimatedDurationWeeks: project.estimatedDurationWeeks,
        screeningQuestions: project.screeningQuestions,
      })}\nDeveloper: ${JSON.stringify({
        name: [developer?.firstName, developer?.lastName].filter(Boolean).join(" "),
        headline: profile?.headline,
        bio: profile?.bio,
        skills: profile?.skills,
        experienceLevel: profile?.experienceLevel,
        primaryCategories: profile?.primaryCategories,
      })}`,
    );

    return NextResponse.json(result);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
