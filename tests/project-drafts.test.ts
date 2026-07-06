import { describe, expect, it } from "vitest";

import { computeDraftFeedback, generateProjectDraft } from "@/lib/project-drafts";

// The heuristic is the fallback when the AI provider is down — it must keep working.
describe("generateProjectDraft (heuristic fallback)", () => {
  const brief = `AI copilot for sales dashboards
We need a Next.js dashboard with a GPT-powered assistant for searching customer notes.
Budget ₹1,50,000 to ₹3,00,000. Target timeline 6 weeks.
- Admin analytics module
- Role-based access
- AI assistant`;

  it("extracts budget range, duration, and category from the brief", () => {
    const result = generateProjectDraft(brief);
    expect(result.source).toBe("heuristic");
    expect(result.draft.budgetMin).toBe(150000);
    expect(result.draft.budgetMax).toBe(300000);
    expect(result.draft.estimatedDurationWeeks).toBe(6);
    expect(result.draft.category).toBe("ai_llm");
    expect(result.draft.deliverables?.length).toBeGreaterThan(0);
    expect(result.draft.technologyTags).toContain("nextjs");
  });

  it("warns when the brief has no budget or duration", () => {
    const result = generateProjectDraft("Build a simple landing page for my bakery business soon.");
    expect(result.warnings.join(" ")).toMatch(/budget/i);
    expect(result.warnings.join(" ")).toMatch(/duration/i);
  });
});

describe("computeDraftFeedback", () => {
  it("flags every required field on an empty draft", () => {
    const { missingFields } = computeDraftFeedback({});
    expect(missingFields).toContain("title");
    expect(missingFields).toContain("budgetMin");
    expect(missingFields).toContain("estimatedDurationWeeksOrDeadline");
  });

  it("accepts a deadline in place of a duration estimate", () => {
    const { missingFields } = computeDraftFeedback({ deadline: "2026-09-01" });
    expect(missingFields).not.toContain("estimatedDurationWeeksOrDeadline");
  });
});
