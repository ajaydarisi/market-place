import { NextRequest, NextResponse } from "next/server";

import { profileOptimizationResponseSchema } from "@shared/schema";
import { TECHNOLOGY_TAG_OPTIONS } from "@shared/marketplace";

import { getAuthUser, getAuthToken } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";
import { aiEnabled, aiErrorResponse, aiJson, checkRateLimit, rateLimitResponse, AiUnavailableError } from "@/lib/ai";

const KNOWN_SKILLS = TECHNOLOGY_TAG_OPTIONS.map((option) => option.label).join(", ");

const SYSTEM_PROMPT = `You rewrite a freelance developer's marketplace profile so it ranks better in search and matching.
Return JSON: { "headline": string (under 80 chars, specific: role + specialization), "bio": string (2-4 sentences, concrete: what they build, for whom, with what results — no buzzwords, no invented facts), "suggestedSkills": string[] (their current skills cleaned up plus genuinely implied additions, max 12; prefer this marketplace's known skill names where they apply: ${KNOWN_SKILLS}) }.
Only state things the current profile supports. If the bio is thin, make the most of what exists rather than inventing.`;

export async function POST(_request: NextRequest) {
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

  const token = await getAuthToken();

  try {
    const profile = await storage.getProfile(user.id, token ?? undefined);
    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    const result = await aiJson(
      profileOptimizationResponseSchema,
      SYSTEM_PROMPT,
      `Current profile: ${JSON.stringify({
        headline: profile.headline,
        bio: profile.bio,
        skills: profile.skills,
        experienceLevel: profile.experienceLevel,
        primaryCategories: profile.primaryCategories,
        portfolioLinks: profile.portfolioLinks,
      })}`,
    );

    return NextResponse.json(result);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
