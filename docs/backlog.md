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

## Priority order (2026-10-08)

The entries below follow this order. The order runs security first, then the shared layers before their consumers (FSD), then the entries that wait for a decision, and last the blocked or deferred ones. An entry that another change resolves sits right after it. R20–R38 come from `docs/review/technical-review.md` §3, which has each candidate's files, principle, risk, protecting tests and expected grade. Effort: S < 2 h, M 2–6 h, L > 6 h.

| # | Entry | Change | Type | Effort | Waits for |
|:-:|---|---|---|:-:|---|
| 0 | R41 | none (closed: environment, no code) | Deploy note | — | — (closed by Product owner 2026-10-08) |
| 0d | R47 | none (closed: no code change) | Unplanned fix | — | — (Product owner 2026-10-08, option A: re-test on current develop) |
| 0e | R48 | `refine-offering-facets-aut` | Correction (fast lane, maximum priority) | M | R46 merged (same files); design lead on finding 16's open points |
| 0f | R49 | `nest-card-taste-notes` | Correction (fast lane, maximum priority) | M | — |
| 0g | R51 | `widen-account-cards` | Correction (fast lane, maximum priority) | S | design lead on its open points |
| 0i | R53 | `add-explore-offerings-entry` | Correction (fast lane, maximum priority) | S | design lead on its open points |
| 0j | R54 | `rename-coffeeshop-card-action` | Correction (fast lane, maximum priority) | S | design lead on its open points |
| 0k | R55 | `fit-bean-mark-disc` | Correction (fast lane, maximum priority) | S | design lead on its open points |
| 0l | R56 | `cascade-evaluation-descriptors` | Correction (fast lane, maximum priority) | M | R48, R49 and round 3 merged (Product owner 2026-10-08: drafts also choose ancestors; read-only views as nested trees; level-2 rows without indent) |
| 0m | R57 | `add-form-cancel-actions` | Correction (fast lane, maximum priority) | M | round 3 merged into `develop` (Product owner 2026-10-08: no Cancel on profile/password; add the New offering Cancel scenario) |
| 0o | R59 | `drop-step-up-for-everyday-writes` | Correction (auth; fast lane, maximum priority for the front) | S | the regenerated contract in `contracts/openapi.yaml` (API change on `tazavera-api` `dev` `71bc91b`); R51 merged (same account page) |
| 0p | R60 | `add-header-theme-toggle` | Correction (fast lane, maximum priority) | S | — (Product owner 2026-10-08: icon of the current theme; `gap-2` below md; with R53 in one package) |
| 0q | R61 | `stack-flavor-wheel-layout` | Correction (fast lane, maximum priority) | S | round 3 (`qa`, with R37's FlavorWheel split) merged into `develop` |
| 0r | R62 | `nest-consensus-notes` | Correction (fast lane, maximum priority) | M | R49 merged (tree rendering to reuse); design lead on its open points |
| 0s | R63 | `add-bottom-back-links` | Correction (fast lane, maximum priority) | S | design lead on its open points (with R51, layout package) |
| 16c | R50 | API branch in `tazavera-api` | Change (API) | S | Product owner: verify with real data (the API should deliver the resolved tree) |
| 1 | R20 | `upgrade-next-16-4` | Refactor (fast lane) | S | — |
| 2 | R39 | `add-code-structure-lint-rules` | Refactor (fast lane) | S | R20 (the ESLint config upgrades with it) |
| 3 | R31 (+ R3) | `harden-response-headers` | Refactor (fast lane) | S | — |
| 4 | R21 | `tidy-shared-imports` | Refactor (fast lane) | S | — |
| 5 | R22 | `extract-field-control-hook` | Refactor (fast lane) | M | — |
| 6 | R24 | `route-public-reads-through-client` | Refactor (fast lane) | S | — |
| 7 | R26 | `share-evaluation-offerings-loader` | Refactor (fast lane) | S | — |
| 8 | R23 (resolves R13) | `remove-cross-feature-auth-imports` | Refactor (fast lane) | S | — |
| 9 | R5 | `share-active-locale` | Refactor (fast lane) | S | R23 |
| 10 | R25 | `move-account-requests-to-api` | Refactor (fast lane) | M | — |
| 11 | R27 | `split-evaluation-row-card` | Refactor (fast lane) | M | — |
| 12 | R28 | `reduce-shared-client-bundle` | Refactor (fast lane) | M | R21 |
| 13 | R29 (resolves R15) | `speed-up-test-environment` | Refactor (fast lane) | S | — |
| 14 | R30 (resolves R19) | `cache-reference-reads` | Refactor (fast lane) | S | — |
| 15 | R32 (+ R17) | `label-landmarks-and-headings` | Refactor (fast lane) | M | — |
| 16 | R40 | API branch in `tazavera-api` | Change (API) | M | PO: review of the API diff |
| 16b | R18 | `show-item-not-found-message` | Change (behaviour, texts) | M | R40 |
| 17 | R33 | `split-consensus-panel` | Refactor (fast lane) | M | — |
| 18 | R34 | `split-evaluation-form-state` | Refactor (fast lane) | L | — |
| 19 | R38 | `split-account-and-management-panels` | Refactor (fast lane) | M | — |
| 20 | R37 | `split-flavor-wheel` | Refactor (fast lane) | L | — |
| 21 | R35 | `unify-api-result-shape` | Refactor (fast lane) | L | R24, R25 |
| 22 | R36 (resolves R16) | `prune-unused-exports` | Refactor (fast lane) | M | the splits above. R4 (16px, spec wording) rides with it as a change |
| 23 | R10 | none yet | Change (behaviour) | S | before the first facet that shows an error |
| 24 | R8 | none yet | Change (behaviour) | M | R40; after R25 and R35 |
| 25 | R1 | none (Playwright suite) | Change (tests) | — | the pre-deployment E2E suite |
| 26 | R43 | `adopt-next-intl-routing` | Change | L | last priority (Product owner, 2026-10-08); after R28 and R31 |
| 27 | R44 | none yet | Change (auth, API) | M | Product owner: API change on the web side and contract update |
| 28 | R45 | none yet | Change (behaviour, API) | M | Product owner: API change and contract update; not to be designed yet |

Every entry of the technical review (R20–R39) takes the fast lane by Product owner's decision of 2026-10-08, including R30, R31 and R32, which change a design decision, security headers and texts; R17 and R19 ride with R32 and R30. R3 (tests, rides with R31) and R4 (spec wording) are typed `Change`.

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

## R48 — Offering facets: cascade, taste-note chips and score scale (production AUT findings 15, 16 and 17, 2026-10-08)

- **Duplicated:** none. Three corrections to settled `filtering` behaviour, grouped because they touch the same facet components.
- **Where today:** `filtering` specs "Taxonomy cascade facet", "Offering facets in the sidebar" (row 3) and "Offering filter state in the URL"; `src/shared/ui/FacetCascade.tsx`; `src/features/offering-facets/` (`model/query.ts` `SCORE_MIN`, the score facet and its chip)
- **Why it pays off now:** Product owner's AUT
- **Owning capability:** filtering (with form-fields for the chip look)
- **Proposed change:** `refine-offering-facets-aut` (M)
- **Open decision (Augusto):** answered 2026-10-08 (relayed by the testing/deployment session):
  - **15, cascade:** "the children are only shown if the parent is touched". A parent's children render only while the parent is checked; checking the parent shows them unchecked; unchecking the parent hides and unchecks them, so no hidden child stays applied; no separate expand control. It replaces "Checkboxes SHALL be independent… a child SHALL be checkable without its parent", the separate expand control and the scenario "Unchecking keeps children visible". Sending the parent plus the checked children stays valid (`Offering::cataRef` matches exact ULIDs with OR).
  - **16, taste-note look:** the taste notes in the facet look like the taxonomy badges of the offering card, reusing `form-fields` "Descriptor chip group": unchosen, the taxonomy's data-colour dot before the label; chosen, the option's taxonomy badge with a check mark. Open for the design lead: the contrast of the chips and badges on the dark sidebar (`variant-inverse`) in both themes, and how the chip look fits 15's parent/child rows.
  - **17, score scale:** option A: the offerings "Average score" slider and its From/To inputs go from 60 to 100; with no filter nothing is sent and the facet shows 60–100; offerings list only (the evaluations score facet keeps 0–100). Affects "Offering facets in the sidebar" row 3, "Offering filter state in the URL" ("the full 0–100 range" and the out-of-limit rule), `SCORE_MIN` and the chip text. The contract still allows 0–100: no API change.
- **Type:** Correction (fast lane, maximum priority, Product owner's standing rule)
- **Status:** accepted
- **Affects:** waits for R46 (same files); whether 15 also applies to the evaluations taste-notes facet (shared `FacetCascade`) is to be confirmed by Product owner

## R49 — Taste notes on the offering card as nested trees (production AUT finding 18, 2026-10-08)

- **Duplicated:** none. The card renders the taste notes in three flat rows, one per level (`src/entities/offering/ui/OfferingCard.tsx:127-139`), as the `landing` spec "Taxonomy badges on the offering card", scenario "Rows by level", states.
- **Where today:** `src/entities/offering/ui/OfferingCard.tsx`; the taxonomy resolution of the offering list (`src/widgets/offering-list/lib/resolve-taxonomies.ts`)
- **Why it pays off now:** Product owner's AUT
- **Owning capability:** landing (with offering-catalog)
- **Proposed change:** `nest-card-taste-notes` (M)
- **Open decision (Augusto):** answered 2026-10-08 (correction, relayed by the testing/deployment session): the taste notes render as nested trees: each level-0 note with its children (and theirs) nested under it, and the trees side by side, wrapping. Visual reference: the MVC descriptor cascade (`C:/Porjects/Full Stack/Sprint4/MVC/tazavera-app/resources/views/layouts/evaluations/partials/descriptor-cascade.blade.php`): each root a block in a `flex flex-wrap gap-3` container; level 1 under its root with `ml-5 mt-2`, a left border and `pl-3`, in a column; level 2 under its level-1 parent with `ml-5 mt-1.5`, wrapping; pills smaller with depth (to be translated into this project's semantic tokens). Open for the design lead: how a child whose parent is not among the offering's notes is placed; keeping the card from growing too tall; keeping the existing taxonomy badge colours and level treatment. Answered 2026-10-08 (Product owner): the API always delivers the consensus tree resolved, so the card renders the concordance tree as it arrives (a note sits where the tree places it; no re-attachment); no cap on the card (real evaluations identify few flavours; the high counts come from the seeders). Only evaluation data, which arrives flat, is resolved into a tree by the front.
- **Type:** Correction (fast lane, maximum priority, Product owner's standing rule; replaces the "Rows by level" scenario)
- **Status:** accepted
- **Affects:** none

## R51 — Account cards take the full container width (production AUT finding 19, 2026-10-08)

- **Duplicated:** none. `pages/account/ui/AccountScreen.tsx:84` (`flex w-full max-w-lg flex-col gap-8`) keeps the cards in a 32rem start-aligned column (add-user-account D10, adopt-section-card-in-account item 4, from the MVC settings layout); `AccountScreen.test.tsx` asserts `max-w-lg`.
- **Owning capability:** user-account
- **Open decision (Augusto):** answered 2026-10-08: the account cards take the full container width with the page's usual side margins ("they look cut off"). Open for the design lead: whether the form fields inside the cards keep a readable maximum width; the register routes (centred 32rem) are not in scope (Product owner spoke only of the account page).
- **Type:** Correction (fast lane, maximum priority) · **Status:** accepted · **Affects:** none

## R53 — "Explore offerings" entry for the specialist (production AUT finding 21, 2026-10-08)

- **Duplicated:** none. A specialist has no direct route to the full offerings list (`/{locale}/offerings` with no query, provisional included): the user menu offers account, security, theme, the role's management entry and sign out; the specialist sidebar (`app/shell/SessionShell.tsx:58-63`) holds only "My evaluations"; the header's "Top rated" opens verified offerings only.
- **Owning capability:** app-shell
- **Open decision (Augusto):** answered 2026-10-08: add "Explore offerings" in BOTH the user menu (next to "Manage evaluations") and the specialist management sidebar (next to "My evaluations"); new catalog texts es/en/ca; spec scenarios "Management entry for a specialist" and the sidebar entries. Open for the design lead: the entries' order, the icon, and whether the coffee-shop role gets it too (Product owner asked only for the specialist).
- **Type:** Correction (fast lane, maximum priority) · **Status:** accepted · **Affects:** none

## R54 — Coffee-shop card action reads "Ver ofertas" (production AUT finding 22, 2026-10-08)

- **Duplicated:** none. `messages/es/coffeeshops.json:9` `"viewLabel": "Ver"`; spec `offering-catalog` "Coffee shop card" (a View action to the coffee shop detail; scenarios "Card content" and "View link").
- **Owning capability:** offering-catalog
- **Open decision (Augusto):** answered 2026-10-08: the label reads "Ver ofertas" (en "View offerings", ca "Veure ofertes", to be confirmed by the design lead); destination unchanged (the coffee shop detail). Open for the design lead: whether it opens the Offerings tab explicitly.
- **Type:** Correction (fast lane, maximum priority) · **Status:** accepted · **Affects:** none

## R55 — Bean mark disc inside the bean (production AUT finding 23, 2026-10-08)

- **Duplicated:** none. `shared/ui/icons.ts` `BeanMark` (used by `BeanScale`: evaluation form, evaluation sheet, consensus panel, scale legend): the disc is a `rect` with `rx 14.4` filling the viewBox (`icons.ts:68-75`) and the bean path is scaled ×1.33 (`icons.ts:38-41`), so the disc frames the bean as a coin (add-evaluation-scales design.md D4).
- **Owning capability:** feedback
- **Open decision (Augusto):** answered 2026-10-08: "the circle is the background of the bean; it must not go beyond the bean's outline": a smaller disc behind the bean, entirely inside its outer contour (closer to the MVC `flux/icon/coffee-bean.blade.php`, circle `scale(0.58)`); reverses D4. Open for the design lead: disc radius and centre (or a shape following the bean), whether the bean keeps its ×1.33 scale, the on/off contrast of `evaluation-bean-on`/`-off` once the disc no longer frames the bean, and the readOnly partial-bean cut (`BeanScale.tsx:167-173`).
- **Type:** Correction (fast lane, maximum priority) · **Status:** accepted · **Affects:** every `BeanMark` consumer

## R56 — Evaluation form descriptors as the MVC cascade (production AUT finding 24, 2026-10-08)

- **Duplicated:** the cascade behaviour R48 builds for the offerings taste-notes facet; the evaluation form would carry a second one.
- **Where today:** `src/pages/evaluation-form/ui/DescriptorBlock.tsx:43-66` and `src/entities/taxonomy/model/descriptor-rows.ts` build `DescriptorChipGroup` rows: one row per level-0 node with level-1 children (the root a non-selectable row title, the children always visible), one shared row for the roots without children; level 2 never shown (add-offering-catalog D13, evaluation-form design.md D7, `form-fields` "Descriptor chip group"). Used for the main tastes and each axis' CATA.
- **Owning capability:** evaluations (with form-fields)
- **Proposed change:** `cascade-evaluation-descriptors` (M)
- **Open decision (Augusto):** answered 2026-10-08 (correction, relayed by the testing/deployment session): the evaluation form's descriptor selectors work like the MVC cascade (`resources/views/layouts/evaluations/partials/descriptor-cascade.blade.php`, used by `evaluation-form.blade.php:63` and `evaluation-axis.blade.php:55,109`): every level-0 node is a selectable chip; level 1 renders only while its root is chosen; level 2 only while its level-1 parent is chosen; choosing adds only that node; unchoosing removes the node and all its descendants. Keep the chip look of finding 16 (taxonomy badge with ✓ when chosen, colour dot when not). Same model as R48 (findings 15/16) and R49 (finding 18). Open for the design lead: whether level 2 is now shown (check the API accepts level-2 refs in the evaluation payload and the consensus); whether the read-only views (evaluation sheet, consensus panel) switch to nested trees; keyboard and ARIA of nested chips (today one tab stop with arrow keys); sharing one cascade component with the offerings facet (R48) and the card trees (R49).
- **Type:** Correction (fast lane, maximum priority) · **Status:** accepted
- **Affects:** waits for R48 (shared cascade); R34 on `qa` reorganised the evaluation form (`EvaluationForm`, `EvaluationGroupCard`): the merge of R56 into `develop` and the next `qa` → `develop` must be reconciled

## R57 — Every create/update form offers Cancel (production AUT finding 25, 2026-10-08)

- **Duplicated:** the Cancel pattern exists in some forms only.
- **Where today:** evaluation form, new and edit (`pages/evaluation-form/ui/EvaluationForm.tsx:251` back link to `/{locale}/manage/evaluations`; `FormActions.tsx:73-88` only Save and Close evaluation): missing, the one reported. New offering (`NewOfferingForm.tsx:142`), location form (`LocationForm.tsx:215`) and account contact section (`ContactSection.tsx:294`): have it. Register forms (`RegisterForm.tsx`): missing. Account profile and password forms (`ProfileForm.tsx:162`, `PasswordForm.tsx:218`): inline, always-open, submit only.
- **Owning capability:** evaluations, user-account (with base-controls for the actions row)
- **Proposed change:** `add-form-cancel-actions` (M)
- **Open decision (Augusto):** answered 2026-10-08: every create/update form offers "Cancel" next to the submit, in the actions-row order of New offering (submit, then Cancel), going to the same destination as the page's back link, sending no request. Open for the design lead: whether Cancel warns about unsaved input in the (long) evaluation form; the evaluation form's action bar with three actions; the register forms' destination (landing or previous page). Open for Product owner: the inline profile and password forms (no Cancel, or a Cancel that restores the saved values).
- **Type:** Correction (fast lane, maximum priority) · **Status:** accepted
- **Affects:** R34 on `qa` reorganised the evaluation form (`FormActions.tsx` touched); R38 on `qa` splits `ContactSection`

## R59 — Step-up only for password and account removal (production AUT finding 27, 2026-10-08)

- **Duplicated:** none. The front asks for step-up (`requestProfileWrite`) before operations that, by Product owner's decision, no longer need `profile:write`.
- **Where today:** `ProfileForm.tsx:158`, `ContactSection.tsx:283`, `LocationForm.tsx:203`, `ManageOfferingsPanel.tsx:181` / `DeleteOfferingsDialog` (they drop step-up); `PasswordForm.tsx:214` and `DangerZone.tsx:97` (they keep it); `NewOfferingForm.tsx:87` also calls it although `POST /offerings` needs no write scope (check against the contract). API routes in `tazavera-api/routes/api.php` (`:49-50`, `:54-57`, `:86`, `:88`, `:90`, `:92`, `:94`).
- **Owning capability:** auth (with user-account, offering-management)
- **Open decision (Augusto):** answered 2026-10-08: no longer `profile:write`: `POST /locations`, `POST /users/{user}/contacts`, `PUT /users/{user}`, `DELETE /offerings/{offering}` and `DELETE /offerings` (the confirmation dialog stays). Keep `profile:write`: `PUT /users/{user}/password`, `DELETE /users/{user}`, `DELETE /users/{user}/force` (the two account ones also keep their confirmation dialog). The API's security page is unchanged. Product owner changes the API first.
- **Updated 2026-10-08 (Product owner, option A):** only adding a contact (`POST /users/{user}/contacts`) and adding a location (`POST /locations`) leave `profile:write`; updating the profile (`PUT /users/{user}`), the password, deactivating and deleting the account, and deleting offerings KEEP it. The account page splits into two parts: one that shows the profile data and lets the user add a contact and a location with no step-up, and an "Edit profile" part that asks for the permission (with the password and account removal). API change done by the orchestrator on `tazavera-api` branch `feature/relax-contact-location-scopes`, fast-forwarded into `dev` (`71bc91b`; API tests 145/149, the 4 failures are `WebThemeAndLocaleTest` needing a Vite build in the worktree); Product owner ports it to `PROD`. Front: `ContactSection` and `LocationForm` drop `requestProfileWrite`; `ProfileForm`, `PasswordForm`, `DangerZone` and the offering deletions keep it; check `NewOfferingForm` (`POST /offerings` needs no write scope). The account-page split needs the design lead.
- **Type:** Correction (touches the auth flow and the API contract; front in the fast lane at maximum priority once the contract lands) · **Status:** accepted
- **Affects:** waits for the API change and the regenerated `contracts/openapi.yaml`: do not start the front until the contract shows the new scopes. R38 (on `qa`) split `ContactSection`, `LocationsPanel` and `ManageOfferingsPanel`.

## R60 — Theme switch in the header for every visitor (production AUT finding 28, 2026-10-08)

- **Duplicated:** none. The only theme control is `ThemeSelect`, a native `<select>` inside the signed-in user menu (`widgets/app-header/ui/UserMenu.tsx:125-127`); anonymous visitors have none although `app-shell` "Theme selection" says the choice "needs no sign in"; the select shows the raw value "traditional", untranslated, with no visible label.
- **Owning capability:** app-shell
- **Open decision (Augusto):** answered 2026-10-08: an icon button next to the language selector, on every viewport (visible like the language selector when the primary navigation collapses), switching between traditional and dark, keeping the choice in the browser as today (`shared/lib/theme`, cookie); an accessible name that names the action and the current theme (es/en/ca), with the pressed/current state exposed. Open for the design lead: the icon pair (through `shared/ui/icons.ts`), a toggle or a small menu like the language selector, whether `ThemeSelect` leaves the user menu (and the user-menu spec scenario), and the header contrast in both themes.
- **Type:** Correction (fast lane, maximum priority) · **Status:** accepted · **Affects:** R53 (also edits the user menu)

## R61 — CATA flavor wheel always stacked (production AUT finding 29, 2026-10-08)

- **Duplicated:** none. `shared/ui/FlavorWheel.tsx:58-66` switches from `@2xl` to a two-column grid (wheel in column 1 `max-w-128`; description panel, group legend and notes list in column 2, `grid-cols-[minmax(0,32rem)_minmax(16rem,1fr)]`), from the add-offering-detail/consensus design (D8, summary §6). Only consumer: `widgets/offering-detail/ui/ConsensusPanel.tsx:459`.
- **Owning capability:** feedback (with offering-catalog)
- **Open decision (Augusto):** answered 2026-10-08: the CATA wheel keeps the mobile-first stacked structure on every width, top to bottom: the wheel (centred, `max-w-128`), the description fragment (the hovered/focused note's description and its `n/total` legend), the "Notes" disclosure. With the mouthfeel groups (D19) the general group legend stays in the stacked order, under the wheel and before the description. Drop the `@2xl` grid (LAYOUT_CLASSES, GROUPED_LAYOUT_CLASSES, WHEEL_CLASSES, GROUPED_WHEEL_CLASSES); update `FlavorWheel.test.tsx` assertions on the `@2xl` classes.
- **Also in this package (findings 31 and 32, 2026-10-08):**
  - **31, rings:** "the parents are the first levels inside the circle, then the children grow outwards". Today only ring 0 is drawn on arrival and children appear after expanding a note (`feedback` "Flavor wheel": "Ring 0 only at first", "Rings follow the deepest expanded level"). Testing session's reading, to confirm by the design lead: draw every consensus level from the start (level 0 inside, then 1, then 2 outwards); if expansion stays, it focuses or zooms a branch instead of revealing rings. Decision change.
  - **32, centre number:** the evaluation total in the centre (`<text font-size="28">`, viewBox `-204 -204 408 408`, `fill-text-primary font-serif font-bold`) gets smaller, in proportion with the ring labels (font-size 13); the design lead picks the size.
- **Type:** Correction (fast lane, maximum priority) · **Status:** accepted
- **Affects:** R37 (on `qa`) split `FlavorWheel` into `FlavorWheelChart`, `FlavorWheelPanel`, `FlavorWheelNoteList` and helpers: R61 starts from `develop` once round 3 is merged there

## R62 — Consensus "Notes by attribute" as nested trees with inline counts (production AUT finding 30, 2026-10-08)

- **Duplicated:** a second tree rendering next to R49's card trees.
- **Where today:** `widgets/offering-detail/ui/ConsensusPanel.tsx` (split by R33 into `AxisDetail.tsx`, `SelectionBlock.tsx`, `ConsensusLegend.tsx`, `lib/identified-counts.ts`): `identifiedCounts` flattens the API tree into a `ref → count` map; the axis sections map it onto `buildDescriptorRows` (the full taxonomy), where a level-0 node with children is only a row title and level 2 is never shown; the legend is a separate `md:w-56` column listing only level-1/shared chips. Settled by add-offering-catalog D13/D18.
- **Owning capability:** offering-catalog
- **Open decision (Augusto):** answered 2026-10-08: (a) each note's consensus legend (`name n/total`) goes next to its own note box/badge, with no separate legend column; (b) each axis renders only the consensus nodes of that axis as the API's resolved tree (root → its consensus children → their consensus children), nested like the MVC cascade (same model as R49/R56). The API already sends the resolved tree (`sensoryTaxonomy`, `cataConcordance`: `{ref, type, level, count, children[]}` with levels 0–2); front only. Open for the design lead: whether the inline legend also applies to the "Main tastes" and "Defects" selection blocks (recommended yes); reusing one tree component with R49 and R56.
- **Type:** Correction (fast lane, maximum priority) · **Status:** accepted
- **Affects:** R56 open point O2 (the consensus panel now goes to nested trees by this decision); waits for R49 (tree rendering)

## R63 — "Back" also at the end of every detail view (production AUT finding 33, 2026-10-08)

- **Duplicated:** the top back link of each detail view, repeated at the end.
- **Where today:** `/{locale}/offerings/[ulid]`, `/{locale}/coffeeshops/[ulid]`, `/{locale}/evaluations/[ulid]` (public evaluation), `/{locale}/manage/evaluations/[ulid]` (evaluation sheet/form): the back link (`BackLink`, previous page with fallback, from fix-production-aut-findings) shows only at the top.
- **Owning capability:** base-controls (with offering-catalog, evaluations)
- **Open decision (Augusto):** answered 2026-10-08: every detail view also shows "Back" at the END of the page, keeping the top one, with the same destination. Open for the design lead: placement after the last tab panel or section, inside the page container and not inside a tab; in the evaluation form, whether the bottom "Back" and R57's "Cancel" are redundant.
- **Type:** Correction (fast lane, maximum priority) · **Status:** accepted · **Affects:** R57 (evaluation form actions)

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

## R31 — Harden the response headers

- **Duplicated:** none. The `nosniff`, `Referrer-Policy` and `Permissions-Policy` headers are missing, and `X-Powered-By` is exposed.
- **Where today:** `proxy.ts:48–120`, `next.config.ts:9`
- **Why it pays off now:** it raises the Security headers indicator from B to A. R3 can ride with it.
- **Owning capability:** app-shell
- **Proposed change:** `harden-response-headers` (S)
- **Open decision (Augusto):** answered 2026-10-08: approved; the headers keep the map and location features allowed (fast lane by Product owner's decision, although it touches security)
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** R3

## R3 — Cover the `/callback` exclusion and the `connect-src` fallback (verify S3)

- **Duplicated:** none
- **Where today:** `proxy.test.ts` (no case for the matcher exclusion or the unset-`NEXT_PUBLIC_API_URL` fallback), `proxy.ts:41-58`
- **Why it pays off now:** two ruled edge cases rest on review only; `add-auth` touches the same proxy seam for `/callback`
- **Owning capability:** app-shell
- **Proposed change:** none
- **Open decision (Augusto):** none
- **Type:** Change
- **Status:** proposed
- **Affects:** `add-auth`

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

## R44 — Automatic sign-in after registration

- **Duplicated:** none. After a registration the user has to type the same credentials again to sign in.
- **Where today:** `POST /register` (API group, stateless) returns 201 with the user only; the front shows the success panel, and "Sign in" starts the PKCE flow (`src/features/auth`). `/oauth/authorize` finds no API web session, so it asks for the credentials again. The first-party client already skips consent (`App\Models\Passport\Client::skipsAuthorization`)
- **Why it pays off now:** it removes the second credential entry right after registering
- **Owning capability:** auth, user-account
- **Proposed change:** none yet
- **Open decision (Augusto):** answered 2026-10-08: keep the current behaviour for now and register it. Options analysed (testing/deployment assistant, on Product owner's behalf):
  - (A) the front calls `signIn()` after the 201: it still asks for the credentials, and the browser blocks the popup outside a click;
  - (B) recommended: registration on the API's web side, which signs the user in with a web session and redirects to `/oauth/authorize`; the user ends up signed in through PKCE, tokens stay in memory and silent re-authentication (`prompt=none`) keeps working;
  - (C) the register controller returns tokens (personal access token or an internal password grant): the user stays signed in only until the first reload, because tokens live in memory and silent re-authentication needs a web session that does not exist; it also needs a new token entry point in `src/shared/api/tokens.ts` (security).
- **Type:** Change (touches the auth flow and the API contract)
- **Status:** deferred
- **Affects:** needs an API change by Product owner and a `contracts/openapi.yaml` update before any front work

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

## R28 — Reduce the shared client bundle

- **Duplicated:** cmdk and Radix (68 KB gzipped) load on every route; each route ships about 220 KB gzipped.
- **Where today:** the consumers of `src/shared/ui/index.ts`, `next.config.ts`
- **Why it pays off now:** the Performance grade is C.
- **Owning capability:** app-shell
- **Proposed change:** `reduce-shared-client-bundle` (M, starts with an investigation)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** comes after R21

## R15 — Slow `EvaluationForm` tests under load (add-user-contact checks)

- **Duplicated:** none; `src/pages/evaluation-form/ui/EvaluationForm.test.tsx` takes about 16s alone and about 58s in the full suite, where one case ("sends each descriptor block's selection to its request field") hit the 5000ms test timeout once and passed on re-run
- **Where today:** `src/pages/evaluation-form/ui/EvaluationForm.test.tsx`
- **Why it pays off now:** a flaky timeout breaks the checks of unrelated changes
- **Owning capability:** evaluations
- **Proposed change:** none yet — unplanned coverage fix (split the file or reduce user-event typing)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** none

## R32 — Label the landmarks and fix the heading order

- **Duplicated:** 4 unlabelled `<nav>`, card headings that skip a level, a signed-out prompt without an `h1`, and a `treeitem` without `aria-selected`.
- **Where today:** `PrimaryNav.tsx:65`, `HomeHero.tsx:78`, `AboutContent.tsx:114`, `AppSidebar.tsx:67`, `OfferingCard.tsx:125`, `CoffeeshopCard.tsx:49`, `FlavorWheel.tsx:516`
- **Why it pays off now:** these are axe best-practice findings (0 A/AA violations), so fixing them raises Usability from B to A.
- **Owning capability:** app-shell, content-structure
- **Proposed change:** `label-landmarks-and-headings` (M)
- **Open decision (Augusto):** answered 2026-10-08: approved with R17; the architect writes the labels in es/en/ca and the spec wording (fast lane by Product owner's decision, although it adds texts)
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** R17

## R17 — Result count not announced while the facets overlay is open (add-evaluation-facets verify W2)

- **Duplicated:** none. The list's `role="status"` result count sits in the page body. The open mobile filters overlay sets `aria-hidden` on everything behind it, so screen readers do not hear the count while the overlay is open. This affects every list with facets in the sidebar overlay: the catalog and "My evaluations".
- **Where today:** `src/pages/evaluations-list/ui/EvaluationsList.tsx`, `src/widgets/offering-list` (results status), and the shared `Sidebar` overlay in `src/shared/ui/Sidebar.tsx`
- **Why it pays off now:** the requirement "Filtered evaluation results" says the total is announced after each change; no scenario covers the overlay case
- **Owning capability:** app-shell (the shared overlay) or filtering
- **Proposed change:** none yet. It needs a new mechanism, such as an announcement region inside the overlay, so it is a correction for Product owner.
- **Open decision (Augusto):** answered 2026-10-08: yes, the count is announced while the overlay is open; done inside R32
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** none

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

## R18 — An item that does not exist shows a "not found" message in its own view (replaces "notFound() inside a streamed boundary answers HTTP 200", add-public-evaluations verify W3)

- **Duplicated:** two wrong answers to "this item does not exist":
  - an unknown offering, coffee shop or public evaluation shows "could not be loaded" with a Retry that can never succeed (`offering-catalog` "Error and retry", "Unknown coffee shop or failure"; `evaluations` read-only view, unknown ULID), because the contract documents no 404 for these reads;
  - a public evaluation that is not closed, an unknown evaluation in the specialist area and an unknown offering on the new-evaluation form show the whole 404 page.
- **Where today:** `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx`, `src/pages/offering-detail`, `src/pages/coffeeshop-detail`, `src/pages/evaluation-form` (`EvaluationDetail.tsx`, `NewEvaluationScreen.tsx`)
- **Why it pays off now:** Product owner's decision (2026-10-08): these are not 404 pages. The view keeps its layout and back link and shows a message naming what is missing ("<item> not found", or "no results" for an empty list), with no Retry. A failed request keeps the error with Retry. Verified: unknown URLs already answer HTTP 404 with the 404 page; a streamed 404 already carries `noindex` (Next.js docs, `loading.md` "Status Codes"), so the HTTP 200 needs no fix.
- **Owning capability:** offering-catalog, evaluations
- **Proposed change:** `show-item-not-found-message`
- **Open decision (Augusto):** answered 2026-10-08: a signed-in user without the right role keeps the 404 page. Texts (orchestrator's recommendation, delegated by Product owner): one title per item and one line under it, inside the view, above the existing back link, with no Retry:
  - viewing an offering (unknown identifier; also an unknown offering on the new-evaluation form): "Oferta no encontrada" / "Offering not found" / "Oferta no trobada"; "Puede que se haya retirado o que el enlace no sea correcto." / "It may have been removed, or the link may be wrong." / "Pot ser que s'hagi retirat o que l'enllaç no sigui correcte.";
  - viewing a coffee shop: "Cafetería no encontrada" / "Coffee shop not found" / "Cafeteria no trobada"; same line;
  - viewing an evaluation (unknown identifier, or not closed on the public view): "Evaluación no encontrada" / "Evaluation not found" / "Avaluació no trobada"; "Puede que aún no esté publicada o que el enlace no sea correcto." / "It may not be published yet, or the link may be wrong." / "Pot ser que encara no estigui publicada o que l'enllaç no sigui correcte." In the specialist area the line is the offering one ("removed").
  Full strings per item, not a "{item} not found" template, so every language keeps its grammar.
- **Type:** Change
- **Status:** accepted
- **Affects:** R40 (the 404 responses must be documented first)

## R35 — Unify the API result shape

- **Duplicated:** 4 result styles for not-found and failure
- **Where today:** every `*/api/*.ts`
- **Why it pays off now:** one way to handle errors across the code. It comes after R24 and R25.
- **Owning capability:** shared/api (with every consumer)
- **Proposed change:** `unify-api-result-shape` (L)
- **Open decision (Augusto):** answered 2026-10-08: approved; the architect chooses the result type in design.md; after R24 and R25
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** R8

## R36 — Prune the unused exports (resolves R16)

- **Duplicated:** knip finds 61 unused exports (scaffold primitives, over-wide indexes, `fetchVerifiedOfferings`).
- **Where today:** `src/shared/ui/Sidebar.tsx`, `DropdownMenu.tsx`, `Sheet.tsx`, `AlertDialog.tsx`, `src/shared/ui/index.ts`, the widget indexes
- **Why it pays off now:** it improves analysability. It goes last, so it does not fight the splits. R4 can ride with it.
- **Owning capability:** content-structure
- **Proposed change:** `prune-unused-exports` (M)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** R16, R4

## R16 — Unused `fetchVerifiedOfferings` (refine-list-pagination verify W1)

- **Duplicated:** two paths to the landing request. Since the unplanned fix `65ca95a`, `VerifiedOfferings` adds `perPage` and `Offerings` sends the request. `fetchVerifiedOfferings(page)` is now called only by its own tests.
- **Where today:** `src/widgets/offering-list/api/offerings.ts` (`fetchVerifiedOfferings`), `offerings.test.ts` (its cases), and the comment in `src/entities/taxonomy/api/taxonomies.test.ts:8`
- **Why it pays off now:** dead code with tests of its own suggests a path the landing does not use
- **Owning capability:** landing
- **Proposed change:** none yet; it can go into the test-suite reduction (it removes tests)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** none

## R4 — Align the shared menu panel radius with `base-controls` (refine-app-header, Q4)

- **Duplicated:** two radius choices for the same menu panel: the shared `DropdownMenu` card panel uses `rounded-container` (16px); the nav variant added by `refine-app-header` uses `radius-field` (8px), which is what `base-controls` states for menus
- **Where today:** `src/shared/ui/DropdownMenu.tsx` (card class set, `rounded-container`; nav class set, field radius)
- **Why it pays off now:** every new menu built on the card variant inherits the mismatch with `base-controls`
- **Owning capability:** base-controls
- **Proposed change:** none yet
- **Open decision (Augusto):** answered 2026-10-08: 16px. The card panel keeps `rounded-container`; `base-controls` is amended to allow it for card menus. The nav menu stays at 8px (orchestrator's recommendation, delegated by Product owner): a panel takes the radius of what opens it, so lists opened from a field or the navigation (Select, Combobox, nav menu) keep `radius-field` and a menu opened from a card keeps `radius-container`. Unifying would change the Select and Combobox lists too, for no gain. Spec wording only; no code change.
- **Type:** Change
- **Status:** accepted
- **Affects:** none

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

## R8 — Map 422 validation errors to their fields (decisions log 2026-10-06, "escrituras, rutas protegidas y 422")

- **Duplicated:** none yet; every form shows one generic form-level error for any 422
- **Where today:** the forms of `add-user-account`, `add-offering-management` and `add-specialist-evaluations` (planned)
- **Why it pays off now:** the API returns per-field messages, but the contract documents no 422 body; once Scribe documents it, each form can show the message under its `Field`
- **Owning capability:** form-fields (shared mapping), consumed by each form
- **Proposed change:** none yet — needs the 422 response documented in the API (Product owner)
- **Open decision (Augusto):** answered 2026-10-08: the API documents its 422 responses first (R40), then the change is scheduled
- **Type:** Change
- **Status:** proposed
- **Affects:** `add-user-account`, `add-offering-management`, `add-specialist-evaluations`

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
