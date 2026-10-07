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

## R14 — Localised, themed 404 page (extract-access-and-status-pieces visual review)

- **Duplicated:** none; the app has no `not-found` file, so `notFound()` (role-gated routes, unknown resources) shows Next's default page, unstyled, untranslated and outside the theme
- **Where today:** `app/[locale]/` (no `not-found.tsx`); reached from `SessionGate` `allows` and any `notFound()` call
- **Why it pays off now:** every role-gated route added (management, evaluations, location) sends users there
- **Owning capability:** app-shell
- **Proposed change:** none yet — a new change with its design summary
- **Open decision (Augusto):** none — answered 2026-10-07: kept in the backlog at the lowest priority; nothing is built until Product owner authorizes it
- **Status:** deferred (lowest priority)
- **Affects:** none

## R15 — Slow `EvaluationForm` tests under load (add-user-contact checks)

- **Duplicated:** none; `src/pages/evaluation-form/ui/EvaluationForm.test.tsx` takes about 16s alone and about 58s in the full suite, where one case ("sends each descriptor block's selection to its request field") hit the 5000ms test timeout once and passed on re-run
- **Where today:** `src/pages/evaluation-form/ui/EvaluationForm.test.tsx`
- **Why it pays off now:** a flaky timeout breaks the checks of unrelated changes
- **Owning capability:** evaluations
- **Proposed change:** none yet — unplanned coverage fix (split the file or reduce user-event typing)
- **Open decision (Augusto):** none
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
