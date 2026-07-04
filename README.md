# SkillPilot

The AI-first freelancer marketplace. Clients post projects with budgets and categories, developers browse and submit proposals, and both sides communicate through built-in messaging — with AI drafting posts and proposals, explaining matches, advising on tech stacks, and reviewing work before delivery.

**Tagline:** Hire smarter, deliver faster — AI at every step.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 18 and TypeScript
- **Database & Auth:** Supabase (PostgreSQL + JWT auth)
- **UI:** shadcn/ui (Radix primitives) + Tailwind CSS
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in your Supabase credentials
cp .env.example .env.local
```

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key

# AI provider (OpenAI-compatible; AI features fall back to heuristics without it)
AI_API_BASE_URL=https://api.deepseek.com/v1
AI_API_KEY=your-ai-api-key
AI_MODEL=deepseek-v4-pro
```

Apply the database schema by running the files in `supabase/migrations/` in filename order in your Supabase SQL Editor (or with `supabase db push`).

## Testing

| Command | Description |
|---------|-------------|
| `npm test` | Unit tests (matching/scoring logic and AI-fallback heuristics) |
| `npm run test:e2e` | Playwright end-to-end journeys (needs a configured `.env.local`, a Supabase project with email confirmation disabled, and the Turnstile test site key `1x00000000000000000000AA`) |

## Production launch checklist

1. Apply all files in `supabase/migrations/` in filename order to the production Supabase project (base schema → repair → v15 → v16 → notifications).
2. Confirm `messages` and `notifications` are in the `supabase_realtime` publication (the migrations add them) — the live message feed and notification bell depend on it.
3. Set env vars in the host (e.g. Vercel): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (production key), and server-side `AI_API_BASE_URL`, `AI_API_KEY`, `AI_MODEL`. Without the `AI_*` vars, the draft writer falls back to heuristics and the other AI features return 503.
4. Run the Supabase security advisors after migrating and review RLS warnings.
5. AI endpoints are rate-limited in-memory per user (10 requests/min); this resets per server instance — move to a shared store if you scale beyond one instance.

```bash
# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run check` | TypeScript type check |

## Features

### Clients

- Post projects with title, description, category, budget range, and deadline
- View and manage proposals from developers
- Message developers directly on a per-project basis

### Developers

- Browse and search projects by category and keyword
- Submit proposals with a custom message
- Track submitted applications
- Set up a profile with skills, experience level, and portfolio links

### Shared

- Email/password authentication via Supabase Auth
- Role-based onboarding (client or developer)
- Route protection via Next.js middleware
- Real-time toast notifications

## Project Structure

```
app/
  auth/                  # Sign in / Sign up
  dashboard/             # Smart redirect hub based on role
  onboarding/            # Role selection & profile setup
  profile/               # User profile management
  client/
    projects/            # My projects list
    post/                # Create new project
    messages/            # Conversations with developers
  developer/
    browse/              # Search & filter available jobs
    messages/            # Conversations with clients
  projects/[id]/         # Project detail view
  api/                   # REST API route handlers
components/
  ui/                    # shadcn/ui primitives
  navigation.tsx         # Shared header
  project-card.tsx       # Reusable project card
hooks/                   # React Query hooks (auth, projects, profiles, etc.)
lib/
  supabase/              # Supabase client setup (browser, server, middleware)
  storage.ts             # Database access layer
shared/
  schema.ts              # Zod schemas & TypeScript types
  routes.ts              # API route definitions
middleware.ts            # Route protection & role-based access
supabase_schema.sql      # Database schema & RLS policies
STANDARDS.md             # Development conventions
```

## API Endpoints

```
GET    /api/projects                    # List projects (filters: category, search, budget)
POST   /api/projects                    # Create project
GET    /api/projects/:id                # Project detail
PATCH  /api/projects/:id                # Update project

GET    /api/projects/:id/interests      # List proposals
POST   /api/projects/:id/interests      # Submit proposal
PATCH  /api/projects/:id/interests      # Update proposal status

GET    /api/projects/:id/messages       # List messages
POST   /api/projects/:id/messages       # Send message

GET    /api/users/:userId               # Get user
PUT    /api/users                       # Update user

GET    /api/profiles/:userId            # Get profile
PUT    /api/profiles                    # Update profile
```

All non-public endpoints require an `Authorization: Bearer <token>` header.

## Database

Six tables managed in Supabase with Row-Level Security enabled:

- **users** -- synced with Supabase Auth (email, name, avatar)
- **profiles** -- role, bio, skills, experience level, availability
- **projects** -- title, category, description, budget range, status
- **project_interests** -- developer proposals with status tracking
- **messages** -- per-project messaging between client and developer
- **reviews** -- ratings and comments (future use)

## Auth Flow

1. User signs up at `/auth` with email and password
2. Redirected to `/dashboard`, which checks for an existing profile
3. If no profile exists, redirected to `/onboarding` to select a role
4. After onboarding, routed to the role-appropriate view:
   - **Client** &rarr; `/client/projects`
   - **Developer** &rarr; `/developer/browse`