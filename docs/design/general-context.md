# General context — tazavera-front

The orchestrator's context for resuming work. Kept by the orchestrator (`docs/agents/orchestrator.md`, §12): rewritten in place to stay current, except the decisions log at the end, which is append-only. Sources of truth this file does not repeat:
- `docs/design/change-progress.md` (the board): phase, assignee and blocker of every open change, and the contract coverage.
- `docs/design/backlog.md`: refactor candidates and accepted entries, used by the agents as the workflow says.
- `docs/agents/workflow_sdd.md`: the process (SDD with OpenSpec): traditional workflow, fast lane and findings.
- `AGENTS.md`: the common rules and the table of role files; each role's rules are in `docs/agents/` and each agent reads only its own. The files in `.claude/` only point to the role files.
- Each change's `handoff.md` and `corrections.md`.

**Working language:** English for every record and artifact (Product owner, 2026-11-05). Interface texts stay in their catalogs (`messages/{es,en,ca}`).

**Updated:** 2026-11-05.

## On resuming

- **First step, always:** the start checklist of `docs/agents/orchestrator.md` before any answer. The assignment loop dies with each session.
- The design lead subagent is not registered when the session starts in `Sprint5`, and `.claude/agents/design-lead.md` was missing in the 2026-11-05 sessions: without it, the design lead's steps cannot run locally (Product owner to add the file).
- **Commands:** never `cd`; one command per call, with `git -C <dir>` and `env -C <dir> <command>`; files are read with the Read, Grep and Glob tools. A chained `cd …;` command always asks for permission, whatever the allow list says.
- `tazavera-front-qa` is a separate folder (its own `.git`), not a worktree: do not touch it.

## Current state (2026-11-05)

- Only **R91 `add-register-landing`** is in progress (traditional workflow), phase **Artifact review**: next steps on the board. Worktree `tazavera-front-register-landing`, with `npm install`; `.env.local` and the restricted OpenCode profile not copied yet (Product owner names the sources).
- Then R45 (after R91 reaches `develop`).

## Permissions (2026-11-05)

- The session runs in `default` mode so that cloud routines can be created (`RemoteTrigger` `create` was denied in "don't ask" mode, three times, even with `RemoteTrigger` allowed). Not yet retested in `default` mode.
- Both `.claude/settings.local.json` files still point to the old path `C:/Porjects/...` (`additionalDirectories` and the `php artisan` rule). The corrected file was given to Product owner in the 2026-11-05 session.

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

Append only (`docs/agents/orchestrator.md` §12). One entry per orchestrator decision, or Product owner answer, that affects another change or a design. "Affects" names the changes and the design points. Entries before 2026-11-05 were translated from Spanish on that date, without changing their content.

### 2026-10-05 — add-auth
- **Decision:** the session hook point in `src/app/shell` is a new `SessionShell.tsx` (`"use client"`). It calls `useSession()` and renders `ShellChrome` and the sidebar region. `AppShell.tsx` stays a Server Component: it resolves the catalog texts and passes them to `SessionShell`, together with the `session?` override.
- **Why:** Product owner's answer to Q12–Q14, add-auth round 2 (`dd8b126`).
- **Affects:** refine-app-header (already merged; the language selector's name is composed in `AppShell.tsx`).

### 2026-10-06 — add-landing / refine-app-header → add-auth (Q-merge)
- **Decision:** when auth merges `develop`, two things must be kept:
  - the header shell height fix (`cd536d2`, test `2d0da3f`), carried from the classes of `AppShell.tsx` to `SessionShell.tsx`;
  - the landing filler child in `AppShell.test.tsx`.

  The conflict is not resolved by taking auth's side. `src/shared/api/index.ts` merges on its own; run `tsc` afterwards.
- **Why:** merge simulation (`git merge-tree`) of 6 Oct; approved by Product owner.
- **Affects:** add-auth.

### 2026-10-06 — add-landing (D14)
- **Decision:** common page layout: full-width sections, a centred container of at most 72rem, side padding 1rem/2rem, vertical padding 3rem/4rem, and explicit gaps between groups.
- **Why:** add-landing round 3.
- **Affects:** every new page design (offering-catalog, user-account, evaluations).

### 2026-10-06 — contract coverage
- **Decision:** `GET /coffees` and `GET /roasteries` are consumed by `add-offering-management` (offering creation) and `add-filter-controls` (offering list filters).
- **Why:** Product owner's answer of 6 Oct.
- **Affects:** add-offering-management, add-filter-controls, add-offering-catalog (the list that hosts those filters).

### 2026-10-06 — filters (decisions of 10-03 and Product owner's answer)
- **Decision:** filters are Amazon-style facets in the sidebar (`inverse` controls), full screen on mobile with the sidebar styles, and the sort order in the page body. A collapsed sidebar hides the filters. The MVC filter bars are not a reference. The sidebar appears only where needed: the offering list (public, any visitor) and the evaluation list (management route, specialists only). Requires an `app-shell` delta inside `add-filter-controls`.
- **Why:** `bycoding/contexto_diseño_claude_1003.md` §5–§6 and Product owner's answer of 6 Oct.
- **Affects:** add-filter-controls (redone), add-offering-catalog (the body's filter slot holds only the bar with the Filters button and the sort; the grid coexists with the sidebar), add-specialist-evaluations (facets in its list's sidebar), add-offering-management Open 1 (sidebar entries).

### 2026-10-06 — access to protected routes
- **Decision:** on `/manage/evaluations*`, a visitor without a session signs in and returns to the route; a user without the right role sees the 404 page.
- **Why:** Product owner's answer to point 9 of add-specialist-evaluations.
- **Affects:** add-offering-management Open 5, add-user-account Open 5 (pending proposal S2: the popup needs a click, so an automatic "sign in" is a redirect).

### 2026-10-06 — refactors first
- **Decision:** three new changes go before their consumers: `refactor-badge-geometry` (feedback, R6) exposes the badge geometry; `fix-button-boundaries` (base-controls) adds a 1px border with existing colours to the Button variants that do not reach 3:1; `extract-offering-list-parts` (content-structure, R7) moves the taxonomy read and lookup to `entities/taxonomy` and the pagination to `shared/ui` with `path` and `query` props.
- **Why:** Product owner's answers to scales Open 3 and 6 and evaluations Open 13; name and open points settled by the orchestrator.
- **Affects:** add-evaluation-scales, add-specialist-evaluations, add-offering-catalog, add-filter-controls, add-offering-management (everything that uses badges, buttons, taxonomies or pagination).

### 2026-10-06 — writes, protected routes and 422 (Product owner's answers)
- **Decision:**
  - Reactive step-up: the write is sent with the current token; on a `403` the step-up notice is shown and the user repeats the action after confirming.
  - Protected route without a session: with `loading`, wait; with `anonymous`, the page calls `signIn(currentRoute)` without a click, which ends in add-auth's full redirect (correction 3) and returns to the route. User without the role: 404 page (previous entry).
  - Any 422 shows the form's generic error; per-field mapping stays in the backlog (R8).
- **Why:** Product owner's answers of 6 Oct to proposals 1–3.
- **Affects:** add-user-account Open 1, 2 and 5; add-offering-management Open 5, 6 and 7; add-specialist-evaluations (point 9 and the writes entry).

### 2026-10-06 — shared section primitive (Product owner's answer)
- **Decision:** a refactor change in `content-structure` extracts the D14 section and container classes (today copied in `HomeScreen.tsx` and `AboutContent.tsx`) into a shared primitive, and Home and About adopt it. It goes before the features that add pages.
- **Why:** Product owner's answer to proposal 4.
- **Affects:** add-user-account Open 8, add-offering-management Open 4, add-offering-catalog Open 2.

### 2026-10-06 — `OfferingCard` action slot (Product owner's answer)
- **Decision:** a refactor change in `landing` replaces `OfferingCard`'s `session` prop with an action slot filled by whoever uses the card. It goes before the features that use it.
- **Why:** Product owner's answer to proposal 5.
- **Affects:** add-offering-management Open 2 (checkbox and Delete), add-specialist-evaluations §8 (only provides `EvaluateLink`), add-offering-catalog (the catalog cards).

### 2026-10-06 — profile refresh in the session (Product owner's answer)
- **Decision:** add-auth exposes `refreshProfile()`: it requests `GET /user` again (the only source of user data, D5) and updates the session; the `PUT` response is not written to the session. On a network error or 5xx it retries once after a short pause; if it fails again, the session keeps the previous user, with no message. The `401` is already recovered by add-auth's client.
- **Why:** Product owner's answer to proposal 6.
- **Affects:** add-user-account Open 7; add-auth (session module, `src/features/auth`).

### 2026-10-06 — combobox library (Product owner's answer)
- **Decision:** the combobox is shadcn/ui's (Radix Popover + `cmdk`), styled with tokens; new dependency approved. The architect checks `cmdk`'s maintenance and size when proposing.
- **Why:** Product owner's answer to add-filter-controls Open 1.
- **Affects:** add-filter-controls (Producer and Roaster facets); any future change that needs a combobox.

### 2026-10-06 — add-filter-controls: remaining points (Product owner's answer)
- **Decision:** every recommendation of the summary is accepted. Those that touch other changes:
  - the `@sidebar` slot (parallel route in `app/[locale]/`) is the shell's mechanism for a route to put content in the sidebar;
  - sidebar defects F1 and F2 are fixed in this change's app-shell delta;
  - facet rows add a row presentation to `Checkbox` and `RadioGroup` (form-fields delta in this change);
  - checkbox and radio border on selected rows with `nav-button-border`; hover without a background change;
  - the `primary` border in dark (F6) goes to a separate base-controls change;
  - the catalog grid with the sidebar open is decided by `add-offering-catalog` (columns by available width);
  - the score range accepts, besides the slider, typing the minimum and maximum in two "From / To" fields synced with it (point 15, to be detailed);
  - comboboxes with API data search while typing (`?name=`), from the browser: an accepted exception to the server-loading rule for public endpoints. It applies to Roaster and to offering creation in offering-management (one combobox over `GET /coffeeInventory?coffeeName=` replaces the roaster and coffee selects and the inventory radios; management stops consuming `listCoffees` and `listRoasteries`). The combobox is generic and reusable (`shared/ui`, built by filter-controls); each consumer passes it the search and the row content. Producer still loads once (point 16). Own hook (`fetch` + `AbortController` + 300 ms debounce), no data library; combobox texts from the es/en/ca catalog.
- **Why:** Product owner's answer to add-filter-controls Open 2–16.
- **Affects:** add-offering-management Open 1 (sidebar entries, same slot), add-offering-catalog (grid, point 14), add-specialist-evaluations (its list's facets), fix-button-boundaries (F6).

### 2026-10-06 — shared chip geometry (Product owner's answer)
- **Decision:** `refactor-badge-geometry` does not add the test of the "Chip matches the badge geometry" scenario (verify WARNING): no chip consumes it yet. The first change that creates a chip starts from `BADGE_GEOMETRY_CLASSES` (`@/shared/ui`), adds that scenario's test and declares its differences (radius, height, padding, gap, typography) as treatments on top of those classes, never as a second geometry.
- **Why:** Product owner's answer to the WARNING of refactor-badge-geometry's verify.
- **Affects:** add-filter-controls §6.2 "Chip" and §9.2 (applied chips); add-evaluation-scales (unselected descriptor chip).

### 2026-10-06 — extracted pieces available (extract-offering-list-parts)
- **Decision:** the taxonomy read and lookup live in `src/entities/taxonomy` (`fetchTaxonomies`, `buildTaxonomyLookup`) and pagination is `Pagination` from `@/shared/ui` (props `path`, `query`, `currentPage`, `lastPage`, texts). New designs consume them; nobody copies them again from `widgets/offering-list`.
- **Why:** extract-offering-list-parts tasks 1.1–4.1 done (`7e6b777`).
- **Affects:** add-filter-controls §9.2 (flavour cascade), add-specialist-evaluations, add-offering-catalog, add-offering-management.

### 2026-10-06 — protected routes without a session: message with a button (Product owner's answer)
- **Decision:** replaces the "protected route without a session" part of the entry "writes, protected routes and 422". With `loading`, wait; with `anonymous`, the page shows a message and a "Sign in" button that calls `signIn(currentRoute)` inside the click (popup; the user stays on the route). No automatic redirect. User without the role: 404 page. Also, `/[locale]/register*` with an `authenticated` session goes to the home page by client-side navigation.
- **Why:** Product owner's answer: the message tells the user what is happening.
- **Affects:** add-user-account Open 4 and 5, add-offering-management Open 5, add-specialist-evaluations point 9.

### 2026-10-06 — single account page (Product owner's answer)
- **Decision:** the account is one page `/[locale]/account` with sections (Profile, Password, Security as an external link to `{API}/user/security`, and "Danger zone" with Deactivate and Delete). The user menu replaces its five account entries with a single "My account"; Security stays as an external entry. What lives in the API (security, password recovery) stays in the API.
- **Why:** Product owner's answer to add-user-account Open 6.
- **Affects:** add-user-account (app-shell delta on `UserMenu.tsx`); any change that links to the account routes.

### 2026-10-06 — form validation in the browser (Product owner's answer)
- **Decision:** forms are `noValidate` and, before submitting, the front validates only what each operation's `requestBody` documents in the contract (required fields, email format, matching confirmation, enums and maximum lengths), with catalog messages under each `Field`. What the contract does not detail (password strength, uniqueness, current password) is validated by the API, with the generic 422 until R8 documents the 422.
- **Why:** Product owner's answer to add-user-account Open 9; Scribe documents the FormRequest rules in the `requestBody`, but not the 422 response.
- **Affects:** add-user-account, add-offering-management, add-specialist-evaluations (all their forms).

### 2026-10-06 — management sidebar entries (Product owner's answer)
- **Decision:** each management area puts its entries in the sidebar with the same `@sidebar` slot as add-filter-controls (one mechanism for facets and entries). `SidebarMenuButton` gains a link form (`asChild`), which fixes F5.
- **Why:** Product owner's answer to add-offering-management Open 1.
- **Affects:** add-offering-management, add-specialist-evaluations point 10, add-filter-controls (owner of the slot).

### 2026-10-06 — offerings request with a query (Product owner's answer)
- **Decision:** `add-offering-catalog` generalises the offerings request so it accepts a query; landing calls it with `verified=1` without changing its behaviour and the catalog with the URL's query. Pagination and taxonomies are already extracted (extract-offering-list-parts), so offering-management Open 3 is covered.
- **Why:** Product owner's answer to add-offering-catalog Open 1.
- **Affects:** add-offering-catalog, add-offering-management Open 3, add-filter-controls (the list it filters).

### 2026-10-06 — tokens against the local API over HTTP (Product owner's answer)
- **Decision:** `oauth4webapi` rejects non-HTTPS requests by default, so sign-in did not complete against `http://localhost:8000`. Both token requests (`exchangeCode`, `refreshTokens` in `src/shared/api/tokens.ts`) use `allowInsecureRequests` only when `NODE_ENV !== "production"`; production still requires HTTPS. add-auth fix F3 in the cloud (`trig_01KCuPWQTXgQYqUshCkLMiPx`, branch `claude/add-auth-f3`).
- **Why:** Product owner's answer (option a) to WARNING W1 of add-auth's verify after `4ac8129`.
- **Affects:** add-auth; every change that tests sign-in locally (user-account, offering-management, specialist-evaluations).

### 2026-10-06 — API CORS for the browser (finding, pending Product owner in the API)
- **Decision:** real sign-in fails in the browser because `POST /oauth/token` from `http://localhost:3000` gets no `Access-Control-Allow-Origin` (Product owner's console: "blocked by CORS policy"). Cause in `tazavera-api`: routes without a prefix (`bootstrap/app.php`, `apiPrefix: ''`) and no `config/cors.php`, so Laravel's default CORS only covers `api/*`. The fix goes in the API (publish `config/cors.php` with the routes the browser calls and `allowed_origins` = `FRONT_URL`, without credentials); the front does not change. Until then, every browser call to the API fails.
- **Why:** browser test of add-auth (8.17 bis) with `php artisan serve`, user `edwin.specialist@tazavera.test`.
- **Affects:** add-auth (browser test and archive), add-user-account, add-specialist-evaluations, add-offering-management, add-filter-controls (combobox with `?name=` from the browser).

### 2026-10-06 — SCA averages in the detail with the bean scale (Product owner's answer)
- **Decision:** the attribute averages (1–9) in the offering detail are shown with add-evaluation-scales' read-only bean scale (one decimal, geometric cut, value also as text). add-offering-catalog goes after add-evaluation-scales is merged.
- **Why:** Product owner's answer to add-offering-catalog Open 5.
- **Affects:** add-offering-catalog (new dependency), add-evaluation-scales (new consumer of the `readOnly` mode).

### 2026-10-06 — offering detail tabs (Product owner's answer)
- **Decision:** the detail has the header with the record (as in the MVC) and tabs below (shadcn/Radix Tabs): "Inventory data" and "Consensus"; the active tab is in the URL (`?tab=`). A third tab with the offering's provisional evaluation, shown as the evaluation form in read-only mode, is left for a later change: it needs the API to expose that evaluation.
- **Why:** Product owner's answer to add-offering-catalog Open 6.
- **Affects:** add-offering-catalog; add-specialist-evaluations (its read-only view would be the base of the future tab).

### 2026-10-06 — style of the future provisional-evaluation tab (Product owner's answer)
- **Decision:** replaces the read-only form idea of the previous entry: the future provisional-evaluation tab will use the same style as Consensus (read-only bean scales and the same layout). Product owner will create the provisional evaluation seeders.
- **Why:** Product owner's answer on add-offering-catalog Open 6.
- **Affects:** the later add-offering-catalog change (third tab); it no longer depends on add-specialist-evaluations' read-only view.

### 2026-10-06 — landing D4: rating badge text (Product owner's answer)
- **Decision:** the offering card's rating badge stops repeating `cuppingAvg` and shows a level word by score (for example "Exceptional", "Excellent", "Very good"), with es/en/ca catalog texts. The number is still shown once (`type-score`). The ranges follow the SCA scale and must be checked at the source before propose (unverified proposal: 90+ exceptional, 85–89.99 excellent, 80–84.99 very good), together with what is shown below 80 and without a score. Landing is merged: it is a new change on the card.
- **Why:** Product owner's answer to landing D4 (Q17).
- **Affects:** the offering card (`OfferingCard`, landing capability) and everything that reuses it (catalog, management); the `OfferingCard` slot refactor touches the same card.

### 2026-10-06 — landing D4: values confirmed against the MVC (decision delegated by Product owner)
- **Decision:** refines the previous entry. The words are the MVC's (`offeringcard.blade.php:20-36`): Exceptional (≥ 90), Excellent (85–89.99), Good (80–84.99), Commercial (< 80); without a score there is no badge (current behaviour). The ranges and the four variants already exist in the front (`ratingTierFor`, `Badge`). New change `label-rating-badge`, summary approved in `docs/design/label-rating-badge/`.
- **Why:** Product owner delegated the decision ("check the MVC and confirm").
- **Affects:** label-rating-badge; the `OfferingCard` slot refactor (same card).

### 2026-10-06 — authenticated evaluation reads (Product owner's answer to evaluations B1)
- **Decision:** the API moves `GET /evaluations` and `GET /evaluations/{ulid}` to the authenticated specialist group; the list returns only the token user's and the detail answers 403/404 if it is not theirs. Product owner documents it in Scribe and regenerates the contract. In the front, list and edit load on the client with the token, without `evaluatorId`; no read-only view for non-owners (404 page); the read-only view is for one's own closed evaluations. The provisional evaluation is defined with the offering and will come inside `GET /offerings/{ulid}`: no public evaluation read is needed.
- **Why:** Product owner's answer to B1 of add-specialist-evaluations' explore (the resource has no owner).
- **Affects:** add-specialist-evaluations (point 6 and propose, which waits for the contract), add-filter-controls (evaluation facets: no `evaluatorId`), add-offering-catalog (future provisional tab), contract coverage.

### 2026-10-06 — evaluation reads: final decision (Product owner's answer)
- **Decision:** replaces the previous entry ("authenticated evaluation reads"), which contradicted the API design (`tazavera-documentation/end-points.md`: public evaluation reads; the provisional one is a coffee shop `baseline` evaluation). Public reads stay public and anonymous. New `UserEvaluationController` in the API (branch `feature/user_evaluations`): `/user/evaluations` list, detail, create, update, close and delete, only for the token's user (someone else's → 404); the previous write routes stay active (`legacy.*`, outside the documentation). New public `GET /users/{user}/evaluations`. Contract regenerated in English and front types regenerated (not committed on `develop`, waiting for the API branch merge).
- **Why:** Product owner's answer to B1 after reviewing the API design and security (do not expose the evaluator in public responses).
- **Affects:** add-specialist-evaluations (list and edit over `/user/evaluations…`, no read-only view for non-owners), add-filter-controls (evaluation facets over `listMyEvaluations`), contract coverage (new operations `listMyEvaluations`, `getMyEvaluation`, `listTheEvaluationsOfAUser`).

### 2026-10-06 — add-specialist-evaluations: explore questions (Product owner's answers)
- **Decision:**
  - Q1 403: one's own evaluations need neither `profile:write` nor step-up. The view only shows the user's; if a write returns 403 (someone else's request sent from outside), the "not yours" message is shown, without asking to sign in. For this change it replaces the reactive step-up of the entry "writes, protected routes and 422".
  - Q3 row date: open → "Created on" `createdAt`; closed → "Closed on" `closedAt`; in `type-meta` under the coffee name.
  - Q5 "Complete" per group: a score group is complete with all its scores; the descriptor of the fragrance/aroma/flavour/aftertaste set is a single requirement shared between those groups; Defects and Extrinsics without an indicator.
  - Q2 entry: "My evaluations" in the user menu (already exists, `UserMenu.tsx`) leads to `/manage/evaluations`, where the existing management sidebar is shown with its entry. No dependency on add-filter-controls' `@sidebar` slot.
  - Q4 default order `created_at desc` and Q6 propose now (orchestrator).
- **Why:** Product owner's answers of 6 Oct to the explore questions.
- **Affects:** add-specialist-evaluations (propose); add-filter-controls (evaluations no longer needs the slot); add-user-account and add-offering-management (reactive step-up still applies to them).

### 2026-10-06 — catalog: detail and consensus; filters: cascade and split (Product owner's answers)
- **Decision:**
  - Detail header without a score. The score lives in the "Consensus" tab (the offering's `cuppingAvg`, the same as the card's, only if the offering is verified) and in the future provisional-evaluation tab.
  - The tree cards (`sensoryTaxonomy`, `cataConcordance`) are replaced by an interactive **SCA-style flavour wheel** (sunburst): it expands from the centre outwards by level; each segment's legend is "evaluators who identify the note / total evaluators" (e.g. 4/5); hovering (and keyboard focus) on a segment shows the olfactory taxonomy description. Own SVG component (no new dependency; orchestrator's decision).
  - Defects and main tastes: the evaluation's selection components are reused (read-only) and the consensus legend is added next to each card.
  - Concordance (0–1, `max(0, 1 − σ/σmax)` per axis in `OfferingConsensusService`): named scale after Koo and Li (2016): < 0.50 "Low", 0.50–0.75 "Moderate", 0.75–0.90 "High", ≥ 0.90 "Excellent"; the value is also shown as text (never colour alone).
  - Q1 rest and Q2 (`LabelValueRow` and `Tabs` in `shared/ui`, content-structure) accepted as the orchestrator recommended.
  - Filters F1: checking a parent adds the parent and its descendants; checking a child without its parent sends only that child. F2: (a) a shell control to expand the collapsed sidebar (taken by the orchestrator; Product owner accepted the rest). F3: split into four changes — `add-sidebar-slot` (app-shell), `add-facet-controls` (filtering, form-fields), `add-offering-facets` (after catalog), `add-evaluation-facets` (after evaluations) — and finish them today with every executor.
- **Why:** Product owner's answers of 6 Oct to the catalog and filter-controls explore questions; concordance scale: Koo and Li (2016), 0–1 agreement coefficient bands.
- **Affects:** add-offering-catalog (detail, consensus, new wheel component), add-filter-controls (replaced by the four changes), add-public-evaluations (could reuse the wheel).

### 2026-10-06 — public evaluations out of scope (Product owner's answer)
- **Decision:** the public view of evaluations is "Top rated": `add-offering-catalog`'s list of verified offerings ordered by score (header entry, `verified=1&orderBy=cupping_avg&orderDirection=desc`). A specialist's public page (seeing another specialist's evaluations) is out of the current scope. `add-public-evaluations` is withdrawn without propose. `listEvaluations`, `getAnEvaluation` and `listTheEvaluationsOfAUser` have no consumer in this delivery.
- **Why:** Product owner's answer to the two questions of the add-public-evaluations draft.
- **Affects:** add-offering-catalog ("Top rated"), contract coverage (three public evaluation operations out of scope).

### 2026-10-06 — add-user-account: explore blockers (decided by the orchestrator in Product owner's absence)
- **Decision:** B1: the screens of `src/pages/register` and `src/pages/account` inject the session and the auth actions (`signIn`, `signOut`, `requestProfileWrite`, `refreshProfile`) as props into the components of `src/features/user-account`, as `SessionShell` does with `AppHeader`; no feature imports another feature; `features/user-account` stays one slice. B2: the rule "form validation in the browser" holds: `updateAUser` documents no required fields, so the profile only validates the email format; an emptied field comes back as the generic 422 error.
- **Why:** Product owner delegated resolving what could be resolved during his break ("if you can resolve it, resolve it"); B1 follows the shell precedent and FSD; B2 follows his recorded rule. Product owner may reopen it.
- **Affects:** add-user-account; add-offering-management and add-specialist-evaluations (same injection pattern if their features need auth actions).

### 2026-10-06 — add-offering-management: explore points (decided by the orchestrator in Product owner's absence)
- **Decision:** Q1 Open 23 (c): after choosing the inventory item, `roastLot · productionDate` is shown as the field's help. Q2 grid next to the sidebar: (a) 1 / 2 from `lg` / 3 from `2xl`. Q3 one's own list (grid, cards, skeletons) is composed in `src/pages/manage-offerings` with the feature's state and actions; nothing moves out of `widgets/offering-list`. Q4/Q5 in design.md (state without a session on the form route; a single `role="alert"` region in the dialog's `error` slot). Q6 selection of the current page only. B7: "My offerings"' `listOfferings` is requested on the client with `publicRequest` because the filter is the session's `ulid` (browser only): second accepted exception to server loading of public endpoints.
- **Requirements for the filter changes:** `add-facet-controls`: the combobox accepts `Input`'s `variant` (default as well as inverse). `add-sidebar-slot`: the entries' label on hover uses `nav-text-hover` and the sidebar stays under `variant-inverse` for the focus ring (filter-controls F3 = management F2).
- **Why:** Product owner's delegation during his break; recommendations of the explore and the design lead.
- **Affects:** add-offering-management, add-facet-controls, add-sidebar-slot.

### 2026-10-06 — filters: questions from the cloud explores (decided by the orchestrator in Product owner's absence)
- **Decision:** add-facet-controls Q1 cascade: option (a). Each parent row has its own expand/collapse control, separate from its checkbox, and a child can be checked without its parent, as Product owner's F1 answer asks. Checkboxes are independent: checking or unchecking the parent does not change the children, and checking every child does not check the parent. Children are hidden only when the user collapses the row, and a row with any checked descendant starts expanded. Q2: `cmdk` stays (approved dependency), with the fix inside the component: cmdk's `label` receives the label text, and `aria-expanded` and the label's `for` are set on the input after render. It stays as a risk in design.md. add-sidebar-slot Q1: `SidebarProvider` moves up to `SessionShell`, each route's sidebar reports through the context that it exists, and the shell shows the reopen control (`PanelLeft`, `nav-button` button with an accessible name) only on routes that have a sidebar. The other points of the three routines take the architect's recommendation.
- **Coexistence:** add-specialist-evaluations (D5) fills app-shell's sidebar `entries` slot by role from `SessionShell`, and add-offering-management uses `@sidebar`. add-sidebar-slot must keep both ways compatible.
- **Why:** Product owner's delegation during his break.
- **Affects:** add-facet-controls, add-sidebar-slot, add-offering-facets, add-evaluation-facets, add-specialist-evaluations, add-offering-management.

### 2026-10-06 — add-offering-catalog: propose questions (decided by the orchestrator in Product owner's absence)
- **Decision:** 1. The change is not split: the apply goes task by task, one run per task, so the session size does not limit it; the boundary between groups 6 and 7–9 stays as a cut point if needed. 2. The consensus legend of Defects and Main tastes is one `type-meta` line per identified note, `{name} {n}/{total}`, and does not appear if the group is empty (design.md D13), like the wheel's legend. 3. `FlavorWheel`'s props are those of add-flavor-wheel's approved summary (`nodes`, `total`, `texts`, plus `buildFlavorWheelNodes` in `entities/taxonomy`); catalog's call (D14) adapts to them in its apply.
- **Why:** Product owner's delegation during his break.
- **Affects:** add-offering-catalog, add-flavor-wheel.

### 2026-10-06 — public evaluations and provisional evaluation (Product owner's answer; corrects "public evaluations out of scope")
- **Decision:** the entry "public evaluations out of scope" misread Product owner's answer. "Top rated" is still `add-offering-catalog`'s offering list, but the **public evaluation list exists and is in scope**. Option (b):
  - The offering detail has a "See evaluations" button that opens the public evaluation list with that offering's filter active in the sidebar.
  - The detail also has a "Provisional evaluation" tab that shows the coffee shop's `baseline` evaluation (`GET /evaluations?offeringId=<ulid>&evaluationType=baseline`).
  - `listEvaluations` and `getAnEvaluation` have a consumer again. `listTheEvaluationsOfAUser` (a specialist's public page) stays out of scope.
- **API change, new and in design:**
  - a seeder that creates at least 3 offerings per coffee shop and one closed `baseline` evaluation per offering (`evaluator_id` = the coffee shop, created with `EvaluationFactory`);
  - the `offeringId` and `evaluationType` scopes in `Evaluation::filter()`, on `GET /evaluations`, `GET /users/{user}/evaluations` and `GET /user/evaluations`.
  - Baseline uniqueness is guaranteed only by the seeder: the coffee shop baseline endpoint stays in the API backlog (MVC `casos de uso.md:3`, API README). The resource does not change, because it already exposes `offeringId` and `evaluationType`.
- **Pending:**
  - whether the button and the tab go into `add-offering-catalog` or a separate change;
  - the name of the API change;
  - whether the seeder hooks into `DatabaseSeeder`.
- **Why:** Product owner's answers of 6 Oct (option b) and the MVC design documents (`Diseño.md:96`, `:104`; `casos de uso.md:3`, `:100`).
- **Affects:** add-public-evaluations (recovered), add-offering-catalog (detail: button and tab), add-flavor-wheel (possible consumer in the public list), contract coverage, new API change.

### 2026-10-06 — API add-offering-baseline-seed: final design, integrated (Product owner's answers)
- **Decision:** the API change is merged into `dev` and `PROD` (`4878ca5`). Contract and types updated in the front (`92328fc`).
  - **Filters:** `offeringId` and `evaluationType` (`specialist` | `baseline`) on `GET /evaluations`, `GET /users/{user}/evaluations` and `GET /user/evaluations`. The resource does not change.
  - **Default behaviour (1a):** the API keeps returning both types. The front's public list always sends `evaluationType=specialist`, and the provisional tab sends `evaluationType=baseline`.
  - **Seeders, called from `DatabaseSeeder`:**
    - `OfferingBaselineSeeder`: between 1 and 5 offerings per coffee shop, each with its closed baseline (`evaluator_id` = the coffee shop);
    - `VerifiedOfferingSeeder`: 15 offerings with between 5 and 9 evaluations from 10 specialists, with `EvaluationClosed` per offering so the consensus is computed.
    - Local result: 73 offerings, 15 verified, 73 baselines.
  - `GetAnOfferingSeeder` and `CreateOfferingSeeder` are kept. No new tests.
  - The baseline stays in the API backlog only as a creation endpoint.
- **Sample data:** `migrate:fresh --seed` recreates the front's OAuth client, so `NEXT_PUBLIC_OAUTH_CLIENT_ID` must be updated in every `.env.local` after seeding.
- **Why:** Product owner's answers of 6 Oct.
- **Affects:** add-public-evaluations, add-offering-catalog (provisional tab and button), every browser test with data (there are verified offerings now).

### 2026-10-06 — add-public-evaluations approved and shared pieces (decided by the orchestrator in Product owner's absence)
- **Decision:**
  - **`add-public-evaluations` summary approved** with every recommendation of the design lead:
    - the "See evaluations" button and the provisional tab go in this change, not a separate one, as Product owner said;
    - offering facet as an option list ("Any" + the active offering);
    - the row card moves to `src/widgets/evaluation-row`;
    - the public facets extend `features/evaluation-facets`;
    - descriptors as chips; an open evaluation opened by URL gives 404; the most recent baseline first; no header entry; "See evaluations" as a plain link, always visible.
  - **Single `fetchOffering`:** catalog (D3, throws) and specialist-evaluations (D1, `publicRequest` with found / not found / failure) create the same `src/entities/offering/api/offering.ts`. One function with D1's contract will do. The second change to merge adapts its call.
  - **Descriptor row builder:** the first change that applies it (catalog D13 or specialist-evaluations D7) leaves it in `src/entities/taxonomy`, and the other reuses it.
  - **Contrast in catalog's consensus:** the score on the section background gives 4.38:1 at the commercial level of the traditional theme (design lead's measurement). Fixed without a new token, by putting that row inside a card. Goes to catalog's architect before its apply.
- **Why:** Product owner's overnight mandate; design lead's report of 6 Oct; the reuse rule (criterion C).
- **Affects:** add-public-evaluations, add-offering-catalog (D3, D13, consensus contrast), add-specialist-evaluations (D1, D7), add-evaluation-facets (public facets).

### 2026-10-06 — collapsible sections, wheel and facets (Product owner's answers)
- **Decision:**
  - **Shared collapsible section mechanism:** taken from the MVC evaluation form (`evaluation-axis.blade.php`, `evaluation-form.blade.php`).
    - The header is a full-width button: title on the left and chevron on the right (down when collapsed, up when open).
    - It has `aria-expanded` and `aria-controls`, visible focus and an opening animation.
    - It goes in `shared/ui` (content-structure, "collapsible"), in its own change, `add-collapsible-section`, before its uses.
  - **Evaluation form (`add-specialist-evaluations`, round 1):** each CVA group and the 1–9 legend use that mechanism, without changing the structure. **Every section starts collapsed**, as in the MVC, **except in a closed (read-only) evaluation, which starts with everything open.**
  - **Wheel (`refine-flavor-wheel`, feedback):**
    - Q4 (b): the rings are sized by the deepest expanded level at each moment; the wheel rescales on expanding.
    - Q5: the note list control becomes the collapsible header with a chevron.
  - **Facets (`refine-facet-controls`, filtering), before `add-offering-facets`' apply:**
    - Q1 (F3): help and error under the row facets with 0.75rem side padding, aligned with the legend. Decided by the orchestrator by Product owner's delegation.
    - Q2 (F4): on leaving the combobox or pressing Escape with abandoned text, without having chosen anything, the field shows the chosen label again.
  - **Landing D4: closed.** The card shows the level legend by the MVC rules (`label-rating-badge`, merged).
- **Why:** Product owner's answers of 6 Oct in the evening; MVC evaluation form.
- **Affects:** add-collapsible-section (new, content-structure), add-specialist-evaluations (round 1), refine-flavor-wheel (new, feedback), refine-facet-controls (new, filtering), add-offering-facets and add-offering-management (combobox), add-landing (D4 closed).

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

### 2026-10-06 — coffee shop directory (Product owner's answers)
- **Decision:**
  - **CSP approved by Product owner:**
    - `connect-src` open to the geocoding service (OpenStreetMap's Nominatim);
    - `img-src` open to the map tile servers.
  - **API**, in the same `add-contacts-and-locations` change so as not to clash in `Location`, factories and seeders:
    - **Public directory:** `GET /coffeeshops` (paginated; filters `name`, `city`, `postalCode`, `verified`; ordered by name) and `GET /coffeeshops/{location}`. The "coffee shop" is the location (`Location`).
    - **Business data only:** name, description, coordinates, the location's primary contact and offering counts. Never the user's personal data.
    - **Seeder** with a closed list of real Barcelona specialty coffee shops, with address and coordinates.
  - **Front, `add-coffeeshop-directory`:**
    - an "Explore coffees" entry in the header;
    - list with filters in the sidebar (name, postal code or neighbourhood, with verified offerings; ordered by name), cards and pagination, with the catalog and facet patterns;
    - **map with Leaflet and OpenStreetMap tiles:** list/map toggle and a map icon on each card that centres that coffee shop; on mobile, the map full screen;
    - **coffee shop detail**, like the offering detail: the location's data and the list of its offerings with the catalog's filter bar (`locationId`).
  - The orchestrator chooses the filters, the library and the behaviour, by Product owner's delegation.
- **Why:** Product owner's answers of 6 Oct in the evening.
- **Affects:** add-coffeeshop-directory (new), add-coffeeshop-location (geocoding), add-offering-catalog and add-offering-facets (reused), app-shell (header and CSP), API add-contacts-and-locations.

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

### 2026-10-07 — API: deleting an offering with evaluations (Product owner)
- **Decision:**
  - New migration in `tazavera-api` (`2026_10_07_083627_make_evaluation_offering_nullable_on_delete`): `evaluations.offering_id` becomes nullable with `nullOnDelete()` (before `restrictOnDelete()`, which gave a 500 when deleting an offering with evaluations).
  - `OfferingController::destroy` and `massDestroy` delete the offering's baseline evaluation in the same transaction; specialists' evaluations are kept with a null `offering_id`.
  - A user who lists evaluations with a null offering sees "offering does not exist"; **handled in the front**.
  - All in branch `feature/add-contacts-and-locations` (uncommitted; Product owner commits). The coffee shop directory was reworked in the style of `offerings` (`5874407`, `b8b7fe5`).
- **Pending in the API:** `update` and `close` of an evaluation with a null offering (the service reads `evaluation->offering`) and `EvaluationResource` with a null offering; Product owner's `OfferingFactory` `configure()` creates a baseline on every offering and leaves 4 `SpecialistTest` tests red.
- **Why:** Product owner's decision of 7 Oct.
- **Affects:** contract (null `offering` in evaluations); add-specialist-evaluations (list, detail and form: "offering does not exist" state, no edit or close) and add-public-evaluations (public lists) — correction or design adjustment when the contract arrives.

### 2026-10-07 — consensus, management sidebar and the 1–9 legend (Product owner's answers)
- **Decision:**
  - **Offering consensus:** the "Consensus" tab uses only `cataConcordance` for the wheel and the cards: a single wheel (CATA, `aromatics` group), no "Sensory profile" wheel; Main tastes and Defects read `cataConcordance`. `mouthfeel` stays in the CATA wheel as a separate reference group (stronger separation, a general group legend, an inner aromatics/mouthfeel legend). `sensoryTaxonomy` is shown as collapsible sections per axis (fragrance, aroma, flavour, aftertaste, mouthfeel), collapsed, with the shared `Collapsible` and `DescriptorChipGroup readOnly` over the shared row builder, with an `n/total` legend per note. An unverified offering shows no SCA card, but a "not verified yet" message.
  - **Catalog grid:** 3 columns with a lower region threshold (value not fixed by Product owner; recommended ~960px).
  - **Coffee shop management sidebar:** a single "Manage offerings" entry (ca "Gestionar ofertes"), to the list and marked as current also on the create route; "New offering" leaves the sidebar (create is still reachable from the list). "Manage locations" is added by add-coffeeshop-location next to it.
  - **1–9 legend of the evaluation form:** an informative collapsible section "Affective quality impression" after Main tastes, with the nine labels in SCA order (es/en/ca texts in add-specialist-evaluations' handoff, Q10); it follows round 1's initial-state rule.
  - **Backlog:** R10 (error border of the row facets in the traditional theme). The access and status pieces refactor proposed by add-coffeeshop-location becomes R11.
- **Why:** Product owner's answers of 7 Oct (handoffs of add-offering-catalog Q1–Q5, add-offering-management Q1, add-specialist-evaluations Q10, refine-facet-controls Q1–Q2).
- **Affects:** add-offering-catalog (round 1); add-public-evaluations (if it reuses the consensus panel or the "Provisional evaluation" tab: only `cataConcordance`, axes as collapsible sections); add-offering-management (round 1, tasks 8–10); add-coffeeshop-location (summary, Open 3: adds its entry next to "Manage offerings"; Open 4 → R11); add-specialist-evaluations (round 2); add-offering-facets and add-evaluation-facets (R10).

### 2026-10-07 — catalog in one column and null `offeringId` (Product owner's answers)
- **Decision:**
  - **Catalog:** the offering list becomes a single centred column, narrower than the region; several columns were only for the landing. Replaces "3 columns with a lower threshold" of the previous entry. Width: pending a complementary decision by Product owner.
  - **Evaluation of a deleted offering:** the front assumes a nullable `offeringId` in evaluations (Product owner updates the API and passes the contract). The row shows "Offering does not exist" without requesting the offering; the evaluation opens read-only, without edit or close, and can be deleted.
- **Why:** Product owner's answers of 7 Oct.
- **Affects:** add-offering-catalog (round 1, point 4); add-specialist-evaluations (round 2, point 2; the tasks that need the regenerated type wait for the contract); add-public-evaluations (public rows and detail with a null `offeringId`); add-coffeeshop-directory (the coffee shop's offerings tab follows the same one-column pattern).

### 2026-10-07 — null `offeringId`: the contract already states it (Product owner; corrects the previous entry)
- **Decision:** contract `290d22e` (API `PROD 37d499a`) states the case in the descriptions of `deleteAnOffering` and `deleteMultipleOfferings` ("specialists' evaluations are kept without an offering"), although the response schema does not mark `offeringId` as `nullable`. The front widens the type to `string | null` at a single read point (aliases `EvaluationItem` / `EvaluationDetail`), without editing `schema.ts`; no task waits for the contract. Replaces "the tasks that need the regenerated type wait for the contract" of the previous entry. Without an offering, "Offering does not exist" replaces the offering header and the roast level that comes from its coffee; the extraction method is kept (orchestrator, from round 2 point 2).
- **Why:** Product owner, 7 Oct ("yes, it is stated"); design lead's report.
- **Affects:** add-specialist-evaluations (round 2, point 2; summary, Open 14); add-public-evaluations (summary: public row and view with "Offering does not exist", without a link or request of the offering; Open 12; needs an artifact update, it already has a propose).

### 2026-10-07 — page surfaces: background, bands and floating sections (Product owner)
- **Decision:**
  1. The shell's main area leaves cream and moves to a light teal-green background, a step between the header/sidebar green and the cream of forms and cards (MVC `--color-neutral`). Design lead's proposal: `surface-page` points to `sage-100` in the light theme; the dark one unchanged (open for Product owner).
  2. Each section's header goes in its own band (`surface-section`), distinct from the cream body.
  3. The view's body has a 1px `border-subtle` border.
  4. Sections hang from the background inside a body container, separated by a gap (MVC, evaluation form); it applies to views in general (forms, detail, profile). Proposal: a `section` variant of the shared `Card`; a layout-only container.
  - The catalog uses `PageSection surface="page"` so the background shows in the side margins (catalog round 1, point 4).
- **Why:** Product owner's decisions of 7 Oct; design lead's summary `docs/design/refine-page-surfaces/design-summary.md`.
- **Affects:** refine-page-surfaces (new; goes first, before catalog's browser check and archive); add-offering-catalog (round 1, point 4; per-axis consensus sections); add-specialist-evaluations and add-offering-management (adoption of the section card when merged); add-public-evaluations (artifact update before the apply); add-user-account (summary, Open 3); add-user-contact, add-coffeeshop-location and add-coffeeshop-directory (summaries).

### 2026-10-07 — page surfaces: answers to Open 1–3 and refactors first (Product owner and orchestrator)
- **Decision:**
  - Light background: `surface-page` → `sage-100` (traditional theme). Dark background unchanged (`night-petrol-950`).
  - Adoption: catalog, specialist-evaluations and management get a small section-card adoption round after their current round and before their archive (no green left border, header band, management panel border 2px → 1px, evaluations header side padding 1rem → 1.5rem from 768px). user-account adopts in a small later change; add-user-contact is applied after that change. public-evaluations adopts through an artifact update before its apply.
  - Orchestrator: the propose of add-coffeeshop-directory and add-coffeeshop-location may go before R9/R12 and R11 are merged; only their apply waits for the refactors. Directory and location lists in one column.
- **Why:** Product owner's answers of 7 Oct (P1a, P2a, P3a); design lead's summaries (`2ce2cd8`).
- **Affects:** refine-page-surfaces; add-offering-catalog, add-specialist-evaluations, add-offering-management (adoption round); add-user-account; add-user-contact; add-public-evaluations; add-coffeeshop-location; add-coffeeshop-directory.

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

### 2026-10-07 — visual review before the archive: shared fixes (orchestrator and Product owner)
- **Decision:**
  - Catalog passes the design lead's review and is archived and merged (`589b358`). Evaluations and management meet their rounds, but wait for two fixes to already merged shared components, each in its own change: `fix-collapsible-overflow` (a collapsed `Collapsible` still takes height: blank gap at 375 px) and `fix-combobox-blur` (the `Combobox` closes and empties when the results arrive; it prevents choosing inventory when creating an offering).
  - Product owner approves `fix-auth-return-query`: the return route after sign-in keeps the query (`pathname + search`), validated as an internal route as today; without touching tokens, PKCE, CSP or `proxy.ts`.
  - Catalog D13: if a selection block has no notes, its card widens (no legend column); kept as the design says.
- **Why:** design lead's report of 7 Oct; the autonomy mandate; Product owner's answer ("yes, go ahead").
- **Affects:** add-specialist-evaluations and add-offering-management (archive after the fixes); add-offering-facets, add-evaluation-facets and add-coffeeshop-location (use `Combobox`/`Collapsible`); auth.

### 2026-10-07 — nothing new in the design and a reduced test suite (Product owner)
- **Decision:**
  - Nothing is added to the design without Product owner's authorisation: work with the current components. Points the orchestrator settles are resolved by choosing among what was already agreed, never by adding. R14 (themed 404 page) stays in the backlog with the lowest priority.
  - Tests: only those that verify the requirements of `openspec/specs/` (simplified, one per scenario) and the project rule guards stay in the repo. Refactor tests are deleted or move to quality. The rest goes to the local folder `Sprint5/tazavera-front-qa` (no remote), is not run on every change and is run once at the end of the project. Each change writes only the tests its tasks name. Before moving anything, a plan with totals (`claude/test-reduction-plan`) for Product owner.
  - OpenCode is not used while the laptop is short of memory; proposes and applies go to the cloud.
- **Why:** Product owner, 7 Oct (about 2,240 unmanageable tests; timeouts under load, R15).
- **Affects:** every open change (build prompts: only the named tests); AGENTS.md `## Testing` (text pending Product owner's application); add-public-evaluations, add-evaluation-facets, add-coffeeshop-location, add-coffeeshop-directory, refine-list-pagination.

### 2026-10-07 — R9 resolved and shared pieces (orchestrator)
- **Decision:**
  - `ClearFiltersButton` lives in `@/shared/ui` (props `label`, `keep`). add-evaluation-facets and add-public-evaluations use it with `keep={["orderBy","orderDirection"]}` and do not create `ClearEvaluationFiltersButton` (artifacts updated `39a4504`, `8b13c84`). In R12, `FilteredOfferingsResults` (widget `offering-list`) uses it with `keep={OFFERING_SORT_KEYS}`.
  - add-coffeeshop-location: the existing `isValidEmail` moves unchanged to `@/entities/contact`; `user-account` imports it from there. No copy.
  - refine-list-pagination D3: the "current 10" row of the table is corrected to follow D3's rule (separate ellipses if they follow different pages); nothing visible changes.
  - Follow-ups in the backlog: R13 (`EvaluationsAccess` over the shared `SessionGate`), R15 (slow `EvaluationForm` tests).
- **Why:** two settled artifacts contradicted each other or could not be built as written; the option that changes least and adds nothing is chosen.
- **Affects:** add-evaluation-facets, add-public-evaluations, add-coffeeshop-directory (uses the shared button and widget; also needs to decide whether pagination keeps `?tab=`), add-coffeeshop-location, refine-list-pagination.

### 2026-10-07 — pagination with `?tab=` in the directory (orchestrator, closed for review)
- **Decision:** `FilteredOfferingsResults` (widget `offering-list`) gains an optional prop that adds keys to the pagination links' query, without touching the API request. The catalog does not pass it and does not change. The directory's "Offerings" tab uses it with `tab`. It is implemented by add-coffeeshop-directory's artifact update, together with the adoption of R9 and R12.
- **Why:** the directory summary (§5) and R12's (§3.2) say pagination keeps `tab`, but the code cannot be built that way: `buildOfferingsQuery` drops `tab` (R12, Open 1 and Risk 2). It is the option that changes least and adds nothing visible beyond what was agreed.
- **Affects:** add-coffeeshop-directory; extract-filtered-offerings (Open 1 closed).

### 2026-10-07 — browser verification in the cloud (orchestrator)
- **Decision:** with the laptop out of memory, visual verification tasks, checks and verifies run in cloud sessions with Playwright and a mocked API. The session commits the captures and the result in the handoff (`docs(<cap>): update handoff for <change-id>`) before checking the task's checkbox.
- **Why:** the system stopped the local processes for lack of memory (7 Oct, ~21:20 UTC); Product owner's autonomy mandate ("you are autonomous", "do not wait for me").
- **Affects:** refine-list-pagination, add-coffeeshop-location, add-evaluation-facets, extract-filtered-offerings, and the next applies (public-evaluations, coffeeshop-directory).

### 2026-10-07 — R14 authorised if there is time (Product owner)
- **Decision:** R14 (localised, themed 404 page) goes in if there is time, after public-evaluations, coffeeshop-directory and the test reduction. New change `add-not-found-page` (app-shell): the design lead writes the summary with existing components and tokens only; the orchestrator approves it if it leaves no open points.
- **Why:** Product owner, 7 Oct night ("if you have time, include R14").
- **Affects:** add-not-found-page (new); backlog R14 (leaves when that change is archived).

### 2026-10-08 — suite reduction approved, high priority (Product owner)
- **Decision:**
  - The plan `docs/testing/test-reduction-plan.md` (branch `claude/test-reduction-plan`) is approved: of 2,239 cases, only those that verify scenarios of `openspec/specs/` (one per scenario) and the guards stay in the repo; the rest moves to `../tazavera-front-qa` or is deleted.
  - The guards are simplified to one general test per rule: `theme-tokens` goes from 707 cases to 4 (complete themes, contrast of the registered pairs, typography, radii and focus); `icons` from 13 to 1. Design values without a scenario go to QA. Target: about 820 cases in total.
  - No new guards are created. A new token only registers its pair in the existing matrix.
  - This authorises the exception to `.claude/CLAUDE.md` §3 ("never remove or weaken a test") for what this plan moves or deletes.
  - Applied in two passes: now on `develop`, without touching the tests changed by branches in flight; the second pass when those branches are merged.
- **Why:** Product owner, 8 Oct ("that number of tests is not manageable", "OK with high priority").
- **Affects:** every open change (their build prompts: create no guards); AGENTS.md `## Testing` (bullet "no new guard tests", pending Product owner); `.claude/CLAUDE.md` §3.

### 2026-10-08 — last task: ISO 25010 technical review and refactoring roadmap (Product owner)
- **Decision:** at the end, with every change merged, a read-only cloud session writes `docs/review/technical-review.md` (committed by the orchestrator on `develop`). Content:
  - ISO/IEC 25010 scorecard with an A–E grade per characteristic (the worst of its indicators).
  - Maintainability: SOLID in React/FSD, consistency, oversizing; light SIG metrics (size, ESLint complexity, `jscpd`, `dependency-cruiser`, `knip`, props per component).
  - Testability (scenarios covered, suite duration), functional suitability (contract and scenarios), security (`npm audit`, CSP, headers, tokens), usability (guards and axe with Playwright on 5–6 screens with the mocked API), performance (bundle per route from `next build`).
  - Refactoring roadmap: findings grouped into proposed changes (change-id and capability), S/M/L effort with a total, impact (current grade → target), priority, order by FSD dependencies and risk. Backlog candidates from R17.
  - Tools only with `npx`, no new dependencies.
- **Why:** Product owner's request, 8 Oct.
- **Affects:** project close; backlog.
- **Order (Product owner, 8 Oct):** directory and public-evaluations → `add-not-found-page` (R14, no longer conditional on spare time) → technical review.

### 2026-10-08 — fast-lane refactoring on `qa` and change types (Product owner)
- **Decision:** `develop` goes to `master` for the UATs. Refactorings go in rounds on the `qa` branch (fast lane: no design summary, explore or artifact review; archived once validation, the QA suite, tsc, lint, build and verify pass) and `qa` returns to `develop` at the end of each round after the visual review. Each change and backlog entry carries `Type: Refactor (fast lane)` or `Change`. The whole technical-review roadmap (R20–R39) goes by the fast lane, including R30 (reference cache at 1 h; changes add-public-evaluations D9, resolves R19), R31 (security headers, keeping the map and location allowed) and R32 (es/en/ca labels written by the architect, with R17). QA tests move to `qa/` in the front repo (`npm run test:qa`). The orchestrator holds the design conversations; explore no longer runs.
- **Why:** Product owner, 8 Oct.
- **Affects:** add-public-evaluations (D9), every refactoring round, `AGENTS.md` (Refactor changes, Testing), `.claude/CLAUDE.md` §13.

### 2026-10-08 — answers on R4, R5, R8 and R18 (Product owner)
- **Decision:** R18: an item that does not exist shows in its own view a "<item> not found" message (or "no results"), without Retry; the HTTP status is not touched. R5: a single language function in `src/shared/lib/i18n`; the language is chosen only with the header's language button. R4: card menus at 16px (`base-controls` is adjusted). R8: first, the API documents its 422s and the 404s of reads by identifier with Scribe example files (R40, in `tazavera-api`, local).
- **Why:** Product owner, 8 Oct.
- **Affects:** offering-catalog and evaluations (R18), auth (R5), base-controls (R4), forms (R8), `tazavera-api` (R40).

### 2026-10-09 — link or action button by position (Product owner)
- **Decision:** the navigation control on the first line of a page header (back, above the title) is a link. Any other navigation control is an action button (`RouteButton`, with the variant per "Action variants by kind"), both in the header after the first line and at the end of the view, the list or the card. The same action in two places uses a single component (e.g. "New offering" in the header and in the empty list).
- **Why:** Product owner, 9 Oct (AUT findings).
- **Affects:** `apply-header-link-rule` and every future view with a header or final actions.

### 2026-10-09 — R43 `adopt-next-intl-routing`: answers to the Open points (Product owner)
- **Decision:** every recommendation of the summary is accepted: Open 1 A (`request.ts` reads the locale from the middleware header; `<html>` does not move); Open 2 A (`alternateLinks: false`); Open 3 B (importers use `routing.locales`, `routing.defaultLocale` and `hasLocale`, and the aliases go away); Open 4 A (`createNavigation` only for the language selector); Open 5 C (`useSession()` registers the locale with `useLocale()` and the session flow reads it from there, with `es` as the default); Open 6 B with a margin of **+3 KB gz per locale route** over the "before" measurement; Open 7 B (`request.ts` without catalogs).
- **Why:** Product owner, 9 Oct ("ok to your proposal").
- **Affects:** `adopt-next-intl-routing` (app-shell, auth).

### 2026-10-09 — write permission, `login_hint` and `API_INTERNAL_URL` (Product owner)
- **Decision:** (1) The write permission lasts only as long as the action (option A): the front keeps the previous read token and returns to it on saving, cancelling or leaving the edit or password view. (2) Reading `API_INTERNAL_URL` on the front's server is a deployment matter: it is not launched as a front change. (3) The step-up `login_hint` is implemented in the API: the front sends the expected user's ULID and the API rejects another user before issuing the code. (4) The orchestrator's and the design lead's rules are integrated into `AGENTS.md`, one section per agent plus the common rules, without leaving out or changing any existing rule, and each agent ignores the sections that are not its own. The rules do not name the model or the tool. `.claude/CLAUDE.md` and `.claude/agents/design-lead.md` only point to `AGENTS.md`. Limits checked: OpenSpec does not read `AGENTS.md` (its 50 KB limit is for `context` in `openspec/config.yaml`); OpenCode documents no limit and loads the whole file in every session.
- **Why:** Product owner, 9 Oct.
- **Affects:** `secure-step-up` and the next step-up change (auth, user-account), `tazavera-api` (`login_hint`), `AGENTS.md`.

### 2026-10-09 — general terminology in `AGENTS.md` (Product owner)
- **Decision:** when integrating the rules into `AGENTS.md`, commands and tools that are not OpenSpec's or OpenCode's are named with general terminology, not with a specific tool's name (e.g. "schedule a cloud session" instead of `RemoteTrigger` or `claude --cloud`, "recurring task every 10 minutes" instead of `/loop`, "compact the context" instead of `/compact`, "subagent" instead of "Agent tool"). It is the only wording change allowed in the existing rules; no rule is removed or changes content.
- **Why:** Product owner, 9 Oct.
- **Affects:** `AGENTS.md` (orchestrator and design lead sections).

### 2026-10-09 — the latest changes are `Refactor (fast lane)` (Product owner)
- **Decision:** every change in progress is `Refactor (fast lane)`: `refine-evaluation-flow`, `show-item-not-found-message` (R18), `show-field-validation-errors` (R8), `secure-step-up`, `unify-action-button-widths`, `close-mobile-filters-on-arrival`, `tighten-public-evaluations-spacing`, `adopt-next-intl-routing` (R43, before `Change`) and the next step-up change. Each is archived when the full checks pass and `/opsx:verify` gives no CRITICAL, without waiting for Product owner's request. R43 no longer waits for the browser test to be archived.
- **Why:** Product owner, 9 Oct ("the latest changes are all refactoring - fast lane").
- **Affects:** the listed changes.

### 2026-10-09 — R43: JS margin per route at +14 KB gz (Product owner)
- **Decision:** Open 6's margin goes from +3 KB to **+14 KB gz per locale route** over the "before" measurement (option A). Measured in task 7.1: +13.4/+13.5 KB gz on each route, from the `use-intl` core that the provider brings to the client. Replaces only the number of Open 6 in the entry "R43: answers to the Open points".
- **Why:** Product owner, 9 Oct ("A").
- **Affects:** `adopt-next-intl-routing` (design.md Open 6, task 7.1).

### 2026-10-09 — orchestrator autonomy (Product owner)
- **Decision:** the orchestrator decides on its own everything that does not change the requested behaviour (archives, integrations, gates, limits, work order, artifact wording), records it here or on the board and acts without asking. It only asks when the decision changes what the user sees or what was asked. First application: `open-security-pages-in-popup` no longer waits for the browser test and is archived as fast lane (full checks and verify without CRITICAL).
- **Why:** Product owner, 9 Oct ("you are autonomous to make decision if it does not change the expected behavior requested").
- **Affects:** every orchestrator decision; `open-security-pages-in-popup`.

### 2026-10-09 — risks of the 2026-10-09 technical report (orchestrator, autonomy)
- **Decision:** (1) the sidebar "Filters" toggle (1.06:1 in the traditional theme) uses at rest the text token of the sidebar entries: unplanned fix, no new token. (2) The 9 pass-2 scenarios without a test are covered as unplanned coverage (replaces the question to Product owner on the board). (3) The Purpose of `openspec/specs/testing/spec.md` is written by hand, the only exception to "specs never by hand". (4) `move-flavor-wheel-types`, a fast-lane refactor for the 11 type cycles. (5) The 48 lint warnings go to the next refactor round. **Not decided** (changes when the facets load): loading the facet comboboxes only on opening the panel (risk 3), question to Product owner on the board.
- **Why:** `docs/review/technical-review-2026-10-09.md` (risks 1–6); the autonomy rule of 9 Oct.
- **Affects:** app-shell, theming, testing, feedback.

### 2026-10-09 — the orchestrator merges into `master` (Product owner)
- **Decision:** Product owner gives the orchestrator permission to merge `develop` into `master` and push `master` (step 5 of the final sequence). Done: `50f6fba`, tree identical to `develop` checked. Exception to "only Product owner merges into `master`" for this sequence.
- **Why:** Product owner, 9 Oct ("You have the permission to merge master").
- **Affects:** final sequence, step 5.

### 2026-10-09 — deferred loading of the facets (Product owner)
- **Decision:** yes. The facet comboboxes (and what only they use, such as cmdk) load with a dynamic import the first time the filter panel opens (like Leaflet), with a short loading state on that first opening; target ≤ 170 KB gz of JS per list route, without changing which filters exist, their order or their behaviour once loaded. Normal change (`lazy-load-facet-controls`, filtering), run in the cloud from propose to archive. The lint-warnings refactor round continues in parallel without touching the facets until this change is integrated.
- **Why:** Product owner, 9 Oct ("Yes"), risk 3 of the 2026-10-09 technical report.
- **Affects:** filtering, app-shell (sidebar); the lint refactor round.

### 2026-10-11 — fast lane by Product owner's order and cloud launching (Product owner)
- **Decision:** an entry Product owner orders "fast lane" (every AUT finding included) goes by the fast lane from `qa` even if it adds behaviour, texts, screens or tests, with one test per new scenario; its backlog entry records the order and the end state. The orchestrator launches every cloud session itself as a scheduled routine, whether Product owner is present or not. Each prompt names the role file, the workflow steps and the `SKILL.md` of each phase.
- **Why:** Product owner, 11 Oct (R67 and R68 "in fast lane"; "you are autonomous to run these changes").
- **Affects:** every fast-lane entry and its prompts; `docs/agents/` (common rules "Refactor changes" and "OpenSpec skills").

### 2026-10-11 — only Product owner revises the rules (Product owner)
- **Decision:** common rules in `AGENTS.md`, one file per role and the workflow in `docs/agents/`, records in `docs/design/`. Only Product owner revises `AGENTS.md`, `docs/agents/`, `CLAUDE.md` and `.claude/` (locked in the settings); the orchestrator follows the established flow and, if a step cannot be applied, stops and says so.
- **Why:** Product owner, 11 Oct ("once the flow is established you need to follow it, revisions are only done by me").
- **Affects:** every agent; `docs/agents/orchestrator.md` §3 and §5 (`c83919d7`).

### 2026-10-12 — the front is the API's only door (R74, Product owner; replaces the 2026-10-09 entry on `API_INTERNAL_URL`)
- **Decision:** the build environment is a server with a single public entry (the ngrok URL) that leads to the front. The front forwards to the API, through `API_INTERNAL_URL` (server only, required, no fallback): the API's web routes on the same path (`/oauth/authorize`, Fortify, `/user/security` and its actions, `/passkeys/*`, and their assets `/build`, `/flux`, `/livewire-*`) and, under the `/api` prefix that the proxy strips, `/oauth/token` and every JSON call (including `/logout`). `NEXT_PUBLIC_API_URL` = `{NEXT_PUBLIC_APP_URL}/api`; `connect-src 'self'` + Nominatim. The API has no public address. API settings (Product owner's): `APP_URL` and `FRONT_URL` = the public origin; `TRUSTED_PROXIES` = the front's address; `SESSION_DOMAIN` empty; secure cookies; `expose_php=Off`; seeders run with the configuration in place (OAuth client callback `{public origin}/callback`). Local tests serve the front over https with Caddy; Caddy has no role in deployment. There is no demo environment in the design: only the build environment.
- **Why:** Product owner, 12 Oct (option A: "the front will also forward all the web routes"; "there is no demo environment for our design purpose, it is just the build environment").
- **Affects:** `route-api-web-pages-through-front` (approved summary `4e02d8c3`); auth and app-shell; the deployment documentation (summary given to Product owner for the deployment assistant); R1 goes after.

### 2026-10-12 — edit lists: filters and sort per tab (R73, Product owner)
- **Decision:** edit lists remember filters and sort in `sessionStorage` until others are applied; they are forgotten on sign-out or user change; no page number; no API change. "Clear all" in My evaluations keeps the sort.
- **Why:** Product owner, 11 Oct (1 → A, after correcting C; 2 all; 3 A; 4 fast lane).
- **Affects:** filtering; My evaluations, Coffee inventory, My offerings.

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
