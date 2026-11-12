# General context — tazavera-front

The orchestrator's context for resuming work. Kept by the orchestrator (`docs/agents/orchestrator.md`, §12): rewritten in place to stay current, except the decisions log at the end, which is append-only. Sources of truth this file does not repeat:
- `docs/design/change-progress.md` (the board): phase, assignee and blocker of every open change, and the contract coverage.
- `docs/design/backlog.md`: refactor candidates and accepted entries, used by the agents as the workflow says.
- `docs/agents/workflow_sdd.md`: the process (SDD with OpenSpec): traditional workflow, fast lane and findings.
- `AGENTS.md`: the common rules and the table of role files; each role's rules are in `docs/agents/` and each agent reads only its own. The files in `.claude/` only point to the role files.
- Each change's `handoff.md` and `corrections.md`.

**Working language:** English for every record and artifact (Product owner, 2026-11-05). Interface texts stay in their catalogs (`messages/{es,en,ca}`).

**Updated:** 2026-11-05 — first log cleaning: 60 entries moved to `docs/design/decisions-archive.md`, 19 kept (plus the entry recording the split).

## On resuming

- **First step, always:** the start checklist of `docs/agents/orchestrator.md` before any answer. The assignment loop dies with each session.
- The design lead subagent is not registered when the session starts in `Sprint5`: run it as a general agent whose prompt names the role, from `tazavera-front/.claude/agents/design-lead.md` (a hidden folder: Glob skips it, read it by path).
- **Commands:** never `cd`; one command per call, with `git -C <dir>` and `env -C <dir> <command>`; files are read with the Read, Grep and Glob tools. A chained `cd …;` command always asks for permission, whatever the allow list says.
- The QA suite lives in the front repository, folder `qa/` (`AGENTS.md` → Testing; `npm run test:qa`). The separate folder `tazavera-front-qa` (its own `.git`, two commits of reduction passes 1–2, clean) is the obsolete pre-integration copy (Product owner, 2026-11-12).

## Current state (2026-11-05)

- Only **R91 `add-register-landing`** is in progress (traditional workflow), phase **Apply** (cloud, not launched yet): next steps on the board. Worktree `tazavera-front-register-landing`; the committed `.opencode/agents/` profile is the restricted `--auto` one; `.env.local` not copied (Product owner's).
- Then R45 (after R91 reaches `develop`).

## Permissions (2026-11-05)

- `RemoteTrigger` `create` is denied in don't-ask mode since Claude Code 2.1.318 (worked through 2.1.299, earlier this month); `list` and `get` still work. It works in auto mode (session `24fbb6cc`) and in `default` mode (with a prompt). Orchestrator sessions start in auto mode (Product owner, 2026-11-05).
- The permission file in force is `Sprint5/.claude/settings.local.json` (same rules as `tazavera-front/.claude/settings.local.json`, both rewritten 2026-11-05). Use only the tools it allows; it denies writes to `.env*`, so Product owner copies `.env.local` into worktrees.
- 2026-11-05 (late afternoon): `claude --cloud` (this version has `--cloud`, not `--remote`) run through Bash was also denied in don't-ask mode, although `Bash` is allowed. The docs say a PreToolUse hook's `allow` lets a call run in don't-ask mode; Product owner adds one for `RemoteTrigger` in `Sprint5/.claude/settings.local.json` (untested). Launching with `claude --cloud` instead of a scheduled run would need Product owner's authorisation (§7 step 3).
- `RemoteTrigger` `create` with `run_once_at` 6–31 minutes ahead was rejected as "in the past" (2026-11-05 ~13:50Z, cause unknown); if it repeats, create the routine unscheduled and fire it once with `run`.

## Environment

- **Local (2026-10-11):** the orchestrator starts it as `tazavera-documentation/arranque-local-con-caddy.md` says: `php artisan serve` in `tazavera-api`, `caddy start --config deploy/Caddy/Caddyfile.local --adapter caddyfile` (the CA is already trusted), and the front with a node launcher (`scratchpad/run-front.mjs <folder> run build|start`) that sets `cwd`, `NODE_EXTRA_CA_CERTS` and the three `NEXT_PUBLIC_*` variables. Seeded coffee-shop account: `nomad-coffee@tazavera.test` / `password` (one per business in `coffeeshops-barcelona.json`). The design lead captures with headless Chrome over the DevTools protocol, navigating with `window.next.router.push` (a reload loses the tokens).
- **Local OAuth client of the front:** changes with every `migrate:fresh --seed`; `NEXT_PUBLIC_OAUTH_CLIENT_ID` is inlined at build time, so the production build is redone after it changes. Product owner creates the front's `.env.local`.
- **Cloud:** environment `env_01DTNNGR37Cgqdaa5ym4Zagr` (`Default`), model `claude-opus-5-5`, repository `EdwinB1025/tazavera-front`. Routines are scheduled at least 3–5 minutes ahead; if the time is already past when creating one, move the time (never also run it by hand: it duplicates the session). Prompt content: `docs/agents/orchestrator.md` §7, step 2.
- **API (`EdwinB1025/tazzavera-api`, 2026-10-12):** the local checkout is on Product owner's `deploy` branch. By his order, API changes start from `deploy` and return to `deploy` (local and GitHub); before merging, `git status` must be clean in the checkout, otherwise stop and tell him. Scribe runs from the API folder: `php artisan optimize:clear` and `php artisan scribe:generate` (no `--force`).
- **OpenCode:** `xiaomi/mimo-v2.6-pro` for the architect and the build. The provider sometimes hangs without an error (CPU at zero, empty log): stop after 15–20 minutes without output and relaunch. OpenCode Desktop leaves `opencode-cli serve --service` orphaned.
- **Project:** Git Bash on Windows (`taskkill //PID <n> //F`); base `C:\Programing\Full Stack\Sprint5\`. GitHub `EdwinB1025/tazavera-front` (private), remote `origin`, default branch `develop`. A fresh folder fails `npx tsc --noEmit` until `npx next typegen` runs.

## Working agreements

- API values are shown as they come (including `roastLevel`).
- Captures go in `docs/design/<change-id>/captures/`. The build has no browser.
- After every API `migrate:fresh`, the front's data cache (`.next/cache/fetch-cache`) must be emptied, or cached taxonomies no longer resolve.

## Orchestrator decisions log

The active log: append only (`docs/agents/orchestrator.md` §12). One entry per orchestrator decision, or Product owner answer, that affects another change or a design. "Affects" names the changes and the design points. Entries whose decisions are reflected in archived changes move, unchanged, to `docs/design/decisions-archive.md` (cleaning, §12). Entries before 2026-11-05 were translated from Spanish on that date, without changing their content.

### 2026-10-06 — add-landing (D14)
- **Decision:** common page layout: full-width sections, a centred container of at most 72rem, side padding 1rem/2rem, vertical padding 3rem/4rem, and explicit gaps between groups.
- **Why:** add-landing round 3.
- **Affects:** every new page design (offering-catalog, user-account, evaluations).

### 2026-10-06 — access to protected routes
- **Decision:** on `/manage/evaluations*`, a visitor without a session signs in and returns to the route; a user without the right role sees the 404 page.
- **Why:** Product owner's answer to point 9 of add-specialist-evaluations.
- **Affects:** add-offering-management Open 5, add-user-account Open 5 (pending proposal S2: the popup needs a click, so an automatic "sign in" is a redirect).

### 2026-10-06 — writes, protected routes and 422 (Product owner's answers)
- **Decision:**
  - Reactive step-up: the write is sent with the current token; on a `403` the step-up notice is shown and the user repeats the action after confirming.
  - Protected route without a session: with `loading`, wait; with `anonymous`, the page calls `signIn(currentRoute)` without a click, which ends in add-auth's full redirect (correction 3) and returns to the route. User without the role: 404 page (previous entry).
  - Any 422 shows the form's generic error; per-field mapping stays in the backlog (R8).
- **Why:** Product owner's answers of 6 Oct to proposals 1–3.
- **Affects:** add-user-account Open 1, 2 and 5; add-offering-management Open 5, 6 and 7; add-specialist-evaluations (point 9 and the writes entry).

### 2026-10-06 — combobox library (Product owner's answer)
- **Decision:** the combobox is shadcn/ui's (Radix Popover + `cmdk`), styled with tokens; new dependency approved. The architect checks `cmdk`'s maintenance and size when proposing.
- **Why:** Product owner's answer to add-filter-controls Open 1.
- **Affects:** add-filter-controls (Producer and Roaster facets); any future change that needs a combobox.

### 2026-10-06 — protected routes without a session: message with a button (Product owner's answer)
- **Decision:** replaces the "protected route without a session" part of the entry "writes, protected routes and 422". With `loading`, wait; with `anonymous`, the page shows a message and a "Sign in" button that calls `signIn(currentRoute)` inside the click (popup; the user stays on the route). No automatic redirect. User without the role: 404 page. Also, `/[locale]/register*` with an `authenticated` session goes to the home page by client-side navigation.
- **Why:** Product owner's answer: the message tells the user what is happening.
- **Affects:** add-user-account Open 4 and 5, add-offering-management Open 5, add-specialist-evaluations point 9.

### 2026-10-06 — form validation in the browser (Product owner's answer)
- **Decision:** forms are `noValidate` and, before submitting, the front validates only what each operation's `requestBody` documents in the contract (required fields, email format, matching confirmation, enums and maximum lengths), with catalog messages under each `Field`. What the contract does not detail (password strength, uniqueness, current password) is validated by the API, with the generic 422 until R8 documents the 422.
- **Why:** Product owner's answer to add-user-account Open 9; Scribe documents the FormRequest rules in the `requestBody`, but not the 422 response.
- **Affects:** add-user-account, add-offering-management, add-specialist-evaluations (all their forms).

### 2026-10-06 — contacts and locations (Product owner's answers)
- **Decision:**
  - **API, change `add-contacts-and-locations`** (branch `feature/add-contacts-and-locations` from `dev`; the orchestrator merges into `dev` and `PROD` and updates documentation and types):
    - `GET` and `POST /users/{user}/contacts`: a single primary contact per user, `409` if one already exists; only for the user themselves.
    - `GET /users/{user}/locations`: only the user themselves.
    - `POST /locations`: role `coffeeshop`; location and contact in one transaction.
    - **All authenticated**: the data is shown only to authenticated users, as part of the profile.
    - Migration: `latitud`, `longitud` and `description` become optional.
    - Factories with real Barcelona addresses.
  - **Coordinates:** computed by **the front** with a geocoding library from the address, and sent in `latitud`/`longitud`. The API does not geocode.
  - **Coffee shop registration:** since the endpoints are authenticated, the location is not sent in `POST /register`. The coffee shop completes its location in the profile after its first sign-in, like the contact section: if there is no data, a message and a button that opens the form in the same view.
  - **Front:** `add-user-contact` (contact section in the profile) and `add-coffeeshop-location` (the coffee shop's location in the profile, with geocoding).
- **Pending:** browser geocoding calls an external service, which requires opening the CSP's `connect-src` (security: Product owner's decision).
- **Why:** Product owner's answers of 6 Oct in the evening.
- **Affects:** add-user-account (profile), add-user-contact, add-coffeeshop-location, app-shell's CSP.

### 2026-10-06 — directory by business, tabs and the coffee shop sidebar (Product owner's answers)
- **Decision** (replaces the previous entry where they contradict):
  - **The directory's "coffee shop" is the business** (a user with role `coffeeshop`), with one or more locations; not a single location.
    - API: `GET /coffeeshops` (coffee shop users with at least one location; filters `name`, `city`, `postalCode`, `verified` over any of their locations; ordered by name) and `GET /coffeeshops/{user}` (counts and `locations[]` with coordinates and the business contact). Business data only.
    - The coffee shop's offerings are read with `GET /offerings?coffeeshopUlid=` (existing filter).
  - **Coffee shop detail with two tabs:** "Offerings" (with the catalog's filter bar) and "Locations" (list and map).
  - **Coffee shop sidebar:** "Manage offerings" and "Manage locations"; the second lists one's own locations and allows creating more (`POST /locations`, geocoded in the front). Replaces the idea of the location in the profile.
  - **Personal contact** (`add-user-contact`) stays in the profile.
  - **API style:** the new endpoints copy the schema, the syntax and the in-model query resolution (scopes and `filter()`) of the existing ones.
- **Why:** Product owner's answers of 6 Oct in the evening.
- **Affects:** add-coffeeshop-directory, add-coffeeshop-location ("Manage locations" page), add-offering-management (sidebar entries, task 8: pending Product owner), API add-contacts-and-locations.

### 2026-10-07 — Combobox inside Field (orchestrator, closed for review)
- **Decision:** inside a `Field`, the shared `Combobox` renders no label or help of its own and its input takes the `Field`'s id; outside a `Field` (facet panels) it does not change.
- **Why:** add-offering-management task 6.2 could not be built as written (duplicated, unlinked label); the option keeps the task text and the single-label design.
- **Affects:** add-offering-management (D14, tasks 6.0a/6.0b), add-coffeeshop-location and any future form with a combobox.

### 2026-10-07 — directory map with Leaflet and `perPage` (Product owner)
- **Decision:**
  - The dependency `leaflet@1.9.4` + `@types/leaflet@1.9.22` (BSD-2-Clause) is approved for the coffee shop directory map (add-coffeeshop-directory D16): list/map toggle, map view, map button on the card, full-screen map on mobile, the Locations tab map, and the CSP `img-src` line for the tiles.
  - API: `page` and `perPage` (default 15, maximum 50) on the five paginated lists (hotfix `6eb8d0f`/`e84b444`). Product owner decides not to document it in Scribe: the front treats it as communicated by Product owner, like the nullable `offeringId`. The landing requests `perPage=6` (refine-list-pagination, Q1 option A).
  - `openspec/config.yaml` updated by Product owner (`bbf5e66`): `offering-catalog` includes the directory; `offering-management`, the locations; `user-account`, the contact data.
- **Why:** Product owner's answers of 7 Oct.
- **Affects:** add-coffeeshop-directory (artifact update: map tasks); refine-list-pagination; add-coffeeshop-location; add-user-contact.

### 2026-10-07 — own geocoding and the autonomy mandate (orchestrator, by Product owner's mandate)
- **Decision:**
  - Product owner's mandate (7 Oct, afternoon): the orchestrator settles points autonomously, except those that change what was agreed in a design summary.
  - add-coffeeshop-location Open 5 / D5: geocoding with an own `fetch` to Nominatim in the single entry point `src/shared/lib/geocoding` (option C of the summary), without a new dependency. `leaflet-geosearch` is discarded: it accepts only free text, cannot cancel and does not check the status (verified in the propose). The CSP `connect-src` to Nominatim was already approved (entry "contacts and locations").
  - The en/ca texts proposed in the proposes of 7 Oct (`urlFormatError`, `signedOutText`, `mapLoading`, `locationNoMap`, "Administra les ubicacions") are accepted as they are.
- **Why:** Product owner's mandate; add-coffeeshop-location's summary (Open 5 offers C); the architect's recommendation.
- **Affects:** add-coffeeshop-location (D5 closed; no library task); add-user-contact; add-coffeeshop-directory.

### 2026-10-07 — nothing new in the design and a reduced test suite (Product owner)
- **Decision:**
  - Nothing is added to the design without Product owner's authorisation: work with the current components. Points the orchestrator settles are resolved by choosing among what was already agreed, never by adding. R14 (themed 404 page) stays in the backlog with the lowest priority.
  - Tests: only those that verify the requirements of `openspec/specs/` (simplified, one per scenario) and the project rule guards stay in the repo. Refactor tests are deleted or move to quality. The rest goes to the local folder `Sprint5/tazavera-front-qa` (no remote), is not run on every change and is run once at the end of the project. Each change writes only the tests its tasks name. Before moving anything, a plan with totals (`claude/test-reduction-plan`) for Product owner.
  - OpenCode is not used while the laptop is short of memory; proposes and applies go to the cloud.
- **Why:** Product owner, 7 Oct (about 2,240 unmanageable tests; timeouts under load, R15).
- **Affects:** every open change (build prompts: only the named tests); AGENTS.md `## Testing` (text pending Product owner's application); add-public-evaluations, add-evaluation-facets, add-coffeeshop-location, add-coffeeshop-directory, refine-list-pagination.

### 2026-10-09 — link or action button by position (Product owner)
- **Decision:** the navigation control on the first line of a page header (back, above the title) is a link. Any other navigation control is an action button (`RouteButton`, with the variant per "Action variants by kind"), both in the header after the first line and at the end of the view, the list or the card. The same action in two places uses a single component (e.g. "New offering" in the header and in the empty list).
- **Why:** Product owner, 9 Oct (AUT findings).
- **Affects:** `apply-header-link-rule` and every future view with a header or final actions.

### 2026-10-09 — write permission, `login_hint` and `API_INTERNAL_URL` (Product owner)
- **Decision:** (1) The write permission lasts only as long as the action (option A): the front keeps the previous read token and returns to it on saving, cancelling or leaving the edit or password view. (2) Reading `API_INTERNAL_URL` on the front's server is a deployment matter: it is not launched as a front change. (3) The step-up `login_hint` is implemented in the API: the front sends the expected user's ULID and the API rejects another user before issuing the code. (4) The orchestrator's and the design lead's rules are integrated into `AGENTS.md`, one section per agent plus the common rules, without leaving out or changing any existing rule, and each agent ignores the sections that are not its own. The rules do not name the model or the tool. `.claude/CLAUDE.md` and `.claude/agents/design-lead.md` only point to `AGENTS.md`. Limits checked: OpenSpec does not read `AGENTS.md` (its 50 KB limit is for `context` in `openspec/config.yaml`); OpenCode documents no limit and loads the whole file in every session.
- **Why:** Product owner, 9 Oct.
- **Affects:** `secure-step-up` and the next step-up change (auth, user-account), `tazavera-api` (`login_hint`), `AGENTS.md`.

### 2026-10-09 — orchestrator autonomy (Product owner)
- **Decision:** the orchestrator decides on its own everything that does not change the requested behaviour (archives, integrations, gates, limits, work order, artifact wording), records it here or on the board and acts without asking. It only asks when the decision changes what the user sees or what was asked. First application: `open-security-pages-in-popup` no longer waits for the browser test and is archived as fast lane (full checks and verify without CRITICAL).
- **Why:** Product owner, 9 Oct ("you are autonomous to make decision if it does not change the expected behavior requested").
- **Affects:** every orchestrator decision; `open-security-pages-in-popup`.

### 2026-10-12 — the front is the API's only door (R74, Product owner; replaces the 2026-10-09 entry on `API_INTERNAL_URL`)
- **Decision:** the build environment is a server with a single public entry (the ngrok URL) that leads to the front. The front forwards to the API, through `API_INTERNAL_URL` (server only, required, no fallback): the API's web routes on the same path (`/oauth/authorize`, Fortify, `/user/security` and its actions, `/passkeys/*`, and their assets `/build`, `/flux`, `/livewire-*`) and, under the `/api` prefix that the proxy strips, `/oauth/token` and every JSON call (including `/logout`). `NEXT_PUBLIC_API_URL` = `{NEXT_PUBLIC_APP_URL}/api`; `connect-src 'self'` + Nominatim. The API has no public address. API settings (Product owner's): `APP_URL` and `FRONT_URL` = the public origin; `TRUSTED_PROXIES` = the front's address; `SESSION_DOMAIN` empty; secure cookies; `expose_php=Off`; seeders run with the configuration in place (OAuth client callback `{public origin}/callback`). Local tests serve the front over https with Caddy; Caddy has no role in deployment. There is no demo environment in the design: only the build environment.
- **Why:** Product owner, 12 Oct (option A: "the front will also forward all the web routes"; "there is no demo environment for our design purpose, it is just the build environment").
- **Affects:** `route-api-web-pages-through-front` (approved summary `4e02d8c3`); auth and app-shell; the deployment documentation (summary given to Product owner for the deployment assistant); R1 goes after.

### 2026-10-12 — autonomous night, API branches from `deploy` and the design lead's tests (Product owner)
- **Decision:** (1) tonight the orchestrator works autonomously until R76–R82 and R81 are on `develop`, and at the end the front's README in the style of the API's README; (2) today's API changes (coffee shop business name, option A: column `users.business_name`; web pages bound to the `login_hint` user) start from the API's `deploy` branch and merge into `deploy`, locally and on GitHub; (3) visual and browser tests are done by the design lead locally; (4) R74's ngrok tests are OK; (5) after a registration with a session, the user goes to the landing (R78).
- **Why:** Product owner, 12 Oct ("let's go with A, create the branch from deploy", "apply the proposed fix", "all tests will be done by the design lead locally", "record that tonight you will be autonomous").
- **Affects:** R76–R82, R81, the front's README; `tazavera-api` `deploy`; R74 (verify and archive still wait for his explicit OK).

### 2026-11-05 — English as the working language (Product owner)
- **Decision:** every record and artifact is written in English, including the board, this general context and its decisions log (translated on this date without changing any entry's content). Interface texts stay in their es/en/ca catalogs. The log's heading is now "Orchestrator decisions log".
- **Why:** Product owner, 2026-11-05 ("make english our working language"; option A).
- **Affects:** every agent and record; `docs/agents/orchestrator.md` §12 names the log by its old Spanish heading (Product owner updates it).

### 2026-11-05 — the board holds only unresolved items (Product owner)
- **Decision:** the board keeps only open changes, the questions waiting for Product owner and the contract coverage; a change leaves the board when it is merged, and its decisions stay in its archive, its handoff and this log.
- **Why:** Product owner, 2026-11-05 ("leave only not resolved issues").
- **Affects:** `docs/design/change-progress.md`; every session's board updates.

### 2026-11-05 — active log and archive (Product owner)
- **Decision:** the decisions log is split: the active log here keeps the decisions that still affect open work and the standing working agreements; entries whose decisions are reflected in archived changes move, unchanged, to `docs/design/decisions-archive.md`, which is not read at session start. Nothing is deleted. First cleaning on this date: 60 moved, 19 kept; in doubt, kept.
- **Why:** Product owner, 2026-11-05 ("lets take the split approach active + archive log file").
- **Affects:** `docs/agents/orchestrator.md` §12 and start checklist step 4 (Product owner updates them); every session's start reading.

### 2026-11-12 — the orchestrator merges into `develop` (Product owner)
- **Decision:** the orchestrator (and a cloud integration session acting for it) may merge `develop` into a feature branch and a finished feature branch into `develop`, and push both; Product owner handles the rest (`master`, `release/*`, `hotfix/*`, and settling the wording of the rules). It also deletes integrated branches and worktrees (Product owner, same day).
- **Why:** Product owner, 2026-11-12 ("si como orchestrador puedes hacer merge a develop, yo me encargo del resto"), answering board item 8 (the Common rules forbid agent merges while `docs/agents/orchestrator.md` §6 step 7 and §9 prescribe them).
- **Affects:** every integration; `AGENTS.md` "Git Flow and Commits" and `docs/agents/orchestrator.md` (Product owner's files, wording unchanged).

### 2026-11-12 — `@playwright/test` and its HTML report (Product owner)
- **Decision:** the new development dependency `@playwright/test` is approved at an exact version, Chromium only (R1 `add-locale-e2e-test`, Open 1 A); the suite's reporters are `list` and `html` (`playwright-report/`, never opened automatically), and the orchestrator reports each run's output to Product owner. The version follows the Chromium revision the cloud image ships (orchestrator's decision in the propose prompt: 1.63.0 for revision 1243).
- **Why:** Product owner, 2026-11-12 ("si apruebo"; "ma haces un informe de salida de los test playwright?" … "cuando termines").
- **Affects:** `add-locale-e2e-test`; `AGENTS.md` → Dependencies and Testing (Product owner's files: "two suites" will read stale after the archive).
