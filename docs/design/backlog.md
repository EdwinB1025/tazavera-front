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
| 1 | R84 | `fill-inventory-detail-width` | Refactor (fast lane), AUT | S | — |
| 2 | R85 | `show-pointer-on-actions` | Refactor (fast lane), AUT | S | — |
| 3 | R86 | `open-directory-from-hero` | Refactor (fast lane), AUT | S | — |
| 3a | R88 | `suggest-inventory-coffee-names` | Refactor (fast lane), AUT | S | — |
| 3c | R89 | `select-inventory-origin-and-process` | Refactor (fast lane), AUT, round 2 | S | R88 in `qa` |
| 4 | R1 | none yet (Playwright suite) | Change (tests) | — | R74 in `develop` (Product owner, 2026-10-12) |
| 5 | R45 | none yet | Change (behaviour, API) | M | Product owner: deferred, to review 2026-10-12; not to be designed yet |
| 7 | R90 | none yet (API A1 and A3 first) | Change (API, behaviour) | M | `tazavera-api` A1; R89 in `develop` |
| 6 | R83 | none yet (API) | Change (API) | S | Product owner: whether to take it |

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

## R84 — The coffee inventory detail does not fill the page width (production AUT, 2026-10-13)

- **Duplicated:** none. The detail's column (`COLUMN_CLASSES` in `InventoryDetailClient.tsx`) uses `items-start`, so the back link, the detail body and its cards shrink to their content width instead of filling the page container, unlike every other detail view (offering detail, coffee shop detail).
- **Where today:** `src/pages/inventory-detail/ui/InventoryDetailClient.tsx`
- **Why it pays off now:** Product owner sees the detail cut short on desktop when opening a card from the inventory list
- **Owning capability:** offering-management
- **Proposed change:** `fill-inventory-detail-width`. Settled end state: the detail body (header, panels, error and loading states) fills the page container at every width, like the offering detail; the back link keeps its own width at the start of its line
- **Open decision (Augusto):** none. Fast lane by Product owner's order (AUT correction, 2026-10-13), maximum priority
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** none

## R85 — Pointer cursor on every link and action (production AUT, 2026-10-13)

- **Duplicated:** none. Tailwind 4 no longer gives buttons the pointer cursor; only a few controls set `cursor-pointer` themselves (`BeanScale`, `DescriptorChipGroup`, `FlavorWheelChart`, `FlavorWheelNoteList`, `IntensitySlider`, `Tabs`, `facet-row`), so most buttons, toggles and clickable elements show the arrow.
- **Where today:** `src/app/styles/globals.css` (base layer) and the controls above
- **Why it pays off now:** Product owner's order: every object with a route or an action shows the link pointer
- **Owning capability:** base-controls
- **Proposed change:** `show-pointer-on-actions`. Settled end state: every enabled link, button, `role="button"`, toggle, tab, chip, select trigger and other clickable control shows the pointer cursor on hover, from one rule in the base layer; disabled controls keep the default cursor; text fields keep the text cursor
- **Open decision (Augusto):** none. Fast lane by Product owner's order (AUT correction, 2026-10-13), maximum priority
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** none

## R86 — The landing's "Explore coffees" opens the coffee shop directory (production AUT, 2026-10-13)

- **Duplicated:** none. The hero's `ExploreButton` (`src/pages/home/ui/ExploreButton.tsx`) scrolls to the landing's own offerings block (`#offerings`), as the landing spec "Explore scrolls to the offerings" states.
- **Where today:** `src/pages/home/ui/ExploreButton.tsx`, `HomeHero.tsx`; `openspec/specs/landing/spec.md` (scenario "Explore scrolls to the offerings")
- **Why it pays off now:** Product owner expects the button to open the list of coffee shops
- **Owning capability:** landing
- **Proposed change:** `open-directory-from-hero`. Settled end state: the hero's "Explore coffees" button opens the coffee shop directory of the active locale (`/{locale}/coffeeshops`) and no longer scrolls; its label, look and place stay the same. The about page's closing action is unchanged
- **Open decision (Augusto):** none. Fast lane by Product owner's order (AUT correction, 2026-10-13), maximum priority
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** none

## R88 — The inventory "Coffee name" facet suggests coffees as you type (production AUT, 2026-10-13)

- **Duplicated:** the offering facets (`src/features/offering-facets/ui/OfferingFacets.tsx`) and the new-offering form (`src/features/offering-management/ui/InventoryField.tsx`) use the interactive `Combobox` search (suggestions fetched while typing); the inventory facets (`src/features/inventory-facets/ui/InventoryFacets.tsx`) render Coffee name as a plain search text field committed on Enter.
- **Where today:** `src/features/inventory-facets/ui/InventoryFacets.tsx`; the coffee search `searchCoffees` / `searchByName` in `src/features/offering-facets/api/`
- **Why it pays off now:** Product owner's AUT review: the inventory list's coffee filter does not behave like the other coffee and roastery filters
- **Owning capability:** filtering
- **Proposed change:** `suggest-inventory-coffee-names`. Settled end state: the inventory list's "Coffee name" facet is the same interactive combobox as the offering facets' "Coffee" facet: it fetches coffee suggestions by name while typing (same search, same option lines, same loading/empty/error texts, inverse variant, max 150), choosing an option applies `coffeeName` and clearing it removes the filter; the chip and "Clear all" keep working. The coffee search moves to a layer both features can import (no copy). The other five inventory facets stay text fields
- **Open decision (Augusto):** none. Fast lane by Product owner's order (AUT, 2026-10-13), round 1, maximum priority; approval delegated to the orchestrator
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** none

## R89 — The inventory Country, Region and Process facets are selects of existing values; City names the roastery (production AUT, 2026-10-13)

- **Duplicated:** the offering facets list the existing processes (`options.processes`, distinct coffee values in `src/features/offering-facets/model/options.ts`, rendered by `OfferingFacetParts.tsx`); the inventory facets render Process as a free text field.
- **Where today:** `src/features/inventory-facets/ui/InventoryFacets.tsx`; `src/features/offering-facets/model/options.ts`, `OfferingFacetParts.tsx`
- **Why it pays off now:** Product owner's AUT review: process has a short closed set of values, a free text field invites misses
- **Owning capability:** filtering
- **Proposed change:** `select-inventory-origin-and-process`. Settled end state: (1) the inventory list's "Country", "Region" and "Process" facets offer the existing values as a single choice, built the same way and with the same control as the offering facets' list facets (distinct coffee values from the same source, no copy of the derivation); choosing one applies its key, choosing none removes it; when the values cannot be read the facet is disabled with the existing "options unavailable" help; (2) Region depends on Country: with a country chosen it lists only that country's regions, and changing the country removes a region that no longer belongs to it; (3) the "City" facet keeps filtering the roastery's city (`city`, `roastery.contacts`) and its label names that: es "Ciudad del tostador", en "Roastery city", ca "Ciutat del torrador". The other inventory facets are unchanged (Coffee name is R88). A coffee municipality does not exist in the API (only `country` and `region`); a Country → Region → Municipality cascade needs an API change and is out of scope
- **Open decision (Augusto):** none for this scope (Product owner, 2026-10-13: country also a select, front only). Whether to add a coffee municipality in the API later is open. Fast lane by Product owner's order (AUT, 2026-10-13), round 2 with R87, integrated only if ready in time; approval delegated to the orchestrator
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** R88 (same facet panel; R89 starts from `qa` after R88 is integrated, or rebases its design on it)

## R90 — Two origin cascades in the facets: coffee origin and roastery origin (front part of API A1 and A3)

- **Duplicated:** none. A coffee's origin is `country` and `region` only; the inventory facet "City" filters the roastery's contact city, not the origin (R89 renames it "Roastery city").
- **Where today:** the inventory and offering facets (`src/features/inventory-facets`, `src/features/offering-facets`); the coffee rows of the inventory card and detail (`src/entities/coffee-inventory/model/rows.ts`, `src/widgets/offering-detail/ui/InventoryPanel.tsx`)
- **Why it pays off now:** Product owner wants Country → Region → Municipality on the coffee filters (2026-10-13)
- **Owning capability:** filtering, offering-management, offering-catalog
- **Proposed change:** none yet. After `tazavera-api` backlog A1 (nullable `municipality` on coffees and its filter) and A3 (a roastery country filter beside the roastery city) are merged into `deploy` and the contract copied, the inventory and offering facets show two cascades, each level a select of existing values listing only the values under the chosen one: (1) coffee origin: Country → Region → Municipality; (2) roastery origin: Country → City. The coffee details show the municipality (Product owner, 2026-10-13)
- **Open decision (Augusto):** when to take it; it needs a design summary (new texts and screens)
- **Type:** Change (API first)
- **Status:** proposed
- **Affects:** R89 (same facet panel, must be in `develop` first)

## R83 — The API accepts any taxonomy descriptor on each sensory axis (API; found by Product owner, 2026-10-13)

- **Duplicated:** none. `StoreEvaluationRequest` and `UpdateEvaluationRequest` check each `descriptive.<axis>.cata.*` only with `exists:olfactory_taxonomies,ulid`, so the mouthfeel axis accepts aromatic notes (and the aromatic axes, main tastes and defects accept descriptors of other categories). The seeded evaluations showed aromatic notes on the body axis; the seeder is fixed (`tazavera-api` `deploy` `ab6c1d5`), the validation is not.
- **Where today:** `tazavera-api/app/Http/Requests/StoreEvaluationRequest.php`, `UpdateEvaluationRequest.php`
- **Why it pays off now:** the front only offers mouthfeel descriptors on the body axis, but any other client can store mixed categories, which then reach the consensus
- **Owning capability:** API (consumed by evaluations and offering-catalog)
- **Proposed change:** none yet. In `tazavera-api`, locally from `deploy`: each axis accepts only the descriptors of its category (`mouthfeel` level 1 for the body; aromatic leaves for fragrance, aroma, flavor and aftertaste; `main_tastes` level 0; `defects`), with a translated 422 per field
- **Open decision (Augusto):** whether to take it, and when
- **Type:** Change (API)
- **Status:** proposed
- **Affects:** none in the front

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
