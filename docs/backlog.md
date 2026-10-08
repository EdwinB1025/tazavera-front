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
| 1 | R20 | `upgrade-next-16-4` | Refactor (fast lane) | S | — |
| 2 | R39 | `add-code-structure-lint-rules` | Refactor (fast lane) | S | R20 (the ESLint config upgrades with it) |
| 3 | R31 (+ R3) | `harden-response-headers` | Refactor (fast lane) | S | — |
| 4 | R21 | `tidy-shared-imports` | Refactor (fast lane) | S | — |
| 5 | R22 | `extract-field-control-hook` | Refactor (fast lane) | M | — |
| 6 | R24 | `route-public-reads-through-client` | Refactor (fast lane) | S | — |
| 7 | R26 | `share-evaluation-offerings-loader` | Refactor (fast lane) | S | — |
| 8 | R23 (resolves R13) | `remove-cross-feature-auth-imports` | Refactor (fast lane) | S | — |
| 9 | R5 | none yet | Refactor (fast lane) | S | R23 |
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

Every entry of the technical review (R20–R39) takes the fast lane by Product owner's decision of 2026-10-08, including R30, R31 and R32, which change a design decision, security headers and texts; R17 and R19 ride with R32 and R30. R3 (tests, rides with R31) and R4 (spec wording) are typed `Change`.

## R39 — Ship the code-structure rules as ESLint warnings

- **Duplicated:** none. The code-structure rules added to AGENTS.md on 2026-10-08 (imports inside a segment, no feature-to-feature imports, size and complexity limits) are checked only by review.
- **Where today:** `eslint.config.mjs`
- **Why it pays off now:** the refactors R21–R38 and every new change get a mechanical check. ESLint 9's built-in rules `complexity`, `max-lines`, `max-lines-per-function` and `no-restricted-imports` need no new dependency. They start as warnings, because the current code breaks them until the refactors land.
- **Owning capability:** app-shell
- **Proposed change:** `add-code-structure-lint-rules` (S)
- **Open decision (Augusto):** none (Product owner approved shipping the rules through ESLint on 2026-10-08)
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** R21, R23, R27, R33, R34, R36, R37, R38

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

## R24 — Route the public reads through `publicRequest`

- **Duplicated:** 6 hand-built API URLs
- **Where today:** `src/shared/api/coffees.ts`, `src/features/offering-facets/api/search-roasteries.ts`, `src/entities/evaluation/api/public-evaluations.ts`, `src/entities/taxonomy/api/taxonomies.ts`, `src/widgets/offering-list/api/offerings.ts`
- **Why it pays off now:** it gives one seam for the base URL, the headers and caching (R30).
- **Owning capability:** offering-catalog
- **Proposed change:** `route-public-reads-through-client` (S)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** R30, R35

## R23 — Remove the cross-feature auth imports (resolves R13)

- **Duplicated:** `EvaluationsAccess` duplicates `SessionGate`, and there are 2 same-layer feature imports.
- **Where today:** `src/features/manage-evaluations/ui/EvaluationsAccess.tsx`, `src/features/evaluate-offering/ui/EvaluateLink.tsx`
- **Why it pays off now:** these are the only FSD violations left in production code.
- **Owning capability:** evaluations
- **Proposed change:** `remove-cross-feature-auth-imports` (S)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** R13, R5

## R13 — Move `EvaluationsAccess` onto the shared session gate (extract-access-and-status-pieces, verify W1)

- **Duplicated:** the session gate logic (loading / signed-out / role check with `notFound()`) that `extract-access-and-status-pieces` moved to `SessionGate` and `SignedOutPrompt` in `src/shared/ui`
- **Where today:** `EvaluationsAccess` (`add-specialist-evaluations`), left out of R11 because that change was not merged when R11 was proposed (R11 design summary Open 1, option c)
- **Why it pays off now:** it is the last protected area with its own gate; `add-coffeeshop-location` will add another protected route on the shared gate
- **Owning capability:** evaluations (consumer of the app-shell gate)
- **Proposed change:** none yet — a small refactor change
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** `add-public-evaluations`, `add-evaluation-facets` (both touch the evaluations area)

## R5 — Single active-locale derivation in `src/features/auth` (add-auth, Build report at 5.2)

- **Duplicated:** the active-locale derivation from the path (first segment, `isSupportedLocale` check, `DEFAULT_LOCALE` fallback)
- **Where today:** `src/features/auth/api/authorize.ts` (`activeLang`), `src/features/auth/model/session.ts` (`localeRoot`)
- **Why it pays off now:** step-up (6.x) and the callback's return route (8.x) also need the active locale; a third copy is likely
- **Owning capability:** auth (or `src/shared/lib/i18n` if another slice needs it)
- **Proposed change:** none
- **Open decision (Augusto):** answered 2026-10-08: move it to `src/shared/lib/i18n`, as the one function every auth flow uses. The language is chosen only with the language button in the header, which changes the locale segment of the URL; sign-in, sign-out and the return route read it from there. A third copy exists in `src/features/auth/model/return-route.ts`.
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** `add-auth`; comes after R23

## R25 — Move the account requests to the api segment

- **Duplicated:** a 33-line password-fields clone between `PasswordForm` and `RegisterForm`. Separately, the forms do their own transport and status mapping.
- **Where today:** `src/features/user-account/ui/ProfileForm.tsx`, `PasswordForm.tsx`, `RegisterForm.tsx`, `DangerZone.tsx`
- **Why it pays off now:** R8 (per-field 422 errors) would land in four places.
- **Owning capability:** user-account
- **Proposed change:** `move-account-requests-to-api` (M)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** R8, R35

## R27 — Split `EvaluationRowCard`

- **Duplicated:** two render trees behind a flag (cyclomatic complexity 37, the highest in the code)
- **Where today:** `src/widgets/evaluation-row/ui/EvaluationRowCard.tsx`
- **Why it pays off now:** it is the most complex unit in the codebase.
- **Owning capability:** evaluations
- **Proposed change:** `split-evaluation-row-card` (M)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** none

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

## R29 — Speed up the test environment (resolves R15)

- **Duplicated:** 195 jsdom set-ups take 51% of the 159 s suite.
- **Where today:** `vitest.config.mts`, `src/pages/evaluation-form/ui/EvaluationForm.test.tsx`
- **Why it pays off now:** it makes every change's checks faster.
- **Owning capability:** testing
- **Proposed change:** `speed-up-test-environment` (S)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** R15

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

## R30 — Cache the reference reads (with R19)

- **Duplicated:** `/taxonomies` and `/coffees` are fetched uncached on every render.
- **Where today:** `src/entities/taxonomy/api/taxonomies.ts`, `src/shared/api/coffees.ts`, `src/pages/offering-detail/ui/OfferingDetailScreen.tsx`
- **Why it pays off now:** it would cut a detail view from 3 requests to 1.
- **Owning capability:** offering-catalog
- **Proposed change:** `cache-reference-reads` (S)
- **Open decision (Augusto):** answered 2026-10-08: approved, cached with a 1 h refresh; D9 of add-public-evaluations changes (fast lane by Product owner's decision)
- **Type:** Refactor (fast lane)
- **Status:** accepted
- **Affects:** R19

## R19 — The provisional evaluation loads on every offering-detail request (add-public-evaluations verify W4)

- **Duplicated:** none. The baseline wrapper is a server element passed as a slot (`OfferingDetailScreen.tsx:154-155,188`), so its baseline and taxonomy requests run on every render, whatever the tab, even when the offering is not found.
- **Where today:** `src/pages/offering-detail/ui/OfferingDetailScreen.tsx`, `src/widgets/evaluation-sheet/ui/EvaluationSheetBaseline.tsx`
- **Why it pays off now:** two extra API requests per detail view
- **Owning capability:** offering-catalog
- **Proposed change:** none yet. Load the panel only for `?tab=provisional` (design D9 would change).
- **Open decision (Augusto):** answered 2026-10-08: yes, D9 changes; done inside R30
- **Type:** Refactor (fast lane)
- **Status:** accepted
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

## R33 — Split `ConsensusPanel`

- **Duplicated:** none; a 480-line file with a 252-line component
- **Where today:** `src/widgets/offering-detail/ui/ConsensusPanel.tsx`
- **Why it pays off now:** it raises Modifiability (fewer files over 300 lines).
- **Owning capability:** offering-catalog
- **Proposed change:** `split-consensus-panel` (M)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** none

## R34 — Move the evaluation form state into a model

- **Duplicated:** none; 9 `useState` calls, cyclomatic complexity 25, and a 205-line `EvaluationGroupCard`
- **Where today:** `src/pages/evaluation-form/ui/EvaluationForm.tsx`, `EvaluationGroupCard.tsx`
- **Why it pays off now:** it raises Modifiability and helps R15/R29.
- **Owning capability:** evaluations
- **Proposed change:** `split-evaluation-form-state` (L)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** none

## R38 — Split the account and management panels

- **Duplicated:** none; long components (`ContactSection` with 186 lines, `ManageOfferingsPanel` with 361, `LocationsPanel` with 138)
- **Where today:** `src/features/user-account/ui/ContactSection.tsx`, `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx`, `src/features/location-management/ui/LocationsPanel.tsx`
- **Why it pays off now:** together with R33, R34 and R37, it gets the files over 300 lines down to 5 or fewer.
- **Owning capability:** user-account, offering-management
- **Proposed change:** `split-account-and-management-panels` (M)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** none

## R37 — Split `FlavorWheel`

- **Duplicated:** none; the wheel, the list and the keyboard model sit in one 319-line function (a 571-line file).
- **Where today:** `src/shared/ui/FlavorWheel.tsx`
- **Why it pays off now:** it is the largest file in the codebase.
- **Owning capability:** feedback
- **Proposed change:** `split-flavor-wheel` (L)
- **Open decision (Augusto):** none
- **Type:** Refactor (fast lane)
- **Status:** proposed
- **Affects:** none

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
