import {
  type Profile,
  type Project,
  type ProposalScreeningAnswer,
  type ReferenceLink,
} from "./schema";

export const PROJECT_CATEGORY_OPTIONS = [
  { value: "web_frontend", label: "Web & Frontend" },
  { value: "backend_api", label: "Backend & APIs" },
  { value: "mobile", label: "Mobile Apps" },
  { value: "ai_llm", label: "AI, LLMs & Agents" },
  { value: "data_ml", label: "Data & Machine Learning" },
  { value: "devops_cloud", label: "DevOps & Cloud" },
  { value: "design_ux", label: "Design & UX" },
  { value: "ecommerce_cms", label: "E-commerce & CMS" },
  { value: "qa_automation", label: "QA & Test Automation" },
  { value: "integrations_internal_tools", label: "Integrations & Internal Tools" },
] as const;

export const PROJECT_CATEGORY_ALIASES: Record<string, string> = {
  web_dev: "web_frontend",
  mobile_app: "mobile",
  design: "design_ux",
  ai_ml: "ai_llm",
  devops: "devops_cloud",
};

export const PROJECT_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  PROJECT_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
);

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  one_time: "One-time build",
  milestone_based: "Milestone-based",
  ongoing: "Ongoing support",
};

export const SCOPE_SIZE_LABELS: Record<string, string> = {
  small: "Small scope",
  medium: "Medium scope",
  large: "Large scope",
};

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
  lead: "Lead",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  available: "Available",
  busy: "Busy",
  open_to_offers: "Open to Offers",
};

export const ENGAGEMENT_TYPE_LABELS: Record<string, string> = {
  fixed: "Fixed Scope",
  hourly: "Hourly",
};

export const TEAM_PREFERENCE_LABELS: Record<string, string> = {
  solo_freelancer: "Solo freelancer",
  small_team: "Small team",
  agency_ok: "Agency or team OK",
};

export const COMMUNICATION_CADENCE_LABELS: Record<string, string> = {
  async_updates: "Async updates",
  weekly_sync: "Weekly sync",
  multi_weekly: "Multiple syncs / week",
  daily_collab: "Daily collaboration",
};

export const TECHNOLOGY_TAG_GROUPS: Array<{
  label: string;
  options: Array<{ value: string; label: string }>;
}> = [
  {
    label: "AI / LLM",
    options: [
      { value: "openai_gpt", label: "OpenAI GPT" },
      { value: "claude", label: "Claude" },
      { value: "gemini", label: "Gemini" },
      { value: "rag", label: "RAG" },
      { value: "ai_agents", label: "AI Agents" },
      { value: "langgraph", label: "LangGraph" },
      { value: "ollama", label: "Ollama" },
      { value: "vector_db", label: "Vector DB" },
      { value: "evals", label: "Evals" },
      { value: "fine_tuning", label: "Fine-tuning" },
    ],
  },
  {
    label: "Frontend",
    options: [
      { value: "react", label: "React" },
      { value: "nextjs", label: "Next.js" },
      { value: "vue", label: "Vue" },
      { value: "svelte", label: "Svelte" },
      { value: "astro", label: "Astro" },
      { value: "tailwindcss4", label: "Tailwind CSS 4" },
      { value: "shadcn_ui", label: "shadcn/ui" },
      { value: "typescript", label: "TypeScript" },
    ],
  },
  {
    label: "Backend",
    options: [
      { value: "nodejs", label: "Node.js" },
      { value: "express", label: "Express" },
      { value: "nestjs", label: "NestJS" },
      { value: "fastapi", label: "FastAPI" },
      { value: "django", label: "Django" },
      { value: "laravel", label: "Laravel" },
      { value: "graphql", label: "GraphQL" },
      { value: "rest_api", label: "REST API" },
    ],
  },
  {
    label: "Mobile",
    options: [
      { value: "react_native", label: "React Native" },
      { value: "flutter", label: "Flutter" },
      { value: "swiftui", label: "SwiftUI" },
      { value: "kotlin_android", label: "Kotlin Android" },
    ],
  },
  {
    label: "Data / Infra",
    options: [
      { value: "postgresql", label: "PostgreSQL" },
      { value: "supabase", label: "Supabase" },
      { value: "redis", label: "Redis" },
      { value: "mongodb", label: "MongoDB" },
      { value: "docker", label: "Docker" },
      { value: "kubernetes", label: "Kubernetes" },
      { value: "terraform", label: "Terraform" },
      { value: "aws", label: "AWS" },
      { value: "gcp", label: "GCP" },
      { value: "azure", label: "Azure" },
      { value: "cloudflare", label: "Cloudflare" },
      { value: "vercel", label: "Vercel" },
    ],
  },
] as const;

export const TECHNOLOGY_TAG_OPTIONS = TECHNOLOGY_TAG_GROUPS.flatMap((group) => group.options);
export const TECHNOLOGY_TAG_LABELS: Record<string, string> = Object.fromEntries(
  TECHNOLOGY_TAG_OPTIONS.map((option) => [option.value, option.label]),
);

const TECHNOLOGY_TAG_ALIASES: Record<string, string> = {
  next_js: "nextjs",
  next: "nextjs",
  node_js: "nodejs",
  node: "nodejs",
  postgres: "postgresql",
  postgres_sql: "postgresql",
  tailwind: "tailwindcss4",
  tailwindcss: "tailwindcss4",
  shadcn: "shadcn_ui",
  shadcn_ui: "shadcn_ui",
  reactnative: "react_native",
  react_native: "react_native",
  kotlin: "kotlin_android",
  kubernetes_cluster: "kubernetes",
  llm: "openai_gpt",
  agents: "ai_agents",
  vector_database: "vector_db",
};

export function sanitizeStringArray(values?: string[] | null): string[] {
  const seen = new Set<string>();
  const sanitized: string[] = [];

  for (const value of values ?? []) {
    const trimmed = value.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    sanitized.push(trimmed);
  }

  return sanitized;
}

export function normalizeProjectCategory(category?: string | null): string | undefined {
  if (!category) return undefined;
  return PROJECT_CATEGORY_ALIASES[category] ?? category;
}

export function normalizeProjectCategories(categories?: string[] | null): string[] {
  const normalized = sanitizeStringArray(categories).map((category) => normalizeProjectCategory(category) ?? category);
  return sanitizeStringArray(normalized);
}

function normalizeTechnologyTag(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[/.+-]/g, "_")
    .replace(/\s+/g, "_");
  return TECHNOLOGY_TAG_ALIASES[normalized] ?? normalized;
}

export function normalizeTechnologyTags(values?: string[] | null): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const value of values ?? []) {
    if (!value?.trim()) continue;
    const nextValue = normalizeTechnologyTag(value);
    if (seen.has(nextValue)) continue;
    seen.add(nextValue);
    normalized.push(nextValue);
  }

  return normalized;
}

export function sanitizeReferenceLinks(values?: ReferenceLink[] | null): ReferenceLink[] {
  const normalized: ReferenceLink[] = [];

  for (const value of values ?? []) {
    const label = value?.label?.trim();
    const url = value?.url?.trim();
    if (!label || !url) continue;
    normalized.push({ label, url });
  }

  return normalized;
}

export function sanitizeScreeningAnswers(values?: ProposalScreeningAnswer[] | null): ProposalScreeningAnswer[] {
  const normalized: ProposalScreeningAnswer[] = [];

  for (const value of values ?? []) {
    const question = value?.question?.trim();
    const answer = value?.answer?.trim();
    if (!question || !answer) continue;
    normalized.push({ question, answer });
  }

  return normalized;
}

function toComparisonSet(values?: string[] | null): Set<string> {
  return new Set(sanitizeStringArray(values).map((value) => value.toLowerCase()));
}

function getExperienceRank(level?: string | null): number {
  switch (level) {
    case "junior":
      return 1;
    case "mid":
      return 2;
    case "senior":
      return 3;
    case "lead":
      return 4;
    default:
      return 0;
  }
}

export function calculateProfileCompletionScore(profile?: Partial<Profile> | null): number {
  if (!profile) return 0;

  const sharedChecks = [
    !!profile.headline?.trim(),
    !!profile.bio?.trim(),
  ];

  const roleSpecificChecks =
    profile.role === "developer"
      ? [
          sanitizeStringArray(profile.skills).length > 0,
          sanitizeStringArray(profile.primaryCategories).length > 0,
          !!profile.experienceLevel,
          !!profile.availabilityStatus,
          Boolean(
            profile.portfolioLinks?.github ||
              profile.portfolioLinks?.linkedin ||
              profile.portfolioLinks?.website,
          ),
        ]
      : [
          !!profile.companyName?.trim(),
          !!profile.industry?.trim(),
          !!profile.companySize,
        ];

  const checks = [...sharedChecks, ...roleSpecificChecks];
  const completed = checks.filter(Boolean).length;

  return checks.length === 0 ? 0 : Math.round((completed / checks.length) * 100);
}

export function calculateProjectCompletenessScore(project?: Partial<Project> | null): number {
  if (!project) return 0;

  const checks = [
    !!project.title?.trim(),
    !!normalizeProjectCategory(project.category),
    !!project.description?.trim(),
    !!project.businessGoal?.trim(),
    !!project.projectType,
    !!project.scopeSize,
    typeof project.budgetMin === "number" && typeof project.budgetMax === "number",
    sanitizeStringArray(project.requiredSkills).length > 0,
    normalizeTechnologyTags(project.technologyTags).length > 0,
    sanitizeStringArray(project.deliverables).length > 0,
    Boolean(project.estimatedDurationWeeks || project.deadline),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function calculateProjectRecommendationScore(
  project: Partial<Project>,
  profile?: Partial<Profile> | null,
): number {
  if (!profile || profile.role !== "developer") return 0;

  let score = 0;
  const profileCategories = toComparisonSet(normalizeProjectCategories(profile.primaryCategories));
  const profileSkills = toComparisonSet(profile.skills);
  const projectSkills = toComparisonSet(project.requiredSkills);
  const preferredProjectSkills = toComparisonSet(project.preferredSkills);
  const projectTechnologyTags = new Set(normalizeTechnologyTags(project.technologyTags).map((value) => value.toLowerCase()));
  const normalizedCategory = normalizeProjectCategory(project.category)?.toLowerCase();

  if (normalizedCategory && profileCategories.has(normalizedCategory)) {
    score += 15;
  }

  if (projectSkills.size > 0 && profileSkills.size > 0) {
    const overlap = [...projectSkills].filter((skill) => profileSkills.has(skill)).length;
    score += Math.round((overlap / projectSkills.size) * 25);
  }

  if (projectTechnologyTags.size > 0 && profileSkills.size > 0) {
    const overlap = [...projectTechnologyTags].filter((tag) => profileSkills.has(tag)).length;
    score += Math.round((overlap / projectTechnologyTags.size) * 25);
  }

  if (preferredProjectSkills.size > 0 && profileSkills.size > 0) {
    const overlap = [...preferredProjectSkills].filter((skill) => profileSkills.has(skill)).length;
    score += Math.round((overlap / preferredProjectSkills.size) * 10);
  }

  if (!project.preferredExperienceLevel) {
    score += 10;
  } else if (getExperienceRank(profile.experienceLevel) >= getExperienceRank(project.preferredExperienceLevel)) {
    score += 10;
  } else if (profile.experienceLevel) {
    score += 5;
  }

  if (profile.availabilityStatus === "available") {
    score += 5;
  } else if (profile.availabilityStatus === "open_to_offers") {
    score += 3;
  }

  score += Math.round(calculateProjectCompletenessScore(project) * 0.1);

  return Math.min(score, 100);
}

export function calculateProposalMatchScore(
  project: Partial<Project>,
  profile?: Partial<Profile> | null,
  relevantSkills?: string[] | null,
  screeningAnswers?: ProposalScreeningAnswer[] | null,
): number {
  const recommendationScore = calculateProjectRecommendationScore(project, profile);
  const proposalSkills = toComparisonSet(relevantSkills);
  const projectSkills = toComparisonSet(project.requiredSkills);
  const sanitizedScreeningAnswers = sanitizeScreeningAnswers(screeningAnswers);
  const screeningQuestionCount = sanitizeStringArray(project.screeningQuestions).length;

  let score = recommendationScore;

  if (projectSkills.size > 0 && proposalSkills.size > 0) {
    const overlap = [...projectSkills].filter((skill) => proposalSkills.has(skill)).length;
    score += Math.round((overlap / projectSkills.size) * 10);
  } else if (proposalSkills.size > 0) {
    score += 5;
  }

  if (screeningQuestionCount > 0 && sanitizedScreeningAnswers.length > 0) {
    score += Math.round((sanitizedScreeningAnswers.length / screeningQuestionCount) * 5);
  }

  return Math.min(score, 100);
}

export function getProjectCategoryLabel(category?: string | null): string {
  const normalized = normalizeProjectCategory(category);
  if (!normalized) return "General";
  return PROJECT_CATEGORY_LABELS[normalized] ?? normalized;
}

export function getTechnologyTagLabel(tag?: string | null): string {
  if (!tag) return "Technology";
  return TECHNOLOGY_TAG_LABELS[normalizeTechnologyTag(tag)] ?? tag;
}
