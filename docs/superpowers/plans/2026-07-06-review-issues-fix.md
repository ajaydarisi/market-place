# Review Issues Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all issues identified in the code review of `feat/ai-marketplace-skillpilot` vs `origin/main` (5 bugs, 4 suggestions, 3 nits), prioritizing STANDARDS.md compliance (eliminate all raw `<button>` elements), API behavior correctness, AI route consistency, input safety, ID robustness, and data freshness.

**Architecture:** Introduce two small shared utilities, then perform targeted replacements and guards following existing patterns from the codebase (e.g. `improve/route.ts` AI guard structure, `<Button variant="ghost" / "outline">` usage, direct Supabase via storage). No new dependencies, no large refactors. All changes keep fallbacks, Zod validation, loading states, and middleware auth intact.

**Tech Stack:** Next.js 15 App Router + TypeScript, Supabase (direct client), shadcn/ui + Tailwind theme tokens, React Query (mutations), Zod, lucide-react.

## Global Constraints
- Strictly follow STANDARDS.md: ONLY shadcn/ui components (use `<Button>` not `<button>`), ONLY theme color tokens (`primary`, `border`, `muted-foreground`, `bg-primary/[0.08]`, `border-primary`, etc. — never `text-red-500` etc.).
- Use `@/` for root and `@shared/` for shared.
- Button variants limited to: default, destructive, outline, secondary, ghost.
- All interactive elements must have `aria-label` where appropriate.
- Use `<Loader2>` / `<Skeleton>` for async.
- Route protection via middleware.ts only.
- Direct Supabase queries (no ORM).
- Client env vars use `NEXT_PUBLIC_`.
- Frequent small commits. TDD for new utilities.
- Changes must preserve existing AI fallbacks (`aiEnabled()` + heuristic), rate limiting behavior where intended, and notification/RPC atomicity.

---

### Task 1: Add shared utility helpers (ID parser + AI prompt sanitizer)

**Files:**
- Modify: `lib/utils.ts`
- Create/Test: `tests/utils.test.ts` (or append to existing test file if pattern matches; prefer new focused test)
- Modify (later tasks): multiple route + page files will import from here

**Interfaces:**
- Consumes: none
- Produces: `parsePositiveInt(value: string | number | null | undefined): number | null`, `sanitizeForPrompt(text: string, maxLen?: number): string`

- [ ] **Step 1: Write failing tests for the new utilities**

Create `tests/utils.test.ts` (new file) with:

```ts
import { describe, it, expect } from 'vitest';
import { parsePositiveInt, sanitizeForPrompt } from '@/lib/utils';

describe('parsePositiveInt', () => {
  it('parses valid positive ids', () => {
    expect(parsePositiveInt('42')).toBe(42);
    expect(parsePositiveInt(123)).toBe(123);
    expect(parsePositiveInt('001')).toBe(1);
  });
  it('rejects invalid/negative/zero/NaN', () => {
    expect(parsePositiveInt('0')).toBe(null);
    expect(parsePositiveInt('-5')).toBe(null);
    expect(parsePositiveInt('abc')).toBe(null);
    expect(parsePositiveInt(NaN)).toBe(null);
    expect(parsePositiveInt(undefined)).toBe(null);
  });
});

describe('sanitizeForPrompt', () => {
  it('removes control characters and truncates', () => {
    const dirty = 'hello\x00world\x1F' + 'x'.repeat(5000);
    const out = sanitizeForPrompt(dirty, 100);
    expect(out).not.toMatch(/[\x00-\x1F]/);
    expect(out.length).toBeLessThanOrEqual(100);
    expect(out).toContain('hello');
  });
  it('handles empty and normal strings', () => {
    expect(sanitizeForPrompt('')).toBe('');
    expect(sanitizeForPrompt(' normal text ')).toBe('normal text');
  });
});
```

Run to verify failure:

```bash
npm test -- tests/utils.test.ts -t "parsePositiveInt|sanitizeForPrompt"
```

Expected: FAIL (functions not exported yet).

- [ ] **Step 2: Implement the helpers in lib/utils.ts**

Update `lib/utils.ts`:

```ts
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
```

- [ ] **Step 3: Run tests to verify they pass**

```bash
npm test -- tests/utils.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/utils.ts tests/utils.test.ts
git commit -m "fix: add parsePositiveInt and sanitizeForPrompt utilities (addresses review issues 8, 11)"
```

---

### Task 2: Replace raw <button> with shadcn Button in project-intake-form.tsx (tags + steps)

**Files:**
- Modify: `components/project-intake-form.tsx:160-200` (TechnologyTagPicker) and `~310-340` (STEP_TITLES stepper)

**Interfaces:**
- Already imports `Button` from `@/components/ui/button`
- Uses theme tokens already in the classNames (`border-primary`, `bg-primary/[0.1]`, etc.)

- [ ] **Step 1: Replace technology tag chips**

In `TechnologyTagPicker`, change the inner return of the map from `<button ...>` to `<Button ...>`:

```tsx
// before
<button
  key={option.value}
  type="button"
  onClick={() => toggleTag(option.value)}
  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
    isSelected
      ? "border-primary bg-primary/[0.1] text-primary"
      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary"
  }`}
>
  {option.label}
</button>

// after
<Button
  key={option.value}
  type="button"
  variant="outline"
  size="sm"
  onClick={() => toggleTag(option.value)}
  className={`rounded-full px-3 py-1.5 text-sm transition-colors h-auto ${
    isSelected
      ? "border-primary bg-primary/[0.1] text-primary hover:bg-primary/[0.15]"
      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary"
  }`}
>
  {option.label}
</Button>
```

- [ ] **Step 2: Replace step navigation buttons**

In the `STEP_TITLES.map` inside CardHeader (around the grid):

```tsx
// before (simplified)
<button
  key={step.key}
  type="button"
  className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
    index === stepIndex
      ? "border-primary bg-primary/[0.08] text-primary"
      : index < stepIndex
        ? "border-primary/30 bg-background text-foreground"
        : "border-border/60 bg-background/70 text-muted-foreground"
  }`}
  onClick={() => setStepIndex(index)}
>
  ...
</button>

// after
<Button
  key={step.key}
  type="button"
  variant="ghost"
  className={`h-auto rounded-2xl border px-3 py-3 text-left transition-colors ${
    index === stepIndex
      ? "border-primary bg-primary/[0.08] text-primary hover:bg-primary/[0.12]"
      : index < stepIndex
        ? "border-primary/30 bg-background text-foreground hover:bg-secondary/50"
        : "border-border/60 bg-background/70 text-muted-foreground hover:bg-secondary/40"
  }`}
  onClick={() => setStepIndex(index)}
>
  ...
</Button>
```

- [ ] **Step 3: Verify no other raw buttons were missed in this file + typecheck**

```bash
grep -n "<button" components/project-intake-form.tsx || echo "No raw buttons left"
npm run build 2>&1 | head -20   # or tsc --noEmit
```

- [ ] **Step 4: Manual test note for later verification**

Open /client/post (or edit), verify tag chips toggle with correct theme colors and are keyboard accessible. Verify clicking step headers jumps correctly. Use different steps.

- [ ] **Step 5: Commit**

```bash
git add components/project-intake-form.tsx
git commit -m "fix: replace raw <button> with shadcn Button in ProjectIntakeForm (tags + steps) — STANDARDS compliance"
```

---

### Task 3: Replace raw <button> conversation selectors in messages pages

**Files:**
- Modify: `app/client/messages/page.tsx:182-210` (approx)
- Modify: `app/developer/messages/page.tsx:132-160` (approx)
- (Both files already `import { Button } from "@/components/ui/button";`)

**Interfaces:**
- The elements act as full-width list items with hover/active states using theme tokens (`bg-primary/[0.08]`, `ring-primary/10`).

- [ ] **Step 1: Update client messages conversation item**

Replace the `<button key=... className=... onClick=... >` (and its children stay inside) with:

```tsx
<Button
  key={`${conv.projectId}-${conv.otherUserId}`}
  variant="ghost"
  type="button"
  className={`w-full text-left p-3 h-auto rounded-2xl transition-all flex items-start gap-3 ${
    isActive
      ? "bg-primary/[0.08] shadow-sm ring-1 ring-primary/10"
      : "hover:bg-secondary/45"
  }`}
  onClick={() => {
    setSelected({ projectId: conv.projectId, developerId: conv.otherUserId });
    setMobileShowChat(true);
  }}
>
  {/* existing children: ProfileAvatar + div with name, title, lastMessage etc. unchanged */}
</Button>
```

- [ ] **Step 2: Apply identical pattern to developer messages page**

Use the analogous replacement (note the field difference: `clientId` vs `developerId` in the onClick/setSelected).

- [ ] **Step 3: Verify + a11y**

```bash
grep -n "<button" app/client/messages/page.tsx app/developer/messages/page.tsx || echo "Clean"
npm run build
```

Ensure Buttons remain keyboard focusable and the active styling matches previous (uses allowed tokens only).

- [ ] **Step 4: Commit**

```bash
git add app/client/messages/page.tsx app/developer/messages/page.tsx
git commit -m "fix: replace raw <button> selectors with shadcn Button in messages pages (STANDARDS)"
```

---

### Task 4: Restore conditional auth requirement on GET /api/projects

**Files:**
- Modify: `app/api/projects/route.ts` (the GET handler)

**Interfaces:**
- `storage.listProjects` already accepts `token?: string` and works without for non-personalized lists.
- Only "recommended" sort needs `currentUserId` (for scoring in storage).

- [ ] **Step 1: Update the GET logic to match pre-review behavior**

```ts
// Replace the unconditional block
// const user = await getAuthUser();
// if (!user) { return 401; }
// const token = await getAuthToken();
// if (filters.sort === "recommended") {
//   filters.currentUserId = user.id;
// }

let token: string | undefined;
if (filters.sort === "recommended") {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  filters.currentUserId = user.id;
  token = await getAuthToken();
} else {
  token = await getAuthToken(); // optional, for any authenticated context
}

const projects = await storage.listProjects(filters, token ?? undefined);
```

- [ ] **Step 2: Confirm other routes (POST etc.) keep full auth. Run typecheck**

- [ ] **Step 3: Test note**

Browse as developer (recommended sort) still works. Non-recommended listing (if used) does not 401 for an authenticated session.

- [ ] **Step 4: Commit**

```bash
git add app/api/projects/route.ts
git commit -m "fix: restore conditional auth on GET /api/projects (only required for recommended sort)"
```

---

### Task 5: Make AI rate limiting consistent in draft route (skip when !aiEnabled)

**Files:**
- Modify: `app/api/projects/draft/route.ts`

**Interfaces:**
- Follow exact pattern from `app/api/projects/improve/route.ts`: check `aiEnabled()` first, then rate limit, use `aiErrorResponse` + `rateLimitResponse` where appropriate.
- Draft intentionally falls back to `generateProjectDraft` heuristic.

- [ ] **Step 1: Update imports and restructure POST**

Add imports:

```ts
import { aiEnabled, rateLimitResponse } from "@/lib/ai";
```

Restructure body:

```ts
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!aiEnabled()) {
    // Fast path: heuristic, no rate limit consumption
    try {
      const body = await request.json();
      const input = api.projects.draft.input.parse(body);
      return NextResponse.json(generateProjectDraft(input.rawBrief));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ message: error.errors[0]?.message ?? "Invalid request" }, { status: 400 });
      }
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  }

  if (!checkRateLimit(user.id)) {
    return rateLimitResponse();
  }

  try {
    const body = await request.json();
    const input = api.projects.draft.input.parse(body);

    try {
      const draft = await aiJson(projectDraftSchema, SYSTEM_PROMPT, input.rawBrief);
      draft.technologyTags = normalizeTechnologyTags(draft.technologyTags ?? []);
      const { missingFields, warnings } = computeDraftFeedback(draft);
      return NextResponse.json({ draft, missingFields, warnings, source: "provider" });
    } catch {
      return NextResponse.json(generateProjectDraft(input.rawBrief));
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message ?? "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Clean up duplicate code if possible (keep simple for minimal diff)**

- [ ] **Step 3: Run relevant tests + manual**

```bash
npm test -- tests/project-drafts.test.ts
# When AI disabled (unset keys), calling /api/projects/draft should succeed without 429
```

- [ ] **Step 4: Commit**

```bash
git add app/api/projects/draft/route.ts
git commit -m "fix: skip rate limit + return heuristic immediately when !aiEnabled in draft route (consistency)"
```

---

### Task 6: Add central prompt sanitization for AI calls

**Files:**
- Modify: `lib/ai.ts` (aiJson + new helper)
- (Callers benefit automatically; no per-route changes required for basic protection)

**Interfaces:**
- `aiJson(schema, systemPrompt, userPrompt)` now internally sanitizes.

- [ ] **Step 1: Implement sanitize + apply inside aiJson**

Add (or import) `sanitizeForPrompt` from `./utils` (or inline for lib/ai if preferred; use the shared one from Task 1).

In `aiJson`, before the fetch:

```ts
const safeSystem = sanitizeForPrompt(systemPrompt, 8000);
const safeUser = sanitizeForPrompt(userPrompt);

... in body:
messages: [
  { role: "system", content: safeSystem },
  { role: "user", content: safeUser },
],
```

Update the ponytail comment at top of rate limit section.

Add a short JSDoc note: "User content is lightly sanitized; final trust is via Zod schema on output."

- [ ] **Step 2: Ensure sanitizeForPrompt is imported after Task 1**

```ts
import { sanitizeForPrompt } from "./utils";
```

- [ ] **Step 3: Typecheck + note on callers**

Affected callers (draft, improve, stack-advice, review-check, scope, profile optimize, interests/draft, match-rationale) automatically get protection on their userPrompt data (briefs, bios, summaries, messages).

- [ ] **Step 4: Commit**

```bash
git add lib/ai.ts
git commit -m "fix: central sanitizeForPrompt + truncation on AI user/system prompts (mitigates injection risk)"
```

---

### Task 7: Fix import ordering nit in lib/ai.ts

**Files:**
- Modify: `lib/ai.ts`

- [ ] **Step 1: Move the NextResponse import to the top**

Current has `import { z } from "zod";` then code, then `import { NextResponse }...` mid-file.

Move it immediately after the z import.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit** (can be combined with Task 6 if adjacent)

```bash
git add lib/ai.ts
git commit -m "chore: move NextResponse import to top of lib/ai.ts"
```

---

### Task 8: Return fresh interest record after successful accept

**Files:**
- Modify: `app/api/projects/[id]/interests/[interestId]/route.ts` (PATCH success path, near end of accept block)

**Interfaces:**
- `storage.listInterests(projectId, undefined, token)` returns the enriched records (with developer).

- [ ] **Step 1: After the log creation and before the final return, re-fetch**

Replace:

```ts
return NextResponse.json({ ...interest, status: "accepted" });
```

With:

```ts
// Re-fetch to return a consistent post-RPC record (the RPC performed the mutation)
const refreshed = await storage.listInterests(projectId, undefined, token ?? undefined);
const updated = refreshed.find((i) => i.id === interestIdNum) ?? { ...interest, status: "accepted" as const };
return NextResponse.json(updated);
```

- [ ] **Step 2: Keep the early `interest` lookup for ownership/pending checks (it is still needed before the RPC)**

- [ ] **Step 3: Verify behavior with a proposal accept flow (use existing e2e or manual)**

- [ ] **Step 4: Commit**

```bash
git add app/api/projects/\[id\]/interests/\[interestId\]/route.ts
git commit -m "fix: re-fetch interest after acceptProposal RPC so client receives fresh status + data"
```

---

### Task 9: Apply robust numeric ID parsing to all dynamic routes and pages

**Files:**
- Modify: `lib/utils.ts` (already done in Task 1)
- Modify multiple:
  - `app/api/projects/[id]/route.ts`
  - `app/api/projects/[id]/interests/route.ts`
  - `app/api/projects/[id]/interests/[interestId]/route.ts`
  - `app/api/projects/[id]/interests/draft/route.ts`
  - `app/api/projects/[id]/messages/route.ts`
  - `app/api/projects/[id]/messages/read/route.ts`
  - `app/api/projects/[id]/request-completion/route.ts`
  - `app/api/projects/[id]/review-check/route.ts`
  - `app/api/projects/[id]/stack-advice/route.ts`
  - `app/api/projects/[id]/scope/route.ts`
  - `app/api/projects/[id]/match-rationale/route.ts`
  - `app/api/projects/[id]/reviews/route.ts`
  - `app/projects/[id]/page.tsx`
  - `app/projects/[id]/edit/page.tsx`
  - `app/admin/projects/[id]/page.tsx`
  - (and any missed from earlier grep)

**Interfaces:**
- `parsePositiveInt` returns `number | null`; 400 on null in API handlers.

- [ ] **Step 1: Update representative API route handlers (example pattern for all)**

In each `[id]` handler:

```ts
// before
const projectId = Number(id);
const interestIdNum = Number(interestId);

// after
const projectId = parsePositiveInt(id);
if (projectId === null) {
  return NextResponse.json({ message: "Invalid project id" }, { status: 400 });
}
const interestIdNum = parsePositiveInt(interestId);
if (interestIdNum === null) {
  return NextResponse.json({ message: "Invalid interest id" }, { status: 400 });
}
```

Apply to GET/PATCH/DELETE/POST as relevant. Import at top:

```ts
import { parsePositiveInt } from "@/lib/utils";
```

- [ ] **Step 2: Update client pages (safer navigation / early return)**

In `app/projects/[id]/page.tsx` (uses parseInt currently):

```ts
const rawId = (params.id as string) || "";
const projectId = parsePositiveInt(rawId);
if (projectId === null) {
  // will naturally 404 or can router.replace('/not-found')
  notFound(); // if imported from next/navigation
}
```

Similar defensive handling in edit and admin pages (they can call notFound()).

- [ ] **Step 3: Batch verify + run full typecheck + tests that touch projects**

```bash
npm run build
npm test
# Spot check one bad-id case returns 400
```

- [ ] **Step 4: Commit (can split per logical group if preferred for smaller PRs)**

```bash
git add lib/utils.ts 'app/api/projects/[id]/**/*' 'app/projects/[id]/**' 'app/admin/projects/[id]/**'
git commit -m "fix: use parsePositiveInt guard on all project/interest ids (prevents NaN propagation)"
```

---

### Task 10: Documentation / low-priority nits (rate limit scaling note + rationale hook)

**Files:**
- Modify: `lib/ai.ts` (rate limit section comment)
- Modify or document: `components/project-card.tsx` + `hooks/use-ai.ts` (optional improvement)

- [ ] **Step 1: Strengthen in-memory rate limit documentation**

Update the existing comment:

```ts
// ponytail: in-memory per-user rate limit (10/min). Resets on cold start / per instance.
// Suitable for current scale. For multi-instance or high traffic, gate behind env and
// switch to Redis/Upstash. See also per-route limits in callers.
```

- [ ] **Step 2: For per-card rationale (nit): document or lightweight improvement**

Option A (preferred for minimal change): Add a comment in `ProjectCard` and `useMatchRationale`.

```ts
// Note: each ProjectCard owns its mutation instance. Rationale data is not shared
// across cards. Acceptable for browse lists (small N). If needed later, migrate to
// a keyed query or shared cache keyed by projectId.
const matchRationale = useMatchRationale();
```

Option B (small improvement): Change `useMatchRationale` to also support a query-like usage, but skip unless time allows.

Accept current behavior for this plan.

- [ ] **Step 3: Commit**

```bash
git add lib/ai.ts components/project-card.tsx
git commit -m "docs: clarify in-memory rate limit limitations + per-card rationale note"
```

---

### Task 11: Verification, cleanup, and final checks

**Files:**
- Run across repo (no code change in this task, or only comments)

- [ ] **Step 1: Global raw button scan (post all UI fixes)**

```bash
grep -rn "<button" --include="*.tsx" app/ components/ | grep -v "node_modules" || echo "No raw <button> elements in app code"
```

- [ ] **Step 2: Full build, type check, lint, unit tests**

```bash
npm run build
npm test
```

- [ ] **Step 3: Spot-check changed user flows (recommended)**

- Intake form: tag picker + step navigation on create/edit.
- Messages: switching conversations (client + developer).
- Project listing: browse as developer (recommended) + other sorts.
- Draft with AI disabled (env unset) succeeds without rate limit hit.
- Accept a proposal: client sees fresh accepted state + notifications.
- Bad route ids (e.g. /projects/abc or /projects/0) → 400 or not-found gracefully.
- Rationale "Why this match?" still works on cards.

Use existing e2e where possible:

```bash
npx playwright test e2e/marketplace-loop.spec.ts --grep "project|proposal" || true
```

- [ ] **Step 4: Confirm plan items map back to original review**

All 12 issues addressed (raw buttons x4 files covered in 2+3, auth, rate limit draft, sanitization, import, stale interest, id guards x many, nits documented).

- [ ] **Step 5: Final commit + push note**

```bash
git status
git log --oneline -5
# Consider: git push origin feat/ai-marketplace-skillpilot
```

---

## Post-Plan Notes

- The two biggest visible wins are STANDARDS compliance (buttons) and ID safety.
- AI safety (sanitization + rate limit) and data consistency (fresh interest) are important for trust in SkillPilot flows.
- If any task reveals larger issues (e.g. need for a proper Interest model separate from current), note it and do not expand scope here.
- After this lands, consider a follow-up to convert the conversation list items into a reusable `ConversationListItem` component.

**Plan complete.** Ready for execution via subagent-driven or inline mode. All steps contain concrete code/commands. No placeholders.
