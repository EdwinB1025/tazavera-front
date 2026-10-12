# Handoff — route-api-web-pages-through-front

## Session 2026-10-12 — design summary draft (local design lead)
Summary: backlog entry R74 (Product owner, 2026-10-12: traditional workflow, highest priority, last change before the Playwright suite; the design lead decides the open points a–d). Design lead drafted `design-summary.md` (`Status: draft — pending Product owner review`); the orchestrator committed it on `develop`. Stopped because: waiting for Product owner's approval. MVC reachable: not needed (no new screen).

### Agent feedback
Decisions in the draft: D1 explicit list of forwarded paths (not a prefix); D2 forwarding in `proxy.ts` with `NextResponse.rewrite`; D3 `X-Forwarded-Host/Proto/Port` from `NEXT_PUBLIC_APP_URL`, no `Location` or body rewriting; D4 the second base URL is `NEXT_PUBLIC_APP_URL` behind one helper (moves: `authorize.ts`, `UserMenu.tsx:123`, `SecuritySection.tsx:43/:56`, `PasswordForm.tsx:92`); D5 server-only `API_INTERNAL_URL` with fallback; D6 front headers unchanged on its own pages, forwarded responses served as the API sends them; D7 cookies move to the front's origin (one extra login after the switch); D8 OAuth issuer stays the API base; D9 access from another device is an environment matter (replaced by option A below); D10 same-origin risk accepted and recorded. Supersedes the 2026-10-09 log entry that called `API_INTERNAL_URL` a deploy matter. Ten scenarios with their test files; nine browser checks.

### Deferred to Product owner (none blocks propose)
#### Q1 — API `APP_URL`
- Recommendation: the front's public origin (passkeys take their domain from it; otherwise only the passkey browser check fails).
#### Q2 — `TRUSTED_PROXIES`, `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE`
- Recommendation: trust the front's address (`127.0.0.1` locally, the compose subnet in Docker); `SESSION_DOMAIN` unset; secure cookies on.
#### Q3 — Tunnels
- Recommendation: a second ngrok endpoint for the API, used as `NEXT_PUBLIC_API_URL`.
#### Q4 — `X-Powered-By` on forwarded responses
- Recommendation: `expose_php=Off` in the API image.
#### Q5 — Email-verification link built on the API's address
- Recommendation: a later backlog entry to build it on the front's address; not part of this change.

### Product owner's answers (2026-10-12)
- **Setup:** the build environment is a single server with one public entry point (one ngrok URL). It is the only environment the design considers (Product owner, 2026-10-12).
- **D10 revised — option A:** the front is the only door. It forwards the API's web routes **and** `/oauth/token` and every JSON call (the front calls the API under a path prefix and strips it when forwarding; no API code change). `NEXT_PUBLIC_API_URL` becomes the front's own origin. This replaces R74 end-state point 2 and the "JSON and `/oauth/token` not forwarded" part of D10.
- Q1: `APP_URL` = the public front URL (accepted).
- Q2: trust the front's address; `SESSION_DOMAIN` unset; secure cookies on (accepted).
- Q3: not needed (one tunnel, one URL).
- Q4: `expose_php=Off` in the API image (accepted).
- Q5: solved by Q1 (the link is built on `APP_URL`, opens on the front, which forwards `/email/verify`); no backlog entry.
- Next: the design lead updates the summary (end-state point 2, D4, D9, CSP, scenarios); then Product owner's approval.

### Summary updated for option A (design lead, 2026-10-12)
D1 two forwarded groups (`/api/*` with the prefix stripped → `/oauth/token` and JSON; the web list unchanged), checked before assets and locale routing; D4 `NEXT_PUBLIC_API_URL` keeps its name, value `{NEXT_PUBLIC_APP_URL}/api`; D5 `API_INTERNAL_URL` required, no fallback (502 without it); D6 `connect-src 'self'` + Nominatim; D7 same-origin, no CORS; 11 scenarios, 11 browser checks.

#### Q6 — How to sign in without ngrok (closed: deployment matter)
- Product owner, 2026-10-12: how the front is served over https (ngrok, Caddy) is a deployment change, not part of R74. The summary states only the requirement: a production build signs in only when the front is served over https. The deployment documentation decides how.
- Context: the token endpoint is now on the front's origin, so a production build signs in only when the front is served over `https` (ngrok gives it). A local production build on `http://localhost:3000` or the Docker stack without ngrok cannot sign in; Caddy no longer serves the browser. / Options: (A) every end-to-end check through ngrok, Caddy leaves the stack; (B) Caddy in front of the front for local and Docker checks; (C) accept `http` on `localhost` in the token exchange (changes security code). / Recommendation: A (B only if checks without ngrok are wanted; not C). `npm run dev` is unaffected.

### API callback registration (orchestrator's read-only check of the API, 2026-10-12)
- The OAuth front client's `redirect_uris` are written by `FrontClientSeeder` as `{FRONT_URL}/callback`. Product owner: the seeder is re-run once the API configuration is in place, so the client gets `https://<public origin>/callback`. Added to the summary (§0, browser check 3).
- Product owner asked for a summary of the decided setup for the deploy assistant to update the deployment documentation (given in chat, 2026-10-12).

### Local test setup (Product owner, 2026-10-12)
- Local tests serve the front over https through Caddy (a site in front of the front, in the local Caddyfile, Product owner's file); Caddy takes no role in the deploy. The browser checks of R74 run on that local https origin.

### Approval and propose launch (2026-10-12)
- Product owner approved the summary in the orchestrator session ("I approve") and asked the orchestrator to commit it and run the rest in the cloud: `docs: approve design summary for route-api-web-pages-through-front` (`4e02d8c3`), committed by the orchestrator at the Product owner's request (deviation from step 4, where Product owner commits the approval himself).
- Branch `feature/route-api-web-pages-through-front` created on origin from `develop` `4e02d8c3`.
- Propose (step 6) in the cloud: `trig_011ACFx3DJHxHoTy1uTFHWCD`, 08:37 UTC, architect only, prompt written by the design lead; target `claude/route-api-web-pages-through-front-propose`.
- **Next session (orchestrator):** list the routine's runs; review the branch (commit format, one commit per capability, `validate --strict`, `## Propose status`, departures from the summary in the final report); fast-forward `feature/route-api-web-pages-through-front`; then Product owner's artifact review (step 7) before apply. The session was closed by Product owner after the launch: no watch is running.

### Pending task for the orchestrator (Product owner, 2026-10-12)
- Create a separate branch named `deploy` to test this change before it passes into `develop`. Task for the orchestrator when Product owner comes back (Product owner's order: an exception to "no agent creates branches"). To settle with Product owner then: the branch it starts from and how R74 reaches it (expected: `develop` plus `feature/route-api-web-pages-through-front` once applied), and what is tested there before the merge into `develop`.

### Open until the browser checks
- Whether Next.js adds its own `X-Forwarded-*` after the proxy's (check 1: every `Location` stays on the front's origin).
- Whether Laravel's CSRF check passes with the forwarded host (check 5: no `419` on the security pages).

## Session 2026-10-12 — propose review (orchestrator)
Summary: the propose run (`trig_011ACFx3DJHxHoTy1uTFHWCD`, session `cse_01RnUC1ANehVUXpnAoYKNQ9D`, 08:37–08:47 UTC) ended with success; branch reviewed and integrated. Stopped because: step 7 (Product owner's artifact review) is next. MVC reachable: not needed.

### Agent feedback
- Commits on `claude/route-api-web-pages-through-front-propose`: `8fae16eb` docs(auth) (proposal, design, tasks, auth delta, `.openspec.yaml`, `## Propose status`), `0acf4533` docs(app-shell), `daf54a7b` docs(user-account); footer `Refs:` on each. `openspec validate --strict`: valid (re-run after the commits).
- 7 task groups + 8.1 (browser checks, left unchecked by the build); 8 new tests (6 `proxy.test.ts`, 1 `tokens.test.ts`, 1 `client.test.ts`), 7 existing tests change their expected base only.
- Research: Next.js 16.4.0 overwrites `X-Forwarded-Host` on an external rewrite with the `Host` that reached the front; D3 holds when the tunnel or TLS terminator keeps the public `Host` (ngrok and Caddy default). Laravel 13 skips the CSRF token for same-origin `Sec-Fetch-Site`.
- Departures from the summary: §5 rows 7 and 10 split into one scenario per capability and link site; one new `tokens.test.ts` test (no existing test asserted the token URL); `qa/proxy.test.ts` expected to go stale (listed by the build, not edited).
- Open (non-blocking, Product owner): (1) should the proxy also override the forwarded `host` header with the public host, so `X-Forwarded-Host` is right behind a terminator that rewrites `Host`? (2) `openspec/config.yaml` still says "JSON calls and the token exchange stay direct" (pre-option A); the configuration is Product owner's.

### Orchestrator review
- Commit format, one commit per capability, architect-only files (`openspec/changes/…` and `## Propose status`): OK. Skill: the run followed `openspec-propose` (`openspec new change`, `instructions`, `validate --strict`, `status`).
- Section 4 cleanup: no duplicate scenarios or tasks across `spec.md`, `design.md` and `tasks.md`; no artifact fix made.
- Integration: `feature/route-api-web-pages-through-front` fast-forwarded `4e02d8c3..daf54a7b` and pushed.

### Deferred to Product owner
#### Q7 — Artifact review (step 7)
- Question: review `openspec/changes/route-api-web-pages-through-front/` on `feature/route-api-web-pages-through-front` and send the review message (or "no changes") for the architect.
- Blocks: apply.
#### ANSWERED 2026-10-12: no override; D3 stays as approved. The build environment has one entry point (ngrok), which keeps the public `Host`; Caddy is not part of the architecture
#### Q8 — Forwarded `host` header (architect's open point 1)
- Options: (A) keep D3 as approved, the risk checked in browser check 2; (B) the proxy also sets the forwarded `host` to the public host (design change, through the artifact review).
- Recommendation: A — ngrok and Caddy keep the public `Host`, and browser check 2 confirms it before archive.
- Blocks: no.
#### ANSWERED 2026-10-12: Product owner updates the auth line himself; the orchestrator gave him the new text
#### Q9 — `openspec/config.yaml` wording (architect's open point 2)
- Question: update the auth line to option A (your file).
- Blocks: no.

## Session 2026-10-12 — artifact review (step 7)
Summary: Product owner sent his review message (the two `design.md` fixes of the Q8 answer: Risks item names only ngrok, no Caddy, records the decision not to override the forwarded `host`; Open Questions "None."; specs and tasks unchanged). Product owner committed the `openspec/config.yaml` auth line on `feature/route-api-web-pages-through-front` (`900a4f76`); the orchestrator pushed it before the architect run so its commit fast-forwards. Stopped because: architect run scheduled. MVC reachable: not needed.

### Decisions taken
#### D1 — Q7 answered: review message = the Q8 wording fixes
- Context: Product owner, 2026-10-12: "submit it as my review message and proceed".
- Result: cloud run `trig_01Ji2NEC5r9eMbHbLvGNGdYm` at 10:14 UTC, architect only, `openspec-update-change` skill, base `900a4f76`, target `claude/route-api-web-pages-through-front-update`, one commit `docs(auth): update artifacts for route-api-web-pages-through-front`. Prompt written by the design lead (local subagent; usage 36 % / 50 %), checked by the orchestrator (added the fetch/branch setup and the `config.yaml` record).
- Next: review the commit, duplicates check (§4), ff `feature/…`; then the apply in the cloud (security: auth flow, `proxy.ts`), tasks 1.1–7.1.

## Session 2026-10-12 — artifact update integrated, apply launched
Summary: architect run `cse_01UUBe3xTyM4ju2t4qGco4Jq` (10:15–10:17 UTC) pushed `2a9e37c4` `docs(auth): update artifacts for route-api-web-pages-through-front`. Stopped because: apply running in the cloud. MVC reachable: not needed.

### Orchestrator review
- One commit, `docs(auth)` with `Refs:`; only `design.md` (Risks item names only ngrok and records the no-override decision; Open Questions "None.") and `## Propose status` (both open points closed; review recorded; validate `--strict` valid). Specs, tasks and proposal unchanged, so no duplicates check needed beyond confirming that.
- Integration: `git merge --ff-only` in `tazavera-front` (where `feature/…` is checked out): `900a4f76..2a9e37c4`, pushed.

### Apply launch
- Weight: cloud from the start (security: `proxy.ts`, auth flow, CSP). Prompt by the design lead (local subagent; usage 38 % / 51 %), checked by the orchestrator: commit scope = each task group's capability (as the propose split), group 2 → `auth`; one cloud session for tasks 1.1–7.1 (long apply, §9); 8.1 left for Product owner and the design lead.
- Run `trig_01RqrqHSR9MVajRkVSp1KYPJ` at 10:29 UTC, base `2a9e37c4`, target `claude/route-api-web-pages-through-front-apply` (pushed after each task).
- Next: watch the branch; at 7.1 review commits (test before implementation, files, checkboxes only), re-run the checks, ff `feature/…`; then the code review with Product owner and the browser checks (8.1).

## Session 2026-10-12 — apply integrated (step 8 done)
Summary: cloud apply `cse_01BhYZD7iyMdm9yqPQpYmFbY` (10:29–11:01 UTC) finished tasks 1.1–7.1; reviewed, checks re-run locally, integrated. Stopped because: the next steps (code review, browser checks, visual review) need Product owner and this machine. MVC reachable: not needed.

### Agent feedback
- Commits (each pushed): 1.1 `5356f208`, 1.2 `fb3b969b`, 2.1 `ae6eb090`, 2.2 `a5e8a4f4` (scope `auth`, as the prompt set for group 2), 3.1 `1cb6a8d7`, 3.2 `c7b3b5c9`, 4.1 `2c5cecee`, 4.2 `146cebf7`, 5.1 `1765cbe3`, 5.2 `55ba226b`, 6.1 `db9715bb`, 6.2 `3d7b3def`, fix `864ca6ed` (`fix(auth)`: the session-types guard read an inline `type SessionUser` in the combined import of `UserMenu.tsx`; split into its own `import type` line), 7.1 `7e9f88ae` (checkbox only).
- Each `.1` test failed as its Verify line said before its `.2` (1.1: five fail, "Paths that are not forwarded" already passed; 3.1: the new `tokens.test.ts` test passed immediately, as planned).
- 7.1 (cloud): validation 209 files / 1190 tests passed; tsc OK; lint 0 errors (1 old warning in `qa/…/ConsensusPanel.test.tsx`); build OK, only `/icon.svg` prerendered (no page reads the API at build). QA: 1 stale test, `qa/proxy.test.ts` "appends 'unsafe-eval' to script-src only in development" (still expects the API origin in `connect-src`), left untouched.
- Deviation to review with Product owner (code review): `src/shared/api/client.test.ts` now runs in the node environment (`// @vitest-environment node`) and its `beforeEach` stubs `window`, because jsdom's `window` cannot be removed in the vmThreads pool; the existing tests keep their assertions.

### Orchestrator review
- 14 commits, test before implementation in each pair; `tasks.md` checkboxes only (8.1 unchecked); no `qa/`, `contracts/`, `schema.ts`, `next.config.ts`, `AGENTS.md` or `docs/agents/` change.
- Local re-run (temporary detached worktree, `npm ci`, `next typegen`): validation 209 / 1190 passed, tsc OK, lint 0 errors. Build and QA not re-run locally (cloud counts taken).
- Integration: `git merge --ff-only` in `tazavera-front` (clean): `2a9e37c4..7e9f88ae`, pushed.
- Rule deviation (orchestrator): the check worktree was removed with `git worktree remove --force` (it held only generated `node_modules`/`.next`); §6 says never `--force`. Nothing was lost.

### Deferred to Product owner
#### Q10 — Code review (step 9) and browser checks (8.1)
- Question: review the code on `feature/route-api-web-pages-through-front` (`7e9f88ae`), including the `client.test.ts` environment deviation above; then the browser checks 1–13 of the design summary §6 with the local https setup and the API configured (`APP_URL`, `TRUSTED_PROXIES`, seeders), with the design lead.
- Blocks: verify and archive.
#### Q11 — Stale QA test
- `qa/proxy.test.ts` 'unsafe-eval': update its expected `connect-src` (QA suite changes go through your reduction plan) — recommended: a fast-lane QA cleanup after the archive, as with R69–R72.
- Blocks: no (verify gate is the validation suite).
#### Note — the feature branch is now free for Product owner's deploy work (no executor on it).

## Session 2026-10-12 — code review (step 9, orchestrator)
Summary: Product owner, 2026-10-12: the orchestrator reviews the code and explains the findings functionally; Product owner approves or recommends. Diff `develop...feature/route-api-web-pages-through-front` (`7e9f88ae`), 9 production files, read against the API's route files (`routes/web.php`, Fortify, Passport, passkeys, Livewire endpoint) and views. Stopped because: Product owner's decisions taken (below); C waits for his choice. MVC reachable: not needed.

### Review result
- Forwarded list (`src/shared/api/forwarding.ts`) matches every API web route the API's pages use; every form and link in `resources/views` targets a forwarded path. Not forwarded and not used by any API page or by the front through the web side: `/register` (GET page), `/logout` (web), `/user/profile-information`, `/user/password`, Passport's management routes; the front calls register, logout, profile and password as JSON under `/api`.
- Server reads use `API_INTERNAL_URL`, browser calls `NEXT_PUBLIC_API_URL`; the token exchange stays in `tokens.ts:168` on `NEXT_PUBLIC_API_URL`. No hand-built API URL left (`apiWebPageUrl` replaces 5). CSP `connect-src 'self'` + Nominatim. Lint 0 production warnings; no `eslint-disable` added.
- `client.test.ts` node environment (apply deviation): accepted; the existing assertions are unchanged and pass.

### Decisions taken
#### D2 — Finding A (visitor IP): verify in the browser, guide below
- Context: the API's sign-in limit is 5 attempts per minute per email and IP (`tazavera-api/app/Providers/FortifyServiceProvider.php:77-80`), and the API trusts the front as a proxy. Next.js's external rewrite sets only `x-forwarded-host` (`node_modules/next/dist/server/lib/router-utils/proxy-request.js:30-41`); it never appends the real client address, so an `X-Forwarded-For` sent by the visitor reaches the API unchanged. Whether a visitor can fake an IP therefore depends on the entry in front of the front (ngrok, or Caddy locally) writing the real address. Not verified.
- Decision (Product owner): record a functional test guide; he runs it once the change is on the active front branch.
- Result: guide G1 below. If A2 fails, the fix changes D3 and touches security: it comes back to Product owner as a correction.
#### D3 — Finding B (`NEXT_PUBLIC_APP_URL` unset → plain server error instead of 502): not an issue
- Product owner: managed in the deployment.
#### D4 — Finding D (stale QA test): fixed on the feature branch by Product owner's order
- Product owner: clean or update `qa/proxy.test.ts` on the current branch and align it in `qa`; after his tests the branch passes directly into `develop`. Backlog R75 (fast lane by order). This replaces Q11's "after the archive".
- QA suite already run for R74: yes, cloud run `trig_01SQzWKBsxaxrsFEA6KAj2tL` on `7e9f88ae` (11:28–11:33 UTC): 1974 / 1975, the only failure is this test.

### Deferred to Product owner
#### Q12 — Finding C (the API pages' tab icon), corrected
- Correction of the first reading: the front already serves `/favicon.ico` (`app/favicon.ico`), and the API's `favicon.svg` is the same Tazavera logo (with a leaf gradient). What breaks: the API's pages (`partials/head.blade.php:8-10`) ask for `/favicon.svg`, which the front does not forward and does not have (404), so their tab falls back to the front's `.ico`, without the dark-mode colours of the SVG. `/apple-touch-icon.png` exists on neither side (pre-existing).
- Options: (A) forward `/favicon.svg` to the API (one entry in the forwarded list; changes design D1 and the auth spec's list → correction round on R74); (B) the API's head points to `/icon.svg`, the front's icon on the same origin (API change, Product owner's; breaks the icon when the API is opened directly); (C) the front serves its own `/favicon.svg` (new asset, a design change).
- Recommendation: A — the API keeps owning its pages' icons, and it is the smallest change.
- Blocks: verify and archive, once Product owner chooses.

#### ANSWERED 2026-10-12: option A (forward `/favicon.svg`) — correction round 1
- `corrections.md` Round 1 committed by the orchestrator (`049c93bd`, after R75's ff so it stays a fast-forward). Cloud run `trig_018PDJg9aM8TDhNNEXktc7s2`, 15:08 UTC, architect (`openspec-update-change`) then build (`openspec-apply-change`), base `049c93bd`, target `claude/route-api-web-pages-through-front-round-1`. Prompt written by the orchestrator: the design lead subagent is not available in a session started from the Sprint5 root (orchestrator §7 step 2); the design lead reviews the result before the round ends.

### R75 integrated (Product owner's order, D4)
- Cloud run `trig_01PkWnYT5BaUZDvFftgmLR4p` (session `cse_01FmtKq1fFqfVKLSS2GM3VKz`, 14:48–14:53 UTC): one commit `7871bd7e` `test(app-shell): drop the API origin from the expected connect-src`, only `qa/proxy.test.ts`. Cloud checks: validation 209/1190, QA 364/1975 (all pass), tsc, lint 0 errors (old warning in `qa/…/ConsensusPanel.test.tsx:529`), build OK. Not re-run locally (session refused npm); integrated on the session's counts. ff `7e9f88ae..7871bd7e`, pushed.
- The build's open question (its role file says it works only on `feature/<change-id>` and does not push; it followed the prompt): answered by the precedent of the cloud cycle (orchestrator §7), no action.
- `qa` gets the fix when `develop` is merged into `qa` after this branch reaches `develop`.

### G1 run (Product owner, 2026-10-12)
- Product owner: the orchestrator runs G1 (the design lead would need to start the servers). Entry: ngrok `https://connector-graph-change.ngrok-free.dev`. ngrok installed with winget for the test (3.3.1), to be uninstalled after. Waiting for Product owner's `.env` changes (API: `APP_URL`, `FRONT_URL`, `TRUSTED_PROXIES=127.0.0.1`, `SESSION_SECURE_COOKIE=true`, `SESSION_DOMAIN` empty; front: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL={public}/api`, `API_INTERNAL_URL=http://127.0.0.1:8000`) and the OAuth client redirect update (the seeder does not update an existing client).

### G1 — Functional test guide: visitor IP and the sign-in limit (finding A)
Run it once R74 is on the active front branch, through the **same public entry as production** (the ngrok URL; locally the https origin behind Caddy), with the API configured as in the summary §0 (`TRUSTED_PROXIES`, `APP_URL`). You need a Chrome extension that adds a request header (for example ModHeader) and the test account (`especialista.prueba@tazavera.test`).
1. **A1 — the limit works.** Open the front, choose "Iniciar sesión". In the sign-in window enter the test email with a wrong password 5 times in a row. Expected: "these credentials do not match" each time. On the 6th try, still within the minute: a "too many attempts, try again in N seconds" message. **Pass:** the 6th try is blocked.
2. **A2 — a fake IP is ignored.** Within that same minute, turn on the extension with the header `X-Forwarded-For: 203.0.113.7` for the public address. Reload the sign-in window and try a wrong password once more. **Pass:** still "too many attempts". **Fail:** "these credentials do not match" again: the API took the fake address, so anyone can get around the limit by changing it. Repeat once with `203.0.113.8` to confirm.
3. **A3 — normal sign-in afterwards.** Turn the extension off, wait 60 seconds, sign in with the right password. **Pass:** you are signed in.
4. Report each result and the entry used (ngrok or local Caddy). A2 failing through ngrok is the case that matters for production.

## Session 2026-10-12 — G1 run (orchestrator with Product owner)
Summary: G1 run through ngrok (`https://connector-graph-change.ngrok-free.dev` → front `npm start` on `feature/route-api-web-pages-through-front` `5dac0bf1` → API `php artisan serve` on `127.0.0.1:8000`). ModHeader is no longer installable in Chrome, so G1 ran as a curl script (`g1.sh`, orchestrator's scratchpad) that follows the same flow: `/oauth/authorize` → `/login` form (CSRF token) → `POST /login` with `Accept: application/json`. Run by Product owner from the session (the session refused the credential requests). Traffic kept minimal at Product owner's request (~25 KB, no assets). Stopped because: completed. MVC reachable: not needed.

### G1 result — PASS (A1, A2); A3 inconclusive (test account)
- Entry used: ngrok (the production entry). ngrok agent updated with `ngrok update` (3.3.1 too old for the account; minimum 3.20.0).
- A1 PASS: tries 1–5 `422` "Estas credenciales no coinciden con nuestros registros."; try 6 `429` "Too Many Attempts." (`ThrottleRequestsException`).
- A2 PASS: within the same minute, `X-Forwarded-For: 203.0.113.7` and `203.0.113.8` both `429`. The API does not take a visitor-sent address: the limit cannot be bypassed by faking the IP. Finding A closed; D3 unchanged.
- A3: after 65 s, the right password gave `422` (credentials do not match), not `429`: the limit released as expected, but the test account `especialista.prueba@tazavera.test` no longer accepts its known password (already noted on the board for R73: the account stopped signing in after a reseed). Not an R74 defect; a successful sign-in through the tunnel is covered by browser check 3 (8.1).
- Seen in passing: browser check 1 partly — `/oauth/authorize` answered `302` to `https://connector-graph-change.ngrok-free.dev/login` (the `Location` stays on the front's origin); round 1 — `HEAD /favicon.svg` through the tunnel `200 image/svg+xml`, rewritten to the API (`X-Middleware-Rewrite: http://127.0.0.1:8000/favicon.svg`).

### Notes for the deployment (Product owner's)
- The `429` JSON carries the exception class and the server file path: the local API runs with `APP_DEBUG=true`. Production must run `APP_DEBUG=false`.
- The API was started without `XDEBUG_MODE=off` (the session's allowed command does not set it); no effect on G1.

### Next
- Browser checks 1–13 (task 8.1) with the design lead, including the design lead's look at round 1 (API pages' tab icon), then verify and archive on Product owner's request. A working test account is needed (re-register `especialista.prueba@tazavera.test` or give another one).
- ngrok: keep it until Product owner says otherwise (demo on 2026-10-13); uninstall afterwards.

## Session 2026-10-12 — artifact update (R82 sync)
Summary: R82 `hint-user-on-security-links` was archived into `develop` after this change's artifacts were written and MODIFIED the same two requirements this change's delta MODIFIES (user-account "Grouped security section", app-shell "Signed-in header and user menu"); archiving R74 unchanged would have dropped R82's `login_hint` wording (R82 design.md, Risks). Product owner ordered the update. Stopped because: completed. MVC reachable: n/a.

### Decisions taken
#### D1 — Carry R82's login_hint into this change's deltas
- Context: R82 risk above. / Decision: cloud architect session `trig_01P51RgQxFkeANX6RhESXc4Y` (openspec-update-change) merged both blocks: this change's front-origin addresses plus R82's `login_hint` text and scenarios ("The security entry names the signed-in user", "No user identifier in the session"); nothing else changed. / Why: Product owner's order; keeps both settled behaviours, already in code. / Result: `35b7daae` docs(user-account), `3aebf6ca` docs(app-shell); `openspec validate --strict` valid; reviewed by the orchestrator (two spec files only, commit format) and fast-forwarded into `feature/route-api-web-pages-through-front`, pushed.

### Final checks
No code changed; validation suite not re-run (spec text only).

## Session 2026-10-12 — task 8.1 verified in code; browser run deferred to the deploy
Summary: Product owner (2026-10-12): the browser checks need the deploy and run on 2026-10-13; the design lead verifies the 13 checks of design-summary §6 in code and tests now and, if verified, the change is archived and merged per the workflow. Design lead (read-only, code and tests at `26a177d9`): **no finding**. Checks 1, 4, 8, 10 verified in code; 2, 5, 7, 11, 12, 13 partial (code right, part browser-only); 3, 6, 9 browser-only. Open risks: `X-Forwarded-Proto/Port` code-addressed (`forwarding.ts:71-79`; Next.js only overwrites `x-forwarded-host` with the incoming `Host`, `proxy-request.js:30-41`), `X-Forwarded-Host` and the CSRF `419` browser-only. Note: the "Open until the browser checks" points refer to §6 checks 2 and 6 in the current numbering. Test gaps (not findings, backlog candidates): forwarding of `/forgot-password`, `/email/verify` and the passkey routes; `poweredByHeader`; the landing's error state when the server-side fetch is rejected.

### Deferred to Product owner
#### Q7 — Browser checks on the production deploy (2026-10-13)
Production build over https, environment of §6. For each: qué abrir / qué hacer / qué debes ver.
1. **Un solo origen.** DevTools → Red en portada, listado, inicio de sesión y Mi cuenta: todas las peticiones van a la dirección del front (datos por `/api/…`); solo Nominatim y teselas del mapa salen fuera; nada a `localhost:8000` ni a la API directa.
2. **Ventana de inicio de sesión.** "Iniciar sesión" con Red abierta en la ventana: está en `{front}/oauth/authorize?…`; `/login` carga con estilos y fuentes; cada `Location` de los `302` apunta al front (riesgo `X-Forwarded-Host`).
3. **Los dos roles.** Entrar como cafetería y como especialista: sin error de `redirect_uri`; la ventana se cierra; `POST /api/oauth/token` y `GET /api/user` responden `200`; queda la sesión iniciada.
4. **Step-up.** Editar perfil → ventana en el front con `login_hint` en la URL; con otro usuario, `access_denied` y tu sesión sigue igual.
5. **Reautenticación silenciosa.** Con sesión, recargar: sigues dentro sin ver el login (petición `/oauth/authorize?…prompt=none` y vuelta por `/callback`).
6. **Página de seguridad.** Menú → Seguridad: en `{front}/user/security`; confirmar contraseña, activar doble factor, registrar passkey; ninguna respuesta `419` (riesgo CSRF).
7. **Enlaces de correo.** "Verificar email" y "¿Olvidaste tu contraseña?", pedir el restablecimiento y abrir el enlace del log de la API: todo en el front; el formulario envía y redirige dentro del front; el enlace empieza por la dirección del front.
8. **Cabeceras.** DevTools → Cabeceras de respuesta: página del front con CSP (`connect-src 'self' https://nominatim.openstreetmap.org`), COOP y las cabeceras de seguridad; `/callback` con CSP y sin COOP; `/login` y `/api/offerings` sin cabeceras del front ni `X-Powered-By` (si sale `X-Powered-By: PHP…`, falta `expose_php=Off` en la API).
9. **Cookies.** DevTools → Aplicación → Cookies: la cookie de sesión de la API y `XSRF-TOKEN` guardadas en la dirección del front, con Secure.
10. **Lecturas en el servidor.** Portada y listado con el log de la API abierto: se muestran; en el log las lecturas llegan del servidor del front; no aparecen en Red del navegador.
11. **Sin dirección interna.** Front sin `API_INTERNAL_URL`: `/api/offerings` responde `502` vacío; la portada muestra su estado de error habitual.
12. **Cerrar sesión.** Cerrar sesión y volver a entrar: `POST /api/logout` responde; el login pide credenciales otra vez.
13. **Step-up con otra cuenta.** Confirmar un step-up con otra cuenta y luego entrar con ella: tu sesión sigue igual; hay `POST /api/logout`; la otra cuenta debe escribir sus credenciales.

Also on the deploy (visual review of `develop`, blocked locally: browser tools denied in the orchestrator's session), at 375 and 1280 px, both themes:
14. **R77** tarjetas y consenso: solo notas principales; cada nota con hijos se abre con su botón; cerrar una cierra sus descendientes.
15. **R78** registrarse: se llega a la portada `/es`, no a Mi cuenta.
16. **R81** registro de cafetería: "Nombre comercial" obligatorio entre apellido y email; especialista sin ese campo; en Mi cuenta (cafetería) se ve y se edita; el directorio muestra el nombre comercial.
17. **R79** las cinco pantallas de gestión de la cafetería: tres entradas en el lateral, en orden, con icono.
18. **R80** crear ofertas: "Ver mis ofertas" sustituye a "Crear ofertas"; al elegir otro café vuelve "Crear ofertas".
19. **R82** enlaces de seguridad de Mi cuenta y del menú con `?login_hint=…`.
