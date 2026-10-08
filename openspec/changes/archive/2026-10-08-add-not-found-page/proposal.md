# Proposal

## Why

The application has no `not-found` file, so every "not found" outcome under a locale — an unknown path, an unsupported locale prefix redirected under `es`, a signed-in user whose role a protected route does not allow, a resource a route reports as not found — shows Next.js's default 404 page: unstyled, in English only, outside the theme and without the shell (backlog R14). Every role-gated route added since `extract-access-and-status-pieces` sends users there. The design source of truth is `docs/design/add-not-found-page/design-summary.md` (approved, no open points).

## What Changes

- A not-found page for the `[locale]` segment, rendered inside the shell (header, theme, `<html lang>`), in the active locale: a level-one heading, a short text and a "back to the home page" link to the root of the active locale.
- It is composed only of existing shared pieces (`PageSection`, section `Card` with `CardAside` and `CardContent`, `Link` back variant) and existing semantic tokens (decisions log 2026-10-07 "nada nuevo en el diseño").
- Three texts added at the end of the `shell` catalog area in es, en and ca.

## Out of scope (non-goals)

- `global-not-found` and a root `app/not-found.tsx`: the proxy prefixes every application URL with a locale, so only framework paths, paths with a file extension and `/callback` reach the root (design summary §2).
- Changing which screens call `notFound()`: the offering detail keeps its own error result for an unknown offering.
- A localised `<title>`: `not-found.js` cannot export metadata; the root layout's title `Tazavera` stays.
- Any change to the sidebar slot beside the page on role-gated routes (design summary Unverified 3).
- No new token, colour, icon, component, variant, dependency, guard test or contract operation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: one ADDED requirement, "Not-found page" — what the page shows and where it renders. The existing scenarios "Unsupported locale", "Unknown route stays not found" and "Role the route does not allow" already route to the application's not-found page and keep their wording.

## Impact

- **Code** (FSD layers): created `app/[locale]/not-found.tsx` (routing), `src/pages/not-found/ui/NotFoundScreen.tsx`, `src/pages/not-found/index.ts` and `src/pages/not-found/ui/NotFoundScreen.test.tsx` (pages); modified `messages/{es,en,ca}/shell.json` (three keys at the end).
- **Tests**: two, one per scenario of the ADDED requirement. No guard test added; the existing catalog guard covers the new keys.
- **Dependencies, contract, tokens**: none added, none changed.
- **Backlog**: resolves R14 (removed when this change is archived).
- **Shared files**: `messages/*/shell.json`; any in-flight branch editing the same closing lines would conflict (orchestrator simulates with `git merge-tree` before the apply).
