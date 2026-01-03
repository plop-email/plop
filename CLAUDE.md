# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun install              # Install dependencies
bun dev                  # Run all apps in parallel
bun dev:app              # Product app (Next.js) at localhost:3000
bun dev:web              # Marketing site at localhost:3001
bun dev:docs             # Documentation site at localhost:3002
bun dev:api              # Bun + Hono API at localhost:3003
bun dev:email            # React Email dev at localhost:3004
bun dev:supabase         # Supabase local (Studio at localhost:54323)

# Quality
bun run format           # Biome format
bun run lint             # Biome lint + sherif
bun run typecheck        # TypeScript check all workspaces

# Database (Supabase)
bun migrate              # Run migrations
bun seed                 # Generate and run seeds
bun reset                # Reset local database
bun generate             # Regenerate DB types → packages/supabase/src/types/db.ts

# Testing
bun run test             # Run tests (e.g., apps/inbox uses Bun test)
```

## Architecture

**Turborepo monorepo with Bun workspaces.**

### Apps

| App | Stack | Purpose |
|-----|-------|---------|
| `apps/app` | Next.js 16 (App Router) | Product app with i18n (next-international) |
| `apps/web` | Next.js | Marketing site |
| `apps/docs` | Next.js + Fumadocs | Documentation site |
| `apps/api` | Bun + Hono + tRPC | Backend API with OpenAPI docs (Scalar) |
| `apps/inbox` | Cloudflare Worker | Email routing ingestion |

### Packages

| Package | Purpose |
|---------|---------|
| `@plop/db` | Drizzle schema + Postgres client with read replicas |
| `@plop/supabase` | Supabase clients (server/client/middleware/job) |
| `@plop/ui` | Shared UI components (shadcn-style) |
| `@plop/kv` | Upstash Redis + rate limiting |
| `@plop/jobs` | Trigger.dev background jobs |
| `@plop/email` | React Email templates |
| `@plop/analytics` | OpenPanel analytics helpers |
| `@plop/billing` | Polar.sh billing integration |
| `@plop/logger` | Pino structured logger |

### Key Patterns

**tRPC (API ↔ App)**
- Root router: `apps/api/src/trpc/routers/_app.ts`
- Procedures: `publicProcedure`, `protectedProcedure` (requires auth), `teamProcedure` (requires team membership)
- App client: `apps/app/src/trpc/client.tsx` and `apps/app/src/trpc/server.tsx`
- Use `trpc.x.y.queryOptions()` for React Query integration

**Database**
- Schema: `packages/db/src/schema.ts` (Drizzle)
- Read replicas with `withReplicas()` wrapper, automatic region routing
- Queries: `@plop/db/queries` for reusable query functions

**Supabase Auth**
- Import clients from `@plop/supabase/*` (server, client, middleware, job)
- Declarative schema in `packages/supabase/supabase/schemas/*.sql`
- Create migrations via `bun run --cwd packages/supabase migration:create -- -f <name>`

**Next.js Apps**
- Server Components by default; add `"use client"` only when necessary
- URL state with `nuqs` for filters/pagination
- i18n via `next-international` (apps/app)

**Data Flow**
1. Email arrives → Cloudflare Worker (apps/inbox) → webhook to API
2. API validates, stores in Postgres, updates usage metrics
3. App fetches via tRPC with auth from Supabase JWT

## Code Conventions

- Named exports for modules and React components
- `import type` for type-only imports
- Input validation with Zod at boundaries (tRPC procedures, server actions, env)
- Structured logging via `@plop/logger` (objects, not string concatenation)
- Use `"server-only"` import in server-only modules
