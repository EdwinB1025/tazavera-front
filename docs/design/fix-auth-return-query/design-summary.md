Status: approved

# Design summary — fix-auth-return-query

Approved: Product owner's decision of 2026-10-07 (auth-flow change under his autonomy mandate). Drafted by the design lead on 2026-10-07 from the design lead's browser review of the same day.

- Change-id: `fix-auth-return-query`
- Capability: `auth` (requirements "Sign in", "Silent re-authentication", "Step-up to the write scope", "Return through the callback").
- Branch and folders: `feature/fix-auth-return-query`, `openspec/changes/fix-auth-return-query/`, `docs/design/fix-auth-return-query/`.
- Out of scope: token storage, scopes, PKCE, CSP, response headers and `proxy.ts`.

## 1. Defect

The sign-in return keeps only the path. Every place that records the return route reads `window.location.pathname` (or the App Router's `usePathname()`), so the query string is dropped. After a reload or a direct link to `/es/manage/evaluations/new?offering=…` the silent restore returns the user to `/es/manage/evaluations/new` without `offering` (404), and `?tab=` and the catalog filters are lost the same way.

## 2. Expected

- The return route is the path plus the query: `pathname + search`, never the hash.
- Before the callback opens it, the return route is validated as an in-application route: a relative URL that starts with a single `/` (not `//`), contains no backslash, resolves to the application's own origin, and whose first path segment is a supported locale (`/<locale>`, `/<locale>/…` or `/<locale>?…`, the locale-prefix rule of `proxy.ts`).
- An invalid return route falls back to the root of the default locale, the destination the callback already uses when there is no pending flow. The rest of the callback outcome (exchange, marker, session state) is unchanged.
- No length limit exists today on the return route; none is added.

Note for Product owner: the task described the validation as "exactly as today's path validation", but the code validates nothing today — `completeCallback` opens the stored `returnRoute` as is. This change introduces the rule stated above, taken from the task's own list (same origin, single leading `/`, locale prefix, no `//`, no backslash). No point is left open.

## 3. Call sites

Recording the return route:

| Where | Today | After |
|---|---|---|
| `src/features/auth/model/session.ts` — startup silent check (`start`) | `startSilent(window.location.pathname)` | path plus query |
| `src/features/auth/model/session.ts` — client seam `onUnrecoverable` | `startSilent(window.location.pathname)` | path plus query |
| `src/features/auth/api/authorize.ts` — `signIn(returnRoute?)` default | `window.location.pathname` | path plus query |
| `src/app/shell/ShellChrome.tsx` — header "Sign in" | `signIn(pathname ?? \`/${locale}\`)` (`usePathname`, no query) | relies on `signIn()`'s default |
| `src/features/user-account/ui/StepUpNotice.tsx` — `requestProfileWrite(\`/${locale}/account\`)` | fixed account route, no query | unchanged (the account route carries no query) |
| `signIn()` callers without argument (`SessionGate`, `RegisterSuccessPanel`, `AccountClient`, `RegisterClient`) | default | default, now with query |

Storing and consuming it:

| Where | Role |
|---|---|
| `src/features/auth/model/flow.ts` — `PendingFlow.returnRoute`, `saveFlow` / `readFlow` in `sessionStorage` | stores the string as given; format unchanged |
| `src/features/auth/api/authorize.ts` — `completeCallback` | reads the stored route, validates it (new), compares it with the current route and opens it through `replaceRoute` |
| `src/pages/callback/ui/CallbackScreen.tsx` (`app/callback/page.tsx`) | passes `router.replace`; unchanged |

## 4. Backlog

R5 (single active-locale derivation in `src/features/auth`) touches the same files. The validation checks whether a route's first segment is a supported locale and has no `DEFAULT_LOCALE` fallback of its own, so it is not a third copy of the active-locale derivation; R5 stays as it is.

## 5. Tests to keep green

- `src/features/auth/api/authorize.test.ts`, `src/features/auth/model/session.test.ts`, `src/features/auth/model/flow.test.ts`, `src/pages/callback/ui/CallbackScreen.test.tsx`, `src/app/shell/AppShell.test.tsx` (their `location` mocks gain `search`).
- The guards: `src/shared/ui/xss-guard.test.ts`, `proxy.test.ts`, `src/shared/api/tokens.test.ts`, and the colour and radius guards.
- `npm run test:run`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.
