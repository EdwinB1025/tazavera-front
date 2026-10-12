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

## Priority order (2026-10-11)

The table lists only open entries, in the order they are to be taken. Effort: S < 2 h, M 2–6 h, L > 6 h.

| # | Entry | Change | Type | Effort | Waits for |
|:-:|---|---|---|:-:|---|
| 1 | R74 | route-api-web-pages-through-front | Change (traditional workflow; behaviour, security) | M | — (Product owner, 2026-10-12: highest priority, last change before the Playwright suite) |
| 1 | R76 | build-standalone-output | Refactor (fast lane), by Product owner's order (hotfix for the Docker deploy) | S | — (highest priority) |
| 1 | R77 | collapse-taxonomy-trees | Refactor (fast lane), by Product owner's order (adds behaviour, texts, tests) | M | — (highest priority; runs in parallel with R76, different files) |
| 1 | R78 | land-on-home-after-registration | Refactor (fast lane), by Product owner's order (changes behaviour) | S | — (highest priority; runs in parallel with R76 and R77, different files) |
| 1 | R79 | add-inventory-sidebar-entry | Refactor (fast lane), AUT correction by Product owner (changes behaviour) | S | — (highest priority; parallel with R76–R78, different files) |
| 1 | R80 | show-my-offerings-after-create | Refactor (fast lane), AUT correction by Product owner (changes behaviour) | S | — (highest priority; parallel with R76–R79, different files) |
| 2 | R75 | update-stale-proxy-qa-test | Refactor (fast lane), by Product owner's order | S | — (on `feature/route-api-web-pages-through-front`, then aligned in `qa`) |
| 4 | R1 | none yet (Playwright suite) | Change (tests) | — | R74 in `develop` (Product owner, 2026-10-12) |
| 5 | R45 | none yet | Change (behaviour, API) | M | Product owner: deferred, to review 2026-10-12; not to be designed yet |

## R80 — "View my offerings" replaces "Create offerings" after a creation (Product owner, 2026-10-12)

- **Duplicated:** none. After offerings are created on "New offering", the form resets and keeps "Create offerings" (which cannot act until an inventory item is chosen again), and the status line carries an inline link "View my offerings" (offering-management "Creating offerings": "the status line announces the number of created offerings with a link to the list route, and the inventory choice and the location checkboxes reset").
- **Where today:** `src/pages/new-offering/ui/NewOfferingForm.tsx` (status line and action group), `openspec/specs/offering-management/spec.md`.
- **Why it pays off now:** AUT finding (Product owner, 2026-10-12): "la acción crear ofertas no hace nada porque me devuelve al mismo sitio; reemplazarla con ver mis ofertas, y que ver mis ofertas deje de ser un link".
- **Owning capability:** offering-management.
- **Proposed change:** show-my-offerings-after-create.
- **Order:** AUT correction: fast lane, highest priority (standing order of the Product owner for AUT findings).
- **Settled end state:**
  1. After a successful creation, the status line (role `status`) keeps announcing the number of created offerings (`createdStatus` + count) **as text only, with no link**.
  2. In that created state, the action group shows **"View my offerings"** (existing catalog text `viewMyOfferings`) **as a button** in place of "Create offerings": a `RouteButton` to `/{locale}/manage/offerings`, variant `action-3` (navigate/consult, as the button-variant rule), size `base`, in the same end-aligned `ActionGroup`, followed by "Cancel" as today.
  3. As soon as the user chooses an inventory item again (the form leaves the created state), "Create offerings" returns in its place, so several creations in a row stay possible; the reset of the inventory choice and the location checkboxes stays as today.
  4. Nothing else changes: requests, errors, the pending state, texts, other screens.
- **Tests:** one test per new or modified scenario of "Creating offerings"; every other test keeps its assertions. Full checks pass.
- **Open decision (Product owner):** none. (Orchestrator's reading, for his review: the button swap applies only after a creation, because "Create offerings" is the form's only way to create.)
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** R79 runs in parallel on the new-offering sidebar file only (different file); the archives edit this file.

## R79 — "Explore coffee inventory" in the coffee shop's management sidebar (Product owner, 2026-10-12)

- **Duplicated:** none. The sidebar of the offerings list, offering creation and locations routes shows only "Manage offerings" and "Manage locations" (offering-management "Management sidebar entry"); "Explore coffee inventory" appears only on the inventory list and detail ("Coffee inventory sidebar") and in the user menu.
- **Where today:** `src/pages/manage-offerings/ui/ManageOfferingsSidebarEntries.tsx`, `src/pages/new-offering/ui/NewOfferingSidebarEntries.tsx`, `src/pages/manage-locations/ui/ManageLocationsSidebarEntries.tsx`, `src/pages/manage-inventory/ui/ManageInventorySidebarScreen.tsx`; `openspec/specs/offering-management/spec.md`.
- **Why it pays off now:** AUT finding (Product owner, 2026-10-12): "explorar inventario de café no hace parte del menú sidebar del coffeeshop".
- **Owning capability:** offering-management.
- **Proposed change:** add-inventory-sidebar-entry.
- **Order:** AUT correction: fast lane, highest priority (standing order of the Product owner for AUT findings).
- **Settled end state:** on every coffee shop management route (offerings list, offering creation, locations, inventory list, inventory detail) the sidebar shows the same three entries in this order, each with its icon and visible label: "Manage offerings", "Manage locations", "Explore coffee inventory" (addressing `/{locale}/manage/inventory`, existing catalog text `sidebarExploreInventory`). The current-page marking stays as today for the first two (offerings on list and create, locations on locations) and "Explore coffee inventory" is the current page only on the inventory routes. On the inventory list it still holds the inventory facets; elsewhere it holds none. Icons: the existing inventory entry's icon if it has one, otherwise one from `src/shared/ui/icons.ts` (no new dependency). The requirement "Management sidebar entry" and its scenarios change from two to three entries; one test per new or modified scenario; every other test keeps its assertions. Full checks pass.
- **Open decision (Product owner):** none.
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** R76–R78 run in parallel (different files); the archives edit this file.

## R78 — Land on the landing page after a registration sign-in (Product owner, 2026-10-12)

- **Duplicated:** none. After a registration whose `201` carries the `token` block, the front opens `/{locale}/account` (`src/pages/register/ui/RegisterClient.tsx:56`; user-account "Registration result", scenario "Signed in by the registration"; decision of `sign-in-after-registration` design.md D4).
- **Where today:** `src/pages/register/ui/RegisterClient.tsx`, `openspec/specs/user-account/spec.md` ("Registration result"), the test of that scenario.
- **Why it pays off now:** Product owner, after testing the deploy: the registration should bring the user back to the landing page, as a normal sign-in returns to where it started.
- **Owning capability:** user-account.
- **Proposed change:** land-on-home-after-registration.
- **Order (Product owner, 2026-10-12):** "can you bring me back to the landing page": fast lane, highest priority.
- **Settled end state:** when `POST /register` answers `201` with a `token` block that signs the user in, the session is authenticated and the landing page `/{locale}` opens through client-side navigation, with no success panel and no full page load (the scenario's destination changes from `/{locale}/account` to `/{locale}`; nothing else in it). Registration without the token block, failures, both roles (specialist and coffee shop), the API requests and every other requirement stay as they are. The scenario's existing test changes only its expected destination; no other test changes. Full checks pass.
- **Open decision (Product owner):** none.
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** R76 and R77 run in parallel (different files); the three archives edit this file.

## R77 — Collapsible taxonomy trees (Product owner, 2026-10-12)

- **Duplicated:** none. `src/shared/ui/TaxonomyTree.tsx` always renders every level of each taxonomy tree.
- **Where today:** `TaxonomyTree` and its three consumers: the offering card (`src/entities/offering/ui/OfferingCard.tsx`, landing and lists), the Consensus tab (`src/widgets/offering-detail/ui/SelectionBlock.tsx`, with the `name count/total` shares) and the detail by axis (`src/widgets/offering-detail/ui/AxisDetail.tsx`).
- **Why it pays off now:** Product owner's request after testing `develop`: long trees crowd the cards.
- **Owning capability:** the capability whose spec owns the shared tree (the architect decides from `openspec/specs/`: landing "Taxonomy badge trees on the offering card", offering-catalog "Consensus taste trees" and "Consensus detail by axis"); one commit per capability.
- **Proposed change:** collapse-taxonomy-trees.
- **Order (Product owner, 2026-10-12):** fast lane, highest priority; the orchestrator's recommendations accepted ("recommendations accepted"): everywhere the tree appears (option 1A), fast lane (2A), and the details below.
- **Settled end state:**
  1. Every taxonomy tree starts **closed**: only the top-level (level 0) notes show, in the three places above.
  2. A note that has children shows a **toggle button right after its badge** (after its share on the Consensus tab), whose visible text is `+` when closed and `−` when open. A note without children has no toggle.
  3. Opening a level-0 note shows its level-1 children; a level-1 note with children has its own toggle that shows its level-2 children.
  4. **Closing a note closes all its descendants**: reopening it shows only its direct children, closed.
  5. The toggle is a real `button` with `aria-expanded`, `aria-controls` pointing at the child list, `focus-visible:focus-ring`, a hover state with existing semantic tokens only (no new token, colour value or dependency), and an accessible name from the message catalogs, passed as props (es "Mostrar las notas de {label}" / "Ocultar las notas de {label}"; en "Show the notes under {label}" / "Hide the notes under {label}"; ca "Mostra les notes de {label}" / "Amaga les notes de {label}"). The `+`/`−` glyph is hidden from assistive technologies. Disabled state not used.
  6. The open/closed state lives only in the component: it is not remembered across reloads or navigation, and does not change the URL or any request to the API.
  7. The `role="list"` hierarchy and the existing layout (indented column for level 1, wrapping row for level 2, connector) stay as they are once open; the shares `name count/total` stay next to each badge.
- **Tests:** one test per new or modified scenario. Existing validation tests of scenarios this entry modifies (all levels visible) are updated to the new scenarios; every other test keeps its assertions. QA tests that fail only because the tree now starts closed may add the clicks that open it, keeping their assertions (orchestrator's decision under the order; list them in the final report).
- **Open decision (Product owner):** none.
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** R76 runs in parallel (only `next.config.ts`); both archives edit this file.

## R76 — Standalone build output for the Docker image (Product owner, 2026-10-12)

- **Duplicated:** none. The front's Docker image copies the whole project (sources, tests, docs, OpenSpec, dev dependencies) and runs `next start` as root (technical review 2026-10-12, risk 3).
- **Where today:** `next.config.ts` (no `output`).
- **Why it pays off now:** the deploy image (Product owner's `Dockerfile`, outside the OpenSpec flow) will copy only `.next/standalone` and `.next/static` and run `node server.js` as user `node`.
- **Owning capability:** app-shell.
- **Proposed change:** build-standalone-output.
- **Order (Product owner, 2026-10-12, relayed by the deploy assistant):** hotfix, fast lane, highest priority, merged into `develop`.
- **Settled end state:** `next.config.ts` adds `output: "standalone"` to `nextConfig`, keeping `poweredByHeader: false` and the next-intl plugin. Nothing else in the front changes; what users see, the requests to the API and every requirement in `openspec/specs/` stay the same. Check: `npm run build`, then `node .next/standalone/server.js` (with `.next/static` copied next to it, as the Dockerfile will) serves `/es` with its styles and translations; if a locale page fails because the message catalogs are not traced, add `outputFileTracingIncludes` for `messages/**` (same config file, no other change). No new tests; existing tests keep their assertions. Full checks (validation, QA, tsc, lint, build) pass. The `Dockerfile` is not changed by this entry.
- **Open decision (Product owner):** none.
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** the deploy `Dockerfile` (Product owner's, after this reaches `develop`).

## R75 — Stale QA test of the proxy's CSP after R74 (Product owner, 2026-10-12)

- **Duplicated:** none. `qa/proxy.test.ts` "appends 'unsafe-eval' to script-src only in development" still expects the API origin in `connect-src` (`expectedCsp`, `API_ORIGIN`); R74 (design.md D6) made it `connect-src 'self' https://nominatim.openstreetmap.org`. It is the only failing QA test on `7e9f88ae` (1974 / 1975).
- **Where today:** `qa/proxy.test.ts:23-38` (constants and `expectedCsp`), `:63-74`.
- **Why it pays off now:** the branch passes directly into `develop` after Product owner's tests; the QA suite must be green before `develop` → `master`.
- **Owning capability:** app-shell.
- **Proposed change:** update-stale-proxy-qa-test.
- **Order (Product owner, 2026-10-12):** fast lane, highest priority: "clean it or update it in the current branch and align it in `qa`". Done on `feature/route-api-web-pages-through-front`, not from `qa` (the code it tests is only on that branch); `qa` takes it when `develop` is merged into `qa` after R74 reaches `develop` (applied on `qa` alone it would fail, because `qa` still sends the API origin).
- **Settled end state:** `expectedCsp` writes `connect-src 'self' https://nominatim.openstreetmap.org`; `API_ORIGIN` removed if unused; no other test, title, assertion or production file changes. `npm run test:qa` passes in full.
- **Open decision (Product owner):** none.
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** R74 (`route-api-web-pages-through-front`).

## R74 — The front is the entry point of the API's web routes (Product owner, 2026-10-12)

- **Duplicated:** none. New front capability (decision D10, `tazavera-documentation/docker-deploy-guideline.md`): the front is the entry point ("router") of the API's WEB routes in every setup. The API's JSON endpoints and `POST /oauth/token` are not forwarded: the front keeps calling them on the API's own https address.
- **Where today (verified against `develop` 2026-10-12):** nothing is forwarded. `next.config.ts` has no rewrites; `proxy.ts` only sets the security headers (CSP `connect-src` = 'self' + API origin + Nominatim, `form-action 'self'`, `proxy.ts:80-93`). Every route is built on `NEXT_PUBLIC_API_URL`: JSON client `src/shared/api/client.ts:129`, token exchange `src/shared/api/tokens.ts:168`, authorize popup `src/features/auth/api/authorize.ts:300`, links to API web pages `UserMenu.tsx:123`, `SecuritySection.tsx:43` and `:56`, `PasswordForm.tsx:92`. `API_INTERNAL_URL` is not read anywhere.
- **Route groups (verified against the API 2026-10-12):**
  - Through the front (Laravel `web` middleware, session cookie): `GET/POST/DELETE /oauth/authorize` (sign-in popup, consent), `/login` and the Fortify screens (two-factor challenge, `/forgot-password`, `/reset-password`, `/email/verify`), `/user/security` (`routes/web.php`), plus the assets those pages load (to confirm).
  - Direct to the API (stateless): `POST /oauth/token` (Passport registers it with `throttle` only, `vendor/laravel/passport/routes/web.php:6-10`) and every route in `routes/api.php`.
- **Why it pays off now:** the build environment depends on it; last change before the Playwright suite (R1).
- **Owning capability:** auth (with app-shell for the security headers)
- **Proposed change:** route-api-web-pages-through-front. Expected end state (Product owner):
  1. The front forwards the web-route group to the API; the browser sees those routes on the front's origin.
  2. A second base URL for the web routes (the front's origin); `NEXT_PUBLIC_API_URL` stays the base of the JSON calls and of `/oauth/token`.
  3. A server-only `API_INTERNAL_URL` (e.g. `http://api:80` in Docker): the forwarding target and the base of the server-side reads, falling back to `NEXT_PUBLIC_API_URL`.
  4. The CSP and COOP rules of the auth spec are kept (COOP `same-origin-allow-popups` on pages, none on `/callback`); the API's forwarded pages are served as the API sends them.
  5. Check: `/login`, `/oauth/authorize` and `/user/security` load through the front's origin; the JSON calls still go to the API's address; specialist and coffee shop sign in end to end.
- **Open decision (Augusto):** Product owner, 2026-10-12: the design lead decides the open points (detail in `tazavera-documentation/front-implementation-notes.md` C9; API side in `api-implementation-notes.md` C8 and `docker-build-steps.md` C8/C9): (a) name of the second base URL and the call sites that move to it; (b) access from another device: ngrok exposes only the front, so the direct JSON calls need the API's own public https address (a second tunnel) or must be forwarded too; (c) the OAuth issuer in `tokens.ts:168` is the API base: confirm nothing checks it against the origin that served `/oauth/authorize`; (d) API side (no code change, environment only, Product owner's): the session cookie and `TRUSTED_PROXIES` likely follow the front's origin for the web routes.
- **Revised by Product owner, 2026-10-12 (option A):** the build environment is a single server with one public entry point (one ngrok URL). The front is the only door: it forwards the web routes **and** `POST /oauth/token` and every JSON call (under a path prefix the front strips when forwarding; no API code change). This replaces end-state point 2 and the "JSON endpoints and `/oauth/token` not forwarded" part of D10; `NEXT_PUBLIC_API_URL` becomes the front's own origin. API environment (Product owner's): `APP_URL` = the public front URL; `TRUSTED_PROXIES` = the front's address; `SESSION_DOMAIN` unset; secure cookies on; `expose_php=Off`.
- **Type:** Change (adds behaviour, touches security). Traditional workflow (section 3a), not fast lane (Product owner, 2026-10-12).
- **Status:** accepted; design summary to draft
- **Affects:** R1 (runs after it); the deploy guides in `tazavera-documentation/`. The contract does not change: these web routes are intentionally absent from `contracts/openapi.yaml`.

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

## R40 — Document the 422 and 404 responses in the API (tazavera-api)

- **Duplicated:** none. Scribe documented a response only from an example; only two write endpoints had a 422 example, and no read by identifier had a 404.
- **Where today:** `tazavera-api`, the write controllers, the reads by identifier and the Scribe example files
- **Why it pays off now:** R8 (per-field errors) and R18 (unknown item message) waited for it
- **Owning capability:** API (outside the front)
- **Proposed change:** done in `tazavera-api` `feature/document-422-404-responses` (`78548de`, docs regenerated `5228a3b`), merged into `dev`, `PROD` aligned. Every write endpoint documents its 422 (`message` plus `errors` per field), every read or action by identifier its 404, and a JSON 404 answers a translated message (`exceptions.not_found`, en/es/ca). API suite 158/158. Contract copied to the front (`2bdde09`, identical to the API's `public/docs/openapi.yaml`); R18 and R8 built on it afterwards and are in `master`.
- **Open decision (Augusto):** none. Product owner's review of the API diff was not recorded before the merge (`git -C tazavera-api show 78548de`)
- **Type:** Change
- **Status:** closed (2026-10-09; closed in this file 2026-10-10)
- **Affects:** R8, R18 (both done)

## R50 — Consensus concordance loses the parent of unmarked intermediate notes (API; found by the design lead for R49)

- **Duplicated:** none. `resolveParentOfferingTasteId` looked a node's parent up only among the directly marked references, so unmarked level-1 ancestors came back at the top level of `cataConcordance`.
- **Where today:** `tazavera-api/app/Services/OfferingConsensusService.php`
- **Why it pays off now:** R49 renders the notes as nested trees
- **Owning capability:** API (consumed by landing and offering-catalog)
- **Proposed change:** done in `tazavera-api` `feature/resolve-consensus-parents` (`3b531c6`, merge `709c617`), `PROD` aligned: unmarked ancestors are registered while climbing the tree, so no level-1 or level-2 note stays at the root; regression test (40 orphans before, 0 after), API suite 159/159. The contract does not change.
- **Open decision (Augusto):** none
- **Type:** Change (API)
- **Status:** closed (2026-10-09; closed in this file 2026-10-10)
- **Affects:** R49, the flavor wheel

## R10 — Error boundary of the row facets in the traditional theme (refine-facet-controls Q2)

- **Duplicated:** none
- **Where today:** the row facet controls of `add-facet-controls`
- **Why it pays off now:** the first facet that shows a validation error
- **Owning capability:** filtering
- **Proposed change:** none. Closed without a code change on 2026-10-09: a cloud session verified that the facets already use `border-feedback-error`, the project's error token (in the traditional theme `oxblood-300` on the sidebar); the cream tone comes from the design, and Product owner wants no contrast questions
- **Open decision (Augusto):** none
- **Type:** Change
- **Status:** closed (2026-10-09; closed in this file 2026-10-10)
- **Affects:** none

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
