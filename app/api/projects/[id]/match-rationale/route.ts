import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  calculateProjectRecommendationScore,
  calculateProposalMatchScore,
} from "@shared/marketplace";

import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";
import { aiEnabled, aiErrorResponse, aiJson, checkRateLimit, rateLimitResponse, AiUnavailableError } from "@/lib/ai";

const SYSTEM_PROMPT = `You explain why a developer matches (or doesn't match) a freelance project.
Return JSON: { "rationale": string } — one sentence, specific and concrete (name the overlapping skills, experience level, or availability), no fluff. If the match is weak, say why honestly.`;

export async function GET(
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
  const interestIdParam = request.nextUrl.searchParams.get("interestId");

  try {
    const project = await storage.getProject(projectId, token ?? undefined);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    let developerId = user.id;
    let score: number;
    let proposalContext = "";

    if (interestIdParam) {
      // Client reviewing a proposal: rationale for that developer.
      if (project.clientId !== user.id) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      const interests = await storage.listInterests(projectId, undefined, token ?? undefined);
      const interest = interests.find((item) => item.id === Number(interestIdParam));
      if (!interest) {
        return NextResponse.json({ message: "Proposal not found" }, { status: 404 });
      }
      developerId = interest.developerId;
      const developerProfile = await storage.getProfile(developerId, token ?? undefined);
      score = interest.matchScore
        ?? calculateProposalMatchScore(project, developerProfile, interest.relevantSkills, interest.screeningAnswers);
      proposalContext = `\nProposal message: ${interest.message}\nProposal skills: ${(interest.relevantSkills ?? []).join(", ")}`;
    } else {
      // Developer browsing: rationale for themselves.
      const profile = await storage.getProfile(user.id, token ?? undefined);
      score = calculateProjectRecommendationScore(project, profile);
    }

    const profile = await storage.getProfile(developerId, token ?? undefined);
    const result = await aiJson(
      z.object({ rationale: z.string() }),
      SYSTEM_PROMPT,
      `Project: ${JSON.stringify({
        title: project.title,
        category: project.category,
        requiredSkills: project.requiredSkills,
        preferredSkills: project.preferredSkills,
        technologyTags: project.technologyTags,
        preferredExperienceLevel: project.preferredExperienceLevel,
        scopeSize: project.scopeSize,
      })}\nDeveloper profile: ${JSON.stringify({
        headline: profile?.headline,
        skills: profile?.skills,
        primaryCategories: profile?.primaryCategories,
        experienceLevel: profile?.experienceLevel,
        availabilityStatus: profile?.availabilityStatus,
      })}${proposalContext}\nHeuristic match score: ${score}/100`,
    );

    return NextResponse.json({ score, rationale: result.rationale });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
