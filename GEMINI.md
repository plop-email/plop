# Project Overview

This is a monorepo for "Plop", an open-source SaaS starter kit. It's built with a modern tech stack including Next.js, Turborepo, Biome, TailwindCSS, Shadcn, TypeScript, Supabase, Upstash, React Email, Resend, i18n, Sentry, Dub, Trigger.dev, OpenPanel, and Polar.

The project is structured as a monorepo with `apps` and `packages`. The `apps` directory contains the main applications: `api`, `app`, `docs`, `inbox`, and `web`. The `packages` directory contains shared libraries for analytics, billing, database access, email, jobs, key-value storage, logging, Supabase integration, and UI components.

## Building and Running

The project uses `bun` as the package manager and `turbo` as the build system.

**Key Commands:**

*   `bun install`: Install dependencies.
*   `bun dev`: Start all applications in development mode.
*   `bun build`: Build all applications.
*   `bun test`: Run tests for all applications.
*   `bun run lint`: Lint the codebase.
*   `bun run format`: Format the codebase.
*   `bun run typecheck`: TypeScript check all workspaces.
*   `bun migrate`: Run database migrations.
*   `bun seed`: Seed the database.
*   `bun reset`: Reset local database.
*   `bun generate`: Regenerate DB types.

**Running individual applications:**

*   `bun dev:app`: Product app (Next.js) at localhost:3000
*   `bun dev:web`: Marketing site at localhost:3001
*   `bun dev:docs`: Documentation site at localhost:3002
*   `bun dev:api`: Bun + Hono API at localhost:3003
*   `bun dev:email`: React Email dev at localhost:3004
*   `bun dev:supabase`: Supabase local (Studio at localhost:54323)

## Architecture

**Apps:**

| App | Stack | Purpose |
|-----|-------|---------|
| `apps/app` | Next.js 16 (App Router) | Product app with i18n (next-international) |
| `apps/web` | Next.js | Marketing site |
| `apps/docs` | Next.js + Fumadocs | Documentation site |
| `apps/api` | Bun + Hono + tRPC | Backend API with OpenAPI docs (Scalar) |
| `apps/inbox` | Cloudflare Worker | Email routing ingestion |

**Packages:**

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

## Development Conventions

*   **Monorepo:** The project is a monorepo, so code should be shared in the `packages` directory whenever possible.
*   **TypeScript:** The entire codebase is written in TypeScript.
*   **Linting and Formatting:** The project uses Biome for linting and formatting. Please run `bun run lint` and `bun run format` before committing your changes.
*   **Testing:** The project uses `bun test` to run tests. Please add tests for any new features or bug fixes.
*   **Database:** The project uses Drizzle for the database schema and client. Migrations are handled with `bun migrate`.
*   **Authentication:** Authentication is handled by Supabase.
*   **UI:** The project uses Shadcn for UI components.
*   **Styling:** The project uses TailwindCSS for styling.

## Key Patterns

**tRPC (API ↔ App)**
*   Root router: `apps/api/src/trpc/routers/_app.ts`
*   Procedures: `publicProcedure`, `protectedProcedure` (requires auth), `teamProcedure` (requires team membership)
*   App client: `apps/app/src/trpc/client.tsx` and `apps/app/src/trpc/server.tsx`
*   Use `trpc.x.y.queryOptions()` for React Query integration

**Database**
*   Schema: `packages/db/src/schema.ts` (Drizzle)
*   Read replicas with `withReplicas()` wrapper, automatic region routing
*   Queries: `@plop/db/queries` for reusable query functions

**Supabase Auth**
*   Import clients from `@plop/supabase/*` (server, client, middleware, job)
*   Declarative schema in `packages/supabase/supabase/schemas/*.sql`
*   Create migrations via `bun run --cwd packages/supabase migration:create -- -f <name>`

**Next.js Apps**
*   Server Components by default; add `"use client"` only when necessary
*   URL state with `nuqs` for filters/pagination
*   i18n via `next-international` (apps/app)

## Guiding Principles

*   Prefer full, maintainable implementations over quick shims/workarounds.
*   Keep monorepo boundaries clean: Apps import from `@plop/*`, and packages should not depend on apps.
*   Don't remove or hide existing features unless explicitly asked.
*   Match existing patterns in the nearest file/directory before introducing a new pattern.
*   Use Zod for request/action inputs and env parsing.
*   Keep "server vs client" boundaries explicit in Next.js using `"server-only"` and `"use client"`.
*   Named exports for modules and React components.
*   `import type` for type-only imports.
*   Structured logging via `@plop/logger` (objects, not string concatenation).
