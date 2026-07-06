import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parses a route param or value into a positive integer id.
 * Returns null for 0, negative, NaN, non-numeric, null/undefined.
 */
export function parsePositiveInt(
  value: string | number | null | undefined
): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

/**
 * Basic sanitization for user-controlled text before interpolation into AI prompts.
 * Strips control characters and caps length to mitigate prompt injection / token bloat.
 */
export function sanitizeForPrompt(text: string, maxLen = 4000): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    .trim()
    .slice(0, maxLen);
}
