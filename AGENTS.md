<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules

## Project

- tazavera-front is the web frontend for an existing Laravel REST API.
- Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS 4, ESLint 9. Package manager: npm.
- Source code lives under `src/`. The import alias `@/*` maps to `src/*`.
- Planned work is described in `openspec/` (specs and changes). Follow it.
- Tailwind CSS 4: design tokens are defined with `@theme` in `src/app/styles/globals.css`. There is no `tailwind.config` file; never create one.

## Architecture (Feature-Sliced Design)

- Root `app/` is Next.js routing only. Each `page.tsx` imports its screen from `src/pages/` and contains no logic.
- Root `pages/` is intentionally empty. Never add files to it.
- Application code lives in `src/`, organized in FSD layers, from top to bottom: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- A layer may only import from layers below it. Never import upwards or between slices of the same layer.
- Before designing a change or creating files under `app/` or `src/`, load the `fsd-architecture` skill.

## API contract

- The API is documented with Scribe (OpenAPI 3.0.3). This project consumes the API and never modifies it.
- Never invent API fields, UI states or error formats. Everything must trace back to the OpenAPI spec or the specs of the current change.
- The API contract is `contracts/openapi.yaml`, a copy of the backend's Scribe spec. It is the only source of truth for API endpoints, fields and error formats.
- Never edit `contracts/openapi.yaml`. If it looks outdated or incomplete, stop and tell the user.
- API types are generated into `src/shared/api/schema.ts` with `npm run types:api`. Never edit that file by hand; regenerate it whenever `contracts/openapi.yaml` changes. Import API types only from `src/shared/api/`.

## Testing

- Unit and component tests use Vitest with React Testing Library. Run them with `npm run test:run`.
- Async Server Components cannot be tested with Vitest; keep them thin and move logic into testable components or functions.
- End-to-end tests (Playwright) come later, as a pre-deployment suite.

## Dependencies

- Do not add, remove or upgrade dependencies without explicit approval from the user.
- Keep ESLint on v9: the plugins in `eslint-config-next` do not support ESLint 10 yet.