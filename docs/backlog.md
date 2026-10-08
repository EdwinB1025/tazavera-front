# Backlog — refactor candidates

Augusto adds entries; agents read the file. The architect checks it before /opsx:explore or /opsx:propose and flags any entry the change would affect, and removes the whole section of an entry only when archiving the change that resolves it.

One section per candidate, in this format:

## R<n> — <title>

- **Duplicated:** <code, classes or helpers that are repeated>
- **Where today:** <files>
- **Why it pays off now:** <upcoming change that would add copies>
- **Owning capability:** <capability>
- **Proposed change:** <change-id>
- **Open decision (Augusto):** <options, or "none">
- **Status:** proposed | accepted | deferred
- **Affects:** <changes that should wait for it or reference it>

## R1 — End-to-end test of "Choosing a locale" (verify W1, deferred here by the product owner)

- **Duplicated:** none
- **Where today:** `src/app/shell/ShellChrome.tsx:35-39` (the locale swap), `src/widgets/app-header/ui/LanguageSelect.tsx` (the callback), `src/app/shell/AppShell.test.tsx` (router mocked with a no-op)
- **Why it pays off now:** the shell's one navigation interaction is verified only up to the callback; every later change that switches locale rides on it
- **Owning capability:** app-shell
- **Proposed change:** none yet — belongs to the pre-deployment Playwright suite
- **Open decision (Augusto):** none
- **Status:** deferred
- **Affects:** none

## R3 — Cover the `/callback` exclusion and the `connect-src` fallback (verify S3)

- **Duplicated:** none
- **Where today:** `proxy.test.ts` (no case for the matcher exclusion or the unset-`NEXT_PUBLIC_API_URL` fallback), `proxy.ts:41-58`
- **Why it pays off now:** two ruled edge cases rest on review only; `add-auth` touches the same proxy seam for `/callback`
- **Owning capability:** app-shell
- **Proposed change:** none
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** `add-auth`
## R4 — Align the shared menu panel radius with `base-controls` (refine-app-header, Q4)

- **Duplicated:** two radius choices for the same menu panel: the shared `DropdownMenu` card panel uses `rounded-container` (16px); the nav variant added by `refine-app-header` uses `radius-field` (8px), which is what `base-controls` states for menus
- **Where today:** `src/shared/ui/DropdownMenu.tsx` (card class set, `rounded-container`; nav class set, field radius)
- **Why it pays off now:** every new menu built on the card variant inherits the mismatch with `base-controls`
- **Owning capability:** base-controls
- **Proposed change:** none yet
- **Open decision (Augusto):** move the card panel to `radius-field`, or amend `base-controls` to allow `radius-container` for card menus
- **Status:** proposed
- **Affects:** none

## R5 — Single active-locale derivation in `src/features/auth` (add-auth, Build report at 5.2)

- **Duplicated:** the active-locale derivation from the path (first segment, `isSupportedLocale` check, `DEFAULT_LOCALE` fallback)
- **Where today:** `src/features/auth/api/authorize.ts` (`activeLang`), `src/features/auth/model/session.ts` (`localeRoot`)
- **Why it pays off now:** step-up (6.x) and the callback's return route (8.x) also need the active locale; a third copy is likely
- **Owning capability:** auth (or `src/shared/lib/i18n` if another slice needs it)
- **Proposed change:** none
- **Open decision (Augusto):** keep it inside `src/features/auth` or move it to `src/shared/lib/i18n`
- **Status:** proposed
- **Affects:** `add-auth`

## R8 — Map 422 validation errors to their fields (decisions log 2026-10-06, "escrituras, rutas protegidas y 422")

- **Duplicated:** none yet; every form shows one generic form-level error for any 422
- **Where today:** the forms of `add-user-account`, `add-offering-management` and `add-specialist-evaluations` (planned)
- **Why it pays off now:** the API returns per-field messages, but the contract documents no 422 body; once Scribe documents it, each form can show the message under its `Field`
- **Owning capability:** form-fields (shared mapping), consumed by each form
- **Proposed change:** none yet — needs the 422 response documented in the API (Product owner)
- **Open decision (Augusto):** document the 422 body in the API, then schedule the change
- **Status:** proposed
- **Affects:** `add-user-account`, `add-offering-management`, `add-specialist-evaluations`

## R10 — Error boundary of the row facets in the traditional theme (refine-facet-controls Q2)

- **Duplicated:** none; the row facets' radio and checkbox boxes take the error boundary colour in the dark theme only — in the traditional theme they keep the cream boundary under an error
- **Where today:** the row facet controls of `add-facet-controls` (inside the sidebar's `variant-inverse` scope); seen in `docs/design/refine-facet-controls/captures/375-light.png` vs `375-dark.png` ("Proceso", "Solo disponibles")
- **Why it pays off now:** no consumer passes an error to a facet today; the first facet that shows a validation error would show it only by the left bar and the text in the traditional theme
- **Owning capability:** filtering
- **Proposed change:** none yet — schedule it before a facet consumer shows errors
- **Open decision (Augusto):** none
- **Status:** accepted
- **Affects:** `add-offering-facets`, `add-evaluation-facets`

## R13 — Move `EvaluationsAccess` onto the shared session gate (extract-access-and-status-pieces, verify W1)

- **Duplicated:** the session gate logic (loading / signed-out / role check with `notFound()`) that `extract-access-and-status-pieces` moved to `SessionGate` and `SignedOutPrompt` in `src/shared/ui`
- **Where today:** `EvaluationsAccess` (`add-specialist-evaluations`), left out of R11 because that change was not merged when R11 was proposed (R11 design summary Open 1, option c)
- **Why it pays off now:** it is the last protected area with its own gate; `add-coffeeshop-location` will add another protected route on the shared gate
- **Owning capability:** evaluations (consumer of the app-shell gate)
- **Proposed change:** none yet — a small refactor change
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** `add-public-evaluations`, `add-evaluation-facets` (both touch the evaluations area)

## R15 — Slow `EvaluationForm` tests under load (add-user-contact checks)

- **Duplicated:** none; `src/pages/evaluation-form/ui/EvaluationForm.test.tsx` takes about 16s alone and about 58s in the full suite, where one case ("sends each descriptor block's selection to its request field") hit the 5000ms test timeout once and passed on re-run
- **Where today:** `src/pages/evaluation-form/ui/EvaluationForm.test.tsx`
- **Why it pays off now:** a flaky timeout breaks the checks of unrelated changes
- **Owning capability:** evaluations
- **Proposed change:** none yet — unplanned coverage fix (split the file or reduce user-event typing)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** none

## R17 — Result count not announced while the facets overlay is open (add-evaluation-facets verify W2)

- **Duplicated:** none. The list's `role="status"` result count sits in the page body. The open mobile filters overlay sets `aria-hidden` on everything behind it, so screen readers do not hear the count while the overlay is open. This affects every list with facets in the sidebar overlay: the catalog and "My evaluations".
- **Where today:** `src/pages/evaluations-list/ui/EvaluationsList.tsx`, `src/widgets/offering-list` (results status), and the shared `Sidebar` overlay in `src/shared/ui/Sidebar.tsx`
- **Why it pays off now:** the requirement "Filtered evaluation results" says the total is announced after each change; no scenario covers the overlay case
- **Owning capability:** app-shell (the shared overlay) or filtering
- **Proposed change:** none yet. It needs a new mechanism, such as an announcement region inside the overlay, so it is a correction for Product owner.
- **Open decision (Augusto):** whether the count must be announced while the overlay is open
- **Status:** proposed
- **Affects:** none

## R16 — Unused `fetchVerifiedOfferings` (refine-list-pagination verify W1)

- **Duplicated:** two paths to the landing request. Since the unplanned fix `65ca95a`, `VerifiedOfferings` adds `perPage` and `Offerings` sends the request. `fetchVerifiedOfferings(page)` is now called only by its own tests.
- **Where today:** `src/widgets/offering-list/api/offerings.ts` (`fetchVerifiedOfferings`), `offerings.test.ts` (its cases), and the comment in `src/entities/taxonomy/api/taxonomies.test.ts:8`
- **Why it pays off now:** dead code with tests of its own suggests a path the landing does not use
- **Owning capability:** landing
- **Proposed change:** none yet; it can go into the test-suite reduction (it removes tests)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** none

## R18 — A `notFound()` inside a streamed boundary answers HTTP 200 (add-public-evaluations verify W3)

- **Duplicated:** the same pattern on every route that decides "not found" after the response starts streaming:
  - opening an evaluation that is not closed (`EvaluationSheetView.tsx:122`, inside the `Suspense` of `ViewScreen.tsx:35`);
  - role-gated management routes (`SessionGate`);
  - an unknown evaluation in the specialist area.
- **Where today:** `src/widgets/evaluation-sheet`, `src/pages/public-evaluation`, `src/shared/ui/SessionGate.tsx`
- **Why it pays off now:** the page shows the 404 correctly, but the HTTP status stays 200 and there is no `noindex`, so crawlers and monitoring see a success
- **Owning capability:** app-shell (with evaluations)
- **Proposed change:** none yet. Decide "not found" before the streaming boundary on server-loaded routes; client-gated routes cannot change the status.
- **Open decision (Augusto):** whether the HTTP status matters for this delivery
- **Status:** proposed
- **Affects:** add-not-found-page (the page itself is correct)

## R19 — The provisional evaluation loads on every offering-detail request (add-public-evaluations verify W4)

- **Duplicated:** none. The baseline wrapper is a server element passed as a slot (`OfferingDetailScreen.tsx:154-155,188`), so its baseline and taxonomy requests run on every render, whatever the tab, even when the offering is not found.
- **Where today:** `src/pages/offering-detail/ui/OfferingDetailScreen.tsx`, `src/widgets/evaluation-sheet/ui/EvaluationSheetBaseline.tsx`
- **Why it pays off now:** two extra API requests per detail view
- **Owning capability:** offering-catalog
- **Proposed change:** none yet. Load the panel only for `?tab=provisional` (design D9 would change).
- **Open decision (Augusto):** whether to change D9
- **Status:** proposed
- **Affects:** none

## R20–R38 — Technical review roadmap (2026-10-08)

The source is `docs/review/technical-review.md` §3, which has each candidate's files, principle, risk, protecting tests and expected grade. Every entry is proposed. The order of the list is the order in §3.3.

## R20 — Upgrade Next.js to 16.4 (security advisories)

- **Duplicated:** none. `next@16.3.6` carries 6 high advisories, fixed in 16.4.0, and `source-map-js` has a transitive advisory.
- **Where today:** `package.json`, `package-lock.json`
- **Why it pays off now:** it is the only way to get a clean `npm audit`.
- **Owning capability:** app-shell
- **Proposed change:** `upgrade-next-16-4` (S)
- **Open decision (Augusto):** approve the dependency upgrade
- **Status:** proposed
- **Affects:** every change (full suite, build, axe rerun)

## R21 — Remove the intra-segment import cycles

- **Duplicated:** 3 cycles through the `shared/ui` barrel and the `RetryButton` re-export shim
- **Where today:** `src/shared/ui/Sidebar.tsx:7`, `src/shared/api/coffees.ts:1`, `src/widgets/offering-list/ui/RetryButton.tsx`
- **Why it pays off now:** R28 needs a barrel without cycles.
- **Owning capability:** content-structure
- **Proposed change:** `tidy-shared-imports` (S)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** R28

## R22 — Shared Field-control hook

- **Duplicated:** the same Field-context resolution, copied 4–6 times (cyclomatic complexity 15–25)
- **Where today:** `src/shared/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx`, `PasswordInput.tsx`, `Checkbox.tsx`, `Combobox.tsx`
- **Why it pays off now:** every new control would add another copy.
- **Owning capability:** form-fields
- **Proposed change:** `extract-field-control-hook` (M)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** none

## R23 — Remove the cross-feature auth imports (resolves R13)

- **Duplicated:** `EvaluationsAccess` duplicates `SessionGate`, and there are 2 same-layer feature imports.
- **Where today:** `src/features/manage-evaluations/ui/EvaluationsAccess.tsx`, `src/features/evaluate-offering/ui/EvaluateLink.tsx`
- **Why it pays off now:** these are the only FSD violations left in production code.
- **Owning capability:** evaluations
- **Proposed change:** `remove-cross-feature-auth-imports` (S)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** R13, R5

## R24 — Route the public reads through `publicRequest`

- **Duplicated:** 6 hand-built API URLs
- **Where today:** `src/shared/api/coffees.ts`, `src/features/offering-facets/api/search-roasteries.ts`, `src/entities/evaluation/api/public-evaluations.ts`, `src/entities/taxonomy/api/taxonomies.ts`, `src/widgets/offering-list/api/offerings.ts`
- **Why it pays off now:** it gives one seam for the base URL, the headers and caching (R30).
- **Owning capability:** offering-catalog
- **Proposed change:** `route-public-reads-through-client` (S)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** R30, R35

## R25 — Move the account requests to the api segment

- **Duplicated:** a 33-line password-fields clone between `PasswordForm` and `RegisterForm`. Separately, the forms do their own transport and status mapping.
- **Where today:** `src/features/user-account/ui/ProfileForm.tsx`, `PasswordForm.tsx`, `RegisterForm.tsx`, `DangerZone.tsx`
- **Why it pays off now:** R8 (per-field 422 errors) would land in four places.
- **Owning capability:** user-account
- **Proposed change:** `move-account-requests-to-api` (M)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** R8, R35

## R26 — Shared "page + distinct offerings" loader for evaluations

- **Duplicated:** the offering join for a page of evaluations
- **Where today:** `src/pages/evaluations-list/ui/EvaluationsList.tsx:56–78`, `src/widgets/public-evaluation-list/ui/PublicEvaluationList.tsx:44–60`
- **Why it pays off now:** any third evaluation list would copy it.
- **Owning capability:** evaluations
- **Proposed change:** `share-evaluation-offerings-loader` (S)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** none

## R27 — Split `EvaluationRowCard`

- **Duplicated:** two render trees behind a flag (cyclomatic complexity 37, the highest in the code)
- **Where today:** `src/widgets/evaluation-row/ui/EvaluationRowCard.tsx`
- **Why it pays off now:** it is the most complex unit in the codebase.
- **Owning capability:** evaluations
- **Proposed change:** `split-evaluation-row-card` (M)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** none

## R28 — Reduce the shared client bundle

- **Duplicated:** cmdk and Radix (68 KB gzipped) load on every route; each route ships about 220 KB gzipped.
- **Where today:** the consumers of `src/shared/ui/index.ts`, `next.config.ts`
- **Why it pays off now:** the Performance grade is C.
- **Owning capability:** app-shell
- **Proposed change:** `reduce-shared-client-bundle` (M, starts with an investigation)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** comes after R21

## R29 — Speed up the test environment (resolves R15)

- **Duplicated:** 195 jsdom set-ups take 51% of the 159 s suite.
- **Where today:** `vitest.config.mts`, `src/pages/evaluation-form/ui/EvaluationForm.test.tsx`
- **Why it pays off now:** it makes every change's checks faster.
- **Owning capability:** testing
- **Proposed change:** `speed-up-test-environment` (S)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** R15

## R30 — Cache the reference reads (with R19)

- **Duplicated:** `/taxonomies` and `/coffees` are fetched uncached on every render.
- **Where today:** `src/entities/taxonomy/api/taxonomies.ts`, `src/shared/api/coffees.ts`, `src/pages/offering-detail/ui/OfferingDetailScreen.tsx`
- **Why it pays off now:** it would cut a detail view from 3 requests to 1.
- **Owning capability:** offering-catalog
- **Proposed change:** `cache-reference-reads` (S)
- **Open decision (Augusto):** a caching design decision; it changes D9 of add-public-evaluations (R19)
- **Status:** proposed
- **Affects:** R19

## R31 — Harden the response headers

- **Duplicated:** none. The `nosniff`, `Referrer-Policy` and `Permissions-Policy` headers are missing, and `X-Powered-By` is exposed.
- **Where today:** `proxy.ts:48–120`, `next.config.ts:9`
- **Why it pays off now:** it raises the Security headers indicator from B to A. R3 can ride with it.
- **Owning capability:** app-shell
- **Proposed change:** `harden-response-headers` (S)
- **Open decision (Augusto):** approve the change to the security headers (it changes specified behaviour)
- **Status:** proposed
- **Affects:** R3

## R32 — Label the landmarks and fix the heading order

- **Duplicated:** 4 unlabelled `<nav>`, card headings that skip a level, a signed-out prompt without an `h1`, and a `treeitem` without `aria-selected`.
- **Where today:** `PrimaryNav.tsx:65`, `HomeHero.tsx:78`, `AboutContent.tsx:114`, `AppSidebar.tsx:67`, `OfferingCard.tsx:125`, `CoffeeshopCard.tsx:49`, `FlavorWheel.tsx:516`
- **Why it pays off now:** these are axe best-practice findings (0 A/AA violations), so fixing them raises Usability from B to A.
- **Owning capability:** app-shell, content-structure
- **Proposed change:** `label-landmarks-and-headings` (M)
- **Open decision (Augusto):** the new catalog texts and the spec wording; whether R17 joins this change
- **Status:** proposed
- **Affects:** R17

## R33 — Split `ConsensusPanel`

- **Duplicated:** none; a 480-line file with a 252-line component
- **Where today:** `src/widgets/offering-detail/ui/ConsensusPanel.tsx`
- **Why it pays off now:** it raises Modifiability (fewer files over 300 lines).
- **Owning capability:** offering-catalog
- **Proposed change:** `split-consensus-panel` (M)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** none

## R34 — Move the evaluation form state into a model

- **Duplicated:** none; 9 `useState` calls, cyclomatic complexity 25, and a 205-line `EvaluationGroupCard`
- **Where today:** `src/pages/evaluation-form/ui/EvaluationForm.tsx`, `EvaluationGroupCard.tsx`
- **Why it pays off now:** it raises Modifiability and helps R15/R29.
- **Owning capability:** evaluations
- **Proposed change:** `split-evaluation-form-state` (L)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** none

## R35 — Unify the API result shape

- **Duplicated:** 4 result styles for not-found and failure
- **Where today:** every `*/api/*.ts`
- **Why it pays off now:** one way to handle errors across the code. It comes after R24 and R25.
- **Owning capability:** shared/api (with every consumer)
- **Proposed change:** `unify-api-result-shape` (L)
- **Open decision (Augusto):** a design decision on the result type
- **Status:** proposed
- **Affects:** R8

## R36 — Prune the unused exports (resolves R16)

- **Duplicated:** knip finds 61 unused exports (scaffold primitives, over-wide indexes, `fetchVerifiedOfferings`).
- **Where today:** `src/shared/ui/Sidebar.tsx`, `DropdownMenu.tsx`, `Sheet.tsx`, `AlertDialog.tsx`, `src/shared/ui/index.ts`, the widget indexes
- **Why it pays off now:** it improves analysability. It goes last, so it does not fight the splits. R4 can ride with it.
- **Owning capability:** content-structure
- **Proposed change:** `prune-unused-exports` (M)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** R16, R4

## R37 — Split `FlavorWheel`

- **Duplicated:** none; the wheel, the list and the keyboard model sit in one 319-line function (a 571-line file).
- **Where today:** `src/shared/ui/FlavorWheel.tsx`
- **Why it pays off now:** it is the largest file in the codebase.
- **Owning capability:** feedback
- **Proposed change:** `split-flavor-wheel` (L)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** none

## R38 — Split the account and management panels

- **Duplicated:** none; long components (`ContactSection` with 186 lines, `ManageOfferingsPanel` with 361, `LocationsPanel` with 138)
- **Where today:** `src/features/user-account/ui/ContactSection.tsx`, `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx`, `src/features/location-management/ui/LocationsPanel.tsx`
- **Why it pays off now:** together with R33, R34 and R37, it gets the files over 300 lines down to 5 or fewer.
- **Owning capability:** user-account, offering-management
- **Proposed change:** `split-account-and-management-panels` (M)
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** none
