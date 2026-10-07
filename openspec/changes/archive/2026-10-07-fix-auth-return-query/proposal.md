## Why

The sign-in return keeps only the path of the route the user was on. After a reload or a direct link to a route with a query (`/es/manage/evaluations/new?offering=…`, `?tab=`, catalog filters), the silent restore or a full-page sign in brings the user back without the query — a 404 for the new-evaluation form and lost tabs and filters elsewhere (design lead's browser review, 2026-10-07; `docs/design/fix-auth-return-query/design-summary.md`).

## What Changes

- The return destination of every flow (sign in, its full-page fallback, the silent restore, step-up) is the route the user is on with its query string, never its hash.
- The callback opens the return destination only when it is a route of the application (relative, a single leading `/`, no backslash, same origin, a supported locale prefix); otherwise it opens the root of the default locale, the destination it already uses when there is no pending request.

## Non-goals

- Token storage, scopes, PKCE, the Content-Security-Policy, response headers and `proxy.ts` are unchanged.
- No length limit is added to the return destination.
- Step-up keeps returning to the account route it names (it carries no query).
- R5 of `docs/backlog.md` (single active-locale derivation) is not addressed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `auth`: "Return through the callback" — the return destination keeps the query and is opened only when it is an application route.

## Impact

- `src/features/auth/api/authorize.ts`, `src/features/auth/model/session.ts`, `src/features/auth/model/flow.ts`, `src/app/shell/ShellChrome.tsx` and their tests.
- No API, dependency or configuration change.
