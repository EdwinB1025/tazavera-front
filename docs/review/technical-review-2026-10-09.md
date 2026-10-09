# Technical review — tazavera-front (ISO/IEC 25010) — 2026-10-09

- **Date:** 2026-10-09
- **Scope:** `app/`, `src/`, `proxy.ts`, configuration, against `contracts/openapi.yaml` (35 operations) and `openspec/specs/*` (14 capabilities).
- **Revision:** `origin/develop` `72b7ec6`. It differs from `51c03b7` (every accepted change, the refreshed QA suite) only in `docs/change-progress.md`, so the code under review is the code of `51c03b7`.
- **Previous review:** [`technical-review.md`](technical-review.md), 2026-10-08, code of `f35b6b3` (`origin/develop` `85cd8f1`). Every section below gives the previous finding and grade next to the new one.
- **Kind:** read-only analysis approved by Product owner in `docs/general-context.md`, "Secuencia final aprobada", step 6. No source, test, configuration, `openspec/` or other doc file was changed. Tools ran with `npx -y <tool>@<version>` or from a scratch folder outside the repository.
- **Changes in between:** 68 changes were archived after `85cd8f1` (37 dated 2026-10-08, 31 dated 2026-10-09). Among them are all 19 changes of the previous roadmap (R20–R38), the test reduction pass 2 and the QA suite under `qa/`. Each finding below names the change that moved it.
- **Measured vs judged:** every number below comes from a tool run listed in [Appendix A](#appendix-a--method-and-tool-versions), with the same method as the previous review. Statements marked *(judged)* are reviewer opinion from reading the code. Statements marked *(not measured)* could not be checked in this session. Where a script had to be re-written, it was first run on the previous revision (`85cd8f1`) and reproduced the previous figure (noted in Appendix A).

---

## 1. Executive summary

The roadmap of the previous review was delivered in full, and it shows:

- **Security went from C to A.** `next` is on 16.4.0, `npm audit --omit=dev` is clean, and every missing header is now sent (`harden-response-headers`).
- **Maintainability went from C to B.** Files over 300 lines fell from 9 to 2. The share of function code in units over 60 lines fell from 41.0% to 29.3%. High-complexity functions fell from 5 to 1. There are no same-layer imports left in production code, and duplication fell from 1.09% to 0.84%.
- **The validation suite runs in 34 s instead of 159 s** (`speed-up-test-environment`), and all 1,126 validation tests and 1,914 tests of both suites pass. Typecheck is clean, and lint reports 0 errors.
- The axe best-practice findings and the jsx-a11y warning are gone (`label-landmarks-and-headings`).

Three grades went **down**, and one did not move:

- **Usability: B → D.** A new WCAG 2.2 AA failure (axe `color-contrast`, *serious*). In the traditional theme on desktop, the sidebar's "Filters" toggle is oxblood text on the green sidebar at **1.06:1**. It appears on 4 list routes (catalog, public evaluations, coffee shop directory and coffee shop detail). It came with `collapse-sidebar-filters` (2026-10-09). It is confirmed on a screenshot.
- **Testability and Functional suitability: C → D**, on one indicator only. The share of requirement names found in test text fell from 77% to 67.1%. The specs grew by 42 requirements, 18 of them refactor properties that AGENTS.md forbids testing, and after the test reduction the suite holds 115 fewer cases (1,241 → 1,126, net). This is a lower bound, as before.
- **Performance stays C.** cmdk no longer loads on the landing (`reduce-shared-client-bundle`), and the landing fell from 225.5 to 213.4 KB gz. The heaviest route is now the coffee shop detail at 248.8 KB gz, just under the C/D limit (250 KB).

`openspec validate --specs --strict` fails 1 of 14 specs: `testing` still has its placeholder Purpose.

### Scorecard

Each characteristic's grade is the worst grade among its indicators, with the same thresholds as before ([Appendix C](#appendix-c--grading-thresholds)).

| ISO/IEC 25010 characteristic | Previous | **Now** | Indicators now (previous → now) | Key evidence now |
|---|:-:|:-:|---|---|
| **Maintainability** | C | **B** | Modularity B → **B** · Reusability A → **A** · Analysability B → **B** · Modifiability C → **B** | 0 same-layer imports in production (was 2); 11 cycles, all type-only inside `shared/ui` (was 3, 2 of them value cycles); jscpd 0.84% (was 1.09%); CC risk by LOC 12.8% moderate, 1.3% high (was 15.5% / 5.0%); 2 files > 300 lines (was 9); 29.3% of function LOC in units > 60 lines (was 41.0%) |
| **Testability** | C | **D** | Pass rate A → **A** · Suite duration C → **A** · Requirement traceability C → **D** | 1,126 / 1,126 validation and 1,914 / 1,914 combined; 34.2 s (was 159 s); 165 / 246 requirement names found in test text (67.1%, was 77%) |
| **Functional suitability** | C | **D** | Contract coverage A → **A** · Spec traceability C → **D** | 32 of the 32 in-scope operations (31 requests + 1 navigation); 3 operations out of scope; the same 67.1% traceability |
| **Security** | C | **A** | Dependencies C → **A** · Headers B → **A** · Credential handling A → **A** · Injection A → **A** | `npm audit --omit=dev`: 0; full audit: 5 high, all dev-only through `eslint-config-next`; nonce CSP + COOP + `nosniff` + `Referrer-Policy` + `Permissions-Policy`, no `X-Powered-By`; tokens in module memory only; no HTML sinks |
| **Usability (accessibility)** | B | **D** | WCAG A/AA (axe) A → **D** · Best practice B → **A** · Guards A → **A** | 1 serious A/AA rule (`color-contrast`) in 4 of 48 runs; 0 best-practice findings (was 3 rule types); 0 jsx-a11y warnings (was 1) |
| **Performance efficiency** | C | **C** | JS per route C → **C** · Request efficiency B → **A** *(judged)* | 206.7–248.8 KB gz per route (was 217.8–225.5); reference reads cached for one hour; the offering detail no longer reads `/evaluations` on its default tab |

Not graded, because the brief does not ask for them: Reliability, Compatibility, Portability.

### Previous → Now

| Characteristic | Previous (2026-10-08) | Now (2026-10-09) | Moved by |
|---|:-:|:-:|---|
| Maintainability | C | **B** ▲ | `split-flavor-wheel`, `split-consensus-panel`, `split-evaluation-form-state`, `split-evaluation-row-card`, `split-account-and-management-panels`, `extract-field-control-hook`, `remove-cross-feature-auth-imports`, `tidy-shared-imports`, `share-evaluation-offerings-loader`, `move-account-requests-to-api`, `prune-unused-exports` |
| Testability | C | **D** ▼ | duration ▲ `speed-up-test-environment`; traceability ▼ test reduction pass 2 and the refactor requirements |
| Functional suitability | C | **D** ▼ | traceability, as above; contract coverage holds (`add-email-verification-status` consumes the new verification page) |
| Security | C | **A** ▲ | `upgrade-next-16-4`, `harden-response-headers` |
| Usability | B | **D** ▼ | best practice ▲ `label-landmarks-and-headings`; contrast ▼ `collapse-sidebar-filters` |
| Performance efficiency | C | **C** = | requests ▲ `cache-reference-reads`, `refresh-stale-taxonomies`; JS: landing ▲ `reduce-shared-client-bundle`, coffee shop detail ▼ *(judged: the facet comboboxes and the map share the route)* |

### Top remaining risks

1. **WCAG contrast failure in the sidebar "Filters" toggle** (Usability D).
   - **Where:** `src/shared/ui/SidebarMenuSub.tsx:38`, inside `Sidebar`, in the traditional theme at ≥ 1280 px. The toggle sets only hover colours (`TOGGLE_CLASSES`, `:18–22`), so at rest it inherits `#8b2e2e` on the sidebar's `#2e5a52`, which is 1.06:1.
   - **Recommendation:** an **unplanned fix** against theming "Text and button contrast" and app-shell "Sidebar entry sub-section". Give the toggle the sidebar entry's text token at rest, as `Explore offerings` has, and register the pair in the `theme-tokens` contrast matrix. Effort S. The `theme-tokens` matrix and `color-guard` did not catch it, because the colour is inherited, not written.
2. **Spec traceability by name is 67%** (Testability, Functional suitability D).
   - The 9 scenarios that pass 2 left uncovered (`docs/testing/test-reduction-result.md`) still wait for Product owner's decision on the board.
   - **Recommendation:**
     - Decide those 9.
     - Make the pass-2 coverage map (one test per scenario) the measured indicator, instead of name matching.
     - Record the refactor-property requirements as "verified by lint / build" in that map. Without the 18 refactor requirements, the figure is 165 / 228 = 72.4% (C).
3. **First-load JS is 207–249 KB gz on every route** (Performance C, at the D boundary on the coffee shop detail).
   - React DOM (64 KB gz) and a 43 KB framework chunk are fixed costs. The coffee shop detail adds two cmdk/Radix chunks (18 + 16 KB gz).
   - **Recommendation:** a measured change that loads the facet comboboxes only when the sidebar panel opens (a dynamic import, like Leaflet), with ≤ 170 KB gz as the target. Effort M. It needs a Product owner decision, because it changes when the facets load.
4. **`openspec validate --specs --strict` fails on `testing`.** The Purpose of the main spec is still the archive placeholder (from `speed-up-test-environment`).
   - AGENTS.md says `openspec/specs/` is never edited by hand, and the validator says to edit the main spec directly.
   - **Recommendation:** Product owner authorises a one-line Purpose edit in the next archive commit.
5. **11 type-only import cycles inside the flavor wheel** (Modularity B).
   - **Where:** `FlavorWheelNode` and `FlavorWheelGroup` are declared in `FlavorWheel.tsx`, which imports the 7 parts that import those types back (`split-flavor-wheel`).
   - **Recommendation:** a fast-lane refactor that moves the types into a `flavor-wheel-types.ts`. Effort S. It takes Modularity to A, because there are no other cycles or violations.
6. **Code-structure warnings and test hygiene.**
   - Lint reports 48 warnings: 22 functions over 80 lines and 7 with complexity over 15 (the AGENTS.md limits), plus 19 unused variables in QA tests.
   - `vitest.qa.config.mts` excludes 3 stale QA files.
   - **Recommendation:** the next refactoring round. Order the units by size: `Combobox` 183 lines / CC 27, `LocationsMap` 147, `EvaluationSheet` 141, `OfferingFacets` 136, `BeanScale` 135. Delete the 3 excluded QA files through Product owner's reduction plan.
7. **Open backlog:**
   - R40 (the API must document its 422 and 404 responses; per-field errors depend on it);
   - R10 (facet error boundary in the traditional theme);
   - R50 (consensus tree, API);
   - R45 (first location at coffee-shop registration, API first);
   - R1 (E2E locale switch).
   - None of them is a front-end code defect today.

---

### 1.1 Functional suitability — contract operations

**Previous:** 31 of 32 operations consumed; `listTheEvaluationsOfAUser` out of scope. Grade **A**.

**Now:**

- The contract grew from 32 to 35 operations: the three email-verification operations (`chore: update the API contract`, `2bdde09e` and the earlier contract updates).
- 31 operations are called through the request clients, and 1 more is consumed as a navigation:
  - `displayTheEmailVerificationPrompt`, linked from the account's security section (`src/pages/account/ui/SecuritySection.tsx:56`), by `add-email-verification-status` (R66).
- Grade **A** (32 / 32 in scope).

| Operation | Consumed in (now) |
|---|---|
| `listOfferings`, `getAnOffering` | `src/widgets/offering-list/api/offerings.ts:60`, `src/entities/offering/api/offering.ts:18` |
| `createOfferings`, `deleteAnOffering`, `deleteMultipleOfferings` | `src/features/offering-management/api/management.ts:72,80,115` |
| `listCoffeeInventory` | `src/features/offering-management/api/management.ts:98` |
| `listCoffees`, `listRoasteries`, `listOlfactoryTaxonomies` | `src/shared/api/coffees.ts:26` and `src/features/offering-facets/api/search-coffees.ts:22`; `search-roasteries.ts:10`; `src/entities/taxonomy/api/taxonomies.ts:19` |
| `listCoffeeShops`, `getACoffeeShop` | `src/widgets/coffeeshop-list/api/coffeeshops.ts:25`, `src/entities/coffeeshop/api/coffeeshop.ts:17` |
| `listEvaluations`, `getAnEvaluation` | `src/entities/evaluation/api/public-evaluations.ts:54,72` |
| `listMyEvaluations`, `getMyEvaluation`, `createAnEvaluation`, `updateAnEvaluation`, `closeAnEvaluation`, `deleteAnEvaluation` | `src/entities/evaluation/api/user-evaluations.ts:88–124` |
| `listMyLocations`, `listAUsersLocations`, `createALocation` | `management.ts:134`, `src/features/location-management/api/locations.ts:15,45` |
| `getTheAuthenticatedUser`, `logOut` | `src/features/auth/model/session.ts:103,147,216`, `src/features/auth/api/identity.ts:41,52` |
| `registerAUser`, `updateAUser`, `updateUserPassword`, `deactivateAUser`, `permanentlyDeleteAUser` | `src/features/user-account/api/register.ts:23`, `account.ts:39,54,66,74`. The previous review found these calls **inside UI components**; they moved to the `api` segment with `move-account-requests-to-api` |
| `listMyContacts`, `createMyPrimaryContact` | `src/features/user-account/api/contacts.ts:10,20` |
| `displayTheEmailVerificationPrompt` | navigation link, `SecuritySection.tsx:56` (new) |
| **`listTheEvaluationsOfAUser`** | **not consumed**: out of scope (Product owner, 6 Oct) — unchanged |
| **`markTheAuthenticatedUsersEmailAddressAsVerified`**, **`sendANewEmailVerificationNotification`** | **not consumed** *(judged: out of scope)*: the link in the email and the resend action belong to the API's verification page; `add-email-verification-status` only links to that page |

No call targets a path the contract does not declare. Every API URL is built by the shared clients. The only other places that read `NEXT_PUBLIC_API_URL` are the API-hosted pages linked from the UI (`/forgot-password`, `/user/security`, `/email/verify`) and the CSP origin in `proxy.ts:80`. **Previous:** 6 public reads built the URL by hand. That is resolved by `route-public-reads-through-client`.

### 1.2 Security details

**Previous:** dependencies **C** (2 high runtime advisories: `next` 16.3.6, `source-map-js`), headers **B** (no `nosniff`, `Referrer-Policy` or `Permissions-Policy`; `X-Powered-By` sent), credentials **A**, injection **A**.

**Now: dependencies A, headers A, credentials A, injection A.**

- **`npm audit --omit=dev`:** **0** vulnerabilities (was 2 high).
  - `next` is pinned to `16.4.0` (`upgrade-next-16-4`), the version that fixes the 6 advisories listed in the previous review.
  - `source-map-js` no longer appears.
- **Full `npm audit`:** **5 high, 0 critical** (was 7 high).
  - All of them are dev-only: `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces` (GHSA-vfj7-8cjw-p6xm, denial of service through nested patterns).
  - npm's only fix is a semver-major downgrade to `eslint-config-next@14.2.35`. Lint runs only on developer machines *(judged: not reachable at runtime)*.
- **Headers** (checked with `curl -I` on `next start`):
  - Present now: the nonce CSP with `'strict-dynamic'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` and `frame-ancestors 'none'`; `Cross-Origin-Opener-Policy: same-origin-allow-popups`; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; and `Permissions-Policy: camera=(), microphone=(), payment=(), usb=(), geolocation=(self)` (the map's geolocation stays allowed, as the decisions log asked).
  - `X-Powered-By` is no longer sent (`poweredByHeader: false`, `next.config.ts:9`).
  - `/callback` has the CSP and `Referrer-Policy` and no COOP, as the auth flow requires.
  - Changes: `harden-response-headers`, and `cover-header-security` for the header's "Security" entry.
  - Unchanged and still documented: `style-src 'unsafe-inline'` for Radix. `Strict-Transport-Security` belongs to the hosting layer *(not measured)*.
- **Credentials:** unchanged.
  - The grant lives in module memory (`src/shared/api/tokens.ts`).
  - `sessionStorage` holds only a full-page flow's record (`src/features/auth/model/flow.ts:49–67`).
  - `localStorage` holds the credential-free marker (`flow.ts:72–82`).
  - A production build still refuses non-HTTPS token endpoints, which caused R41 (closed as a deploy note).
  - `secure-step-up`, `drop-step-up-for-offerings` and `scope-write-token-to-action` changed when the step-up applies, but not where tokens live *(judged from the archived proposals and a grep of the storage APIs)*.
- **Injection:** still no `dangerouslySetInnerHTML`, `innerHTML`, `eval` or `new Function` in `src/`, `app/` or `proxy.ts`. `xss-guard.test.ts` still guards it.

### 1.3 Usability and accessibility details

**Previous:** 0 A/AA violations on 36 runs; 3 best-practice rule types (`heading-order`, `landmark-unique`, `page-has-heading-one`); 1 jsx-a11y warning. Grade **B**.

**Now:** axe-core 4.11.0, the same tags and the same mock method. It covered the same 9 screens plus 3 new ones (the coffee shop registration, About, and an unknown route), × {traditional, dark} × {1280, 375} = **48 runs**.

| Screen | Path | A/AA violations | Best-practice findings | Previous |
|---|---|:-:|---|---|
| Landing | `/en` | 0 | — | `heading-order`, `landmark-unique` |
| Catalog | `/en/offerings` | **1** (`color-contrast`, traditional @ 1280) | — | `heading-order` |
| Offering detail | `/en/offerings/{ulid}` | 0 | — | — |
| Public evaluation view | `/en/evaluations/{ulid}` | 0 | — | — |
| Public evaluations list | `/en/evaluations` | **1** (same) | — | — |
| Register | `/en/register` | 0 | — | — |
| Coffee shop directory | `/en/coffeeshops` | **1** (same) | — | `heading-order` |
| Coffee shop detail | `/en/coffeeshops/{ulid}` | **1** (same) | — | `heading-order` |
| Evaluation form, signed out (gated) | `/en/manage/evaluations/new?offering=…` | 0 | — | `page-has-heading-one` |
| Coffee shop registration (new) | `/en/register/coffeeshop` | 0 | — | not audited |
| About (new) | `/en/about` | 0 | — | not audited |
| Unknown route, 404 (new) | `/en/does-not-exist` | 0 | — | not audited |

Notes:

- **The contrast failure.**
  - The node is the sidebar sub-section toggle "Filters": `span.type-subheading` inside `[data-slot="sidebar-menu-sub"]`. axe measures 1.06:1 (foreground `#8b2e2e`, background `#2e5a52`, 16 px), against the required 4.5:1.
  - A computed-style check and a screenshot confirm it: the label is barely visible.
  - It appears only in the traditional theme. The dark theme passes. At 375 px the sidebar is a closed overlay, so it is not rendered at load.
  - It came with `collapse-sidebar-filters` (`09d5501b`, 2026-10-09), and `drop-duplicate-filter-title` (`b611fdd8`) made that toggle the panel's only title.
  - The guards did not catch it: `color-guard` checks written classes, and the colour here is inherited.
  - Path: **unplanned fix** (theming "Text and button contrast").
- **Best practice:** all three rule types of the previous review are gone (`label-landmarks-and-headings`, which also resolved R17: "Result count announced inside the sidebar overlay" is now a requirement).
- **Lint:** `jsx-a11y/role-has-required-aria-props` no longer fires (`split-flavor-wheel` moved the tree list into `FlavorWheelNoteList.tsx`).
- **Signed-in screens:** still not audited. They need the OAuth popup, and the mock has no authorization server *(not measured)*.

**Guards (all passing):** `color-guard`, `radius-guard`, `focus-guard`, `badge-geometry-guard`, `xss-guard`, `client-boundary` (×2), `icons`, `catalog-guard`, `leaflet-guard`, `session-types-guard` and the `theme-tokens` contrast matrix. This is the same set as before. `react/jsx-no-literals` still enforces catalog texts. **New:** the AGENTS.md size, complexity and import rules are reported by lint as warnings (`add-code-structure-lint-rules`, `eslint.config.mjs:74–100`).

**Spec traceability** (Testability and Functional suitability). Same script: requirement and scenario titles of `openspec/specs/*` matched against the text of the validation-suite test files (case-insensitive substring).

| | Previous | Now (validation suite, 198 files) | Now (validation + QA, 356 files) |
|---|--:|--:|--:|
| Requirement names found | 157 / 204 (77.0%) | **165 / 246 (67.1%)** | 166 / 246 (67.5%) |
| Scenario titles found | 465 / 873 (53%) | **559 / 1,077 (51.9%)** | 566 / 1,077 (52.6%) |

The figure fell for three reasons:

- **The specs grew** by 42 requirements and 204 scenarios. 18 of the new requirements are refactor properties: "… kept as one view", "Acyclic shared segment imports", "One result shape for every API request", "No known high or critical framework advisory", "Client code loaded per route", "Test environment set-up keeps the suites' results" and similar. AGENTS.md forbids adding tests in a refactor change, so lint, the build or the existing suites verify them, and they can never match by name. Without them, the figure is 165 / 228 = **72.4%** (C).
- **Test reduction pass 2** went from 1,241 to 986 cases. The suite now has 1,126 cases after the later changes. It kept one test per scenario, but its `it()` titles paraphrase.
- **9 scenarios were left without a test**, by the pass-2 report (`docs/testing/test-reduction-result.md`, "Uncovered scenarios"). They wait for Product owner's decision on the board.

The unmatched requirement names are listed in Appendix B.4.

### 1.4 Performance details

**Previous:** 217.8–225.5 KB gz on the 8 measured routes; a 68 KB gz cmdk/Radix chunk on every route; `/taxonomies` and `/coffees` uncached; 3 requests per offering detail (R19). Grade **C** (JS) / **B** (requests).

**Now:** the same method. Scripts are summed until network idle in a fresh browser context (traditional theme, 1280 px), and gzip uses Node `zlib` at level 6.

| Route | Scripts | Raw JS | Gzip JS | Previous gzip |
|---|:-:|--:|--:|--:|
| `/en` (landing) | 14 | 673 KB | **213.4 KB** | 225.5 KB |
| `/en/offerings` | 16 | 717 KB | 227.9 KB | 220.2 KB |
| `/en/offerings/{ulid}` | 15 | 691 KB | 218.8 KB | 220.5 KB |
| `/en/evaluations/{ulid}` | 15 | 676 KB | 214.4 KB | 217.8 KB |
| `/en/evaluations` | 16 | 691 KB | 219.8 KB | 219.6 KB |
| `/en/register` | 15 | 666 KB | 210.7 KB | 222.7 KB |
| `/en/coffeeshops` | 17 | 691 KB | 219.7 KB | 222.8 KB |
| `/en/coffeeshops/{ulid}` | 17 | 780 KB | **248.8 KB** | 220.4 KB |
| `/en/manage/evaluations/new` (signed out) | 15 | 704 KB | 222.0 KB | not measured |
| `/en/register/coffeeshop` | 15 | 666 KB | 210.7 KB | not measured |
| `/en/about` | 14 | 654 KB | 206.8 KB | not measured |
| unknown route (404) | 14 | 654 KB | 206.7 KB | not measured |

Findings:

- **cmdk is no longer on every route** (`reduce-shared-client-bundle`).
  - The landing loads no cmdk chunk. It loads two Radix chunks (16 + 11 KB gz) for the header's menus.
  - The catalog and coffee shop routes load cmdk chunks (`41qy8ggehgcyv.js` 18 KB gz, `13ux7nrb2fxh3.js` 16 KB gz).
- **The floor is high.**
  - Even the About page loads 206.8 KB gz: React DOM (`2nii411saqstq.js`, 64 KB gz), a 43 KB gz framework chunk and a 19 KB gz chunk.
  - *(judged)* Below ~200 KB needs a check of what `next-intl` and the app shell put on every route, not only the facets.
- **The coffee shop detail grew to 248.8 KB gz,** 2 scripts more than the catalog. It holds both the facet comboboxes and the tabbed detail *(judged; not traced chunk by chunk)*. It is 1.2 KB under the D limit.
- **Leaflet** (`2m30aakide9md.js`, 149 KB raw / 44 KB gz) still loads only on the map view, not on the measured list views.
- **Server requests** (mock API log):
  - The offering detail now asks for `/offerings/{ulid}` and `/taxonomies` only. `/evaluations` no longer loads on the default tab (R19 resolved by `cache-reference-reads`).
  - The `/taxonomies` request in the log is the **fresh** read of `refresh-stale-taxonomies`. The mock's offering example references taxonomy ids that its taxonomy example lacks, so the one-hour cached read is judged stale on every render. With consistent data, the cached read answers and the view sends 1 request *(judged from `src/entities/taxonomy/api/taxonomies.ts:36–45`)*.
  - `/coffees` was read **once** for all 48 runs, so the one-hour cache works.
  - The per-offering reads of the evaluation lists are unchanged (imposed by the contract). They now go through one shared loader (`share-evaluation-offerings-loader`).

---

## 2. Maintainability in depth

### 2.1 Size and layering (measured)

`.ts`/`.tsx` files, non-test, without the generated `schema.ts`. This is the previous review's method, re-run on `85cd8f1` to confirm it gives 335 files and 25,493 lines.

| Layer | Slices | Files (non-test) | LOC (non-test) | Previous files / LOC |
|---|:-:|:-:|--:|--:|
| `app` (Next routing, root) + `proxy.ts` | — | 36 | 535 | 35 / ~500 |
| `src/app` | 2 + `fonts.ts` | 6 | 340 | 5 / 272 |
| `src/pages` | 19 | 95 | 6,419 | 73 / 5,128 |
| `src/widgets` | 10 | 77 | 5,287 | 65 / 4,696 |
| `src/features` | 9 | 74 | 6,206 | 60 / 5,380 |
| `src/entities` | 6 | 34 | 1,801 | 29 / 1,541 |
| `src/shared` (without `schema.ts`) | 4 segments | 91 | 8,825 | 68 / 7,972 |
| **Total** | | **413** | **29,413** | 335 / 25,493 |

Tests:

- **Validation suite:** 198 files, 28,143 lines (was 195 files, 28,077 lines).
- **QA suite:** 158 files under `qa/`. 155 of them run; 3 are excluded in `vitest.qa.config.mts`.

The code grew by 16% (+3,920 lines). Most of the growth is the splits (more, smaller files) and the 2026-10-09 features (extrinsic fields, email verification, step-up, validation errors).

### 2.2 SOLID applied to React + FSD

**S — single responsibility**

- **Previous:** bad. `EvaluationForm` (244 lines, CC 25, 9 `useState`), `ConsensusPanel` (252 lines), `FlavorWheel` (319 lines), and the account forms building requests inline.
- **Now:** good.
  - `EvaluationForm.tsx` is 139 lines with no `useState`. Its state lives in a reducer (`src/pages/evaluation-form/model/form-model.ts`, `formReducer` CC 13) and a hook (`use-evaluation-form.ts`, 83 lines) (`split-evaluation-form-state`).
  - `ConsensusPanel` is split into `ScoreCard`, `SelectionBlock`, `AxisDetail` and others (`split-consensus-panel`). No function of it is over 80 lines.
  - `FlavorWheel.tsx` is 147 lines, split into `FlavorWheelChart`, `FlavorWheelNoteList`, `FlavorWheelPanel`, `FlavorWheelLabels`, `use-flavor-wheel-state`, `flavor-wheel-tree` and `flavor-wheel-keys` (`split-flavor-wheel`).
  - The account forms call `src/features/user-account/api/account.ts` and `register.ts` (`move-account-requests-to-api`).
- **Still open:** units over 80 lines that mix concerns. `Combobox` (183 lines, CC 27), `LocationsMap` (147), `EvaluationSheet` (141) and `OfferingFacets` (136) are in Appendix B.2.

**O — open for extension**

- **Previous:** bad. `EvaluationRowCard` (CC 37), with two render trees behind `variant === "public"`.
- **Now:** good. `split-evaluation-row-card` made one component per variant: `PublicEvaluationRowCard.tsx` (132 lines) and `SpecialistEvaluationRow.tsx` (CC 15), sharing `EvaluationRowParts.tsx`. This also satisfies the AGENTS.md rule against boolean-switched render trees.

**L — variants honour the same contract**

- **Previous:** bad. `EvaluationRowCard`'s flat props.
- **Now:** good. Each row variant has its own props type.
- The field controls still share one rule, now through one hook (`extract-field-control-hook`, form-fields "One field resolution for every field control"). `Checkbox` fell from CC 25 to 19, and `PasswordInput` from 23 to ≤ 10. `Input`, `Select` and `Textarea` dropped out of the CC > 15 list.

**I — minimal props**

- **Previous:** 153 `*Props` types, mean 3.9 fields; 9 with 8 or more; 1 with 12 or more.
- **Now:** **208** types, mean **4.0**; **14** with 8 or more; 1 with 12 or more (`RadioGroupProps`, 13, unchanged). The same regex scan gives 157 types on `85cd8f1`, so the scan counts about 4 more than the previous review reported.
- *(judged)* More types with the same mean means the splits kept props narrow. `ConsensusPanelTexts` (36 keys) was split with its panel. `formTextsFrom` is still a 96-line mapping.

**D — depend on injected actions and data**

- **Previous:** bad. `EvaluateLink` and `EvaluationsAccess` imported `@/features/auth`, and the account forms reached `request` directly.
- **Now:** good. There are 0 same-layer imports in production (`remove-cross-feature-auth-imports`, which also resolved R13). The account forms get their requests from the slice's `api` segment.
- **Still open:** 4 test files mock or import a same-layer slice (§2.3). That is allowed for tests (app-shell "Code-structure rules reported by lint"), but it couples those tests to the other slice.

### 2.3 Coherence

| Aspect | Previous | Now | Evidence / change |
|---|---|---|---|
| FSD layering | 2 same-layer imports in production; 2 in tests; 0 upward | **0 in production**, 0 upward, 0 public-API bypasses; 4 in tests (2 `vi.mock("@/features/auth")`, 2 imports of `@/widgets/evaluation-row`) | `remove-cross-feature-auth-imports`. Tests: `src/features/offering-management/model/delete-flow.test.ts:13`, `ui/DeleteOfferingsDialog.test.tsx:7`, `src/widgets/public-evaluation-list/ui/EvaluationListPresentation.test.tsx:25`, `PublicEvaluationList.test.tsx:30`. Lint now reports same-layer imports (`eslint.config.mjs:102–108`), and it reports none |
| Cycles (dependency-cruiser 16.10.4) | 3 inside one segment (2 value cycles through the `shared/ui` barrel, 1 type-only) | **11, all type-only, all inside `shared/ui`'s flavor wheel**; 0 through a barrel | `tidy-shared-imports` removed the barrel cycles. `split-flavor-wheel` created the type cycles: `FlavorWheel.tsx` imports its parts, which `import type { FlavorWheelNode }` back from it (e.g. `FlavorWheelChart.tsx:13`, `flavor-wheel-tree.ts:4`). Not a spec breach: content-structure "Acyclic shared segment imports" forbids only paths through the public index |
| Data loading | Matches the decisions log | Unchanged | — |
| API access | **Inconsistent**: 6 hand-built public reads, 4 inline account writes | **One seam**: every API call goes through `request` / `publicRequest` / `requestWithToken` (`src/shared/api/client.ts:45,78,89`) inside an `api` segment | `route-public-reads-through-client`, `move-account-requests-to-api` |
| Error handling | **4 result styles** | **1**: every `*/api/*.ts` resolves to `ApiResult<T, K>` (`src/shared/api/result.ts:16`), with `kind` `"not-found" \| "forbidden" \| "conflict" \| "validation"`. The OAuth flows are excluded by design (D6) | `unify-api-result-shape`; `"validation"` added by `show-field-validation-errors` (R8) |
| Texts | Coherent | Coherent: catalogs es/en/ca, `react/jsx-no-literals`, `catalog-guard` | — |
| Tokens | Coherent | Coherent in written classes. **One inherited colour fails contrast** (§1.3) | `collapse-sidebar-filters` |
| Naming | Coherent, except `fetch*` with two contracts | Coherent: every reader returns an `ApiResult` | `unify-api-result-shape` |
| Locale derivation | Duplicated in auth (R5) | **One derivation** in `src/shared/lib/i18n` | `share-active-locale` (R5 closed) |
| Routing / i18n | next-intl message loading only | next-intl routing adopted | `adopt-next-intl-routing` (R43) |

### 2.4 Oversizing

**Files over 300 lines:** **2** (was 9), by raw line count.

- `src/features/auth/api/authorize.ts`: 351 lines (was 307). `secure-step-up` and `scope-write-token-to-action` added the step-up and write-token flows.
- `src/shared/ui/Sidebar.tsx`: 342 lines (was 388), shadcn primitives. `prune-unused-exports` removed the unused parts.

Lint counts non-blank, non-comment lines, and by that count both files are under 300 (0 `max-lines` warnings).

**Top 15 files by lines** (non-test, without `schema.ts` and `globals.css`):

| # | File | Lines | Largest function (LOC / CC) | Previous rank |
|--:|---|--:|---|---|
| 1 | `src/features/auth/api/authorize.ts` | 351 | `completeCallback` CC 14 | 9 (307) |
| 2 | `src/shared/ui/Sidebar.tsx` | 342 | shadcn primitives, all small | 4 (388) |
| 3 | `src/widgets/evaluation-sheet/ui/EvaluationSheet.tsx` | 295 | `EvaluationSheet` 141 / 10 | 10 (295) |
| 4 | `src/shared/ui/Combobox.tsx` | 289 | `Combobox` 183 / **27** | 11 (289) |
| 5 | `src/shared/ui/LocationsMap.tsx` | 267 | `LocationsMap` 147 / 5 | 13 (267) |
| 6 | `src/shared/ui/DropdownMenu.tsx` | 267 | shadcn primitives | 5 (378) |
| 7 | `src/shared/ui/flavor-wheel-geometry.ts` | 261 | pure geometry | 12 (271) |
| 8 | `src/shared/ui/DescriptorChipGroup.tsx` | 255 | `DescriptorChipGroup` 124 / 12 | 14 (255) |
| 9 | `src/features/auth/model/session.ts` | 249 | `refreshProfile` CC 11 | — |
| 10 | `src/shared/ui/BeanScale.tsx` | 239 | `BeanScale` 135 / 15 | — |
| 11 | `src/shared/ui/Pagination.tsx` | 236 | small | — |
| 12 | `src/features/user-account/ui/RegisterForm.tsx` | 230 | `RegisterForm` 111 / 8 | 15 (244) |
| 13 | `src/features/location-management/ui/LocationForm.tsx` | 225 | `LocationForm` 111 / 3 | — |
| 14 | `src/shared/ui/Button.tsx` | 222 | `Button` CC 15 | — |
| 15 | `src/pages/evaluations-list/ui/EvaluationsList.tsx` | 222 | `EvaluationsList` 128 / 18 | — |

The previous rows 1, 2, 3, 6, 7 and 8 (`FlavorWheel`, `ConsensusPanel`, `EvaluationForm`, `ManageOfferingsPanel`, `EvaluationGroupCard`, `ContactSection`) are all under 210 lines now.

**Cyclomatic complexity** (ESLint `complexity`, ad hoc `--rule`):

- **Now:** 1,316 functions, mean **2.50**, max **27**.
- **Previous:** 1,134 functions, mean 2.61, max 37.

| CC band | Functions (prev → now) | Share of outermost-unit LOC (prev → now) |
|---|--:|--:|
| 1–10 (low) | 1,097 → **1,276** | 79.5% → **85.9%** |
| 11–20 (moderate) | 32 → **39** | 15.5% → **12.8%** |
| 21–50 (high) | 5 → **1** | 5.0% → **1.3%** |
| > 50 (very high) | 0 → 0 | 0% → 0% |

**The one high-risk function** is `Combobox`, CC 27, `src/shared/ui/Combobox.tsx:89`. It is unchanged, and it is now the only unit that holds Analysability at B.

The other four previous high-risk functions:

- `EvaluationRowCard` 37 was split (≤ 15);
- `EvaluationForm` 25 went into the model;
- `Checkbox` 25 is now 19;
- `PasswordInput` 23 is now ≤ 10.

**Unit size** (outermost functions, by LOC):

| Size | Previous | Now |
|---|--:|--:|
| ≤ 15 lines | 18.3% | **20.4%** |
| 16–30 lines | 17.5% | **22.0%** |
| 31–60 lines | 23.2% | **28.2%** |
| > 60 lines | 41.0% | **29.3%** |

There are still 47 functions over 60 lines, but they are shorter. **22 functions are over 80 lines** (was 31), listed in Appendix B.2. Lint reports the same 22 as `max-lines-per-function` warnings.

**Single-use abstractions and code beyond the specs:**

- **Previous:** ~30 unused shadcn exports, widget index over-exports, the `RetryButton` shim and `fetchVerifiedOfferings` (R16).
- **Now:** all removed by `prune-unused-exports`.
  - knip reports 1 unused export: `SidebarSeparator`, `src/shared/ui/Sidebar.tsx:338`.
  - `fetchVerifiedOfferings` survives only in a test comment (`src/widgets/offering-list/api/offerings.test.ts:10`).

### 2.5 Duplication (jscpd 4.3.0)

- Settings: the same as before (`--min-tokens 50`, non-test, without `schema.ts`).
- **Now:** 655 sources (jscpd also counts the CSS and JSON it finds), **28 clones, 304 duplicated lines (0.84%), 1.09% of tokens**.
- **Previous:** 525 sources, 29 clones, 351 lines (1.09%), 1.39% of tokens.

| Clone | Lines | Locations | Previous |
|---|--:|---|---|
| Filtered list screen (toolbar + sidebar + results) | 29 | `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx:50–78` ↔ `src/pages/offerings/ui/OfferingsScreen.tsx:48–76` | 28, still open |
| Password-form submit and status block | 21 | `src/features/user-account/ui/PasswordForm.tsx:182–202` ↔ `ProfileForm.tsx:145–165` | was 11 lines; grew |
| New-password + confirmation block | 20 + 10 | `PasswordForm.tsx:111–130` ↔ `RegisterForm.tsx:136–155`; `ProfileForm.tsx:74–83` ↔ `RegisterForm.tsx:136–145` | was 33 + 18; shrank (`move-account-requests-to-api`) |
| Selectable chip/scale option rendering | 18 + 12 + 10 + 10 | `BeanScale.tsx` ↔ `DescriptorChipGroup.tsx` ↔ `RadioGroup.tsx` ↔ `IntensitySlider.tsx` | unchanged |
| Detail screen header | 17 | `CoffeeshopDetailScreen.tsx:104–120` ↔ `OfferingDetailScreen.tsx:168–184` | unchanged |
| Detail content tabs (new) | 13 + 12 | `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.tsx:56–79` ↔ `src/widgets/offering-detail/ui/OfferingDetailContent.tsx:83–106` | new |
| Evaluation list screens | 14 | `EvaluationsListScreen.tsx:24–37` ↔ `public-evaluations/ui/ListScreen.tsx:31–45` | unchanged |
| Field-context resolution | — | — | **removed** (`extract-field-control-hook`) |
| Taxonomy resolution | — | — | **removed** |
| Evaluations + their offerings loader | — | — | **removed** (`share-evaluation-offerings-loader`) |

The full list is in Appendix B.3.

### 2.6 Dead code (knip 5.88.1)

| Finding | Previous | Now |
|---|--:|--:|
| Unused files | 2 (both false positives or design material) | **2**, the same two: `src/shared/lib/i18n/request.ts` (loaded by path from `next.config.ts:6`) and `docs/design/add-theme-tokens/tokens.css` |
| Unlisted dependencies | 1 (`postcss`) | **1**, the same |
| Unresolved imports | — | **1**: `qa/src/widgets/offering-list/lib/resolve-taxonomies.test.ts:4` imports a module removed by `fix-production-aut-findings`. That file is one of the 3 excluded in `vitest.qa.config.mts` |
| Unused exports | 61 | **1** (`SidebarSeparator`) |
| Unused exported types | 373 | **225** (the `*Props` / `*Texts` types exported by convention, *judged harmless*) |

---

## 3. Refactoring roadmap

### 3.1 Status of the previous roadmap (R20–R38)

All 19 proposed changes were archived on 2026-10-08 through the fast lane on `qa`, and merged into `develop`. The table gives the effect each was expected to have and what this review measures.

| ID | Change-id | Expected impact (previous review) | Measured now |
|---|---|---|---|
| R20 | `upgrade-next-16-4` | Security dependencies C → A | **A**: 0 runtime advisories |
| R21 | `tidy-shared-imports` | cycles 3 → 0 | barrel cycles 0; **11 new type-only cycles** come from R37 |
| R22 | `extract-field-control-hook` | `Checkbox` and `PasswordInput` out of the high band | **done**: 1 high unit left (`Combobox`) |
| R23 | `remove-cross-feature-auth-imports` | Modularity B → A (with R21) | production violations 0; Modularity stays **B** because of the R37 cycles |
| R24 | `route-public-reads-through-client` | 1 API seam | **done** |
| R25 | `move-account-requests-to-api` | clones 29 → 26 | clones 28 (other clones appeared, §2.5) |
| R26 | `share-evaluation-offerings-loader` | one copy fewer | **done** |
| R27 | `split-evaluation-row-card` | highest CC 37 → ≤ 10 | row variants ≤ 15; highest CC overall now 27 (`Combobox`) |
| R28 | `reduce-shared-client-bundle` | Performance C → B if ≤ 170 KB gz | cmdk off the landing; landing 213.4 KB gz → stays **C** |
| R29 | `speed-up-test-environment` | duration C → B (≤ 120 s) | **A**: 34.2 s |
| R30 | `cache-reference-reads` | requests per detail view 3 → 1 | **1** with consistent data *(judged; 2 against the mock, §1.4)* |
| R31 | `harden-response-headers` | headers B → A | **A** |
| R32 | `label-landmarks-and-headings` | Usability B → A | best practice **A**; Usability is **D** because of the new contrast failure |
| R33 | `split-consensus-panel` | files > 300 lines 9 → 8 | done |
| R34 | `split-evaluation-form-state` | 2 files out of the > 300 list | done |
| R35 | `unify-api-result-shape` | one result shape | **done** |
| R36 | `prune-unused-exports` | unused exports 61 → < 10 | **1** |
| R37 | `split-flavor-wheel` | largest file 571 → < 300 | 147; but it created the type cycles |
| R38 | `split-account-and-management-panels` | files > 300 lines → ≤ 5 (with R33, R34, R37) | **2** |

Previous estimate: ~62 h for the whole roadmap. *(not measured: actual effort)*

### 3.2 Existing backlog entries

| Entry | Previous status | Now | Backlog |
|---|---|---|---|
| R1 (E2E locale switch) | deferred | still deferred to the Playwright suite | open |
| R3 (`/callback` and `connect-src` coverage) | open | not in the backlog any more; `harden-response-headers` and `cover-header-security` cover the headers | closed |
| R4 (menu panel radius) | open, PO | resolved by `align-menu-panel-radius-spec` | closed |
| R5 (locale derivation) | confirmed | resolved by `share-active-locale` | closed |
| R8 (422 per-field errors) | blocked on the API | `show-field-validation-errors` shows per-field errors where the contract documents a 422; full coverage still waits for **R40** | R40 open |
| R10 (facet error boundary) | open | unchanged; no facet shows an error yet | open |
| R13 (`EvaluationsAccess`) | confirmed | resolved by R23 | closed |
| R15 (slow `EvaluationForm` tests) | confirmed (21.0 s) | the suite takes 34 s, but this file still takes **18.4 s** for 45 tests (the slowest case 1.8 s) and bounds the wall time | closed in the backlog; the file is still the slowest |
| R16 (`fetchVerifiedOfferings`) | confirmed | resolved by R36 | closed |
| R17 (count in the overlay) | open | specified and implemented with R32 | closed |
| R18 (`notFound()` answers 200) | not verified | resolved by product decision: `show-item-not-found-message` shows "not found" in the view, and the status is not touched. *(not re-measured: the 404 of a missing item)* The unknown route answers **404** (measured) | closed |
| R19 (provisional evaluation on every detail) | confirmed | resolved by R30 (`/evaluations` not requested on the default tab, measured) | closed |
| New since the previous review | — | R40 (API 422/404 docs), R45 (first location at registration), R50 (consensus tree, API), R41 and R47 (closed) | see `docs/backlog.md` |

### 3.3 New candidates from this review

These are not in `docs/backlog.md`: this session only writes the review. They are numbered N1–N6 so they do not collide with backlog ids. Product owner or the orchestrator files them.

| ID | Proposed change-id (capability) | Files | Problem → sub-characteristic | Effort | Impact | Path |
|---|---|---|---|:-:|---|---|
| **N1** | `fix-sidebar-filters-contrast` (app-shell) | `src/shared/ui/SidebarMenuSub.tsx:18–22`, `src/app/styles/theme-tokens.test.ts` (matrix pair) | The "Filters" toggle inherits oxblood on the green sidebar: 1.06:1 → Usability / accessibility | S | Usability D → A | **Unplanned fix** (theming "Text and button contrast") |
| **N2** | `decide-uncovered-scenarios` (testing) | `docs/testing/test-reduction-result.md` (9 scenarios); a scenario → test map | Traceability 67% by name → Testability, Functional suitability | S–M | Traceability D → C or B, depending on the measure Product owner accepts | PO decision (already on the board) |
| **N3** | `fill-testing-spec-purpose` (testing) | `openspec/specs/testing/spec.md:4` | `openspec validate --specs --strict` fails on the placeholder Purpose | S | 14 / 14 specs valid | PO: an exception to "never edit `openspec/specs/` by hand", or a change whose archive replaces it |
| **N4** | `move-flavor-wheel-types` (feedback) | `src/shared/ui/FlavorWheel.tsx` → new `flavor-wheel-types.ts`; the 7 parts' type imports | 11 type-only cycles → Modularity | S | Modularity B → A | Refactor (fast lane) |
| **N5** | `lazy-load-facet-comboboxes` (filtering, app-shell) | `src/shared/ui/Combobox.tsx` consumers in the facets, coffee shop detail | 248.8 KB gz on the coffee shop detail, 207 KB minimum → Performance / resource use | M (measure first) | Performance C → B if ≤ 170 KB gz *(target not verified)* | Change (PO: when the facets load) |
| **N6** | `split-combobox` and the next refactor round (form-fields and others) | `Combobox.tsx:89` (183 lines / CC 27), then the 21 other functions over 80 lines (Appendix B.2) | The last high-CC unit; the AGENTS.md limits broken 29 times → Analysability, Modifiability | M–L | Analysability B → A; > 60-line share 29.3% → ≤ 15% for A | Refactor (fast lane), by backlog entry |

**QA-suite hygiene** goes through Product owner's reduction plan, not a change:

- delete the 3 stale QA files excluded in `vitest.qa.config.mts` (one of them is knip's unresolved import);
- remove the 19 unused variables lint reports in `qa/`.

### 3.4 Expected grades

| Characteristic | Now | After N1–N4 | After N1–N6 |
|---|:-:|:-:|:-:|
| Maintainability | B | B (Modularity A) | A *(judged: needs CC > 20 at 0% and ≤ 15% of LOC in units > 60 lines)* |
| Testability | D | C or B *(depends on N2's measure)* | same |
| Functional suitability | D | C or B *(same)* | same |
| Security | A | A | A |
| Usability | D | **A** | A |
| Performance efficiency | C | C | B *(if N5 reaches ≤ 170 KB gz)* |

---

## Appendix A — Method and tool versions

**Environment**

- Node 22.22.0, npm 10.9.4. `npm ci` warns `EBADENGINE`: `w3c-xmlserializer@6.0.0`, which jsdom pulls in, wants Node ≥ 22.22.2. It does not affect the results, but the Node version should be raised in the environment.
- Next.js **16.4.0** (Turbopack; was 16.3.6), TypeScript 5.9.3, ESLint 9.39.5 (npm marks it deprecated; AGENTS.md keeps ESLint 9 on purpose), Vitest 5.0.2 (jsdom 30.1.1), next-intl 4.14.9, radix-ui 1.6.7, cmdk 1.1.1, leaflet 1.9.4, oauth4webapi 3.8.8, lucide-react 1.49.0, React 19.2.8.
- Linux container.

**Setup**

- `git switch -c technical-review-2026-10-09 origin/develop` (local only), `npm ci`, `npx next typegen`.
- `git status` stayed clean apart from this file.

| Check | Command | Result (previous → now) |
|---|---|---|
| Validation suite | `npm run test:run` (wall time with `date`) | 195 files / 1,241 tests, 159.4 s → **198 files / 1,126 tests, all passed, 34.2 s (35 s wall)**. vmThreads pool, with forks for 7 files |
| QA suite | `npm run test:qa` (both suites) | did not exist → **353 files / 1,914 tests, all passed, 51.1 s (52 s wall)**. QA alone: 155 files / 788 tests; 3 QA files excluded by config |
| Per-file durations | `npx vitest run --reporter=json` | Appendix B.5 |
| Typecheck | `npx tsc --noEmit` | 0 errors → **0 errors** |
| Lint | `npm run lint` (`eslint -f json`) | 0 errors / 1 warning → **0 errors / 48 warnings**: 22 `max-lines-per-function` and 7 `complexity` (production; the AGENTS.md limits, reported since `add-code-structure-lint-rules`), 19 `@typescript-eslint/no-unused-vars` (all in `qa/`), 0 `max-lines`, 0 `no-restricted-imports`, 0 jsx-a11y |
| Build | `next build` with `NEXT_PUBLIC_API_URL=http://localhost:8000` | success in 27 s, 20 dynamic routes → **success in 24 s (compile 8.7 s, TypeScript 13.2 s); 21 dynamic routes + `icon.svg` static**. Next 16 prints no First Load JS per route; JS per route was measured in the browser (§1.4) |
| OpenSpec | `npx -y @fission-ai/openspec@1.13.2 validate --specs --strict` | not run → **13 passed, 1 failed** (`testing`: "Purpose section is still a placeholder"). The others report only INFO notes on long requirement texts |
| Audit | `npm audit --omit=dev --json`, `npm audit --json` | 2 high / 7 high → **0 / 5 high** (dev only), 0 critical |
| Complexity and unit size | `npx eslint <src, app, proxy.ts> --ignore-pattern <tests, schema.ts> --rule '{"complexity":["warn",0]}' --rule '{"max-lines-per-function":["warn",{"max":0,"skipBlankLines":true,"skipComments":true}]}' --rule '{"max-depth":["warn",4]}' -f json`, then a scratch script that pairs each complexity report with the innermost function range and keeps outermost units for the LOC shares | 1,316 functions; 40 with CC > 10; 22 > 80 lines; 0 with depth > 4. 4 of 1,317 complexity reports could not be paired (they are left out) |
| File sizes | `git ls-tree` + `git show | wc -l` per `.ts`/`.tsx` file, non-test, without `schema.ts` | On `85cd8f1` it gives 335 files / 25,493 lines, the previous figures. Now 413 / 29,413 |
| Duplication | `npx -y jscpd@4.3.0 src app --min-tokens 50 --ignore '**/*.test.ts,**/*.test.tsx,**/schema.ts'` | 1.09% → **0.84%** lines |
| Dead code | `npx -y knip@5.88.1 --reporter json`, default config | §2.6 |
| Cycles | `npx -y dependency-cruiser@16.10.4 src app proxy.ts`, ad hoc config in the scratch folder (`no-circular`, `tsPreCompilationDeps`, tests, `qa/` and `schema.ts` excluded), `NODE_PATH` set to the repo's `node_modules` | 3 cycles / 356 modules → **11 type-only cycles / 437 modules, 1,449 dependencies** |
| FSD layering | Ad hoc Node script: every `import` / `export … from` / dynamic `import()` / `vi.mock()` of `@/…` and relative paths under `src/`, `app/` and `proxy.ts`, classified by layer and slice | §2.3 |
| Props count | Ad hoc regex scan of `export type *Props = { … }` top-level fields | 157 types on `85cd8f1` (the previous review reported 153; mean 3.9 in both); now 208, mean 4.0 |
| Contract | `js-yaml` parse of `contracts/openapi.yaml` (35 operations) plus a grep of request paths in `src/` | §1.1 |
| Traceability | Ad hoc script: requirement and scenario titles of `openspec/specs/*/spec.md` searched in the test file text | On `85cd8f1`: 157 / 204 and 464 / 873, the previous figures ±1. Now 165 / 246, 559 / 1,077 |
| Accessibility | `playwright-core` 1.56.1, `@axe-core/playwright` 4.11.0, `axe-core` 4.11.0, Chromium (`/opt/pw-browsers/chromium-1194`), installed in a scratch folder outside the repo; theme set with the `theme` cookie | §1.3 |
| JS per route | The same Playwright run: sum of `script` response bodies until network idle, gzip with Node `zlib` level 6 | §1.4 |
| Headers | `curl -I` on `next start` for `/en` and `/callback` | §1.2 |

**Mock API**

- The same as before: a Node HTTP server answers every contract path with the `example` of its first documented 2xx response (now 35 operations + `OPTIONS`).
- The same deviation: `GET /evaluations/{ulid}` returns `status: "closed"`.
- It logs every request (§1.4). It is not committed.

**Limits**

- Signed-in screens (account, the evaluation form with a session, management) were still not audited with axe, because they need the OAuth popup flow.
- HTTP/2, real network timing and Core Web Vitals were not measured.
- The HTTP status of a missing offering or coffee shop (R18) was not re-measured. The unknown route's 404 was measured.
- The contrast failure was measured by axe and by computed style, and seen on a screenshot. It was not measured with the project's own contrast script.

## Appendix B — Raw metrics

### B.1 Functions with CC > 10 (non-test)

40 functions (was 37). Functions marked † are over the AGENTS.md limit of 15 (lint warning).

| CC | Function | Location | Previous |
|--:|---|---|--:|
| 27 † | `Combobox` | `src/shared/ui/Combobox.tsx:89` | 27 |
| 19 † | `Checkbox` | `src/shared/ui/Checkbox.tsx:89` | 25 |
| 19 † | `EvaluationSheetView` | `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx:130` | 19 |
| 18 † | `EvaluationsList` | `src/pages/evaluations-list/ui/EvaluationsList.tsx:78` | 18 |
| 18 † | `RadioGroup` | `src/shared/ui/RadioGroup.tsx:103` | 18 |
| 17 † | `OfferingCard` | `src/entities/offering/ui/OfferingCard.tsx:70` | 18 |
| 16 † | `parseEvaluationFilters` | `src/features/evaluation-facets/model/query.ts:86` | 16 |
| 15 | `EvaluationFacets` | `src/features/evaluation-facets/ui/EvaluationFacets.tsx:74` | 15 |
| 15 | `SpecialistEvaluationRow` | `src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx:53` | new (from `EvaluationRowCard` 37) |
| 15 | `BeanScale` | `src/shared/ui/BeanScale.tsx:93` | 15 |
| 15 | `Button` | `src/shared/ui/Button.tsx:152` | 13 |
| 15 | `InventoryPanel` | `src/widgets/offering-detail/ui/InventoryPanel.tsx:47` | 15 |
| 15 | `OfferingList` | `src/widgets/offering-list/ui/OfferingList.tsx:88` | 15 |
| 14 | `completeCallback` | `src/features/auth/api/authorize.ts:106` | 15 |
| 14 | `handleSubmit` | `src/features/user-account/ui/PasswordForm.tsx:116` | new |
| 14 | `IntensitySlider` | `src/shared/ui/IntensitySlider.tsx:82` | 14 |
| 14 | `DetailHeader` | `src/widgets/offering-detail/ui/DetailHeader.tsx:38` | 14 |
| 13 | `completenessOf` | `src/entities/evaluation/model/completeness.ts:26` | 13 |
| 13 | `formReducer` | `src/pages/evaluation-form/model/form-model.ts:96` | new (`split-evaluation-form-state`) |
| 13 | `EvaluationGroupCard` | `src/pages/evaluation-form/ui/EvaluationGroupCard.tsx:67` | 17 |
| 13 | `AppSidebar` | `src/widgets/app-sidebar/ui/AppSidebar.tsx:44` | new |
| 12 | `formStateFromEvaluation` | `src/entities/evaluation/model/load.ts:43` | new |
| 12 | `buildTaxonomyLookup` | `src/entities/taxonomy/model/lookup.ts:21` | 12 |
| 12 | `completePopup` | `src/features/auth/api/authorize.ts:229` | new |
| 12 | `evaluationListQuery` | `src/features/evaluation-facets/model/query.ts:132` | 12 |
| 12 | `publicEvaluationsQuery` | `src/features/evaluation-facets/model/query.ts:153` | 12 |
| 12 | `initialFormModel` | `src/pages/evaluation-form/model/form-model.ts:55` | new |
| 12 | async arrow function | `src/pages/evaluation-form/model/use-evaluation-form.ts:92` | new |
| 12 | `EvaluationFormHeader` | `src/pages/evaluation-form/ui/EvaluationFormHeader.tsx:31` | new |
| 12 | `DescriptorChipGroup` | `src/shared/ui/DescriptorChipGroup.tsx:121` | 12 |
| 12 | `renderOption` | `src/shared/ui/RadioGroup.tsx:144` | 12 |
| 12 | `EvaluationSheetBaseline` | `src/widgets/evaluation-sheet/ui/EvaluationSheetBaseline.tsx:60` | new |
| 12 | `EvaluationListPresentation` | `src/widgets/public-evaluation-list/ui/EvaluationListPresentation.tsx:79` | 12 |
| 11 | `refreshProfile` | `src/features/auth/model/session.ts:202` | 11 |
| 11 | `appliedEvaluationFilters` | `src/features/evaluation-facets/model/applied.ts:32` | 11 |
| 11 | `handleSubmit` | `src/features/user-account/ui/ProfileForm.tsx:79` | new |
| 11 | arrow function | `src/shared/ui/Combobox.tsx:202` | 11 |
| 11 | `Field` | `src/shared/ui/Field.tsx:30` | 11 |
| 11 | arrow function | `src/shared/ui/LocationsMap.tsx:126` | 11 |
| 11 | `UserMenu` | `src/widgets/app-header/ui/UserMenu.tsx:107` | new |

These left the list: `EvaluationRowCard` 37, `EvaluationForm` 25, `PasswordInput` 23, `Select` 20, `Input` 19, the `FlavorWheel` arrow function 18 and `FlavorWheel` 16, `Textarea` 15, and `handleSubmit` of `ContactSection` 14.

### B.2 Functions over 80 lines (non-blank, non-comment)

22 functions (was 31), all reported by lint as `max-lines-per-function` warnings.

| LOC | Function | Location | Previous |
|--:|---|---|--:|
| 183 | `Combobox` | `src/shared/ui/Combobox.tsx:89` | 183 |
| 147 | `LocationsMap` | `src/shared/ui/LocationsMap.tsx:105` | 147 |
| 141 | `EvaluationSheet` | `src/widgets/evaluation-sheet/ui/EvaluationSheet.tsx:151` | 141 |
| 136 | `OfferingFacets` | `src/features/offering-facets/ui/OfferingFacets.tsx:55` | 132 |
| 135 | `BeanScale` | `src/shared/ui/BeanScale.tsx:93` | 135 |
| 128 | `EvaluationsList` | `src/pages/evaluations-list/ui/EvaluationsList.tsx:78` | 121 |
| 124 | `DescriptorChipGroup` | `src/shared/ui/DescriptorChipGroup.tsx:121` | 124 |
| 121 | `OfferingDetailScreen` | `src/pages/offering-detail/ui/OfferingDetailScreen.tsx:67` | 122 |
| 111 | `LocationForm` | `src/features/location-management/ui/LocationForm.tsx:112` | 112 |
| 111 | `RegisterForm` | `src/features/user-account/ui/RegisterForm.tsx:114` | 140 |
| 108 | `RadioGroup` | `src/shared/ui/RadioGroup.tsx:103` | 108 |
| 106 | `ProfileForm` | `src/features/user-account/ui/ProfileForm.tsx:54` | 113 |
| 105 | `DangerZone` | `src/features/user-account/ui/DangerZone.tsx:48` | 111 |
| 105 | `PasswordForm` | `src/features/user-account/ui/PasswordForm.tsx:94` | 132 |
| 100 | `EvaluationFacets` | `src/features/evaluation-facets/ui/EvaluationFacets.tsx:74` | 100 |
| 99 | `IntensitySlider` | `src/shared/ui/IntensitySlider.tsx:82` | 99 |
| 96 | `formTextsFrom` | `src/pages/evaluation-form/ui/form-texts.ts:8` | 90 |
| 96 | `CoffeeshopsMapView` | `src/widgets/coffeeshop-list/ui/CoffeeshopsMapView.tsx:69` | 96 |
| 95 | `ScoreRangeFacet` | `src/shared/ui/ScoreRangeFacet.tsx:35` | 95 |
| 93 | `CoffeeshopsScreen` | `src/pages/coffeeshops/ui/CoffeeshopsScreen.tsx:51` | 90 |
| 93 | `EvaluationsListScreen` | `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx:38` | 88 |
| 83 | `useEvaluationForm` | `src/pages/evaluation-form/model/use-evaluation-form.ts:67` | new |

These left the list (≤ 80 lines now): `FlavorWheel` 319, `ConsensusPanel` 252, `EvaluationForm` 244, `EvaluationGroupCard` 205, `ContactSection` 186, `LocationsPanel` 138, `FacetCascade` 126, `EvaluationRowCard` 95, `AccountClient` 85 and `OfferingCard` 84.

### B.3 All jscpd clones (lines, tokens)

| Lines | Tokens | First location | Second location |
|--:|--:|---|---|
| 29 | 229 | `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx:50-78` | `src/pages/offerings/ui/OfferingsScreen.tsx:48-76` |
| 21 | 193 | `src/features/user-account/ui/PasswordForm.tsx:182-202` | `src/features/user-account/ui/ProfileForm.tsx:145-165` |
| 20 | 214 | `src/features/user-account/ui/PasswordForm.tsx:111-130` | `src/features/user-account/ui/RegisterForm.tsx:136-155` |
| 18 | 106 | `src/shared/ui/BeanScale.tsx:124-141` | `src/shared/ui/DescriptorChipGroup.tsx:137-154` |
| 17 | 130 | `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx:104-120` | `src/pages/offering-detail/ui/OfferingDetailScreen.tsx:168-184` |
| 14 | 95 | `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx:24-37` | `src/pages/public-evaluations/ui/ListScreen.tsx:31-45` |
| 14 | 104 | `src/pages/account/ui/AccountScreen.tsx:70-83` | `src/pages/manage-locations/ui/ManageLocationsScreen.tsx:51-64` |
| 13 | 125 | `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.tsx:56-68` | `src/widgets/offering-detail/ui/OfferingDetailContent.tsx:83-95` |
| 13 | 143 | `src/features/evaluation-facets/ui/EvaluationsToolbar.tsx:43-55` | `src/features/offering-facets/ui/OfferingsToolbar.tsx:32-44` |
| 12 | 89 | `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.tsx:68-79` | `src/widgets/offering-detail/ui/OfferingDetailContent.tsx:95-106` |
| 12 | 93 | `src/pages/manage-offerings/ui/ManageOfferingsScreen.tsx:41-52` | `src/pages/offerings/ui/OfferingsScreen.tsx:57-68` |
| 12 | 94 | `src/features/coffeeshop-facets/ui/CoffeeshopFacets.tsx:32-43` | `src/features/offering-facets/ui/OfferingFacets.tsx:94-105` |
| 12 | 106 | `src/shared/ui/DescriptorCascade.tsx:12-23` | `src/shared/ui/DescriptorChipGroup.tsx:22-33` |
| 12 | 105 | `src/shared/ui/BeanScale.tsx:107-118` | `src/shared/ui/DescriptorChipGroup.tsx:127-…` |
| 10 | 87 | `src/pages/evaluation-form/ui/ExtrinsicField.tsx:39-48` | `src/pages/evaluation-form/ui/NoteField.tsx:51-60` |
| 10 | 105 | `src/features/user-account/ui/ProfileForm.tsx:74-83` | `src/features/user-account/ui/RegisterForm.tsx:136-145` |
| 10 | 96 | `src/shared/ui/IntensitySlider.tsx:91-100` | `src/shared/ui/RadioGroup.tsx:135-144` |
| 10 | 98 | `src/shared/ui/DescriptorChipGroup.tsx:130-139` | `src/shared/ui/RadioGroup.tsx:135-…` |
| 9 | 52 | `src/pages/manage-offerings/ui/ManageOfferingsSidebarEntries.tsx:24-32` | `src/pages/new-offering/ui/NewOfferingSidebarEntries.tsx:24-32` |
| 9 | 108 | `src/features/coffeeshop-facets/model/query.ts:35-43` | `src/features/evaluation-facets/model/query.ts:62-70` |
| 8 | 82 | `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx:110-117` | `src/widgets/offering-detail/ui/OfferingDetailContent.tsx:87-95` |
| 8 | 71 | `src/pages/about/ui/AboutContent.tsx:77-84` | `src/pages/home/ui/HomeHero.tsx:70-77` |
| 7 | 59 | `src/pages/evaluation-form/ui/GroupParts.tsx:147-153` | `src/pages/evaluation-form/ui/GroupParts.tsx:116-122` |
| 7 | 76 | `src/entities/offering/ui/OfferingCard.tsx:107-113` | `src/widgets/offering-detail/ui/ScoreCard.tsx:48-54` |
| 7 | 71 | `src/entities/coffeeshop/ui/CoffeeshopCard.tsx:27-33` | `src/entities/offering/ui/OfferingCard.tsx:56-69` |
| 6 | 87 | `src/pages/evaluation-form/ui/EvaluationFormHeader.tsx:35-40` | `src/widgets/evaluation-row/ui/EvaluationRowParts.tsx:78-83` |
| 6 | 74 | `src/entities/offering/ui/OfferingCard.tsx:96-101` | `src/widgets/offering-detail/ui/DetailHeader.tsx:46-52` |
| 6 | 86 | `src/entities/coffeeshop/api/coffeeshop.ts:20-25` | `src/entities/offering/api/offering.ts:25-32` |

As before, jscpd reports the second range of some clones with an end line lower than the start line (shown as `…`).

### B.4 Requirement names not found in any validation-suite test file text

The tests may still cover these under another wording (§1.3). Requirements marked ◆ are refactor properties: AGENTS.md lets no test be added for them, so lint, the build or the existing suites verify them.

- **app-shell (9):** Brand logotype presentation; Header menu triggers; Sidebar entry presentation; No known high or critical framework advisory ◆; Code-structure rules reported by lint ◆; Header menu surface; Named navigation landmarks; Result count announced inside the sidebar overlay; Client code loaded per route ◆.
- **auth (1):** One active-locale derivation for the auth flows ◆.
- **base-controls (8):** Action button treatments; Action button sizes; Action button interaction states; Accessible naming of icon-only actions; Link states and back variant; Theme-driven corner radii; Action variants by kind; Navigation controls by position.
- **content-structure (6):** Card stacking on narrow viewports; Pagination page numbers; Acyclic shared segment imports ◆; Prompt page change on server-loaded lists; Heading outline; Public indexes export only what is imported ◆.
- **evaluations (10):** Closing an evaluation; Sign-in to the evaluation routes; Evaluate action on the offering card; Public evaluations filter sidebar; Offerings of an evaluations page ◆; Evaluation routes as protected views; One row per evaluation-row variant ◆; Evaluation form kept as one form ◆; Cancelling the evaluation form; Evaluation route headings.
- **feedback (5):** Badge label contrast; Flavor wheel note list disclosure; Flavor wheel kept as one view ◆; Flavor wheel with every level; Selected row of the flavor wheel note list.
- **filtering (5):** Evaluation facets in the sidebar; Filtered evaluation results; Coffee shop filter toolbar; Filtered coffee shop results; Sidebar facets sub-section.
- **form-fields (5):** Field structure and association; Inverse variant on dark surfaces; Theme-driven rendering; Facet row presentation; One field resolution for every field control ◆.
- **landing (2):** Public access; Verified offerings list.
- **offering-catalog (14):** Catalog pagination; Catalog heading and toolbar slot; Catalog single column; Catalog and detail texts and metadata; View evaluations link on the offering detail; Directory heading and results column; Map interaction and accessibility; Full-screen map on a small viewport; Coffee shop detail tabs in the address; Directory texts and metadata; Public reads through the shared public request client ◆; Consensus panel kept as one view ◆; Reference data cached with a one-hour refresh ◆; One result shape for every API request ◆.
- **offering-management (5):** Localized management texts; Access to the locations page; Address geocoding; Localized location texts; Management panels kept as one view ◆.
- **testing (1):** Test environment set-up keeps the suites' results ◆.
- **theming (5):** Two complete color themes; Text and button contrast; UI boundary and focus contrast; Theme-invariant typography; Text sizing accessibility.
- **user-account (5):** Writes and the step-up; Account requests through the slice's request layer ◆; Contact section kept as one view ◆; Account page modes and their session gate; Grouped security section.

Matches by capability (requirements / scenario titles), previous → now:

| Capability | Requirements | Scenario titles |
|---|--:|--:|
| app-shell | 17/21 → 20/29 | 65/102 → 77/126 |
| auth | 9/9 → 10/11 | 31/34 → 40/45 |
| base-controls | 2/8 → 5/13 | 14/28 → 19/43 |
| content-structure | 9/11 → 9/15 | 32/53 → 36/66 |
| evaluations | 13/17 → 13/23 | 20/82 → 48/124 |
| feedback | 9/11 → 8/13 | 27/57 → 29/63 |
| filtering | 29/33 → 29/34 | 34/119 → 40/129 |
| form-fields | 10/14 → 12/17 | 64/74 → 67/86 |
| landing | 8/10 → 8/10 | 39/39 → 46/46 |
| offering-catalog | 25/35 → 25/39 | 100/123 → 103/141 |
| offering-management | 12/16 → 12/17 | 24/82 → 24/90 |
| testing | — → 0/1 | — → 0/2 |
| theming | 3/8 → 4/9 | 2/23 → 2/24 |
| user-account | 11/11 → 10/15 | 13/57 → 28/92 |

### B.5 Slowest test files (validation suite)

| Duration | Tests | File | Previous |
|--:|--:|---|---|
| 18.4 s | 45 | `EvaluationForm.test.tsx` | 21.0 s / 36 |
| 2.1 s | 41 | `AppHeader.test.tsx` | 2.5 s / 35 |
| 2.0 s | 22 | `authorize.test.ts` | — |
| 2.0 s | 24 | `ManageOfferingsPanel.test.tsx` | 3.3 s / 26 |
| 1.7 s | 15 | `session.test.ts` | 1.6 s / 13 |
| 1.7 s | 7 | `EvaluationDetail.test.tsx` | 2.4 s / 6 |
| 1.6 s | 43 | `FlavorWheel.test.tsx` | 2.2 s / 42 |
| 1.2 s | 16 | `Badge.test.tsx` | — |
| 1.1 s | 9 | `OfferingFacets.test.tsx` | — |
| 0.9 s | 14 | `AppShell.test.tsx` | — |

The slowest case is still "sends each descriptor block's selection to its request field (design.md D7)", at 1.8 s (was 2.0 s). With the vmThreads pool, `EvaluationForm.test.tsx` alone takes more than half of the suite's wall time.

### B.6 Largest client chunks (`.next/static/chunks`)

| Chunk | Raw | Gzip | Contents (by string match) | Previous |
|---|--:|--:|---|---|
| `2nii411saqstq.js` | 207 KB | 65 KB | react-dom; every route | `34wvn5zw0a69w.js` 199 / 63 KB |
| `0hzoz45wp76l6.js` | 159 KB | 44 KB | framework; every route | `1a7jqsbbldhux.js` 156 / 42 KB |
| `2m30aakide9md.js` | 152 KB | 44 KB | Leaflet; lazy, map view only | `0npphf47dyaux.js` 148 / 43 KB |
| `0cz1d0mv5g_q7.js` | 113 KB | 39 KB | — (not loaded on the measured routes) | 109 / 38 KB |
| `3kveyp7z-2f-p.js` | 62 KB | 20 KB | every route | — |
| `41qy8ggehgcyv.js` | 56 KB | 19 KB | cmdk, Radix; facet routes only | `240_2zg523npv.js` 216 / 68 KB cmdk + Radix on **every** route |

The CSS bundle is 88 KB raw / 14 KB gzip (was 85 / 13 KB), plus a 10.6 KB raw / 2.7 KB gzip route stylesheet.

## Appendix C — Grading thresholds

These are the same thresholds as the previous review, unchanged so the grades compare. A characteristic's grade is the **worst** of its indicators.

| Indicator | A | B | C | D | E | Previous value | **Now** |
|---|---|---|---|---|---|---|---|
| Modularity: FSD violations in production / cycles | 0 / 0 | ≤ 2 / only intra-segment or type-only cycles | ≤ 5 / ≤ 3 cross-slice | ≤ 10 | > 10 | 2 / 3 intra-segment → B | 0 / 11 type-only, intra-segment → **B** |
| Reusability: jscpd duplicated lines | < 3% | 3–5% | 5–10% | 10–20% | > 20% | 1.09% → A | 0.84% → **A** |
| Analysability: share of outermost-unit LOC with CC 11–20 / 21–50 / > 50 | ≤ 25% / 0% / 0% | ≤ 30% / ≤ 5% / 0% | ≤ 40% / ≤ 10% / 0% | ≤ 50% / ≤ 15% / ≤ 5% | worse | 15.5% / 5.0% / 0% → B | 12.8% / 1.3% / 0% → **B** |
| Modifiability (a): share of function LOC in units > 60 lines (React-calibrated) | ≤ 15% | ≤ 30% | ≤ 45% | ≤ 60% | > 60% | 41.0% → C | 29.3% → **B** |
| Modifiability (b): files > 300 lines | ≤ 2 | ≤ 5 | ≤ 10 | ≤ 20 | > 20 | 9 → C | 2 → **A** |
| Testability: pass rate | 100% | ≥ 99% | ≥ 97% | ≥ 90% | < 90% | 100% → A | 100% (1,126 and 1,914) → **A** |
| Testability: full-suite wall time | ≤ 60 s | ≤ 120 s | ≤ 240 s | ≤ 480 s | > 480 s | 159 s → C | 35 s (validation suite) → **A**; both suites 52 s |
| Testability / Functional suitability: requirement names traceable to tests | ≥ 95% | ≥ 85% | ≥ 70% | ≥ 50% | < 50% | 77% → C | 67.1% → **D** (lower bound; 72.4% → C without the 18 refactor-property requirements) |
| Functional suitability: in-scope contract operations consumed | ≥ 95% | ≥ 85% | ≥ 70% | ≥ 50% | < 50% | 31/31 → A | 32/32 in scope (32/35 overall) → **A** |
| Security: dependency advisories (runtime) | none | low/moderate only | high with an in-minor fix | high with no fix, or reachable | critical | 2 high → C | none → **A** |
| Security: response headers | CSP + nosniff + Referrer-Policy + Permissions-Policy, no X-Powered-By | strict CSP, 1–4 of the rest missing | CSP present but weak | no CSP | no CSP and framing allowed | 3 missing + X-Powered-By → B | all present, no X-Powered-By → **A** |
| Security: credential storage | memory only | session storage | local storage | cookies without flags | tokens in URL / logs | memory only → A | memory only → **A** |
| Security: HTML injection sinks | 0 | — | 1 sanitised | 1 unsanitised | > 1 | 0 → A | 0 → **A** |
| Usability: axe WCAG 2.2 A/AA violations | 0 | 0 | ≤ 3 moderate | any serious | any critical | 0 on 36 runs → A | 1 serious rule (`color-contrast`) in 4 of 48 runs → **D** |
| Usability: best-practice rule types / lint a11y warnings | 0 / 0 | ≤ 3 / ≤ 2 | ≤ 6 / ≤ 5 | more | — | 3 / 1 → B | 0 / 0 → **A** |
| Performance: first-load JS per route (gzip, max) | ≤ 130 KB | ≤ 170 KB | ≤ 250 KB | ≤ 350 KB | > 350 KB | 225.5 KB → C | 248.8 KB (coffee shop detail) → **C** |
| Performance: redundant requests per view *(judged)* | none | ≤ 2 | ≤ 5 | — | — | 2 on the detail view + uncached reference data → B | none with consistent data; reference reads cached for 1 h → **A** |
