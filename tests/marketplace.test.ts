import { describe, expect, it } from "vitest";

import {
  calculateProfileCompletionScore,
  calculateProjectCompletenessScore,
  calculateProjectRecommendationScore,
  calculateProposalMatchScore,
  normalizeProjectCategory,
  normalizeTechnologyTags,
} from "@shared/marketplace";
import type { Profile, Project } from "@shared/schema";

const completeProject: Partial<Project> = {
  title: "E-commerce store for a saree boutique",
  category: "web_frontend",
  description: "Build a full storefront with catalog, cart, checkout and Instagram integration.",
  businessGoal: "Sell sarees online with Instagram checkout",
  projectType: "one_time",
  scopeSize: "medium",
  budgetMin: 70000,
  budgetMax: 90000,
  requiredSkills: ["React", "Next.js"],
  technologyTags: ["nextjs", "supabase"],
  deliverables: ["Product catalog", "Cart and checkout"],
  estimatedDurationWeeks: 6,
};

const developerProfile: Partial<Profile> = {
  role: "developer",
  skills: ["React", "Next.js", "Supabase"],
  primaryCategories: ["web_frontend"],
  experienceLevel: "senior",
  availabilityStatus: "available",
};

describe("calculateProjectCompletenessScore", () => {
  it("returns 0 for an empty project", () => {
    expect(calculateProjectCompletenessScore(null)).toBe(0);
    expect(calculateProjectCompletenessScore({})).toBe(0);
  });

  it("returns 100 for a fully specified project", () => {
    expect(calculateProjectCompletenessScore(completeProject)).toBe(100);
  });

  it("drops when required pieces are missing", () => {
    const { budgetMin, budgetMax, ...withoutBudget } = completeProject;
    expect(calculateProjectCompletenessScore(withoutBudget)).toBeLessThan(100);
  });
});

describe("calculateProjectRecommendationScore", () => {
  it("returns 0 for non-developers", () => {
    expect(calculateProjectRecommendationScore(completeProject, { role: "client" })).toBe(0);
    expect(calculateProjectRecommendationScore(completeProject, null)).toBe(0);
  });

  it("scores a well-matched developer high and caps at 100", () => {
    const score = calculateProjectRecommendationScore(completeProject, developerProfile);
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("scores an unrelated developer lower than a matched one", () => {
    const unrelated: Partial<Profile> = {
      role: "developer",
      skills: ["Embedded C"],
      primaryCategories: ["devops_cloud"],
      availabilityStatus: "busy",
    };
    expect(calculateProjectRecommendationScore(completeProject, unrelated)).toBeLessThan(
      calculateProjectRecommendationScore(completeProject, developerProfile),
    );
  });
});

describe("calculateProposalMatchScore", () => {
  it("is at least the recommendation score when proposal adds relevant skills", () => {
    const base = calculateProjectRecommendationScore(completeProject, developerProfile);
    const withProposal = calculateProposalMatchScore(
      completeProject,
      developerProfile,
      ["React", "Next.js"],
      [{ question: "Have you built stores before?", answer: "Yes, three." }],
    );
    expect(withProposal).toBeGreaterThanOrEqual(base);
    expect(withProposal).toBeLessThanOrEqual(100);
  });
});

describe("normalization helpers", () => {
  it("maps legacy category aliases to current values", () => {
    expect(normalizeProjectCategory("web_dev")).toBe("web_frontend");
    expect(normalizeProjectCategory("ai_ml")).toBe("ai_llm");
  });

  it("dedupes and normalizes technology tags", () => {
    const tags = normalizeTechnologyTags(["nextjs", "nextjs", "supabase"]);
    expect(tags).toContain("nextjs");
    expect(tags).toContain("supabase");
    expect(new Set(tags).size).toBe(tags.length);
  });
});

describe("calculateProfileCompletionScore", () => {
  it("is 0 for an empty profile and grows with detail", () => {
    expect(calculateProfileCompletionScore(null)).toBe(0);
    expect(
      calculateProfileCompletionScore({ ...developerProfile, bio: "I build web apps.", headline: "Full-stack dev" }),
    ).toBeGreaterThan(0);
  });
});
