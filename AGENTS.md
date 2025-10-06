# Repository Guidelines

Next.js ordering platform with an admin dashboard and API routes. Use these notes to contribute consistently.

## Project Structure & Module Organization
- `app/`: App Router routes and server actions; keep features in segments such as `app/(management)/orders`.
- `components/`: Reusable UI primitives; place feature widgets in `components/<feature>` and share atoms from `components/ui`.
- `hooks/` & `lib/`: Shared hooks and domain utilities; import through the `@/` alias in `tsconfig.json`.
- `prisma/`: `schema.prisma`, generated client, seeds; edit the schema, then regenerate before committing.
- `public/`, `styles/`, `docs/`: Static assets, Tailwind layers, and product references that mirror current UI behavior.

## Build, Test, and Development Commands
- `pnpm install`: install dependencies; always prefer pnpm to keep the lockfile authoritative.
- `pnpm dev`: launch at `http://localhost:3000`; use `pnpm build` + `pnpm start` for production checks.
- `pnpm lint`: run the Next.js ESLint suite and fix findings before pushing.
- `pnpm db:migrate` / `pnpm db:seed`: apply Prisma migrations, refresh local data, and note seed edits in PRs.

## Coding Style & Naming Conventions
- TypeScript runs in strict mode; favor explicit return types for server actions and avoid `any`.
- Keep 2-space indentation and rely on ESLint autofix rather than manual whitespace tweaks.
- Components use PascalCase, helpers use camelCase, and only add `"use client"` when client state is required.
- Tailwind utilities stay inline in JSX; extract repeated styles into `styles/globals.css` or shared components.

## Testing Guidelines
- No automated tests yet, so record manual verification steps and attach UI screenshots or clips in each PR.
- Propose tooling changes before adding tests; if accepted, place specs under `tests/` or feature-level `__tests__`.
- Run `pnpm lint` and current Prisma commands before pushing to ensure migrations and seeds stay reproducible.

## Commit & Pull Request Guidelines
- Follow the repo’s descriptive, Chinese commit summaries; keep the subject under 72 characters and add detail in the body only when needed.
- PRs should outline scope, affected routes, database impacts, and env requirements; link relevant docs and include UI captures.
- Request reviews from owners of touched areas, list follow-up tasks, and rebase on the latest `main` before merging.

## Database & Configuration Notes
- Keep secrets in `.env.local`; set `DATABASE_URL` and the Aliyun OSS keys noted in `docs/ALIYUN_OSS_INTEGRATION.md`.
- After editing `schema.prisma`, run `pnpm prisma generate` and confirm seeds still populate the shared dataset.
