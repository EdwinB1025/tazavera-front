Type: Refactor (fast lane)

# Proposal

## Why

The front's Docker image copies the whole project (sources, tests, docs, OpenSpec, dev dependencies) and runs `next start` as root (technical review 2026-10-12, risk 3; backlog R76). Product owner's deploy `Dockerfile` will copy only the self-contained server output and the static assets and run `node server.js` as user `node`, which needs the production build to emit that self-contained server. Product owner ordered it as a hotfix, fast lane, highest priority (2026-10-12).

## What Changes

- `next.config.ts` adds `output: "standalone"` to `nextConfig`, keeping `poweredByHeader: false` and the next-intl plugin exactly as they are.
- Only if a locale page served by the standalone server fails because the message catalogs are not traced: the same `next.config.ts` adds `outputFileTracingIncludes` for `messages/**`, and nothing else.
- `npm run build` additionally emits `.next/standalone/server.js`; started with `.next/static` copied next to it (as the Dockerfile will), it serves every locale page with its styles and translations.
- No behaviour a user sees changes, the requests sent to the API stay the same, and every requirement in `openspec/specs/` stays as it is. `npm run dev` and `npm run start` keep working as before.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: adds the requirement that states the observable property the change establishes: the production build yields a self-contained server that serves the localized pages with their styles. No existing requirement changes.

## Impact

- Files: `next.config.ts` only.
- Dependencies: none.
- Tests: none added; existing tests keep their assertions.
- Protecting checks: the validation and QA suites, typecheck, lint, `npm run build`, and the runtime check of the standalone server (task 1.2).

## Non-goals

- Changing the `Dockerfile` (Product owner's, outside the OpenSpec flow).
- Copying `.next/static` or `public/` into the standalone output as part of the build; the Dockerfile does that copy.
- Any other configuration change (headers, rewrites, images, CSP).
- Unit tests of the standalone output; it is checked at runtime only.

## Propose status

- Change-id: `build-standalone-output`
- Date: 2026-10-12
- `openspec validate build-standalone-output --strict`: valid
- Resolves backlog entry: R76 (Standalone build output for the Docker image), type `Refactor (fast lane)` by Product owner's order of 2026-10-12.
- Resolved from the entry's settled end state: `output: "standalone"` in `next.config.ts`, keeping `poweredByHeader: false` and the next-intl plugin; `outputFileTracingIncludes` for `messages/**` only if the runtime check shows untraced catalogs; no new tests; the `Dockerfile` is not changed. `design.md` is skipped: the backlog entry replaces it.
- Open: none.
