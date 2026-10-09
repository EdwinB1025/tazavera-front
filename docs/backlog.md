# Backlog — refactor candidates

Augusto and the orchestrator add entries; agents read the file. Each entry's type decides its workflow: `Refactor (fast lane)` takes the fast lane (refactoring rounds on `qa`), `Change` takes the traditional workflow. The architect checks the file before /opsx:propose and flags any entry the change would affect, and removes the whole section of an entry only when archiving the change that resolves it.

One section per candidate, in this format:

## R<n> — <title>

- **Duplicated:** <code, classes or helpers that are repeated>
- **Where today:** <files>
- **Why it pays off now:** <upcoming change that would add copies>
- **Owning capability:** <capability>
- **Proposed change:** <change-id>
- **Open decision (Augusto):** <options, or "none">
- **Type:** Refactor (fast lane) | Change
- **Status:** proposed | accepted | deferred
- **Affects:** <changes that should wait for it or reference it>

## Priority order (2026-10-09)

The table lists only open entries, in the order they are to be taken. Effort: S < 2 h, M 2–6 h, L > 6 h.

| # | Entry | Change | Type | Effort | Waits for |
|:-:|---|---|---|:-:|---|
| 1 | R40 | API branch in `tazavera-api` | Change (API) | M | PO: review of the API diff |
| 4 | R10 | none yet | Change (behaviour) | S | before the first facet that shows an error |
| 5 | R50 | API branch in `tazavera-api` | Change (API) | S | API fix (confirmed on local data 2026-10-09: level-1 notes come back at the top of `cataConcordance`) |
| 6 | R43 | `adopt-next-intl-routing` | Change | L | its design summary |
| 7 | R45 | none yet | Change (behaviour, API) | M | Product owner: API change and contract update; not to be designed yet |
| 8 | R1 | none (Playwright suite) | Change (tests) | — | the pre-deployment Playwright suite |

## R40 — Document the 422 and 404 responses in the API (tazavera-api)

- **Duplicated:** none. Scribe documents the request body from each FormRequest's rules, but a response only from an example (`@response` / `@responseFile`, an API Resource or a response call). Only two write endpoints (the coffee-shop location and the user contact) have a 422 example, and no read by identifier has a 404.
- **Where today:** `tazavera-api`: the controllers of the write endpoints (register, profile, password, offerings, evaluations, locations, coffee shops) and of the reads by identifier (offering, coffee shop, evaluation); the Scribe example files
- **Why it pays off now:** the front may not use an undocumented response (`AGENTS.md` → API contract), so R8 (per-field errors) and R18 (unknown item message) wait for it
- **Owning capability:** API (outside the front); the front then copies `contracts/openapi.yaml` and regenerates `schema.ts`
- **Proposed change:** in `tazavera-api`, a branch that adds a 422 example file in Laravel's standard shape (`message` plus `errors` per field) to every write endpoint and a 404 example file to every read by identifier, then runs `php artisan scribe:generate`. Documentation only: no API behaviour changes. Done locally by the orchestrator, never from the front repository.
- **Open decision (Augusto):** none (Product owner asked for it on 2026-10-08); review the API diff before its merge
- **Type:** Change
- **Status:** accepted
- **Affects:** R8, R18

## R10 — Error boundary of the row facets in the traditional theme (refine-facet-controls Q2)

- **Duplicated:** none; the row facets' radio and checkbox boxes take the error boundary colour in the dark theme only — in the traditional theme they keep the cream boundary under an error
- **Where today:** the row facet controls of `add-facet-controls` (inside the sidebar's `variant-inverse` scope); seen in `docs/design/refine-facet-controls/captures/375-light.png` vs `375-dark.png` ("Proceso", "Solo disponibles")
- **Why it pays off now:** no consumer passes an error to a facet today; the first facet that shows a validation error would show it only by the left bar and the text in the traditional theme
- **Owning capability:** filtering
- **Proposed change:** none yet — schedule it before a facet consumer shows errors
- **Open decision (Augusto):** none
- **Type:** Change
- **Status:** accepted
- **Affects:** `add-offering-facets`, `add-evaluation-facets`

## R50 — Consensus concordance loses the parent of unmarked intermediate notes (API; found by the design lead for R49)

- **Duplicated:** none. Read from the code, not run: `tazavera-api/app/Services/OfferingConsensusService.php:189-197`, `resolveParentOfferingTasteId` looks a node's parent up only among the directly marked references, so a level-1 ancestor that was not itself marked is stored with `parent_id` null and comes back at the top level of `cataConcordance`, apart from its level-0 parent. The seed marks aromatic leaves only (`EvaluationFactory::taxonomyRefs`), so in seeded data almost every level-1 note is affected. The contract example (`contracts/openapi.yaml:6550-6615`) shows a proper three-level tree.
- **Where today:** the API consensus service; seen on the front in the offering card's taste notes (R49) and the flavor wheel (`buildFlavorWheelNodes` keeps top-level nodes as roots)
- **Why it pays off now:** R49 renders the notes as nested trees; with this defect many children appear detached from their parent
- **Owning capability:** API (consumed by landing and offering-catalog)
- **Proposed change:** none yet: an API fix by Product owner; the front does not adapt to it
- **Open decision (Augusto):** Product owner (2026-10-08): the API always delivers the consensus tree resolved; the very high note counts come from anomalous seeders (real evaluations identify few flavours). Verify the code reading against real data before any work; if the tree arrives resolved, close this entry
- **Type:** Change (API)
- **Status:** deferred
- **Affects:** R49 (how often its orphan rule applies), the flavor wheel

## R43 — Adopt next-intl for locale routing

- **Duplicated:** locale handling written by hand next to next-intl, which the project uses only for its plugin and `getRequestConfig`: the locale list in `src/shared/config/locales.ts` instead of `defineRouting`, the locale prefix in `proxy.ts` instead of the next-intl middleware, and the active locale read from the URL (R5's `localeFromPath`) instead of `useLocale()` / `getLocale()`
- **Where today:** `src/shared/config/locales.ts`, `src/shared/lib/i18n/`, `proxy.ts`, `app/layout.tsx`, `src/features/auth` (after R5), the language selector, and every importer of the locale config (~60 files with tests)
- **Why it pays off now:** one library for i18n, following its standard structure. It moves no grade of `docs/review/technical-review.md`; it risks two of them (JS per route, R28; `proxy.ts` headers and CSP, R31)
- **Owning capability:** app-shell (with auth)
- **Proposed change:** `adopt-next-intl-routing` (L, about 3–4 h after the summary is approved)
- **Open decision (Augusto):** the design summary settles how the next-intl middleware coexists with the CSP nonce and headers of `proxy.ts`, where the provider goes, and how the sign-in code receives the locale. Condition: measure the JS per route before and after; the change must not exceed R28's target. Texts keep reaching components as props (no `useTranslations`)
- **Type:** Change
- **Status:** accepted (last priority, Product owner 2026-10-08)
- **Affects:** R5 (its function is removed here), R28, R31 (both go first)

## R45 — Ask for the first location in coffee-shop registration

- **Duplicated:** none. Coffee-shop registration does not ask for a location; the user creates the first one after signing in, in Manage locations.
- **Where today:** the coffee-shop register form (`/[locale]/register/coffeeshop`, `src/features/user-account`); the Manage locations form (`src/features/location-management`)
- **Why it pays off now:** the coffee shop is usable as soon as it registers, without a second step
- **Owning capability:** user-account, offering-management
- **Proposed change:** none yet. Later, through the normal flow (design summary needed): the coffee-shop register form adds the location fields, reusing the Manage locations form fields; Manage locations stays for editing and adding more locations
- **Open decision (Augusto):** answered 2026-10-08: registration asks for the first location's data, reversing production AUT point 11, decision A ("the location is created after the first sign-in, in Manage locations") once this entry is done; until then the current behaviour stays. Not to be designed now. It cannot be front-only today: `POST /locations` needs `auth:api` + `profile:write`, and the front has no token right after `POST /register` (see R44); `POST /register` (`StoreUserRequest`) does not accept location data. API change first, by Product owner: `StoreUserRequest` accepts a `location` block with the `StoreLocationRequest` rules (`name`, `description`, `latitud`/`longitud`, `contact` with `address` and `city`), required when `role=coffeeshop`; `UserController::store` creates the location and its primary contact in the same `DB::transaction`; Scribe regenerated and `contracts/openapi.yaml` updated
- **Type:** Change (changes what users see and the API contract)
- **Status:** deferred
- **Affects:** R44 (same registration step); the coffee-shop register screen and Manage locations

## R1 — End-to-end test of "Choosing a locale" (verify W1, deferred here by the product owner)

- **Duplicated:** none
- **Where today:** `src/app/shell/ShellChrome.tsx:35-39` (the locale swap), `src/widgets/app-header/ui/LanguageSelect.tsx` (the callback), `src/app/shell/AppShell.test.tsx` (router mocked with a no-op)
- **Why it pays off now:** the shell's one navigation interaction is verified only up to the callback; every later change that switches locale rides on it
- **Owning capability:** app-shell
- **Proposed change:** none yet — belongs to the pre-deployment Playwright suite
- **Open decision (Augusto):** none
- **Type:** Change
- **Status:** deferred
- **Affects:** none

## Closed entries

## R41 — Sign-in does not authenticate (production AUT, 2026-10-08)

- **Duplicated:** none. Defect found in the production AUT: no user ends up signed in, whatever the role (coffee shop and specialist, both freshly registered), and neither after the registration nor through the normal sign-in flow.
- **Where today:** not located yet; sign-in flow of `src/features/auth`. Ruled out on 2026-10-08: the production build carries the current client `01a11aee-170a-71bc-82aa-43344bf1b12d`; the API accepts it (`/oauth/authorize` answers 302 to `/login`, a wrong client answers `invalid_client`); the API log has no error that day. **Cause found (2026-10-08): environment, not code.** The API completes every step (authorize, login, `POST /oauth/token` 200, `GET /user` 200, CORS ok, `/callback` without COOP). The AUT ran a production build (`npm run build` + `npm start`) against `http://localhost:8000`, and `src/shared/api/tokens.ts` (`add-auth` design.md D8) refuses a non-HTTPS token endpoint when `NODE_ENV=production`; `completePopup` takes the silent error path. Product owner is putting the API behind a local TLS proxy (Caddy) to repeat the AUT; deployment requirements are in `tazavera-documentation/api-implementation-notes.md` and `front-implementation-notes.md`. **No code task until that AUT is repeated**; then the entry is closed or retyped.
- **Why it pays off now:** it blocks every authenticated flow (account, evaluations, management of offerings and locations), and the AUT cannot continue on that side.
- **Owning capability:** auth
- **Proposed change:** none. **Closed by Product owner's decision of 2026-10-08:** the AUTs continue locally with `npm run dev`, which accepts the `http` API, so sign-in works; the deploy (TLS proxy Caddy + Docker) is postponed to a later action. The HTTPS requirement is a deploy note, covered by `tazavera-documentation/api-implementation-notes.md`, `front-implementation-notes.md` and `docker-deploy-guideline.md`.
- **Open decision (Augusto):** none
- **Type:** Deploy note (no code)
- **Status:** closed
- **Affects:** the deploy (HTTPS for the API's token endpoint in production builds)

## R47 — Filter chips and "Clear all" show no loading state (production AUT finding 13, 2026-10-08)

- **Duplicated:** none. Defect against `content-structure` "Prompt page change on server-loaded lists" ("…or changes the query…: the list SHALL replace the previous page's content with its loading state at once").
- **Where today:** the offerings list with its `@sidebar/offerings` slot. Measured in a production build: "Clear all" changed the URL after 4.4 s, a chip ✕ after 5.9 s, no `.animate-pulse` at any time, the `_rsc` requests for `/es/offerings` took 3.6–5.8 s; `GET /offerings?verified=1` takes about 3.8 s on the API itself. Probable cause (not verified): the async sidebar slot (`FilteredOfferingsFacets` awaits `/coffees` and `/taxonomies`) has no `Suspense`, so the transition waits for it before the list's keyed `Suspense` fallback shows
- **Why it pays off now:** Product owner's AUT; the old cards stay for seconds with no feedback
- **Owning capability:** content-structure (with filtering)
- **Proposed change:** `show-filter-loading-at-once` (S)
- **Open decision (Augusto):** answered 2026-10-08, option A: no code change. The cloud session reproduced the cause (the sidebar facets and the toolbar await `/coffees` and `/taxonomies` outside any `Suspense`, so the navigation waits for them) and measured that with those reads cached (R30's one-hour cache, merged after the AUT build) the list skeleton and the URL change show in ~110 ms. Option B (keyed `Suspense` around facets and toolbar) was rejected: the facets would go blank while the reads load. Product owner re-tests on current develop.
- **Type:** Unplanned fix
- **Status:** closed (no code)
- **Affects:** none
