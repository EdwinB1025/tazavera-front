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
| 2 | R68 | `add-coffee-inventory-explorer` | Refactor (fast lane), maximum priority (Product owner) | L | R67 (same user menu) |
| 3 | R45 | none yet | Change (behaviour, API) | M | Product owner: API change and contract update; not to be designed yet |
| 4 | R1 | none (Playwright suite) | Change (tests) | — | the pre-deployment Playwright suite |

## R68 — Explore the coffee inventory (Product owner, 2026-10-11)

- **Duplicated:** none. The coffee inventory is read today only by the New offering combobox (`searchCoffeeInventory` in `src/features/offering-management/api`, `coffeeName` only); reuse that request rather than adding a second one.
- **Where today:** nothing; the list screens to follow are the offerings list and the evaluations list (toolbar, cards, filters in the sidebar)
- **Why it pays off now:** the coffee shop sees the available inventory before creating offerings
- **Owning capability:** offering-management
- **Proposed change:** `add-coffee-inventory-explorer`, settled with Product owner on 2026-10-11:
  - **Entry point:** a user menu and mobile submenu entry "Explore coffee inventory", `coffeeshop` role only, after "Manage locations" (R67); route `/{locale}/manage/inventory`.
  - **List:** built like the offerings and evaluations lists (toolbar, cards, filters in the sidebar). Data from `GET /coffeeInventory` (`listCoffeeInventory`), which needs the `coffeeshop` role and `profile:read`: loaded on the client through the add-auth client (settled decision). The contract has no pagination: the list shows every item returned, with the list's loading, empty and error states.
  - **Filters:** only the query parameters the contract defines: `coffeeName` (max 150), `originCountry` (60), `originRegion` (90), `process` (60), `producer` (150), `city` (90), as text filters reflected in the URL like the other lists. No other filter.
  - **Card:** coffee name, country and region, process, variety, roast level, altitude, producer when present, certifications, roastery, roast lot and production date (only contract fields). Actions: "View" (`action-3`) and "Create offering" (`action-1`), following the button variant rule.
  - **View:** a detail page `/{locale}/manage/inventory/{ulid}` with every field of the item, built from the list data (the contract has no read of one inventory item); an unknown `ulid` shows the project's item-not-found message. Its header follows the header link rule (back link first; "Create offering" as an action button).
  - **Create offering:** opens New offering (`/{locale}/manage/offerings/new`) with that inventory item already selected in the inventory field; the coffee shop only picks the locations. Without a preselected item, New offering stays as today.
  - Texts in the message catalogs (es, en, ca); icons through `src/shared/ui/icons.ts`; semantic tokens only.
- **Open decision (Augusto):** none (entry point, card actions and detail page answered 2026-10-11)
- **Type:** Refactor (fast lane), by Product owner's decision (new screen; maximum priority)
- **Status:** accepted
- **Affects:** New offering (inventory preselection); the user menu (after R67)

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
