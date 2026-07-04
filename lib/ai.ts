import { z } from "zod";

// Server-only client for any OpenAI-compatible chat-completions API.
// Provider is swappable via env: AI_API_BASE_URL + AI_API_KEY + AI_MODEL.
const BASE_URL = process.env.AI_API_BASE_URL;
const API_KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_MODEL ?? "deepseek-v4-pro";

export function aiEnabled(): boolean {
  return Boolean(BASE_URL && API_KEY);
}

export class AiUnavailableError extends Error {}

/**
 * Sends a system + user prompt, requests a JSON object back, and validates it
 * against the given Zod schema. Throws on provider errors or invalid output —
 * callers decide the fallback (usually the pre-existing heuristic).
 */
export async function aiJson<T>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  systemPrompt: string,
  userPrompt: string,
): Promise<T> {
  if (!aiEnabled()) {
    throw new AiUnavailableError("AI provider is not configured");
  }

  const response = await fetch(`${BASE_URL!.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new AiUnavailableError(`AI provider responded ${response.status}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new AiUnavailableError("AI provider returned no content");
  }

  return schema.parse(JSON.parse(content));
}

import { NextResponse } from "next/server";

/** Maps errors from AI routes to consistent HTTP responses. */
export function aiErrorResponse(error: unknown): NextResponse {
  if (error instanceof AiUnavailableError) {
    return NextResponse.json(
      { message: "AI features are not available right now. Try again later." },
      { status: 503 },
    );
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { message: error.errors[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }
  console.error("AI route error:", error);
  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { message: "Too many AI requests, try again in a minute." },
    { status: 429 },
  );
}

// ponytail: in-memory per-user rate limit; move to a shared store (e.g. Upstash)
// if this ever runs on more than one instance.
const requestLog = new Map<string, number[]>();

export function checkRateLimit(userId: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (requestLog.get(userId) ?? []).filter((at) => now - at < windowMs);
  if (recent.length >= limit) {
    requestLog.set(userId, recent);
    return false;
  }
  recent.push(now);
  requestLog.set(userId, recent);
  return true;
}
