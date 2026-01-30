# Project Instructions

Always read and follow the rules defined in `STANDARDS.md` before making any code changes.

Key reminders:
- Use only shadcn/ui components (never raw HTML elements when a shadcn equivalent exists)
- Use only theme color tokens (never raw Tailwind colors like `text-red-500`)
- Button variants: `default`, `destructive`, `outline`, `secondary`, `ghost` (no `link` variant)
- Use `@/` alias for project root imports, `@shared/` for shared code
- Use lucide-react for icons
- Use `<Loader2>` or `<Skeleton>` for loading states
- Route protection is handled by `middleware.ts` (not component wrappers)
- Navigation uses `next/link` and `next/navigation` (not wouter)
- Use `router.push()` for programmatic navigation (not `window.location.href`)
- Logout must redirect to landing page (`/`)
- No framer-motion — use tailwindcss-animate
- No Drizzle/ORM — use Supabase client directly
- Client-side env vars use `NEXT_PUBLIC_` prefix
- Pages with interactivity need `"use client"` directive
- API endpoints are Next.js Route Handlers in `app/api/`
