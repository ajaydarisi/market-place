# AI-First Freelancer Marketplace — Concept & Phase-Wise Build Plan

This document has two parts. **Part A** is the product concept: name, brand positioning, and the complete AI feature set. **Part B** is the phase-wise plan to build it in this repository, grounded in what already exists here.

---

## Part A — Concept

### 1. Website Name

1. **SkillPilot** — "Pilot" carries the copilot mental model people already associate with AI assistance, applied to hiring and delivering freelance work.
2. **Neuralance** — Fuses "neural" and "freelance," so the AI core of the marketplace is audible in the name itself.
3. **GigMind** — Pairs gig work with machine intelligence in two short, spellable syllables.
4. **Matchwork** — Names the AI matching engine that sits at the heart of the marketplace loop between clients and developers.
5. **Devlancer** — Says exactly who the marketplace serves (developers working freelance) and pairs cleanly with "AI-powered" positioning.

**Recommended: SkillPilot** — it is the easiest of the five to say and spell, and "copilot" is the strongest existing mental model for AI that assists rather than replaces.

### 2. Brand Positioning

**Tagline:** Hire smarter, deliver faster — AI at every step.

**Homepage hero description:** SkillPilot is the freelancer marketplace built AI-first: every post, proposal, and match is drafted, checked, and ranked by AI. Clients describe what they need in plain words and get a professional project brief and a shortlist of matched developers in minutes. Developers get an AI that writes tailored proposals, plans the right tech stack, and reviews their work before delivery.

**Value propositions:**
- **For clients:** Post a project in two minutes — AI turns your rough idea into a brief developers can actually bid on.
- **For freelancers/developers:** Win more work — AI drafts your proposals, optimizes your profile, and checks your code before delivery.
- **Trust & quality:** Every match comes with a reason, and every delivery is AI-reviewed against the agreed scope.

### 3. AI Features for Clients

#### a. AI Product Description Writer

**What it does:** The client types a rough draft, a few keywords, or a single plain-language sentence into the project intake form. The AI expands it into a complete, professional project post: title, overview, business goal, scope size, deliverables, required skills, technology tags, and suggested budget range and duration. Anything it cannot infer is returned as a "missing fields" list, so the client fills only the gaps instead of a blank 20-field form.

**Example:** Priya, a boutique owner, types "need an online store for my saree shop, Instagram checkout, maybe ₹80,000" and clicks the button. She gets a post titled "E-commerce store for a saree boutique" with deliverables (product catalog, cart and checkout, Instagram integration), required skills (Shopify or Next.js, payment gateway), a ₹70,000–₹90,000 budget range, and a flag that a deadline is still missing.

**UI label:** `Write it with AI` (while editing an existing draft: `Rewrite with AI`)

*Builds on:* the existing draft endpoint `app/api/projects/draft/route.ts` and `projectDraftResponseSchema` (which already reserves `source: "provider"`), consumed by `components/project-intake-form.tsx`.

#### b. AI Job Post Improver

**What it does:** Reviews an existing job post and returns a structured list of improvements: missing details (no deadline, no acceptance criteria), unclear requirements, and budget or timeline that is unrealistic for the described scope. Each suggestion is a concrete proposed edit the client can apply with one click or dismiss.

**Example:** Rohan posts "Build a food delivery app like Swiggy, budget ₹25,000, 2 weeks." The improver flags the scope-to-budget mismatch, asks whether he needs iOS, Android, or web first, and proposes rescoping phase 1 to a single-city web MVP with a revised 6–8 week estimate and a ₹1,50,000+ budget note.

**UI label:** `Improve this post`

*Builds on:* `calculateProjectCompletenessScore` in `shared/marketplace.ts` as the deterministic signal fed to the LLM; UI on the intake form and `app/projects/[id]/edit/page.tsx`.

#### c. AI Freelancer Matcher

**What it does:** Reads the client's job post and ranks the best-matched developers, each with a one-line reason for the match. A fast rule-based score produces the candidate pool; the AI reranks the top candidates and writes the rationale. It appears both as a match list on the client's project and as ranked proposals when bids come in.

**Example:** On her saree-store post, Priya opens the matches panel and sees Arjun ranked first at 92% — "Senior developer with Shopify and payment-gateway experience across three similar boutique stores, available this week." She invites him to bid.

**UI label:** `Find my matches` (on each match card: `Why this match?`)

*Builds on:* `calculateProjectRecommendationScore` / `calculateProposalMatchScore` in `shared/marketplace.ts` as the base layer, LLM rerank + rationale on top; surfaces in the proposal review list and `components/project-card.tsx`.

### 4. AI Features for Developers/Freelancers

#### a. AI Tech Stack Advisor

**What it does:** The developer describes the project they are bidding on or building (or opens it from a job post), and the AI recommends a suitable stack — language, framework, database, hosting — with a one-line reason for each choice. It always includes a simpler, cheaper alternative stack for small budgets, so the developer can offer the client two price points.

**Example:** Arjun opens a ₹50,000 appointment-booking post and clicks the advisor. It recommends Next.js + PostgreSQL (Supabase) + Vercel with reasons per component, and a budget alternative — WordPress with a booking plugin — estimated at roughly half the build effort.

**UI label:** `Suggest a stack`

*Builds on:* the technology-tag taxonomy in `shared/marketplace.ts` so recommendations use the same labels the marketplace already filters and matches on.

#### b. AI Proposal Writer

**What it does:** Generates a tailored bid from the job post plus the developer's own profile: an opening message that references the client's stated goal, the developer's most relevant skills and experience, a proposed budget and duration prefill, and drafted answers to the post's screening questions. The developer edits before sending — the AI never auto-submits.

**Example:** Meera opens a React Native fitness-app post and clicks the button. The draft references her two published fitness apps, proposes ₹1,20,000 over 6 weeks, and answers both screening questions from her profile history. She adjusts the price and submits.

**UI label:** `Write my proposal`

*Builds on:* the proposal flow in `app/api/projects/[id]/interests/` including the existing `screeningAnswers` schema; form on `app/projects/[id]/page.tsx`.

#### c. AI Profile Optimizer

**What it does:** Rewrites the freelancer's headline and bio and suggests changes to the skill list so the profile ranks better in search and matching. Suggestions use the same skill vocabulary the matcher scores against, so accepted changes measurably improve match scores. Changes are shown as a before/after diff and applied only when the developer confirms.

**Example:** Sanjay's bio reads "I do web development." The optimizer proposes "Full-stack developer specializing in React, Node.js, and Supabase — 12 delivered dashboards for logistics and retail clients," and suggests adding PostgreSQL and REST API to his skills. He applies both and immediately ranks higher on matching API projects.

**UI label:** `Optimize my profile`

*Builds on:* `app/api/profiles/` and the profile page `app/profile/page.tsx`; skill vocabulary shared with the matcher.

#### d. AI Code Review Assistant

**What it does:** Before marking work delivered, the developer submits a repository link, a diff, or a written summary of the work. The AI flags likely bugs, security issues (exposed keys, missing input validation), and — critically — requirements from the job post that appear unmet, checking against the post's deliverables, must-haves, and success criteria. The result is saved to the project log so both sides can see the check happened.

**Example:** Before delivering the saree store, Arjun runs the review. It flags a hardcoded payment API key, a cart-quantity bug, and that "Instagram checkout" from the post isn't implemented yet. He fixes all three before handing over.

**UI label:** `Run AI review`

*Builds on:* the assigned-project view under `app/developer/projects/`, checked against the project's `deliverables` / `mustHaves` / `successCriteria` fields; result stored via the existing project-log pattern (`storage.createProjectLog`).

#### e. AI Scope & Estimate Helper

**What it does:** Turns the client conversation — the project's message thread plus the post itself — into a written scope of work: deliverables, assumptions, exclusions, timeline, and a cost estimate. The developer reviews it and attaches it to the project, giving both parties one agreed document instead of scope scattered across chat.

**Example:** After a week of messages in which the client added "also need an admin panel," Meera clicks the helper. It produces a scope with nine deliverables including the admin panel, the assumption "client provides product photos," an exclusion for App Store submission, and a revised estimate of ₹1,45,000 over 7 weeks, which she attaches for the client to confirm.

**UI label:** `Draft scope of work`

*Builds on:* the message thread (`app/api/projects/[id]/messages/`) and project fields; output attached as a system project log and rendered on the project detail page.

---

## Part B — Phase-wise build plan

Provider decision (locked): all AI features call an **OpenAI-compatible chat-completions API**, model **`deepseek-v4-pro`** for now — configured by base URL + key + model name so the provider is swappable without code changes.

### Phase 0 — Brand & identity rollout (S)
**Outcome:** the app carries the new name and AI-first positioning everywhere.
**Tasks:** apply the chosen name, tagline, and hero copy in `app/layout.tsx` (metadata), `app/manifest.ts`, `app/page.tsx` (landing hero), `components/site-footer.tsx`, and `README.md`.
**Depends on:** confirming the recommended name from Part A.

### Phase 1 — Repo & database foundation (S)
**Outcome:** a fresh clone plus a fresh Supabase project runs the app; the DB schema is fully source-controlled.
**Tasks:**
- Recover `supabase_schema.sql` from commit `b3bb35d` and commit it as the base migration ordered before v15/v16 in `supabase/migrations/`; sanity-check its columns against what `lib/storage.ts` reads.
- The instance holds test data only, so reset the Supabase database and apply base + v15 + v16 cleanly; recreate a few test users/projects manually afterwards.
- Add `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Phase 2 adds the `AI_*` vars).
- Fix stale README references; verify `npm run check` and `npm run build`; smoke-test the core loop (sign up → post → propose → accept → message).
**Depends on:** nothing.

### Phase 2 — AI foundation + AI Product Description Writer (M)
**Outcome:** one real LLM feature live end-to-end, proving latency, cost, and failure behavior before the other seven features build on it.
**Tasks:**
- `lib/ai.ts`: thin server-only client for the OpenAI-compatible API. Env: `AI_API_BASE_URL`, `AI_API_KEY`, `AI_MODEL=deepseek-v4-pro`. JSON-mode responses validated with the existing Zod schemas; on provider error, fall back to the current heuristic and mark `source` accordingly.
- Rewrite `app/api/projects/draft/route.ts` to produce the draft via the LLM (`source: "provider"`); `components/project-intake-form.tsx` already consumes the response.
- Per-user rate limit on this route — the pattern every later AI route reuses.
**Depends on:** Phase 1.

### Phase 3 — Remaining client AI features: Job Post Improver + Freelancer Matcher (M–L)
**Outcome:** the complete client-side suite from Part A §3.
**Tasks:**
- **Improver:** new route (e.g. `app/api/projects/[id]/improve/route.ts`) feeding the post plus `calculateProjectCompletenessScore` signals to the LLM; structured suggestions UI on the intake form and edit page.
- **Matcher:** LLM rerank + one-line rationale over the top N heuristic scores, in the developer browse feed (recommended sort, `lib/storage.ts:628`) and the client's proposal review (best-match sort, `lib/storage.ts:759`); rationale shown on `components/project-card.tsx` and proposal cards. Rerank on demand — no embeddings, no schema change.
**Depends on:** Phase 2.

### Phase 4 — Developer AI: Proposal Writer + Scope & Estimate Helper (M–L)
**Outcome:** the bid-side developer features.
**Tasks:**
- **Proposal Writer:** new draft endpoint under `app/api/projects/[id]/interests/`; contract in `shared/routes.ts` / `shared/schema.ts`; hook in `hooks/use-interests.ts`; `Write my proposal` in the proposal form on `app/projects/[id]/page.tsx`.
- **Scope & Estimate Helper:** endpoint combining the message thread and project fields into a structured scope-of-work; attached as a system project log and rendered on project detail.
**Depends on:** Phase 2.

### Phase 5 — Developer AI: Tech Stack Advisor + Profile Optimizer + Code Review Assistant (M–L)
**Outcome:** completes the Part A §4 feature set.
**Tasks:**
- **Advisor:** endpoint returning recommended stack + low-budget alternative, using the technology-tag taxonomy in `shared/marketplace.ts`; panel on project detail for developers.
- **Optimizer:** rewrite via `app/api/profiles/`; before/after diff on `app/profile/page.tsx` with explicit apply — never silently overwrite.
- **Code Review Assistant:** pre-delivery check on `app/developer/projects/`, flags issues against the post's `deliverables` / `mustHaves` / `successCriteria`; result saved as a project log.
**Depends on:** Phase 2 (independent of Phases 3–4; parallelizable).

### Phase 6 — Real-time notifications, in-app only (M)
**Outcome:** both roles see events live — new proposal, proposal accepted/rejected, new message — via a bell with an unread badge.
**Tasks:** `notifications` table + RLS in a new migration; inserts in the handlers that own the events (`app/api/projects/[id]/messages/route.ts`, `.../interests/route.ts`, `.../interests/[interestId]/route.ts`); `hooks/use-notifications.ts` cloning the `postgres_changes` pattern from `hooks/use-messages.ts:22`; bell + badge in `components/navigation.tsx`.
**Depends on:** Phase 1 only — parallelizable with Phases 3–5.

### Phase 7 — Tests for ship-critical paths (M)
**Outcome:** regressions in the money paths get caught.
**Tasks:** Playwright e2e for the two core journeys (sign up → onboard → post project; browse → propose → accept → message) using the existing `data-testid` hooks; unit tests for the pure logic in `shared/marketplace.ts` and the heuristic fallbacks in `lib/project-drafts.ts`; `test` script in `package.json`.
**Depends on:** Phases 2–6 feature-complete.

### Phase 8 — Production hardening & launch (S–M)
**Outcome:** live and safe.
**Tasks:** rate limiting confirmed on all AI routes; Supabase advisors / RLS coverage check on the final schema (including `notifications`); production Turnstile keys; Vercel deploy with `AI_*` keys server-side; final AI-first copy sweep across every page.
**Depends on:** everything above.

### Out of scope (explicit)
AI-powered natural-language search, payments/escrow, email/web-push notifications, and any admin-area changes.
