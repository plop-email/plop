# Repository Guidelines

## Project Structure & Module Organization
- Turborepo + Bun workspaces. Apps live in `apps/` (`api` Hono+tRPC, `app` product Next.js, `web` marketing Next.js, `inbox` Cloudflare worker). Shared code is under `packages/` (`db`, `ui`, `logger`, `supabase`, etc.); shared configs in `tooling/`. Keep features within their workspace and share via `@plop/*` packages rather than cross-app imports.
- Supabase schemas/migrations live in `packages/supabase/supabase`; generated DB types in `packages/supabase/src/types`. Use shared clients (`@plop/supabase/*`) and logger/db utilities before adding new ones.
- TypeScript configs come from `tooling/typescript`; extend them locally only when necessary.

## Build, Test, and Development Commands
- Install deps: `bun install`.
- Run everything in dev: `bun dev` (Turbo pipeline). Target surfaces: `bun dev:web`, `bun dev:app`, `bun dev:api`, `bun dev:email`, `bun dev:supabase`.
- Build: `bun build` / `bunx turbo build`.
- Lint/format: `bun lint` (Turbo lint + sherif), `bun run format` (Biome). Typecheck: `bun typecheck`.
- Tests: `bun test` (Turbo fan-out). Keep test commands scoped with `--filter @plop/<pkg>` when iterating.
- Data ops: `bun migrate`, `bun seed`, `bun reset`, `bun generate` (Supabase local project).

## Coding Style & Naming Conventions
- Biome enforces formatting; run `bun run format` before PRs. Favor `type` aliases over `interface` unless extending; use `import type` for types.
- Components/utilities use PascalCase filenames; hooks `useX` camelCase; Next.js routes/files lowercase with hyphens. Add `"use client"` sparingly—default to server components.
- Reuse shared env helpers, logger, db client, and rate limiting (`@plop/kv/ratelimit`) instead of re-implementing.

## Testing Guidelines
- Co-locate tests in the same workspace (`*.test.ts`/`*.spec.tsx`). Add coverage for data access, server actions/tRPC inputs (validate with Zod), and critical UI flows. Keep fixtures small and typed.
- Use the framework configured per package (Turbo will run the right tool). Prefer regression tests when fixing bugs.

## Commit & Pull Request Guidelines
- Commit messages are short, imperative, and scoped when useful (e.g., `api: tighten auth middleware`). Avoid noisy WIP commits.
- PRs: include intent, key changes, migrations/env impacts, and links to issues/Linear. Add screenshots/gifs for UI changes. Confirm `bun lint`, `bun typecheck`, and relevant `bun dev:<target>` smoke checks.

## Security & Configuration Tips
- Copy `.env.example` to `.env` per workspace before running dev; never commit secrets. Keep `WEBHOOK_AUTH_TOKEN` synced with `INBOX_WEBHOOK_SECRET` for Inbox/API.
- For Supabase changes: edit `packages/supabase/supabase/schemas/*.sql`, generate migrations, and commit both schema and migration outputs. Do not hand-edit generated type files—regenerate with `bun generate`.
