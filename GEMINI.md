# Project Overview

This is a monorepo for "Plop", an open-source SaaS starter kit. It's built with a modern tech stack including Next.js, Turborepo, Biome, TailwindCSS, Shadcn, TypeScript, Supabase, Upstash, React Email, Resend, i18n, Sentry, Dub, Trigger.dev, OpenPanel, and Polar.

The project is structured as a monorepo with `apps` and `packages`. The `apps` directory contains the main applications: `api`, `app`, `inbox`, and `web`. The `packages` directory contains shared libraries for things like analytics, database access, email, jobs, key-value storage, logging, Supabase integration, and UI components.

## Building and Running

The project uses `bun` as the package manager and `turbo` as the build system.

**Key Commands:**

*   `bun i`: Install dependencies.
*   `bun dev`: Start all applications in development mode.
*   `bun build`: Build all applications.
*   `bun test`: Run tests for all applications.
*   `bun lint`: Lint the codebase.
*   `bun format`: Format the codebase.
*   `bun migrate`: Run database migrations.
*   `bun seed`: Seed the database.

**Running individual applications:**

*   `bun dev:api`: Start the API server.
*   `bun dev:app`: Start the main application.
*   `bun dev:web`: Start the marketing website.
*   `bun dev:email`: Start the email development server.

## Development Conventions

*   **Monorepo:** The project is a monorepo, so code should be shared in the `packages` directory whenever possible.
*   **TypeScript:** The entire codebase is written in TypeScript.
*   **Linting and Formatting:** The project uses Biome for linting and formatting. Please run `bun lint` and `bun format` before committing your changes.
*   **Testing:** The project uses `bun test` to run tests. Please add tests for any new features or bug fixes.
*   **Database:** The project uses Drizzle for the database schema and client. Migrations are handled with `bun migrate`.
*   **Authentication:** Authentication is handled by Supabase.
*   **UI:** The project uses Shadcn for UI components.
*   **Styling:** The project uses TailwindCSS for styling.

## Guiding Principles

*   Prefer full, maintainable implementations over quick shims/workarounds.
*   Keep monorepo boundaries clean: Apps import from `@plop/*`, and packages should not depend on apps.
*   Don’t remove or hide existing features unless explicitly asked.
*   Match existing patterns in the nearest file/directory before introducing a new pattern.
*   Use Zod for request/action inputs and env parsing.
*   Keep “server vs client” boundaries explicit in Next.js using `"server-only"` and `"use client"`.

## App Patterns (`@plop/app`)

*   **Architecture:** Next.js App Router, Supabase Auth, tRPC + TanStack Query, `next-safe-action`, `next-international` for i18n, and Sentry for observability.
*   **File Structure:**
    *   Routes/layouts: `src/app/`
    *   Components: `src/components/`
    *   Server actions: `src/actions/`
    *   tRPC wiring: `src/trpc/`
    *   Middleware: `src/middleware.ts`
    *   Env validation: `src/env.mjs`
*   **Conventions:**
    *   Default to Server Components.
    *   Centralize auth/session concerns.
    *   Prefer tRPC options for consistent caching/prefetching.
    *   Server actions should validate inputs and be the only place that performs side effects.
