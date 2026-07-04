import { engagementTypes, projectTypes, scopeSizes, type ProjectDraft, type ProjectDraftResponse, type ReferenceLink } from "@shared/schema";
import { PROJECT_CATEGORY_OPTIONS, normalizeTechnologyTags } from "@shared/marketplace";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  web_frontend: ["web", "frontend", "landing page", "dashboard", "saas", "website", "portal"],
  backend_api: ["backend", "api", "microservice", "service", "server", "auth", "graphql"],
  mobile: ["mobile", "ios", "android", "react native", "flutter", "app store", "play store"],
  ai_llm: ["ai", "llm", "rag", "agent", "gpt", "claude", "gemini", "prompt", "copilot"],
  data_ml: ["machine learning", "ml", "etl", "data pipeline", "analytics", "model", "warehouse"],
  devops_cloud: ["devops", "cloud", "aws", "gcp", "azure", "docker", "kubernetes", "terraform"],
  design_ux: ["design", "ux", "ui", "wireframe", "figma", "prototype", "brand"],
  ecommerce_cms: ["shopify", "woocommerce", "wordpress", "cms", "ecommerce", "checkout"],
  qa_automation: ["qa", "test automation", "cypress", "playwright", "selenium", "testing"],
  integrations_internal_tools: ["integration", "automation", "internal tool", "crm", "erp", "zapier", "n8n"],
};

const TECHNOLOGY_KEYWORDS: Record<string, string[]> = {
  openai_gpt: ["openai", "gpt", "chatgpt"],
  claude: ["claude"],
  gemini: ["gemini"],
  rag: ["rag", "retrieval augmented generation"],
  ai_agents: ["agent", "agents", "agentic"],
  langgraph: ["langgraph"],
  ollama: ["ollama"],
  vector_db: ["vector db", "vector database", "pinecone", "weaviate", "qdrant", "pgvector"],
  evals: ["eval", "evals", "evaluation"],
  fine_tuning: ["fine tune", "finetune", "fine-tuning"],
  react: ["react"],
  nextjs: ["next.js", "nextjs", "next js"],
  vue: ["vue"],
  svelte: ["svelte"],
  astro: ["astro"],
  tailwindcss4: ["tailwind", "tailwind css"],
  shadcn_ui: ["shadcn", "shadcn/ui"],
  typescript: ["typescript", "ts"],
  nodejs: ["node", "node.js"],
  express: ["express"],
  nestjs: ["nestjs", "nest"],
  fastapi: ["fastapi"],
  django: ["django"],
  laravel: ["laravel"],
  graphql: ["graphql"],
  rest_api: ["rest api", "restful api"],
  react_native: ["react native"],
  flutter: ["flutter"],
  swiftui: ["swiftui"],
  kotlin_android: ["kotlin", "android"],
  postgresql: ["postgres", "postgresql"],
  supabase: ["supabase"],
  redis: ["redis"],
  mongodb: ["mongodb", "mongo"],
  docker: ["docker"],
  kubernetes: ["kubernetes", "k8s"],
  terraform: ["terraform"],
  aws: ["aws", "amazon web services"],
  gcp: ["gcp", "google cloud"],
  azure: ["azure"],
  cloudflare: ["cloudflare"],
  vercel: ["vercel"],
};

const REQUIRED_DRAFT_FIELDS = [
  "title",
  "category",
  "businessGoal",
  "projectType",
  "scopeSize",
  "description",
  "deliverables",
  "engagementType",
  "budgetMin",
  "budgetMax",
  "requiredSkills",
  "technologyTags",
  "estimatedDurationWeeksOrDeadline",
] as const;

function dedupe(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function extractTitle(rawBrief: string) {
  const lines = rawBrief
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return "";
  const firstLine = lines[0].replace(/^[-*#\d.\s]+/, "").trim();
  if (firstLine.length >= 8 && firstLine.length <= 80) return firstLine;

  const firstSentence = rawBrief.split(/[.!?]/)[0]?.trim() ?? "";
  return firstSentence.slice(0, 80);
}

function inferCategory(rawBrief: string): (typeof PROJECT_CATEGORY_OPTIONS)[number]["value"] {
  const normalized = rawBrief.toLowerCase();
  let bestCategory: (typeof PROJECT_CATEGORY_OPTIONS)[number]["value"] = "web_frontend";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      bestCategory = category as (typeof PROJECT_CATEGORY_OPTIONS)[number]["value"];
      bestScore = score;
    }
  }

  return bestCategory;
}

function inferProjectType(rawBrief: string): typeof projectTypes[number] {
  const normalized = rawBrief.toLowerCase();
  if (/(ongoing|maintenance|support|retainer|long-term)/.test(normalized)) return "ongoing";
  if (/(phase|phased|milestone|sprint)/.test(normalized)) return "milestone_based";
  return "one_time";
}

function inferScopeSize(rawBrief: string): typeof scopeSizes[number] {
  const normalized = rawBrief.toLowerCase();
  if (/(enterprise|marketplace|platform|multi-tenant|admin panel|dashboard|complex|full product)/.test(normalized)) {
    return "large";
  }
  if (/(feature|mvp|workflow|integration|revamp|module)/.test(normalized)) {
    return "medium";
  }
  return "small";
}

function inferEngagementType(rawBrief: string): typeof engagementTypes[number] {
  const normalized = rawBrief.toLowerCase();
  if (/(hourly|part-time|retainer|ongoing support)/.test(normalized)) return "hourly";
  return "fixed";
}

function inferBudget(rawBrief: string) {
  const rangeMatch = rawBrief.match(/₹?\s*([\d,]{4,})\s*(?:-|to)\s*₹?\s*([\d,]{4,})/i);
  if (rangeMatch) {
    return {
      budgetMin: Number(rangeMatch[1].replace(/,/g, "")),
      budgetMax: Number(rangeMatch[2].replace(/,/g, "")),
    };
  }

  const singleMatch = rawBrief.match(/budget[^0-9₹]*₹?\s*([\d,]{4,})/i);
  if (singleMatch) {
    const value = Number(singleMatch[1].replace(/,/g, ""));
    return { budgetMin: value, budgetMax: value };
  }

  return {};
}

function inferDuration(rawBrief: string) {
  const weeksMatch = rawBrief.match(/(\d{1,2})\s*(?:week|weeks)/i);
  if (weeksMatch) return Number(weeksMatch[1]);

  const monthsMatch = rawBrief.match(/(\d{1,2})\s*(?:month|months)/i);
  if (monthsMatch) return Number(monthsMatch[1]) * 4;

  return undefined;
}

function extractList(rawBrief: string) {
  return rawBrief
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*•]/.test(line))
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

function inferDeliverables(rawBrief: string) {
  const bullets = extractList(rawBrief);
  if (bullets.length > 0) return bullets.slice(0, 5);

  const sentences = rawBrief
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => /(build|ship|create|launch|deliver|integrate|design|develop)/i.test(sentence));

  return dedupe(sentences.slice(0, 4));
}

function inferTechnologyTags(rawBrief: string) {
  const normalized = rawBrief.toLowerCase();
  const hits = Object.entries(TECHNOLOGY_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))
    .map(([value]) => value);

  return normalizeTechnologyTags(hits);
}

function inferRequiredSkills(technologyTags: string[]) {
  const skillMap: Record<string, string> = {
    openai_gpt: "OpenAI",
    claude: "Claude",
    gemini: "Gemini",
    rag: "RAG",
    ai_agents: "AI Agents",
    langgraph: "LangGraph",
    ollama: "Ollama",
    vector_db: "Vector Search",
    evals: "AI Evals",
    fine_tuning: "Fine-tuning",
    react: "React",
    nextjs: "Next.js",
    vue: "Vue",
    svelte: "Svelte",
    astro: "Astro",
    tailwindcss4: "Tailwind CSS",
    shadcn_ui: "shadcn/ui",
    typescript: "TypeScript",
    nodejs: "Node.js",
    express: "Express",
    nestjs: "NestJS",
    fastapi: "FastAPI",
    django: "Django",
    laravel: "Laravel",
    graphql: "GraphQL",
    rest_api: "REST API",
    react_native: "React Native",
    flutter: "Flutter",
    swiftui: "SwiftUI",
    kotlin_android: "Kotlin",
    postgresql: "PostgreSQL",
    supabase: "Supabase",
    redis: "Redis",
    mongodb: "MongoDB",
    docker: "Docker",
    kubernetes: "Kubernetes",
    terraform: "Terraform",
    aws: "AWS",
    gcp: "GCP",
    azure: "Azure",
    cloudflare: "Cloudflare",
    vercel: "Vercel",
  };

  return dedupe(technologyTags.map((tag) => skillMap[tag]).filter(Boolean)).slice(0, 8);
}

function extractReferenceLinks(rawBrief: string): ReferenceLink[] {
  const matches = rawBrief.match(/https?:\/\/[^\s)]+/g) ?? [];
  return matches.slice(0, 5).map((url, index) => ({
    label: `Reference ${index + 1}`,
    url,
  }));
}

function inferBusinessGoal(rawBrief: string) {
  const firstSentence = rawBrief.split(/[.!?]/)[0]?.trim() ?? "";
  if (firstSentence.length >= 12) return firstSentence;
  const lines = rawBrief.split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.find((line) => line.length >= 12) ?? "";
}

export function generateProjectDraft(rawBrief: string): ProjectDraftResponse {
  const technologyTags = inferTechnologyTags(rawBrief);
  const deliverables = inferDeliverables(rawBrief);
  const budget = inferBudget(rawBrief);

  const draft = {
    title: extractTitle(rawBrief),
    category: inferCategory(rawBrief),
    description: rawBrief.trim(),
    businessGoal: inferBusinessGoal(rawBrief),
    projectType: inferProjectType(rawBrief),
    scopeSize: inferScopeSize(rawBrief),
    engagementType: inferEngagementType(rawBrief),
    budgetMin: budget.budgetMin,
    budgetMax: budget.budgetMax,
    estimatedDurationWeeks: inferDuration(rawBrief),
    requiredSkills: inferRequiredSkills(technologyTags),
    technologyTags,
    deliverables,
    referenceLinks: extractReferenceLinks(rawBrief),
  };

  const { missingFields, warnings } = computeDraftFeedback(draft);

  return {
    draft,
    missingFields,
    warnings,
    source: "heuristic",
  };
}

export function computeDraftFeedback(draft: ProjectDraft): { missingFields: string[]; warnings: string[] } {
  const missingFields = REQUIRED_DRAFT_FIELDS.filter((field) => {
    if (field === "estimatedDurationWeeksOrDeadline") {
      return !draft.estimatedDurationWeeks && !draft.deadline;
    }

    const value = draft[field as keyof typeof draft];
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null || value === "";
  });

  const warnings = [
    !draft.budgetMin || !draft.budgetMax ? "No clear INR budget detected in the brief." : "",
    !draft.estimatedDurationWeeks && !draft.deadline ? "No clear duration detected; add weeks or a deadline manually." : "",
    (draft.technologyTags ?? []).length === 0 ? "No known technology tags were detected; add the stack manually." : "",
  ].filter(Boolean);

  return { missingFields, warnings };
}
