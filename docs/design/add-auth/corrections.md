# Corrections — add-auth

## Round 1

Product owner, 2026-10-05. Resolves handoff Q2–Q5 and changes the interactive sign-in to a popup window. Stop condition: if `/oauth/authorize` or `/login` of the API responds with `Cross-Origin-Opener-Policy: same-origin`, stop and report before writing tasks; the popup flow depends on it being absent.

1. PKCE challenge timing (handoff Q3, option 2). End state: `code_challenge` is computed with `oauth4webapi`'s asynchronous `calculatePKCECodeChallenge` (design.md D8 unchanged); `signIn` keeps its `void` return (D1) and the authorization request starts once the challenge resolves. No in-house SHA-256.
   Existing tests affected: the three `signIn` assertions in `src/features/auth/api/authorize.test.ts` await the challenge before asserting the opened URL.
   New test: none.

2. Interactive sign-in and step-up open in a popup window. End state: on the user's click, `signIn(returnRoute?)` and `requestProfileWrite(returnRoute)` open a popup synchronously within the click (blank first), then point it at `{NEXT_PUBLIC_API_URL}/oauth/authorize` with the parameters of design.md D4/D5 once the challenge resolves. The verifier and `state` of a popup flow live only in the opener's memory, never in `sessionStorage` or `localStorage`. The opener accepts a message only when its origin is the front's origin and its source is the popup it opened; it checks `state`, exchanges the code with the verifier, stores the tokens in memory, sets the credential-free marker and ends `authenticated` (step-up: the new token replaces the previous one). The opener does not navigate and does not reload: the current route and any typed input stay as they are.
   Existing tests affected: the 3.1 assertions that expect sign in and step-up to navigate the current page (`location.assign`) and to store the flow record in `sessionStorage` for these two entry points.
   New tests: a message from another origin, or from a window other than the popup, is ignored (fails if it triggers an exchange); a matching message ends `authenticated` with no navigation of the opener (fails if `location` changes); the flow record of a popup flow never reaches `sessionStorage` (fails if it does).

3. Popup blocked. End state: when the popup cannot be opened (`window.open` returns `null`), the same call falls back to the current full-page redirect flow (design.md D3/D4: flow record in `sessionStorage`, return route kept), with no message shown.
   Existing tests affected: none.
   New test: with `window.open` returning `null`, sign in navigates the current page to the authorization URL and stores the flow record (fails if nothing happens).

4. Popup closed before completing. End state: the opener detects the closed popup, discards the in-memory flow data and keeps its previous session state (anonymous for sign in; unchanged for step-up), with no message. Retrying is a new click.
   Existing tests affected: none.
   New test: closing the popup without a message leaves the session state unchanged and no flow data behind (fails if the session changes or flow data remains).

5. `/callback` has two modes and renders no text (replaces handoff Q4). End state:
   - Popup mode (it has an opener of the front's origin): it posts `{ code, state }` or `{ error, state }` to the front's origin only, then closes itself. It performs no exchange.
   - Redirect mode (no opener: silent restore of design.md D5 and the fallback of correction 3): the current D4 outcomes (state check, exchange, flow data deleted, marker set or removed), plus: the history entry is replaced so the code does not remain in the URL, and the return route opens through client-side navigation, never a full page load (the in-memory tokens must survive).
   The D6 status region, the `auth` message catalog files and the spec scenario "The wait is announced" are removed.
   Existing tests affected: `src/pages/callback/ui/CallbackScreen.test.tsx` (status region and `callback.status` assertions removed; rewritten for the two modes); the D4 outcome assertions in `authorize.test.ts` apply to redirect mode.
   New tests: popup mode posts to the front origin and closes, making no token request (fails on any exchange); redirect mode leaves no `code` in the URL and opens the return route without a full page load (fails on `location.assign`/reload).

6. Public API of `src/features/auth` (handoff Q5). End state: the function `/callback` uses to complete or forward the result is exported from `src/features/auth/index.ts`; `src/pages/callback` imports only from `@/features/auth`.
   Existing tests affected: imports in `CallbackScreen.test.tsx` if they deep-import.
   New test: none (the FSD import rule applies).

7. Content-Security-Policy on `/callback` (handoff Q2). End state: document responses of `/callback` carry a CSP that allows only the page's own scripts and, in `connect-src`, the API origin (redirect mode exchanges the code there). `/callback` stays outside the locale redirect. The mechanism is yours to propose in design.md; if it requires changing `proxy.ts` (owned by `app-shell`), stop and ask before writing tasks.
   Existing tests affected: none.
   New test: a `/callback` response carries the CSP with the API origin in `connect-src` (fails if absent).

8. Cross-Origin-Opener-Policy. End state: every front document response sends `Cross-Origin-Opener-Policy: same-origin-allow-popups`, except `/callback`, which sends none (a `/callback` with COOP would be severed from its opener after returning from the API origin). Same mechanism rule as correction 7.
   Existing tests affected: none.
   New tests: a page response carries `same-origin-allow-popups` (fails if absent or `same-origin`); a `/callback` response carries no COOP (fails if present).

9. Token holder exposure. End state: the access and refresh tokens are reachable only inside `src/shared/api/tokens.ts`; they are never assigned to `window`, React state or any browser storage.
   Existing tests affected: none.
   New test: after a successful grant, no token value appears on `window`, in `localStorage` or in `sessionStorage` (fails if any does).

Verification: in addition to the unit tests, the task list ends with a real-browser check by Product owner before archive: sign in through the popup, step-up from a filled form keeping its input, and a reload restoring the session silently.