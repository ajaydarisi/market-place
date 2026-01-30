# Project Standards & Rules

## Tech Stack

| Layer       | Technology                                  |
| ----------- | ------------------------------------------- |
| Framework   | Next.js 15 (App Router), React 18, TypeScript |
| Database    | Supabase (PostgreSQL)                       |
| Auth        | Supabase Auth (JWT) via `@supabase/ssr`     |
| Styling     | Tailwind CSS 3 + shadcn/ui (Radix)          |
| Data        | React Query (TanStack Query v5)             |
| Routing     | Next.js file-based routing                  |
| Forms       | React Hook Form + Zod                       |
| Icons       | Lucide React                                |

---

## Color System

All colors must use **theme tokens** defined in `tailwind.config.ts`. Never use raw Tailwind colors (e.g. `text-red-500`, `bg-blue-600`).

### Allowed Tokens

| Token          | Usage                                    |
| -------------- | ---------------------------------------- |
| `primary`      | Buttons, links, accents                  |
| `secondary`    | Secondary surfaces, subtle backgrounds   |
| `muted`        | Subdued text, borders                    |
| `accent`       | Highlights, decorative elements          |
| `destructive`  | Errors, delete actions                   |
| `foreground`   | Primary text                             |
| `background`   | Page backgrounds                         |
| `border`       | Borders                                  |
| `card`         | Card surfaces                            |
| `popover`      | Popover/dropdown surfaces                |
| `input`        | Input field borders                      |
| `ring`         | Focus rings                              |

### Status Colors

| Token            | Usage         |
| ---------------- | ------------- |
| `status-online`  | Success/green |
| `status-away`    | Warning/amber |
| `status-busy`    | Error/red     |
| `status-offline` | Inactive/gray |

### Examples

```tsx
// Correct
className="text-primary"
className="bg-destructive text-destructive-foreground"
className="text-muted-foreground"
className="border-border"

// Incorrect
className="text-blue-500"
className="bg-red-600"
className="text-gray-400"
```

---

## UI Components

All UI must use **shadcn/ui** components from `components/ui/`. Never use raw HTML elements when a shadcn component exists.

### Rules

- Use `<Button>` instead of `<button>`
- Use `<Input>` instead of `<input>`
- Use `<Label>` instead of `<label>`
- Use `<Card>` instead of styled `<div>` containers
- Use `<Dialog>` instead of custom modals
- Use `<Badge>` for tags/labels
- Use `<Separator>` instead of `<hr>`
- Use `<Skeleton>` for loading states
- Use `<Tabs>` for tabbed interfaces
- Use `<RadioGroup>` for radio selections

### Button Variants

Available variants: `default`, `destructive`, `outline`, `secondary`, `ghost`.

There is **no `link` variant**. For link-style buttons, use:

```tsx
<Button variant="ghost" className="hover:bg-transparent text-muted-foreground hover:text-primary px-0">
```

### Button Sizes

Available sizes: `default`, `sm`, `lg`, `icon`.

---

## Typography

### Fonts

| Variable         | Font               | Usage               |
| ---------------- | ------------------ | -------------------- |
| `--font-display` | Plus Jakarta Sans  | Headings, display    |
| `--font-body`    | Inter              | Body text            |

### Usage

```tsx
className="font-display"  // Headings
className="font-body"     // Body (default, rarely needed)
```

---

## File Naming

| Type             | Convention     | Example                |
| ---------------- | -------------- | ---------------------- |
| Components       | kebab-case     | `navigation.tsx`       |
| Pages            | `page.tsx`     | `app/profile/page.tsx` |
| Hooks            | kebab-case     | `use-auth.ts`          |
| Utilities        | kebab-case     | `auth-utils.ts`        |
| UI               | kebab-case     | `button.tsx`           |
| Route Handlers   | `route.ts`     | `app/api/users/route.ts` |
| Layouts          | `layout.tsx`   | `app/layout.tsx`       |

---

## Naming Conventions

| Context      | Convention          | Example                       |
| ------------ | ------------------- | ----------------------------- |
| Variables    | camelCase           | `isLoading`, `userData`       |
| Functions    | camelCase           | `handleSignIn`, `getSession`  |
| Components   | PascalCase          | `Navigation`, `ProjectCard`   |
| Enums/Types  | PascalCase          | `User`, `ProjectStatus`       |
| DB columns   | snake_case          | `first_name`, `created_at`    |
| API paths    | kebab-case          | `/api/projects/:id`           |

---

## Project Structure

```
app/                            # Next.js App Router
  layout.tsx                    # Root layout (html, body, providers, fonts)
  page.tsx                      # Landing page (/)
  globals.css                   # Global styles & Tailwind directives
  not-found.tsx                 # 404 page
  auth/page.tsx                 # Authentication (/auth)
  dashboard/page.tsx            # Post-login redirect hub (/dashboard)
  onboarding/page.tsx           # Onboarding (/onboarding)
  profile/page.tsx              # User profile (/profile)
  not-authorized/page.tsx       # 403 page
  client/
    projects/page.tsx           # My Projects (/client/projects)
    post/page.tsx               # Post Project (/client/post)
    messages/page.tsx           # Messages (/client/messages)
  developer/
    browse/page.tsx             # Browse Jobs (/developer/browse)
    messages/page.tsx           # Messages (/developer/messages)
  projects/[id]/page.tsx        # Project Detail (/projects/:id)
  api/                          # Route Handlers (API)
    auth/callback/route.ts      # Supabase auth callback
    users/route.ts              # PUT /api/users
    users/[userId]/route.ts     # GET /api/users/:userId
    profiles/route.ts           # PUT /api/profiles
    profiles/[userId]/route.ts  # GET /api/profiles/:userId
    projects/route.ts           # GET, POST /api/projects
    projects/[id]/route.ts      # GET, PATCH /api/projects/:id
    projects/[id]/interests/route.ts  # GET, POST
    projects/[id]/messages/route.ts   # GET, POST

components/
  ui/                           # shadcn/ui primitives
  navigation.tsx                # Shared navigation bar
  project-card.tsx              # Reusable project card
  providers.tsx                 # Client providers (QueryClient, Tooltip)

hooks/                          # Custom React hooks (use-*.ts)

lib/
  supabase/
    client.ts                   # Browser Supabase client (createBrowserClient)
    server.ts                   # Server Supabase client (createServerClient)
    middleware.ts               # Middleware Supabase client
  storage.ts                    # Database access layer (IStorage interface)
  auth-utils.ts                 # Server-side auth helpers
  query-client.ts               # React Query config
  api.ts                        # Client-side auth headers
  utils.ts                      # cn() utility

shared/
  schema.ts                     # Zod schemas & TypeScript types
  routes.ts                     # API route definitions
  models/auth.ts                # Auth model exports

middleware.ts                   # Next.js middleware (route protection)
```

---

## Import Aliases

| Alias     | Path             |
| --------- | ---------------- |
| `@`       | `./` (project root) |
| `@shared` | `./shared`       |

---

## Data Fetching

Use React Query hooks. All data hooks live in `hooks/`.

### Patterns

```tsx
// Read: useQuery
const { data, isLoading } = useProject(id);

// Write: useMutation with cache invalidation
const { mutate, isPending } = useCreateProject();
mutate(data, { onSuccess: () => { /* handle */ } });
```

### Query Client Settings

- `staleTime: Infinity` (no auto-refetch)
- `refetchOnWindowFocus: false`
- `retry: false`

---

## Authentication

- Auth is handled by **Supabase Auth** via `@supabase/ssr`
- Client: `useAuth()` hook provides `user`, `isLoading`, `isAuthenticated`, `logout()`
- Server: Route Handlers use `getAuthUser()` / `getAuthToken()` from `lib/auth-utils.ts`
- Supabase clients:
  - `lib/supabase/client.ts` — browser client (Client Components, hooks)
  - `lib/supabase/server.ts` — server client (Route Handlers, Server Components)
  - `lib/supabase/middleware.ts` — middleware client (route protection)

---

## Route Protection

Route protection is handled by **Next.js middleware** (`middleware.ts` at root), not component wrappers.

```ts
// middleware.ts handles:
// - Auth check: redirects unauthenticated users to /auth
// - Role check: /client/* requires role="client", /developer/* requires role="developer"
// - Wrong role: redirects to /not-authorized
```

**Protected routes** (auth required): `/dashboard`, `/onboarding`, `/profile`, `/projects/:id`
**Role-protected routes**: `/client/*` (client role), `/developer/*` (developer role)
**Public routes**: `/`, `/auth`

---

## Forms & Validation

- Use **React Hook Form** for form state
- Use **Zod** schemas for validation (shared between client and server)
- Server validates all input with Zod before processing
- Return field-specific error messages on validation failure

---

## API Routes

API endpoints are implemented as **Next.js Route Handlers** in `app/api/`. Route definitions are shared via `shared/routes.ts`.

### Convention

```
GET    /api/[resource]          # List
GET    /api/[resource]/:id      # Get one
POST   /api/[resource]          # Create
PUT    /api/[resource]          # Update (full)
PATCH  /api/[resource]/:id      # Update (partial)
```

### Route Handler Pattern

```ts
// app/api/projects/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

### Authentication

- Public routes: No auth header needed
- Protected routes: `Authorization: Bearer <token>` header required
- Route Handlers use `getAuthToken()` from `lib/auth-utils.ts` to extract the token

---

## Database

- **Schema**: `supabase_schema.sql`
- **Column naming**: snake_case in DB, camelCase in TypeScript
- **Mapping**: `lib/storage.ts` has helper functions (`mapUser`, `mapProfile`, etc.)
- **Row Level Security (RLS)**: Enabled on all tables
- **No ORM**: Direct Supabase client queries

### User Roles

Two roles defined in `shared/schema.ts`:

- `client` - Posts projects, manages proposals
- `developer` - Browses jobs, submits proposals

---

## File Uploads (Supabase Storage)

### Storage Buckets

| Bucket    | Access | Purpose        |
| --------- | ------ | -------------- |
| `avatars` | Public | Profile photos |

### Upload Pattern

File uploads use the **Supabase browser client** directly from Client Components. The upload utility lives in `lib/upload.ts`.

### Rules

1. **Validation first**: Always validate file type and size before uploading
2. **Storage paths**: Use `{bucket}/{user_id}/{filename}` pattern for user-owned files
3. **Upsert**: Use `upsert: true` to replace existing files cleanly
4. **Cache busting**: Append `?t={timestamp}` to public URLs after replacement
5. **Loading states**: Show `<Loader2>` spinner during upload
6. **Error handling**: Show destructive toast on upload failure
7. **File limits**: Max 2MB for images; accepted types: JPEG, PNG, WebP
8. **Accessibility**: Hidden file inputs must have `aria-label`; upload triggers must be keyboard accessible

### Avatar Display Pattern

Always use `AvatarImage` inside `Avatar` when a `profileImageUrl` exists:

```tsx
<Avatar aria-label="User's avatar">
  {user.profileImageUrl && (
    <AvatarImage src={user.profileImageUrl} alt="Profile photo" />
  )}
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

The `AvatarFallback` is always rendered as a fallback when the image fails to load or is absent.

### Upload Component

Use `<AvatarUpload>` from `components/avatar-upload.tsx` for avatar upload interactions. It handles validation, preview, upload, and loading states internally.

---

## Error Handling

### Frontend

- Toast notifications for user-facing errors (`useToast()`)
- `variant: "destructive"` for error toasts
- Loading states via `isLoading` / `isPending` from React Query

### Route Handlers

- Zod validation errors return `400` with field details
- Auth errors return `401`
- Authorization errors return `403`
- Not found returns `404`
- Each Route Handler wraps logic in try/catch and returns `NextResponse.json()`

---

## Server vs Client Components

- Pages that need interactivity (forms, state, hooks) must have `"use client"` at the top
- Static pages (Landing, 404, 403) can be Server Components
- All hooks require `"use client"` — they cannot be used in Server Components
- `components/providers.tsx` is a `"use client"` boundary wrapping QueryClientProvider

---

## Navigation & Routing

- Use `next/link` for `<Link>` components (not wouter)
- Use `useRouter()` from `next/navigation` for programmatic navigation
- Use `usePathname()` from `next/navigation` for current path
- Use `useParams()` from `next/navigation` for dynamic route params
- Use `router.push()` for client-side redirects (not `window.location.href`)

---

## Accessibility

### `aria-label` on Interactive Components

All interactive components must include an `aria-label` attribute for screen reader accessibility.

- `<Button>` — `aria-label="Edit profile"`
- `<Input>` — `aria-label="First name"`
- `<SelectTrigger>` — `aria-label="Experience level"`
- `<Textarea>` — `aria-label="Biography"`
- `<Link>` (navigation) — `aria-label="Go back"`
- `<Avatar>` — `aria-label="User's avatar"`
- Read-only display fields — `aria-label="Email address"`

```tsx
// Correct
<Button aria-label="Save profile changes" type="submit">Save</Button>
<Input aria-label="First name" placeholder="John" />
<SelectTrigger aria-label="Experience level">

// Incorrect
<Button type="submit">Save</Button>
<Input placeholder="John" />
<SelectTrigger>
```

---

## Text Overflow

All text values that may overflow their container must use ellipsis truncation.

### Rules

- Use `truncate` (single-line) for short text values (names, emails, roles)
- Use `line-clamp-{n}` (multi-line) for long text like bios or descriptions
- Add `title` attribute to truncated text so full content is visible on hover
- Add `min-w-0` on flex/grid children to allow truncation to work

```tsx
// Single-line truncation
<p className="text-sm truncate" title={userData?.email}>{userData?.email}</p>

// Multi-line truncation (3 lines max)
<p className="text-sm line-clamp-3" title={profile?.bio}>{profile?.bio}</p>

// Flex child needs min-w-0
<div className="min-w-0">
  <p className="truncate">{longText}</p>
</div>
```

---

## General Rules

1. **No raw HTML** when a shadcn component exists
2. **No raw colors** - always use theme tokens
3. **No `framer-motion`** - use `tailwindcss-animate` classes instead
4. **No Drizzle/ORM** - use Supabase client directly
5. **Imports**: Use `@/` alias for project root, `@shared/` for shared code
6. **Loading states**: Use `<Loader2>` spinner from lucide-react or `<Skeleton>` from shadcn
7. **Icons**: Use lucide-react as the primary icon library
8. **Logout**: Must redirect to landing page (`/`) after sign out
9. **Environment variables**: Client-side vars prefixed with `NEXT_PUBLIC_`
10. **Route protection**: Handled by `middleware.ts`, not component wrappers
11. **Accessibility**: All interactive components must have `aria-label` attributes
12. **Text overflow**: Use `truncate` or `line-clamp-{n}` with `title` attribute on text that may overflow
