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

### Status

2026-10-05. `openspec validate add-auth --strict`: `Change 'add-auth' is valid`. The document is processed as review round 1.

1. **PKCE challenge timing.** `design.md` D8 records the settled timing — `code_challenge` from `oauth4webapi`'s asynchronous `calculatePKCECodeChallenge`, the authorization request starting once it resolves, `signIn` keeping its `void` return (D1), no in-house SHA-256. `specs/auth/spec.md` unchanged: the specs fix no timing. Task 8.1 created (the three `signIn` assertions of `src/features/auth/api/authorize.test.ts` await the challenge).
2. **Interactive sign-in and step-up in a popup.** `specs/auth/spec.md` — "Sign in" now opens the authorization page in a popup that leaves the route and its typed input untouched, "Completing sign in" leaves the user on the route where sign in started, and the scenario "The popup is closed before completing" is added; the "Step-up to the write scope" scenario "Requesting the write scope" states the popup and the untouched route. `design.md` — D1 points the two interactive actions at the new **D10** (opening synchronously within the click, the verifier and `state` in the opener's memory, the `postMessage` handshake with origin, source and `state` checks, no navigation or reload of the opener) and D3 scopes the pending-flow record to full-page flows. Tasks 8.2 (tests) and 8.3 (implementation) created.
3. **Popup blocked.** `specs/auth/spec.md` — scenario "The popup cannot be opened" added (the full-page redirect fallback, return destination kept, no message). `design.md` D10 records the fallback. Tasks 8.4 and 8.5 created.
4. **Popup closed before completing.** Covered by item 2's scenario and D10's closed-window rule (in-memory flow data discarded, previous session state kept, no message). Tasks 8.6 and 8.7 created.
5. **`/callback` has two modes and renders no text.** `specs/auth/spec.md` — "Return through the callback" now renders no text and states the two modes; scenario "Forwarding the result to the application" added; "Completing on the callback" rewritten to redirect mode (history entry replaced so no `code` remains in the URL, client-side navigation); scenario "The wait is announced" removed. `design.md` — D4 gains the two modes and the two redirect rules, D6 is rewritten to the no-text rule with the `auth` catalogs dropped, and D9's file tables are updated. Tasks 8.8 and 8.9 created.
6. **Public API of `src/features/auth`.** `design.md` D1 exports the callback entry (`completeCallback`) from `src/features/auth/index.ts`; `src/pages/callback` imports only from `@/features/auth`. No specified behaviour change. Task 8.10 created.
7. **Content-Security-Policy on `/callback`.** `specs/auth/spec.md` gains the requirement "Content-Security-Policy on the callback"; `design.md` **D11** proposes the mechanism and marks it open. **No task — see the question below.**
8. **Cross-Origin-Opener-Policy.** `specs/auth/spec.md` gains the requirement "Cross-Origin-Opener-Policy"; `design.md` D11 proposes the same mechanism. **No task — see the question below.**
9. **Token holder exposure.** `specs/auth/spec.md` — "Credential handling" now forbids assigning the tokens to `window` or to React state; `design.md` D3 confines the holder to `src/shared/api/tokens.ts`. Tasks 8.11 and 8.12 created.

The task list ends with the real-browser check the round asks for (task 8.13, product owner, before archive), which also confirms `design.md`'s open risk that the API answers `/oauth/authorize` and `/login` without `Cross-Origin-Opener-Policy: same-origin` (not verifiable locally: the string appears nowhere in `../tazavera-api` and the API is not running).

**Question to the product owner (corrections 7 and 8 — no tasks are written for them).** The mechanism proposed in `design.md` D11 — `add-app-shell`'s D9 per-request nonce extended to `/callback`, with `Cross-Origin-Opener-Policy: same-origin-allow-popups` beside the existing CSP on every other response — requires changing `proxy.ts` and `proxy.test.ts`, which `add-app-shell` owns. May `add-auth` change them, or are these headers delivered by `add-app-shell` or by a change of their own? (`docs/backlog.md` R2 and R3 sit on the same seam and stay out of this change either way.)

Note for the product owner: corrections 1–6 and 9 leave parts of the unchecked tasks 3.2, 6.1 and 7.1 describing the earlier design (the D6 status region and the `auth` catalogs of 3.2, the navigation and `sessionStorage` assertions of 6.1, the `auth` catalog texts of 7.1). Sections 3–7 are left exactly as written, the new section's tasks name what they supersede, and sequencing the two is recorded in the final report.

### Status

2026-10-05 (second processing of the round, after the product owner answered handoff Q6, Q7 and Q8). `openspec validate add-auth --strict`: `Change 'add-auth' is valid`. The document is processed as review round 1.

1. **PKCE challenge timing.** Unchanged in this pass; task 8.1 stands as recorded above.
2. **Interactive sign-in and step-up in a popup.** Unchanged in this pass; tasks 8.2 and 8.3 stand as recorded above. As part of handoff Q8's rewrite, task 6.1 now plans its `requestProfileWrite` cases on the popup flow of D10 (no navigation, no `sessionStorage`).
3. **Popup blocked.** Unchanged in this pass; tasks 8.4 and 8.5 stand as recorded above.
4. **Popup closed before completing.** Unchanged in this pass; tasks 8.6 and 8.7 stand as recorded above.
5. **`/callback` has two modes and renders no text.** Unchanged in this pass; tasks 8.8 and 8.9 stand as recorded above. As part of handoff Q8's rewrite, task 3.2 now states the two modes and the no-text rule with no `messages/{locale}/auth.json` files.
6. **Public API of `src/features/auth`.** Unchanged in this pass; task 8.10 stands as recorded above.
7. **Content-Security-Policy on `/callback`.** `design.md` D11 is settled (handoff Q6): `add-auth` changes `proxy.ts` and `proxy.test.ts` in its own tasks; the requirement stays in `specs/auth/spec.md` with its `/callback` policy and no-COOP clause. Tasks **8.13** (tests) and **8.14** (implementation) created, test first.
8. **Cross-Origin-Opener-Policy.** The requirement moves from `specs/auth/spec.md` to the new `specs/app-shell/spec.md` delta of this change (handoff Q7), `proposal.md` lists `app-shell` under Modified Capabilities and records the `proxy.ts` seam in Impact, and `design.md` D11 records the settled mechanism and ownership. Tasks **8.15** (tests) and **8.16** (implementation) created, test first.
9. **Token holder exposure.** Unchanged in this pass; tasks 8.11 and 8.12 stand as recorded above. As part of handoff Q8's rewrite, task 7.1 now checks the exposure against `window` and React state as well.

Handoff Q8 additionally rewrites tasks 3.2, 6.1 and 7.1 in place to the updated design (popup flow and its full-page fallback, two modes of `/callback`, no-text rule with no `auth` catalogs, token exposure of correction 9), and `proposal.md`'s "What Changes" now describes the popup flow. The real-browser check moves from 8.13 to **8.17** and stays the list's last task, as the round's Verification line requires.

## Round 2 — 2026-10-05

Context: task 4.2 is blocked. design.md D1 has `AppShell.tsx` call `useSession()`, but `AppShell.tsx` is a Server Component (it reads the catalogs through `getMessages`, which uses `node:fs`).

1. **Session seam (D1).** Add a `"use client"` component in `src/app/shell` (name left to the architect) that calls `useSession()` and renders `ShellChrome` and the sidebar region. `AppShell.tsx` stays a Server Component: it resolves the catalog texts and passes them to the new component. The sidebar region choice moves with the session into the new component. `ShellChrome.tsx` and `AppSidebar.tsx` keep receiving the session as input, unchanged. Changes to `app-shell` files go under scope `auth`, as in Q6.
2. **`session` prop of `AppShell`.** Keep `session?` as an explicit override. The new component calls `useSession()` unconditionally and uses `session ?? <hook value>`. The three `AppShell.test.tsx` cases that pass literal sessions stay unchanged.
3. **Already-mounted consumers.** When the popup completes, a `useSession()` consumer mounted before sign-in ends `authenticated` without remounting or navigating (D10: the opener never navigates). Add a test-only task before 4.2 that changes the "ends `authenticated`" case in `session.test.ts` so the consumer is mounted before the flow starts.

Tasks: add the task of item 3 before 4.2; rewrite 4.2 and any later unchecked task that contradicts items 1–3. Checked tasks stay as they are.

### Status

2026-10-05. `openspec validate add-auth --strict`: `Change 'add-auth' is valid`. The document is processed as review round 2. No `app-shell` spec delta is needed or touched: the round changes no specified behaviour of that capability — the shell still follows the session state and the sidebar rule and the catalog-driven texts are exactly as specified — so this change's `specs/app-shell/spec.md` delta of review round 1 stands unchanged.

1. **Session seam (D1).** `design.md` — D1 now records the seam as the round settles it, with the name the round leaves to the architect: the `"use client"` component `SessionShell` (`src/app/shell/SessionShell.tsx`) calls `useSession()` and renders `ShellChrome` and the sidebar region, `AppShell.tsx` stays a Server Component that resolves the catalog texts and passes them to it, the sidebar region choice moves with the session into it, `ShellChrome.tsx` and `AppSidebar.tsx` keep receiving the session as input unchanged, and these `app-shell` files are changed under the commit scope `auth` (handoff Q6); the Goals seam bullet, D9's file tables (new `SessionShell.tsx` row, rewritten `AppShell.tsx` row) and the `AppShell.tsx` risk follow. `proposal.md` — the Out of Scope seam wording and the Impact "New" and "Modified" lists follow. `specs/auth/spec.md` unchanged: the rendered layout and the shell's session behaviour are exactly as specified. Task **4.2** rewritten in place; no separate task for the component, which lands in 4.2 and is verified through the existing `AppShell.test.tsx` cases (D9 records that it gets no test file of its own).
2. **`session` prop of `AppShell`.** `design.md` D1 records the settled override: `SessionShell` calls `useSession()` unconditionally and uses `session ?? <hook value>`, `AppShell`'s props are unchanged, and the three `AppShell.test.tsx` cases that pass a literal session stay as they are. No specified behaviour change and no further artifact update. Task **4.2** (rewritten together with item 1) verifies it over those three unchanged cases.
3. **Already-mounted consumers.** No specified behaviour change and no design decision beyond what `design.md` D1 and D10 already state (the opener completes the flow without navigating and ends `authenticated`), so the specs and `design.md` are unchanged. Task **4.1b** created before 4.2 — test-only, as the round directs — changing the "ends `authenticated`" case of `src/features/auth/model/session.test.ts` so its consumer is mounted before the flow starts. Checked tasks are untouched, and no later unchecked task contradicts items 1–3 (5.1–5.2, 6.1–6.2, 7.1 and 8.1–8.17 already match the popup flow and the two `/callback` modes), so 4.2 is the only rewrite.

The task list keeps its order and gains no new section: the round's Tasks line places the new task before 4.2 and rewrites 4.2 in place, following the `2.2b` and handoff Q8 precedents. This round lands in one `docs(auth)` commit: no `app-shell` artifact under `openspec/` changes.

## Round 3 — 2026-10-05

Context: handoff Q15. `src/app/shell/ShellChrome.tsx` holds empty `handleSignIn` and `handleSignOut`; their comments assign the wiring to `add-auth`, but design.md "Out of scope" gives the header to `add-app-shell`, so no task wires them and the header's Sign in and Sign out do nothing.

1. **Header actions.** The header's Sign in action calls `signIn()` with the current route, and the user menu's Sign out calls `signOut()`, both from `@/features/auth`. How they reach `ShellChrome` (passed from `SessionShell`, or called in `ShellChrome`) is left to the architect, within FSD import rules. Changes to `app-shell` files go under scope `auth`, as in Q6. Update design.md's out-of-scope line to match.

Tasks: one test-first pair after 5.2 (sign out must exist first). Checked tasks stay as they are.
