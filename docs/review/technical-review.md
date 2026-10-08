# Technical review — tazavera-front (ISO/IEC 25010)

- **Date:** 2026-10-08
- **Scope:** `app/`, `src/`, `proxy.ts`, configuration, against `contracts/openapi.yaml` and `openspec/specs/*` (13 capabilities).
- **Revision:** `origin/develop` `85cd8f1`. It differs from `f35b6b3` (every change of the delivery merged) only in `docs/change-progress.md`, so the code under review is the code of `f35b6b3`.
- **Kind:** read-only analysis requested by Product owner in the decisions log, 2026-10-08, "última tarea: revisión técnica ISO 25010 y hoja de ruta de refactorización". No source, test, configuration, `openspec/` or other doc file was changed. Tools ran with `npx -y <tool>@<version>` or from a scratch folder outside the repository.
- **Measured vs judged:** every number below comes from a tool run listed in the [appendix](#appendix-a--method-and-tool-versions). Statements marked *(judged)* are reviewer opinion from reading the code. Statements marked *(not verified)* could not be checked in this session.

---

## 1. Executive summary

The codebase is in good shape for a first delivery:

- All 1,241 tests pass, and typecheck and lint are clean (1 lint warning).
- 31 of the 32 contract operations are consumed. The one left out, `listTheEvaluationsOfAUser`, is out of scope by decision.
- Duplication is 1.09%.
- The FSD layering is almost clean: 2 forbidden imports in production code and 3 import cycles, all inside one segment.
- axe-core finds **no WCAG 2.2 A/AA violation** on 9 screens × 2 themes × 2 viewports.
- Tokens stay in memory only, and nothing injects HTML.

The grades are held down by four things:

- **Security:** `next@16.3.6` carries 6 high advisories, fixed in `16.4.0`. Updating needs Product owner's approval.
- **Performance:** every route ships ~220 KB of gzipped JS, including a 68 KB cmdk/Radix chunk that the landing does not need.
- **Modifiability:** large components and functions. 9 files are over 300 lines, and 41% of the code inside functions sits in functions longer than 60 lines.
- **Testability:** the suite takes 159 s, and only 77% of the requirement names can be traced to a test name.

### Scorecard

Each characteristic's grade is the worst grade among its indicators. The thresholds are in [Appendix C](#appendix-c--grading-thresholds).

| ISO/IEC 25010 characteristic | Grade | Indicators (grade) | Key evidence |
|---|:-:|---|---|
| **Maintainability** | **C** | Modularity **B** · Reusability **A** · Analysability **B** · Modifiability **C** | 2 cross-feature imports + 3 intra-segment cycles; jscpd 1.09%; CC risk by LOC: 15.5% moderate, 5.0% high, 0% very high; 9 files > 300 lines, 41% of function LOC in units > 60 lines |
| **Testability** | **C** | Pass rate **A** · Suite duration **C** · Requirement traceability **C** | 1,241/1,241 pass; 159 s wall (jsdom set-up 51%); 157/204 requirement names found in test names (77%) |
| **Functional suitability** | **C** | Contract coverage **A** · Spec traceability **C** | 31/32 operations (the 32nd excluded by decision); same 77% requirement traceability (a lower bound, see §1.3) |
| **Security** | **C** | Dependencies **C** · Headers **B** · Credential handling **A** · Injection **A** | `npm audit --omit=dev`: 2 high (next direct, source-map-js transitive); full: 7 high, 0 critical; strict nonce CSP + COOP, but no `nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `X-Powered-By` is exposed; tokens in module memory only; no `dangerouslySetInnerHTML` |
| **Usability (accessibility)** | **B** | WCAG A/AA (axe) **A** · Best practice **B** · Guards **A** | 0 A/AA violations on 36 runs; 3 best-practice rule types (`heading-order`, `landmark-unique`, `page-has-heading-one`); 1 jsx-a11y warning; R17 open |
| **Performance efficiency** | **C** | JS per route **C** · Request efficiency **B** *(judged)* | 218–226 KB gz / 711–731 KB raw JS on every measured route; uncached `/taxonomies` on each render; R19 (2 extra requests per detail view) |

Not graded, because the brief does not ask for them: Reliability, Compatibility, Portability.

### 1.1 Functional suitability — contract operations

| Operation | Consumed in |
|---|---|
| `listOfferings`, `getAnOffering` | `src/widgets/offering-list/api/offerings.ts:42`, `src/entities/offering/api/offering.ts:21` |
| `createOfferings`, `deleteAnOffering`, `deleteMultipleOfferings` | `src/features/offering-management/api/management.ts:83,92,123` |
| `listCoffeeInventory` | `src/features/offering-management/api/management.ts:107` |
| `listCoffees`, `listRoasteries`, `listOlfactoryTaxonomies` | `src/shared/api/coffees.ts:16`, `src/features/offering-facets/api/search-roasteries.ts:11`, `src/entities/taxonomy/api/taxonomies.ts:13` |
| `listCoffeeShops`, `getACoffeeShop` | `src/widgets/coffeeshop-list/api/coffeeshops.ts:17`, `src/entities/coffeeshop/api/coffeeshop.ts:17` |
| `listEvaluations`, `getAnEvaluation` | `src/entities/evaluation/api/public-evaluations.ts:50,60` |
| `listMyEvaluations`, `getMyEvaluation`, `createAnEvaluation`, `updateAnEvaluation`, `closeAnEvaluation`, `deleteAnEvaluation` | `src/entities/evaluation/api/user-evaluations.ts:60–96` |
| `listMyLocations`, `listAUsersLocations`, `createALocation` | `src/features/offering-management/api/management.ts:140`, `src/features/location-management/api/locations.ts:9,16` |
| `getTheAuthenticatedUser`, `logOut` | `src/features/auth/model/session.ts:88,130,175` |
| `registerAUser`, `updateAUser`, `updateUserPassword`, `deactivateAUser`, `permanentlyDeleteAUser` | `src/features/user-account/ui/RegisterForm.tsx:139`, `ProfileForm.tsx:90`, `PasswordForm.tsx:123`, `DangerZone.tsx:73–76` |
| `listMyContacts`, `createMyPrimaryContact` | `src/features/user-account/api/contacts.ts:9,19` |
| **`listTheEvaluationsOfAUser`** | **not consumed**: out of scope (change-progress, 8 Oct) |

No call targets a path the contract does not declare. Three links point to API-hosted pages (`/forgot-password`, `/user/security`, the account security URL). These are navigations, not API operations.

### 1.2 Security details

- **`npm audit --omit=dev`:** 2 high.
  - `next` 16.0.0–16.3.7 (direct) has 6 advisories: GHSA-3w37-wq28-93x7, GHSA-4jqv-mc3x-m676, GHSA-39w2-rjm5-chcv, GHSA-f87g-xv8r-7p7x, GHSA-mcj8-r9mp-w47p and GHSA-cjq9-62q9-8jv4. All are fixed in `16.4.0`, which is outside the exact pin `16.3.6`.
  - `source-map-js` ≤ 1.2.1 (transitive, via `@tailwindcss/postcss` and `postcss`, so build time only) has 1 advisory, fixable with `npm audit fix`.
  - Full audit: 7 high, adding `eslint-config-next`, `@next/eslint-plugin-next`, `fast-glob`, `micromatch` and `braces` (dev only). No critical.
- **Exposure of the Next.js advisories *(judged, not verified)*:**
  - Every route is dynamic (`ƒ` in the build output).
  - No `use cache`, ISR, `revalidate`, Draft Mode or generated metadata images.
  - Image optimization is used once (`src/pages/home/ui/HomeHero.tsx:2`), with no `remotePatterns`.
  - So most advisories look unreachable. The upgrade is still the cheapest fix and the only one that makes the audit clean.
- **Headers** (`proxy.ts:48–120`, checked with `curl -I` on `next start`):
  - Good: a strict CSP with a per-request nonce, `'strict-dynamic'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` and `frame-ancestors 'none'`. `Cross-Origin-Opener-Policy: same-origin-allow-popups`.
  - `style-src 'unsafe-inline'` is a documented trade-off for Radix (`proxy.ts:31–34`).
  - Missing: `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`. `Strict-Transport-Security` belongs to the hosting layer *(not verified)*. `X-Powered-By: Next.js` is sent, because `poweredByHeader` is not disabled in `next.config.ts:9`.
- **Credentials:**
  - The grant lives in module memory only (`src/shared/api/tokens.ts:33`).
  - `sessionStorage` holds only the PKCE verifier, `state` and return route of a full-page flow, cleared at the callback (`src/features/auth/model/flow.ts:44–63`).
  - `localStorage` holds a credential-free marker (`flow.ts:66–78`).
  - A production build refuses non-HTTPS token endpoints (`tokens.ts:111–115`).
  - This matches spec "Credential handling".
- **Injection:**
  - No `dangerouslySetInnerHTML`, `innerHTML`, `eval` or `new Function` in `src/`, `app/` or `proxy.ts`.
  - `src/shared/ui/xss-guard.test.ts` guards it.
  - Query values go through `encodeURIComponent` / `URLSearchParams` (e.g. `management.ts:107`, `search-roasteries.ts:12`).
  - Return routes are validated as internal (fix-auth-return-query).

### 1.3 Usability and accessibility details

**axe-core** 4.11.0 ran through Playwright on Chromium 141 against `next start`, backed by a mock API built from the contract examples. Tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` and `best-practice`. It covered 9 screens × {traditional, dark} × {1280, 375} = 36 runs.

| Screen | Path | A/AA violations | Best-practice findings |
|---|---|:-:|---|
| Landing | `/en` | 0 | `heading-order` (card `h3` after the `h1`), `landmark-unique` at 1280 (unlabelled `<nav>`) |
| Catalog | `/en/offerings` | 0 | `heading-order` |
| Offering detail | `/en/offerings/{ulid}` | 0 | — |
| Public evaluation view | `/en/evaluations/{ulid}` | 0 | — |
| Public evaluations list | `/en/evaluations` | 0 | — |
| Register | `/en/register` | 0 | — |
| Coffee shop directory | `/en/coffeeshops` | 0 | `heading-order` |
| Coffee shop detail | `/en/coffeeshops/{ulid}` | 0 | `heading-order` |
| Evaluation form, signed out (gated) | `/en/manage/evaluations/new?offering=…` | 0 | `page-has-heading-one` (the signed-out prompt has no `h1`) |

Notes on the axe results:

- Colour contrast passes in both themes, consistent with the `theme-tokens` contrast matrix.
- The signed-in form and account screens could not be audited: auth is client-side through a popup, and the mock has no authorization server *(not verified)*.
- Lint reports `jsx-a11y/role-has-required-aria-props` at `src/shared/ui/FlavorWheel.tsx:516` (a `treeitem` without `aria-selected`).
- Backlog R17 (the result count is not announced while the facets overlay is open) is still open.
- Sources of the best-practice findings:
  - Unlabelled `<nav>`: `src/widgets/app-header/ui/PrimaryNav.tsx:65`, `src/pages/home/ui/HomeHero.tsx:78`, `src/pages/about/ui/AboutContent.tsx:114`, `src/widgets/app-sidebar/ui/AppSidebar.tsx:67`.
  - Card headings at `h3` under the page `h1`: `src/entities/offering/ui/OfferingCard.tsx:125`, `src/entities/coffeeshop/ui/CoffeeshopCard.tsx:49`.

**Guards (project rules, all passing):** `color-guard`, `radius-guard`, `focus-guard`, `badge-geometry-guard`, `xss-guard`, `client-boundary` (×2), `icons`, `catalog-guard`, `leaflet-guard`, `session-types-guard` and the `theme-tokens` contrast matrix. ESLint enforces `react/jsx-no-literals`, so every interface text comes from the catalog (`eslint.config.mjs:20–33`).

**Spec traceability** (Testability and Functional suitability). I matched requirement and scenario titles of `openspec/specs/*` against the text of the test files (case-insensitive substring):

- 157 of 204 requirement names were found (77%).
- 465 of 873 scenario titles were found (53%).

This is a **lower bound**. Tests usually name the requirement in `describe("… (spec: <Requirement>)")` and paraphrase the scenario in `it()`. The guard tests verify the theming requirements without naming them (theming 3/8). The 47 unmatched requirement names are listed in Appendix B.4. The test-reduction plan pass 2, which is in flight, maps one test per scenario and will give the exact figure *(not verified here)*.

### 1.4 Performance details

Next 16 no longer prints per-route sizes. JS was measured in the browser as the sum of every `script` response loaded until network idle, with gzip computed with Node `zlib`, level 6.

| Route | Scripts | Raw JS | Gzip JS |
|---|:-:|--:|--:|
| `/en` (landing) | 12 | 731 KB | 225.5 KB |
| `/en/offerings` | 12 | 717 KB | 220.2 KB |
| `/en/offerings/{ulid}` | 12 | 718 KB | 220.5 KB |
| `/en/evaluations/{ulid}` | 11 | 711 KB | 217.8 KB |
| `/en/evaluations` | 12 | 715 KB | 219.6 KB |
| `/en/register` | 12 | 729 KB | 222.7 KB |
| `/en/coffeeshops` | 12 | 725 KB | 222.8 KB |
| `/en/coffeeshops/{ulid}` | 12 | 717 KB | 220.4 KB |

Findings:

- **Every route loads the same 11 shared chunks.** The biggest is `240_2zg523npv.js` (216 KB raw / 68 KB gz), which contains **cmdk** and Radix. cmdk is used only by `src/shared/ui/Combobox.tsx` (offering facets and the new-offering form), yet it loads on the landing.
  - *(judged)* The likely cause is that client components import through the `@/shared/ui` barrel (`src/shared/ui/index.ts`), so the client bundle cannot split the combobox from the header's menus.
- Leaflet is correctly lazy-loaded (`src/shared/ui/LocationsMapLoader.tsx:29`). Its 148 KB chunk does not load on the landing.
- **Server requests** (mock API log):
  - The offering detail asks for `/offerings/{ulid}`, `/taxonomies` and `/evaluations` on the default tab. This is backlog **R19**.
  - `/taxonomies` (`src/entities/taxonomy/api/taxonomies.ts:13`) and `/coffees` (`src/shared/api/coffees.ts:16`) are fetched with no cache option, so on every render.
  - "My evaluations" and the public list read one offering per distinct `offeringId`, in parallel and deduplicated: `src/pages/evaluations-list/ui/EvaluationsList.tsx:62–69` and `src/widgets/public-evaluation-list/ui/PublicEvaluationList.tsx:46–55`. That is up to 15 extra requests per page, imposed by the contract (no embedded offering).

---

## 2. Maintainability in depth

### 2.1 Size and layering (measured)

| Layer | Slices | Files (non-test) | LOC (non-test) |
|---|:-:|:-:|--:|
| `app` (Next routing, root) + `proxy.ts` | — | 35 | ~500 |
| `src/app` | 3 | 5 | 272 |
| `src/pages` | 19 | 73 | 5,128 |
| `src/widgets` | 9 | 65 | 4,696 |
| `src/features` | 9 | 60 | 5,380 |
| `src/entities` | 6 | 29 | 1,541 |
| `src/shared` (without generated `schema.ts`, 7,131 lines) | 4 segments | 68 | 7,972 |
| **Total** | | **335** | **25,493** (+28,077 test LOC, 195 test files) |

### 2.2 SOLID applied to React + FSD

**S — single responsibility**

- Good:
  - `src/shared/ui/SessionGate.tsx:28–41`: one decision (loading / signed out / 404 / content), no element of its own.
  - `src/shared/ui/RetryButton.tsx:21–24`: one action.
  - `src/entities/offering/api/offering.ts:19`: one read with a typed outcome.
  - The page `page.tsx` files are thin, as AGENTS.md requires (e.g. `app/[locale]/offerings/page.tsx`).
- Bad:
  - `src/pages/evaluation-form/ui/EvaluationForm.tsx:128`: one 244-line function, cyclomatic complexity 25, and **9 `useState`** (`:135–153`). It mixes form state, save/close orchestration, group disclosure and messages.
  - `src/widgets/offering-detail/ui/ConsensusPanel.tsx:209`: a 252-line function with 36 text keys (`:32`) for scores, selection blocks, axes and concordance.
  - `src/shared/ui/FlavorWheel.tsx:235`: a 319-line function that draws the SVG wheel, the tree list and the keyboard model.
  - `src/features/user-account/ui/ProfileForm.tsx:90`, `PasswordForm.tsx:123`, `RegisterForm.tsx:139`, `DangerZone.tsx:76`: the components build and send their HTTP requests inline, so the UI also owns transport and status mapping.

**O — open for extension (props, slots, variants)**

- Good:
  - `src/shared/ui/Button.tsx:21–23,189–193`: variants and sizes map to token tables, so a new treatment is a new table entry.
  - The Card slots (`CardAside`, `CardContent`, `CardFooter`) let `EvaluationRowCard` and `OfferingCard` compose without editing `Card`.
  - `src/widgets/offering-list/ui/FilteredOfferingsResults.tsx:29–31` gained the directory's `tab` key through an optional prop, without touching the catalog's behaviour.
  - `ClearFiltersButton`'s `keep` prop is another example.
- Bad:
  - `src/widgets/evaluation-row/ui/EvaluationRowCard.tsx:72`, cyclomatic complexity **37**, the highest in the code. Two render trees sit behind `variant === "public"` (`:80,119,141`). A third variant means editing every branch.

**L — variants honour the same contract**

- Good: `Input`, `Select`, `Textarea` and `PasswordInput` follow one rule: an explicit prop wins over the `Field` context (`src/shared/ui/Input.tsx:70–77`, `Select.tsx:86–93`). Any of them can be dropped into a `Field`.
- Bad: `EvaluationRowCard`'s props are a single flat type. `viewOfferingLabel?` and `offeringUnavailableLabel?` (`:24–26`) are optional but required by the public variant, and `actions` (`:42`) is silently ignored by the public variant (`:161–171`). A discriminated union per variant would make the contract checkable.

**I — minimal props**

- Good, measured: 153 `*Props` types average **3.9** fields. Only 9 have 8 or more, and 1 has 12 or more (`RadioGroupProps`, 13 fields, `src/shared/ui/RadioGroup.tsx:30`). Texts arrive as one cohesive `texts` object per component, which is consistent across the codebase.
- Bad: the `texts` objects grow with the component.
  - `ConsensusPanelTexts` has 36 keys.
  - `formTextsFrom` (`src/pages/evaluation-form/ui/form-texts.ts:8`) is a 90-line mapping.
  - `ManageOfferingsTexts` is an intersection of several text types (`src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx:35`).
  - *(judged)* These are god objects for text, not for behaviour. Splitting the components (R27) splits them.

**D — depend on injected actions and data**

- Good:
  - `src/app/shell/SessionShell.tsx:55–80` is the one place that reads `useSession()`. It injects the session into `ShellChrome` and the sidebar providers, and accepts an override (`:22`).
  - `src/features/user-account/index.ts:4–6`: "the page slices inject the session and the auth actions as props". `ProfileForm` receives `refreshProfile` (`ProfileForm.tsx:32`).
  - `SessionGate` takes the session and the `allows` predicate as props.
- Bad:
  - `src/features/evaluate-offering/ui/EvaluateLink.tsx:4` and `src/features/manage-evaluations/ui/EvaluationsAccess.tsx:5` import `@/features/auth` directly. These are the only two **same-layer imports in production code** (§2.3). The second also duplicates `SessionGate` (backlog R13).
  - The account forms reach `request` from `@/shared/api` inside their handlers instead of receiving an action, so their tests must mock the module.

### 2.3 Coherence

| Aspect | Finding | Evidence |
|---|---|---|
| FSD layering | **2 forbidden same-layer imports** in production, 0 upward, 0 public-API bypasses. 2 test-only same-layer imports. Route files import only `src/pages` and, for locale setup, `src/shared/lib/i18n` / `src/shared/config` *(judged acceptable: no logic)* | Production: `EvaluateLink.tsx:4`, `EvaluationsAccess.tsx:5`. Tests: `src/widgets/public-evaluation-list/ui/EvaluationListPresentation.test.tsx:25`, `PublicEvaluationList.test.tsx:28` |
| Cycles (dependency-cruiser 16.10.4) | **3 cycles**, all inside one segment: `shared/ui/index.ts → Sidebar.tsx → index.ts`, `FiltersTrigger.tsx → Sidebar.tsx → index.ts → FiltersTrigger.tsx`, `shared/api/coffees.ts → index.ts → coffees.ts` (type-only) | `src/shared/ui/Sidebar.tsx:7` imports `Button` from `@/shared/ui`; `src/shared/api/coffees.ts:1` imports a type from `./index` |
| Data loading (server vs client) | Matches the decisions log: public reads on the server; the accepted client exceptions are the type-ahead comboboxes (log line 202), "My offerings" (B7, line 318) and the authenticated evaluation routes (line 277) | `OfferingFacets.tsx:171`, `ManageOfferingsPanel.tsx:149`, `EvaluationsList.tsx:56` |
| API access | **Inconsistent.** 6 public reads build `fetch(\`${process.env.NEXT_PUBLIC_API_URL}…\`)` by hand instead of `publicRequest` (`src/shared/api/client.ts:67`). 4 account writes call `request` inside UI components; the other writes go through an `api/` segment | Raw fetch: `src/shared/api/coffees.ts:16`, `src/features/offering-facets/api/search-roasteries.ts:11`, `src/entities/evaluation/api/public-evaluations.ts:50,60`, `src/entities/taxonomy/api/taxonomies.ts:13`, `src/widgets/offering-list/api/offerings.ts:42`. Inline: §2.2 S |
| Error handling | **4 result styles**: throw (`taxonomies.ts`, `offerings.ts`, `coffeeshops.ts`, `public-evaluations.ts`); `{ status: "found" \| "not-found" \| "failed" }` (`offering.ts`, `coffeeshop.ts`); `{ ok }` (`user-evaluations.ts`); the raw `Response` handed to the UI (`locations.ts`, `contacts.ts`, and the inline forms) | `src/features/location-management/api/locations.ts:9`, `src/features/user-account/api/contacts.ts:9` |
| Texts | Coherent: every interface string comes from the es/en/ca catalogs; `react/jsx-no-literals` and `catalog-guard` enforce it | `eslint.config.mjs:20–33` |
| Tokens | Coherent: the guards pass; no hex or default scale in components | `color-guard.test.ts`, `radius-guard.test.ts` |
| Naming | Coherent *(judged)*: `*Screen` (pages), `*Panel` / `*List` (widgets), `fetch*` / `list*` (api), `*Texts` / `*Props` types declared before the component. Exception: `fetchOffering` / `fetchCoffeeshop` return outcomes while `fetchOfferings` throws, so the same verb carries two contracts | `src/entities/offering/api/offering.ts:19` vs `src/widgets/offering-list/api/offerings.ts:30` |
| Locale derivation | Duplicated in auth (backlog R5, still open) | `src/features/auth/model/session.ts:101`, `src/features/auth/api/authorize.ts:289` |

### 2.4 Oversizing

**Top 15 files by lines** (non-test, without `schema.ts`), with their largest function. CC = cyclomatic complexity (ESLint `complexity`). Function LOC excludes blank and comment lines.

| # | File | Lines | Largest function (LOC / CC) | Props fields |
|--:|---|--:|---|:-:|
| 1 | `src/shared/ui/FlavorWheel.tsx` | 571 | `FlavorWheel` 319 / 16 | 4 |
| 2 | `src/widgets/offering-detail/ui/ConsensusPanel.tsx` | 480 | `ConsensusPanel` 252 / ≤10 | 4 |
| 3 | `src/pages/evaluation-form/ui/EvaluationForm.tsx` | 396 | `EvaluationForm` 244 / 25 | 5 |
| 4 | `src/shared/ui/Sidebar.tsx` | 388 | shadcn primitives, all small | — |
| 5 | `src/shared/ui/DropdownMenu.tsx` | 378 | shadcn primitives, all small | — |
| 6 | `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx` | 361 | `OwnOfferingsBody` / `ManageOfferingsPanel` (≤80 / ≤10) | 4 |
| 7 | `src/pages/evaluation-form/ui/EvaluationGroupCard.tsx` | 328 | `EvaluationGroupCard` 205 / 17 | 11 |
| 8 | `src/features/user-account/ui/ContactSection.tsx` | 316 | `ContactSection` 186; `handleSubmit` CC 14 | 4 |
| 9 | `src/features/auth/api/authorize.ts` | 307 | `completeCallback` CC 15 | — |
| 10 | `src/widgets/evaluation-sheet/ui/EvaluationSheet.tsx` | 295 | `EvaluationSheet` 141 | 4 |
| 11 | `src/shared/ui/Combobox.tsx` | 289 | `Combobox` 183 / 27 | 9 (base) + variant |
| 12 | `src/shared/ui/flavor-wheel-geometry.ts` | 271 | pure geometry, small functions | — |
| 13 | `src/shared/ui/LocationsMap.tsx` | 267 | `LocationsMap` 147 | 6 |
| 14 | `src/shared/ui/DescriptorChipGroup.tsx` | 255 | `DescriptorChipGroup` 124 / 12 | 7 |
| 15 | `src/features/user-account/ui/RegisterForm.tsx` | 244 | `RegisterForm` 140 | 4 |

Props counts come from a regex scan of top-level fields in each `*Props` type.

**Cyclomatic complexity** (ESLint `complexity`, run ad hoc with `--rule`): 1,134 functions, mean 2.61, max 37.

| CC band | Functions | Share of outermost-unit LOC |
|---|--:|--:|
| 1–10 (low) | 1,097 | 79.5% |
| 11–20 (moderate) | 32 | 15.5% |
| 21–50 (high) | 5 | 5.0% |
| > 50 (very high) | 0 | 0% |

The 5 high-risk functions:

- `EvaluationRowCard` 37 (`src/widgets/evaluation-row/ui/EvaluationRowCard.tsx:72`)
- `Combobox` 27 (`src/shared/ui/Combobox.tsx:89`)
- `EvaluationForm` 25 (`src/pages/evaluation-form/ui/EvaluationForm.tsx:128`)
- `Checkbox` 25 (`src/shared/ui/Checkbox.tsx:88`)
- `PasswordInput` 23 (`src/shared/ui/PasswordInput.tsx:84`)

In the field controls (`Checkbox`, `PasswordInput`, `Select` 20, `Input` 19, `Textarea` 15), most of the complexity is the repeated `??` chain that resolves the `Field` context. One shared hook removes it (R22).

**Unit size** (outermost functions, by LOC): ≤15 lines 18.3%, 16–30 lines 17.5%, 31–60 lines 23.2%, **> 60 lines 41.0%** (47 functions). 31 functions are over 80 lines (Appendix B.2).

**Single-use abstractions and code beyond the specs:**

- *(measured with knip, then judged)* The shadcn scaffolds export primitives that nothing uses:
  - `Sidebar.tsx:377–384`: `SidebarInset`, `SidebarFooter`, `SidebarGroup*`.
  - `DropdownMenu.tsx:364–377`: `DropdownMenuSub*`, `CheckboxItem`, `Shortcut`, `Portal`, `Group`.
  - `Sheet.tsx:133–139` and `AlertDialog.tsx:113–118`.
- Widget indexes re-export internals no slice imports: `Offerings`, `OfferingList`, `RetryButton`, `buildOfferingsQuery` and `CATALOG_GRID_CLASSES` (`src/widgets/offering-list/index.ts:10–23`), `EvaluationSheet`, `OfferingDetailContent`, `CoffeeshopList` and `UserMenu`.
- `src/widgets/offering-list/ui/RetryButton.tsx` is a leftover re-export shim of `@/shared/ui`'s `RetryButton`, kept "for its consumers". The only consumer is `OfferingList.tsx:11`.
- `fetchVerifiedOfferings` is used only by its tests (backlog **R16**).
- Most single-consumer shared components (`FacetCascade`, `FilterChip`, `ViewToggle`, `FlavorWheel`) are shared because a spec capability (form-fields, filtering, feedback) defines them there *(judged acceptable)*.

### 2.5 Duplication (jscpd 4.3.0)

- Settings: `--min-tokens 50`, non-test, without `schema.ts`.
- Result: 525 sources, **29 clones, 351 duplicated lines (1.09%), 1.39% of tokens**.

| Clone | Lines | Locations |
|---|--:|---|
| New-password + confirmation block | 33 + 18 | `src/features/user-account/ui/PasswordForm.tsx:172–204` ↔ `RegisterForm.tsx:198–230`; `PasswordForm.tsx:103–120` ↔ `RegisterForm.tsx:118–135` |
| Filtered list screen (toolbar + sidebar + results) | 28 | `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx:50–77` ↔ `src/pages/offerings/ui/OfferingsScreen.tsx:44–71` |
| Selectable chip/scale option rendering | 18 + 12 + 10 | `src/shared/ui/BeanScale.tsx:107–141` ↔ `DescriptorChipGroup.tsx:127–154` ↔ `RadioGroup.tsx:135–144` ↔ `IntensitySlider.tsx:91–100` |
| Detail screen header | 17 | `CoffeeshopDetailScreen.tsx:103–119` ↔ `src/pages/offering-detail/ui/OfferingDetailScreen.tsx:166–182` |
| Field-context resolution | 15 + 13 + 9 | `src/shared/ui/Input.tsx:67–81` ↔ `Select.tsx:82–95` ↔ `PasswordInput.tsx:97–109` ↔ `Textarea.tsx:64–72` |
| Evaluation list screens | 14 | `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx:24–37` ↔ `src/pages/public-evaluations/ui/ListScreen.tsx:28–42` |
| Taxonomy resolution | 12 | `src/pages/manage-offerings/lib/resolve-taxonomies.ts:14–25` ↔ `src/widgets/offering-list/lib/resolve-taxonomies.ts:23–34` |
| Facet query parsing | 9 | `src/features/coffeeshop-facets/model/query.ts:35–43` ↔ `src/features/evaluation-facets/model/query.ts:62–70` |
| Evaluations + their offerings loader *(found by reading, below jscpd's token threshold)* | ~15 | `EvaluationsList.tsx:56–78` ↔ `PublicEvaluationList.tsx:44–60` |

The full list is in Appendix B.3.

### 2.6 Dead code (knip 5.88.1)

knip found:

- **Unused files (2):**
  - `src/shared/lib/i18n/request.ts` is a **false positive**: next-intl loads it by path from `next.config.ts:6`.
  - `docs/design/add-theme-tokens/tokens.css` is design material.
- **Unlisted dependency (1):** `postcss`, used by `postcss.config.mjs` and installed transitively by `@tailwindcss/postcss`.
- **Unused exports (61):**
  - ~30 are shadcn primitives (§2.4).
  - ~12 are widget or feature index over-exports.
  - `getCatalogs`, re-exported at `src/shared/lib/i18n/index.ts:8` but used only inside the segment.
  - Constants exported for tests: `SEARCH_DELAY_MS`, `GEOCODE_TIMEOUT_MS`, `FACET_ROW_*`, `GROUP_GAP`.
- **Unused exported types (373):** mostly the `*Props` / `*Texts` types every component exports by convention *(judged harmless)*.

Truly dead runtime code is small: `fetchVerifiedOfferings` (R16), the `RetryButton` shim and the unused shadcn primitives.

---

## 3. Refactoring roadmap

Each change follows the project flow: one change-id, branch `feature/<change-id>` and the OpenSpec propose / apply cycle.

- **Refactor-only changes** add no tests (AGENTS.md "Testing"). The existing tests listed under "Risk" must keep passing.
- **Changes marked "PO"** change specified behaviour, a design decision or a dependency, so Product owner decides before propose.
- **Effort:** S < 2 h, M 2–6 h, L > 6 h.
- **Impact:** the grade of the indicator now → the target if the change alone lands.

### 3.1 Proposed changes

| ID | Change-id (capability) | Files | Problem → principle / sub-characteristic | Effort | Impact | Risk (protecting tests) | Priority |
|---|---|---|---|:-:|---|---|:-:|
| **R20** | `upgrade-next-16-4` (app-shell) — **PO: dependency** | `package.json`, `package-lock.json` | `next@16.3.6` has 6 high advisories, fixed in 16.4.0; also `eslint-config-next` 16.4.x and `npm audit fix` for `source-map-js` → Security / dependencies | S | Security dependencies C → A | Medium: framework minor upgrade. Full suite, build, `proxy.test.ts`, `client-boundary`; rerun axe | **1** |
| **R21** | `tidy-shared-imports` (content-structure) | `src/shared/ui/Sidebar.tsx:7`, `src/shared/api/coffees.ts:1`, `src/widgets/offering-list/ui/RetryButton.tsx` (delete), `OfferingList.tsx:11` | Intra-segment cycles through the barrel and a re-export shim → Modularity | S | Modularity B → B (cycles 3 → 0; the other half of the B is R23) | Low: `Sidebar.test`, `index.test`, `OfferingList` tests | **2** |
| **R22** | `extract-field-control-hook` (form-fields) | `src/shared/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx`, `PasswordInput.tsx`, `Checkbox.tsx`, `Combobox.tsx:102` | The same Field-context resolution is copied 4–6 times; CC 15–25 → Reusability, Analysability (S, DRY) | M | Analysability B → A (takes `Input`, `Select`, `Textarea` out of the moderate band and `Checkbox`, `PasswordInput` out of the high band, leaving 3 high units) | Low: `Field.test`, `Input.test`, `Select.test`, `Textarea.test`, `PasswordInput.test`, `Checkbox.test`, `Combobox.test` | **3** |
| **R23** | `remove-cross-feature-auth-imports` (evaluations) — **resolves R13** | `src/features/manage-evaluations/ui/EvaluationsAccess.tsx`, `src/features/evaluate-offering/ui/EvaluateLink.tsx`, their page and widget callers | The two same-layer imports; `EvaluationsAccess` duplicates `SessionGate` → Modularity (D: inject the session as `user-account` does) | S | Modularity B → A (with R21) | Low: `EvaluationsAccess`, `EvaluateLink` and `SessionGate` tests; the "Sign-in to the evaluation routes" and "Evaluate action" scenarios | **4** |
| **R24** | `route-public-reads-through-client` (offering-catalog; also evaluations, filtering) | `src/shared/api/coffees.ts:16`, `src/features/offering-facets/api/search-roasteries.ts:11`, `src/entities/evaluation/api/public-evaluations.ts:50,60`, `src/entities/taxonomy/api/taxonomies.ts:13`, `src/widgets/offering-list/api/offerings.ts:42` | 6 hand-built API URLs bypass `publicRequest` → Analysability, Modifiability (one seam for base URL, headers, caching) | S | Coherence: 1 API seam (supports R30) | Low: `coffees.test`, `search-roasteries.test`, `public-evaluations.test`, `offerings.test` (they stub `fetch`; the URLs do not change); `taxonomies.ts` has no test of its own, so its callers' tests protect it | **5** |
| **R25** | `move-account-requests-to-api` (user-account) | `src/features/user-account/ui/ProfileForm.tsx:90`, `PasswordForm.tsx:123`, `RegisterForm.tsx:139`, `DangerZone.tsx:73–76`; new functions in `src/features/user-account/api/`; shared `NewPasswordFields` from `PasswordForm.tsx:172–204` / `RegisterForm.tsx:198–230` | UI components own transport and status mapping; 33-line clone → S, D; Reusability | M | Analysability: 4 forms CC −3…−5; clones 29 → 26 | Low: `ProfileForm`, `PasswordForm`, `RegisterForm` and `DangerZone` tests (they mock `request`; update mocks only where the module path moves) | **6** |
| **R26** | `share-evaluation-offerings-loader` (evaluations) | `src/pages/evaluations-list/ui/EvaluationsList.tsx:56–78`, `src/widgets/public-evaluation-list/ui/PublicEvaluationList.tsx:44–60`, new helper in `src/entities/evaluation/lib` that takes the offering reader as a parameter (no entity-to-entity import) | Duplicated "page + distinct offerings" join → Reusability | S | Reusability A → A (one copy fewer) | Low: `EvaluationsList.test`, `PublicEvaluationList.test` | 7 |
| **R27** | `split-evaluation-row-card` (evaluations) | `src/widgets/evaluation-row/ui/EvaluationRowCard.tsx` and its 2 callers | CC 37, two render trees behind a flag, optional texts that one variant requires, ignored `actions` → S, O, L, I | M | Analysability: highest CC 37 → ≤ 10 | Low/medium: `EvaluationRowCard.test`, `EvaluationsList.test`, the public-evaluation-list tests; the "My evaluations list" and "Public evaluations list" scenarios | 8 |
| **R28** | `reduce-shared-client-bundle` (app-shell) | `src/shared/ui/index.ts` consumers in client components, `next.config.ts` (`experimental.optimizePackageImports` or direct imports) | cmdk + Radix (68 KB gz) load on every route → Performance / resource use | M (investigation first) | Performance C → B if ≤ 170 KB gz *(target not verified)* | Medium: build, `client-boundary.test.ts` (×2); measure again with the method of §1.4 | 9 |
| **R29** | `speed-up-test-environment` (testing; **resolves R15**) | `vitest.config.mts` (`pool: "vmThreads"` or a shared jsdom per worker), `src/pages/evaluation-form/ui/EvaluationForm.test.tsx` (less `user.type`, e.g. `fireEvent.change` for long text) | 195 jsdom set-ups = 51% of 159 s; one file takes 21 s → Testability | S | Testability duration C → B (≤ 120 s) *(not verified)* | Medium: isolation leaks between files; the full suite must stay at 1,241/1,241 (or the post-reduction count) | 10 |
| **R30** | `cache-reference-reads` (offering-catalog) — **PO: design decision**; **with R19** | `src/entities/taxonomy/api/taxonomies.ts:13`, `src/shared/api/coffees.ts:16`, `src/pages/offering-detail/ui/OfferingDetailScreen.tsx:153–188` | `/taxonomies` and `/coffees` fetched uncached on every render; the provisional panel loads on every detail view → Performance / time behaviour | S | Requests per detail view 3 → 1; Performance (requests) B → A | Low: `taxonomies.test`, `OfferingDetailScreen` tests; changes D9 of add-public-evaluations (R19) | 11 |
| **R31** | `harden-response-headers` (app-shell) — **PO: specified behaviour** | `proxy.ts:48–120`, `next.config.ts:9` (`poweredByHeader: false`), `proxy.test.ts` | No `nosniff`, `Referrer-Policy` or `Permissions-Policy`; `X-Powered-By` leaks → Security / confidentiality | S | Security headers B → A | Low: `proxy.test.ts` (new scenario assertions per the updated app-shell spec) | 12 |
| **R32** | `label-landmarks-and-headings` (app-shell, content-structure) — **PO: texts and spec** | `src/widgets/app-header/ui/PrimaryNav.tsx:65`, `src/pages/home/ui/HomeHero.tsx:78`, `src/pages/about/ui/AboutContent.tsx:114`, `src/widgets/app-sidebar/ui/AppSidebar.tsx:67`, `OfferingCard.tsx:125`, `CoffeeshopCard.tsx:49`, the signed-out prompt of the gated routes, `FlavorWheel.tsx:516` | axe best-practice: `landmark-unique`, `heading-order`, `page-has-heading-one`; the lint `treeitem` warning → Usability / accessibility | M (catalog texts × 3 locales) | Usability B → A | Low: header, home, about and card tests; the catalog guard | 13 |
| **R33** | `split-consensus-panel` (offering-catalog) | `src/widgets/offering-detail/ui/ConsensusPanel.tsx` (480 lines, 36 text keys) | 252-line component, too many concerns → S, I; Modifiability | M | Modifiability: files > 300 lines 9 → 8 | Low: `ConsensusPanel.test` (24 tests) | 14 |
| **R34** | `split-evaluation-form-state` (evaluations) | `src/pages/evaluation-form/ui/EvaluationForm.tsx`, `EvaluationGroupCard.tsx` (move state into a `model/` reducer or hook) | 9 `useState`, CC 25, 244 lines; `EvaluationGroupCard` 205 lines, 11 props → S; Analysability, Modifiability | L | Modifiability: 2 files out of the > 300 list; high-CC units 5 → 4 | Medium: `EvaluationForm.test` (36 tests), `EvaluationDetail.test`, `EvaluationGroupCard` tests; "Evaluation form" scenarios | 15 |
| **R35** | `unify-api-result-shape` (shared/api; all consumers) — **PO: design decision** | every `*/api/*.ts` (§2.3 error handling) | 4 result styles → Analysability, Modifiability (one way to handle not-found and failure) | L | Coherence; Analysability stays B *(judged)* | Medium: every api test and every consumer's error-state tests | 16 |
| **R36** | `prune-unused-exports` (content-structure; **resolves R16**) | `src/shared/ui/Sidebar.tsx`, `DropdownMenu.tsx`, `Sheet.tsx`, `AlertDialog.tsx`, `src/shared/ui/index.ts`, widget indexes (§2.6), `src/widgets/offering-list/api/offerings.ts` | Unused scaffold exports and over-wide public APIs → Analysability | M | knip unused exports 61 → < 10 | Low/medium: `src/shared/ui/index.test.tsx` renders the controls exported from the segment (it does not list every export); R16's own tests leave with its code (PO, test-reduction plan) | 17 |
| **R37** | `split-flavor-wheel` (feedback) | `src/shared/ui/FlavorWheel.tsx` (571 lines, a 319-line function) | Wheel, list and keyboard model in one function → S; Modifiability | L | Modifiability: largest file 571 → < 300 | Medium: `FlavorWheel.test` (42 tests), `flavor-wheel-geometry.test` | 18 |
| **R38** | `split-account-and-management-panels` (user-account, offering-management) | `src/features/user-account/ui/ContactSection.tsx` (186-line function, `handleSubmit` CC 14), `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx` (361 lines), `src/features/location-management/ui/LocationsPanel.tsx` (138-line function) | Long components → S; Modifiability | M | Modifiability: files > 300 lines → ≤ 5 (with R33, R34, R37) | Low: `ContactSection.test`, `ManageOfferingsPanel.test`, `LocationsPanel.test` | 19 |

### 3.2 Existing backlog entries

| Entry | Status in this review | Mapped to |
|---|---|---|
| R1 (E2E locale switch) | Still deferred to the Playwright suite | — (pre-deployment E2E) |
| R3 (`/callback` exclusion and `connect-src` fallback coverage) | Still open: unplanned coverage | Can ride with R31 (same file) |
| R4 (menu panel radius) | Still open: `DropdownMenu.tsx:35` `rounded-container` vs `:48` `rounded-field` | PO decision; can ride with R36 (same file) |
| R5 (locale derivation duplicated in auth) | Confirmed: `session.ts:101`, `authorize.ts:289` | S follow-up after R23; open decision in the entry |
| R8 (422 per-field errors) | Blocked on the API documenting the 422 body | Would follow R25 and R35 |
| R10 (facet error boundary, traditional theme) | Open; no consumer passes an error yet | — |
| R13 (`EvaluationsAccess` onto `SessionGate`) | Confirmed: one of the 2 FSD violations | **R23** |
| R15 (slow `EvaluationForm` tests) | Confirmed: 21.0 s for 36 tests; slowest case 2.0 s | **R29** (and helped by R34) |
| R16 (unused `fetchVerifiedOfferings`) | Confirmed (knip, grep) | **R36**, or the test-reduction pass |
| R17 (count not announced in the overlay) | Open; not reproduced here (needs a screen reader) | With R32 if PO decides to announce it |
| R18 (`notFound()` after streaming answers 200) | Not re-measured *(not verified)* | — (PO decision) |
| R19 (provisional evaluation loads on every detail request) | Confirmed by the mock log: `/taxonomies` and `/evaluations` on the default tab | **R30** |

### 3.3 Order (FSD dependencies first, then priority)

1. **R20** `upgrade-next-16-4`: independent; unblocks a clean audit before anything else.
2. **R21** `tidy-shared-imports`: shared.
3. **R22** `extract-field-control-hook`: shared.
4. **R24** `route-public-reads-through-client`: shared/api, then entities, features and widgets callers.
5. **R26** `share-evaluation-offerings-loader`: entities, then pages and widgets.
6. **R23** `remove-cross-feature-auth-imports`: features (R13), then R5.
7. **R25** `move-account-requests-to-api`: features.
8. **R27** `split-evaluation-row-card`: widgets.
9. **R28** `reduce-shared-client-bundle`: app and shared barrel; after R21 so the barrel is cycle-free.
10. **R29** `speed-up-test-environment`: configuration; any time, best before the big splits so they run faster.
11. **R30**, **R31**, **R32**: after PO decisions.
12. **R33**, **R34**, **R38**, **R37**: widgets, pages and features splits, largest last.
13. **R35** `unify-api-result-shape`: after R24 and R25 have funnelled all calls through the api segments.
14. **R36** `prune-unused-exports`: last, so it does not fight the splits.

### 3.4 Effort and expected grades

- **By size:** 8 S (8–16 h), 7 M (14–42 h), 3 L (18–30 h). **Total ≈ 40–88 h, best estimate ~62 h (about 8 working days).**
- **Top 10 by priority (R20–R29):** ≈ 22 h.

| Characteristic | Now | After R20–R29 | After the whole roadmap |
|---|:-:|:-:|:-:|
| Maintainability | C | C (modifiability is still C) | B *(judged: needs ≤ 5 files > 300 lines and ≤ 30% LOC in units > 60 lines)* |
| Testability | C | B *(if the suite runs in ≤ 120 s and pass 2 brings traceability to ≥ 85%)* | B |
| Functional suitability | C | B *(same traceability condition)* | B |
| Security | C | B (dependencies A, headers B) | A (with R31) |
| Usability | B | B | A (with R32) |
| Performance efficiency | C | B *(if R28 reaches ≤ 170 KB gz)* | B |

---

## Appendix A — Method and tool versions

**Environment**

- Node 22.22.0, npm 10.9.4.
- Next.js 16.3.6 (Turbopack), TypeScript 5.9.3, ESLint 9.39.5, Vitest 5.0.2 (jsdom).
- Linux container.

**Setup**

- `git checkout -b claude/technical-review origin/develop`, `npm ci`, `npx next typegen`.
- `git status` stayed clean apart from this file.

| Check | Command | Result |
|---|---|---|
| Tests | `npm run test:run` (wall time with `date`) | 195 files, 1,241 / 1,241 passed, 159.4 s (161 s wall); jsdom set-up 51% of tracked time |
| Per-file durations | `npx vitest run --reporter=json` | Appendix B.5 |
| Typecheck | `npx tsc --noEmit` | 0 errors |
| Lint | `npx eslint` | 0 errors, 1 warning (`FlavorWheel.tsx:516`) |
| Build | `next build` with `NEXT_PUBLIC_API_URL=http://localhost:8000` | Success in 27 s; 20 dynamic routes + `icon.svg` static |
| Audit | `npm audit --omit=dev` and `npm audit` (JSON) | 2 high / 7 high, 0 critical |
| Complexity | `npx eslint --rule '{"complexity":["warn",10]}' --rule '{"max-lines-per-function":["warn",{"max":80,…}]}' --rule '{"max-depth":["warn",4]}'`, then `complexity` 0 and `max-lines-per-function` 0 for the full profile | 37 functions with CC > 10; 31 functions > 80 lines; 0 with depth > 4 |
| Duplication | `npx -y jscpd@4` (4.3.0) on `src` and `app`, ignoring `*.test.*` and `schema.ts`, `--min-tokens 50` | 1.09% lines |
| Dead code | `npx -y knip@5` (5.88.1), default config | §2.6 |
| Cycles | `npx -y dependency-cruiser@16` (16.10.4), ad hoc config in the scratch folder (`no-circular`, `tsPreCompilationDeps`, tests excluded), `NODE_PATH` set to the repo's `node_modules` so it finds TypeScript | 3 cycles, 356 modules, 1,123 dependencies |
| FSD layering | Ad hoc Node script: every `import` / `from` of `@/…` and relative paths under `src/` and `app/`, classified by layer and slice | §2.3 |
| Props count | Ad hoc regex scan of `export type *Props = { … }` top-level fields | 153 types, mean 3.9 |
| Contract | `js-yaml` parse of `contracts/openapi.yaml` (32 operations) plus a grep of request paths in `src/` | 31/32 |
| Traceability | Ad hoc script: requirement and scenario titles of `openspec/specs/*/spec.md` searched in the test file text | 157/204, 465/873 |
| Accessibility | `playwright-core` 1.56.1, `@axe-core/playwright` 4.11.0, `axe-core` 4.11.0, Chromium 141.0.7390.37 (`/opt/pw-browsers/chromium-1194`), installed in a scratch folder outside the repo | §1.3 |
| JS per route | The same Playwright run: sum of `script` response bodies, gzip with Node `zlib` | §1.4 |

**Mock API**

- A ~20-line Node HTTP server answers every contract path with the `example` of its first documented response (the 200 or 201 schema example).
- One deviation: `GET /evaluations/{ulid}` returns the example with `status: "closed"`, so the public evaluation view renders instead of the 404 an open evaluation correctly gets.
- It is not committed.

**Limits**

- Signed-in screens (account, the evaluation form with a session, management) were not audited with axe. They need the OAuth popup flow.
- HTTP/2, real network timing and Core Web Vitals were not measured.
- R18's HTTP status was not re-measured.

## Appendix B — Raw metrics

### B.1 Functions with CC > 10 (non-test)

| CC | Function | Location |
|--:|---|---|
| 37 | `EvaluationRowCard` | `src/widgets/evaluation-row/ui/EvaluationRowCard.tsx:72` |
| 27 | `Combobox` | `src/shared/ui/Combobox.tsx:89` |
| 25 | `EvaluationForm` | `src/pages/evaluation-form/ui/EvaluationForm.tsx:128` |
| 25 | `Checkbox` | `src/shared/ui/Checkbox.tsx:88` |
| 23 | `PasswordInput` | `src/shared/ui/PasswordInput.tsx:84` |
| 20 | `Select` | `src/shared/ui/Select.tsx:73` |
| 19 | `Input` | `src/shared/ui/Input.tsx:58` |
| 19 | `EvaluationSheetView` | `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx:99` |
| 18 | `OfferingCard` | `src/entities/offering/ui/OfferingCard.tsx:75` |
| 18 | `EvaluationsList` | `src/pages/evaluations-list/ui/EvaluationsList.tsx:90` |
| 18 | arrow function | `src/shared/ui/FlavorWheel.tsx:308` |
| 18 | `RadioGroup` | `src/shared/ui/RadioGroup.tsx:103` |
| 17 | `EvaluationGroupCard` | `src/pages/evaluation-form/ui/EvaluationGroupCard.tsx:116` |
| 16 | `parseEvaluationFilters` | `src/features/evaluation-facets/model/query.ts:86` |
| 16 | `FlavorWheel` | `src/shared/ui/FlavorWheel.tsx:235` |
| 15 | `completeCallback` | `src/features/auth/api/authorize.ts:99` |
| 15 | `EvaluationFacets` | `src/features/evaluation-facets/ui/EvaluationFacets.tsx:74` |
| 15 | `BeanScale` | `src/shared/ui/BeanScale.tsx:93` |
| 15 | `Textarea` | `src/shared/ui/Textarea.tsx:53` |
| 15 | `InventoryPanel` | `src/widgets/offering-detail/ui/InventoryPanel.tsx:47` |
| 15 | `OfferingList` | `src/widgets/offering-list/ui/OfferingList.tsx:86` |
| 14 | `handleSubmit` | `src/features/user-account/ui/ContactSection.tsx:186` |
| 14 | `IntensitySlider` | `src/shared/ui/IntensitySlider.tsx:82` |
| 14 | `DetailHeader` | `src/widgets/offering-detail/ui/DetailHeader.tsx:37` |
| 13 | `completenessOf` | `src/entities/evaluation/model/completeness.ts:26` |
| 13 | `Button` | `src/shared/ui/Button.tsx:144` |
| 12 | `buildTaxonomyLookup` | `src/entities/taxonomy/model/lookup.ts:21` |
| 12 | `evaluationListQuery` | `src/features/evaluation-facets/model/query.ts:132` |
| 12 | `publicEvaluationsQuery` | `src/features/evaluation-facets/model/query.ts:153` |
| 12 | `DescriptorChipGroup` | `src/shared/ui/DescriptorChipGroup.tsx:121` |
| 12 | `renderOption` | `src/shared/ui/RadioGroup.tsx:144` |
| 12 | `EvaluationListPresentation` | `src/widgets/public-evaluation-list/ui/EvaluationListPresentation.tsx:79` |
| 11 | `refreshProfile` | `src/features/auth/model/session.ts:161` |
| 11 | `appliedEvaluationFilters` | `src/features/evaluation-facets/model/applied.ts:32` |
| 11 | arrow function | `src/shared/ui/Combobox.tsx:202` |
| 11 | `Field` | `src/shared/ui/Field.tsx:30` |
| 11 | arrow function | `src/shared/ui/LocationsMap.tsx:126` |

### B.2 Functions over 80 lines (non-blank, non-comment)

| LOC | Function | Location |
|--:|---|---|
| 319 | `FlavorWheel` | `src/shared/ui/FlavorWheel.tsx:235` |
| 252 | `ConsensusPanel` | `src/widgets/offering-detail/ui/ConsensusPanel.tsx:209` |
| 244 | `EvaluationForm` | `src/pages/evaluation-form/ui/EvaluationForm.tsx:128` |
| 205 | `EvaluationGroupCard` | `src/pages/evaluation-form/ui/EvaluationGroupCard.tsx:116` |
| 186 | `ContactSection` | `src/features/user-account/ui/ContactSection.tsx:115` |
| 183 | `Combobox` | `src/shared/ui/Combobox.tsx:89` |
| 147 | `LocationsMap` | `src/shared/ui/LocationsMap.tsx:105` |
| 141 | `EvaluationSheet` | `src/widgets/evaluation-sheet/ui/EvaluationSheet.tsx:151` |
| 140 | `RegisterForm` | `src/features/user-account/ui/RegisterForm.tsx:99` |
| 138 | `LocationsPanel` | `src/features/location-management/ui/LocationsPanel.tsx:78` |
| 135 | `BeanScale` | `src/shared/ui/BeanScale.tsx:93` |
| 132 | `OfferingFacets` | `src/features/offering-facets/ui/OfferingFacets.tsx:53` |
| 132 | `PasswordForm` | `src/features/user-account/ui/PasswordForm.tsx:88` |
| 126 | `FacetCascade` | `src/shared/ui/FacetCascade.tsx:38` |
| 124 | `DescriptorChipGroup` | `src/shared/ui/DescriptorChipGroup.tsx:121` |
| 122 | `OfferingDetailScreen` | `src/pages/offering-detail/ui/OfferingDetailScreen.tsx:66` |
| 121 | `EvaluationsList` | `src/pages/evaluations-list/ui/EvaluationsList.tsx:90` |
| 113 | `ProfileForm` | `src/features/user-account/ui/ProfileForm.tsx:50` |
| 112 | `LocationForm` | `src/features/location-management/ui/LocationForm.tsx:110` |
| 111 | `DangerZone` | `src/features/user-account/ui/DangerZone.tsx:46` |
| 108 | `RadioGroup` | `src/shared/ui/RadioGroup.tsx:103` |
| 100 | `EvaluationFacets` | `src/features/evaluation-facets/ui/EvaluationFacets.tsx:74` |
| 99 | `IntensitySlider` | `src/shared/ui/IntensitySlider.tsx:82` |
| 96 | `CoffeeshopsMapView` | `src/widgets/coffeeshop-list/ui/CoffeeshopsMapView.tsx:69` |
| 95 | `ScoreRangeFacet` | `src/shared/ui/ScoreRangeFacet.tsx:35` |
| 95 | `EvaluationRowCard` | `src/widgets/evaluation-row/ui/EvaluationRowCard.tsx:72` |
| 90 | `CoffeeshopsScreen` | `src/pages/coffeeshops/ui/CoffeeshopsScreen.tsx:48` |
| 90 | `formTextsFrom` | `src/pages/evaluation-form/ui/form-texts.ts:8` |
| 88 | `EvaluationsListScreen` | `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx:38` |
| 85 | `AccountClient` | `src/pages/account/ui/AccountClient.tsx:61` |
| 84 | `OfferingCard` | `src/entities/offering/ui/OfferingCard.tsx:75` |

### B.3 All jscpd clones (lines, tokens)

| Lines | Tokens | First location | Second location |
|--:|--:|---|---|
| 33 | 197 | `src/features/user-account/ui/PasswordForm.tsx:172-204` | `src/features/user-account/ui/RegisterForm.tsx:198-230` |
| 32 | 210 | `src/features/user-account/ui/PasswordForm.tsx:174-205` | `src/features/user-account/ui/RegisterForm.tsx:200-230` |
| 28 | 220 | `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx:50-77` | `src/pages/offerings/ui/OfferingsScreen.tsx:44-71` |
| 18 | 197 | `src/features/user-account/ui/PasswordForm.tsx:103-120` | `src/features/user-account/ui/RegisterForm.tsx:118-135` |
| 18 | 106 | `src/shared/ui/BeanScale.tsx:124-141` | `src/shared/ui/DescriptorChipGroup.tsx:137-154` |
| 17 | 130 | `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx:103-119` | `src/pages/offering-detail/ui/OfferingDetailScreen.tsx:166-182` |
| 15 | 195 | `src/shared/ui/Input.tsx:67-81` | `src/shared/ui/Select.tsx:82-…` |
| 14 | 95 | `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx:24-37` | `src/pages/public-evaluations/ui/ListScreen.tsx:28-42` |
| 14 | 104 | `src/pages/account/ui/AccountScreen.tsx:70-83` | `src/pages/manage-locations/ui/ManageLocationsScreen.tsx:53-66` |
| 13 | 143 | `src/features/evaluation-facets/ui/EvaluationsToolbar.tsx:43-55` | `src/features/offering-facets/ui/OfferingsToolbar.tsx:32-44` |
| 13 | 172 | `src/shared/ui/PasswordInput.tsx:97-109` | `src/shared/ui/Select.tsx:83-…` |
| 12 | 93 | `src/pages/manage-offerings/ui/ManageOfferingsScreen.tsx:45-56` | `src/pages/offerings/ui/OfferingsScreen.tsx:52-63` |
| 12 | 127 | `src/pages/manage-offerings/lib/resolve-taxonomies.ts:14-25` | `src/widgets/offering-list/lib/resolve-taxonomies.ts:23-34` |
| 12 | 94 | `src/features/coffeeshop-facets/ui/CoffeeshopFacets.tsx:32-43` | `src/features/offering-facets/ui/OfferingFacets.tsx:92-103` |
| 12 | 105 | `src/shared/ui/BeanScale.tsx:107-118` | `src/shared/ui/DescriptorChipGroup.tsx:127-…` |
| 11 | 94 | `src/features/user-account/ui/PasswordForm.tsx:202-212` | `src/features/user-account/ui/ProfileForm.tsx:146-156` |
| 10 | 96 | `src/shared/ui/IntensitySlider.tsx:91-100` | `src/shared/ui/RadioGroup.tsx:135-144` |
| 10 | 98 | `src/shared/ui/DescriptorChipGroup.tsx:130-139` | `src/shared/ui/RadioGroup.tsx:135-…` |
| 9 | 81 | `src/widgets/coffeeshop-list/ui/CoffeeshopList.tsx:75-83` | `src/widgets/public-evaluation-list/ui/EvaluationListPresentation.tsx:89-98` |
| 9 | 52 | `src/pages/manage-offerings/ui/ManageOfferingsSidebarEntries.tsx:24-32` | `src/pages/new-offering/ui/NewOfferingSidebarEntries.tsx:24-32` |
| 9 | 108 | `src/features/coffeeshop-facets/model/query.ts:35-43` | `src/features/evaluation-facets/model/query.ts:62-70` |
| 9 | 141 | `src/shared/ui/Select.tsx:87-95` | `src/shared/ui/Textarea.tsx:64-72` |
| 8 | 80 | `src/widgets/offering-list/ui/OfferingList.tsx:108-115` | `src/widgets/public-evaluation-list/ui/EvaluationListPresentation.tsx:93-100` |
| 8 | 71 | `src/pages/about/ui/AboutContent.tsx:75-82` | `src/pages/home/ui/HomeHero.tsx:68-75` |
| 8 | 88 | `src/features/user-account/ui/ProfileForm.tsx:68-75` | `src/features/user-account/ui/RegisterForm.tsx:118-125` |
| 7 | 79 | `src/features/location-management/ui/LocationForm.tsx:133-139` | `src/features/user-account/ui/ContactSection.tsx:191-198` |
| 7 | 76 | `src/entities/offering/ui/OfferingCard.tsx:113-119` | `src/widgets/offering-detail/ui/ConsensusPanel.tsx:388-394` |
| 6 | 76 | `src/widgets/evaluation-row/ui/EvaluationRowCard.tsx:97-102` | `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx:132-137` |
| 6 | 74 | `src/entities/offering/ui/OfferingCard.tsx:102-107` | `src/widgets/offering-detail/ui/DetailHeader.tsx:45-51` |

jscpd reported the second range of several clones with an end line lower than the start line (shown as `…`).

### B.4 Requirement names not found in any test file text

The tests may still cover these under another wording (§1.3).

- **app-shell:** Header brand and primary navigation; Brand logotype presentation; Header menu triggers; Sidebar entry presentation.
- **base-controls:** Action button treatments; Action button sizes; Action button interaction states; Accessible naming of icon-only actions; Link states and back variant; Theme-driven corner radii.
- **content-structure:** Card stacking on narrow viewports; Pagination page numbers.
- **evaluations:** Closing an evaluation; Sign-in to the evaluation routes; Evaluate action on the offering card; Public evaluations filter sidebar.
- **feedback:** Badge label contrast; Flavor wheel note list disclosure.
- **filtering:** Evaluation facets in the sidebar; Filtered evaluation results; Coffee shop filter toolbar; Filtered coffee shop results.
- **form-fields:** Field structure and association; Inverse variant on dark surfaces; Theme-driven rendering; Facet row presentation.
- **landing:** Public access; Verified offerings list.
- **offering-catalog:** Catalog pagination; Catalog heading and toolbar slot; Catalog single column; Catalog and detail texts and metadata; View evaluations link on the offering detail; Directory heading and results column; Map interaction and accessibility; Full-screen map on a small viewport; Coffee shop detail tabs in the address; Directory texts and metadata.
- **offering-management:** Localized management texts; Access to the locations page; Address geocoding; Localized location texts.
- **theming:** Two complete color themes; Text and button contrast; UI boundary and focus contrast; Theme-invariant typography; Text sizing accessibility.

Matches by capability (requirements / scenario titles):

| Capability | Requirements | Scenario titles |
|---|--:|--:|
| app-shell | 17/21 | 65/102 |
| auth | 9/9 | 31/34 |
| base-controls | 2/8 | 14/28 |
| content-structure | 9/11 | 32/53 |
| evaluations | 13/17 | 20/82 |
| feedback | 9/11 | 27/57 |
| filtering | 29/33 | 34/119 |
| form-fields | 10/14 | 64/74 |
| landing | 8/10 | 39/39 |
| offering-catalog | 25/35 | 100/123 |
| offering-management | 12/16 | 24/82 |
| theming | 3/8 | 2/23 |
| user-account | 11/11 | 13/57 |

### B.5 Slowest test files

| Duration | Tests | File |
|--:|--:|---|
| 21.0 s | 36 | `EvaluationForm.test.tsx` |
| 3.3 s | 26 | `ManageOfferingsPanel.test.tsx` |
| 2.5 s | 35 | `AppHeader.test.tsx` |
| 2.4 s | 6 | `EvaluationDetail.test.tsx` |
| 2.2 s | 42 | `FlavorWheel.test.tsx` |
| 1.8 s | 17 | `NewOfferingForm.test.tsx` |
| 1.7 s | 24 | `ConsensusPanel.test.tsx` |
| 1.6 s | 13 | `session.test.ts` |
| 1.4 s | 17 | `Combobox.test.tsx` |
| 1.4 s | 8 | `EvaluationSheet.test.tsx` |

The slowest case is "sends each descriptor block's selection to its request field" at 2.0 s.

### B.6 Largest client chunks (`.next/static/chunks`)

| Chunk | Raw | Gzip | Contents (by string match) |
|---|--:|--:|---|
| `240_2zg523npv.js` | 216 KB | 68 KB | cmdk, Radix |
| `34wvn5zw0a69w.js` | 199 KB | 63 KB | react-dom |
| `1a7jqsbbldhux.js` | 156 KB | 42 KB | — |
| `0npphf47dyaux.js` | 148 KB | 43 KB | Leaflet; lazy, map routes only |
| `0cz1d0mv5g_q7.js` | 109 KB | 38 KB | — |

The CSS bundle is 85 KB raw / 13 KB gzip.

## Appendix C — Grading thresholds

A characteristic's grade is the **worst** of its indicators. The thresholds are this review's own:

- Where an industry reference exists, they are a simplified version of it: the SIG / TÜViT maintainability model for complexity and unit size, the jscpd defaults, and web.dev JS budgets.
- Where noted, they are calibrated for React, where JSX makes components longer than the Java code the SIG bands were built on.

| Indicator | A | B | C | D | E | Value |
|---|---|---|---|---|---|---|
| Modularity: FSD violations in production / cycles | 0 / 0 | ≤ 2 / only intra-segment or type-only cycles | ≤ 5 / ≤ 3 cross-slice | ≤ 10 | > 10 | 2 / 3 intra-segment → **B** |
| Reusability: jscpd duplicated lines | < 3% | 3–5% | 5–10% | 10–20% | > 20% | 1.09% → **A** |
| Analysability: share of outermost-unit LOC with CC 11–20 / 21–50 / > 50 | ≤ 25% / 0% / 0% | ≤ 30% / ≤ 5% / 0% | ≤ 40% / ≤ 10% / 0% | ≤ 50% / ≤ 15% / ≤ 5% | worse | 15.5% / 5.0% / 0% → **B** |
| Modifiability (a): share of function LOC in units > 60 lines (React-calibrated; the original SIG band for the top rating is ≤ 3.9%) | ≤ 15% | ≤ 30% | ≤ 45% | ≤ 60% | > 60% | 41.0% → **C** |
| Modifiability (b): files > 300 lines | ≤ 2 | ≤ 5 | ≤ 10 | ≤ 20 | > 20 | 9 → **C** |
| Testability: pass rate | 100% | ≥ 99% | ≥ 97% | ≥ 90% | < 90% | 100% → **A** |
| Testability: full-suite wall time | ≤ 60 s | ≤ 120 s | ≤ 240 s | ≤ 480 s | > 480 s | 159 s → **C** |
| Testability / Functional suitability: requirement names traceable to tests | ≥ 95% | ≥ 85% | ≥ 70% | ≥ 50% | < 50% | 77% → **C** (lower bound) |
| Functional suitability: in-scope contract operations consumed | ≥ 95% | ≥ 85% | ≥ 70% | ≥ 50% | < 50% | 31/31 in scope (31/32 overall) → **A** |
| Security: dependency advisories (runtime) | none | low/moderate only | high with an in-minor fix | high with no fix, or reachable | critical | 2 high, fix in 16.4.0 → **C** |
| Security: response headers | CSP + nosniff + Referrer-Policy + Permissions-Policy, no X-Powered-By | strict CSP, 1–4 of the rest missing | CSP present but weak (`unsafe-inline` scripts) | no CSP | no CSP and framing allowed | strict CSP, 3 missing + X-Powered-By → **B** |
| Security: credential storage | memory only | session storage | local storage | cookies without flags | tokens in URL / logs | memory only → **A** |
| Security: HTML injection sinks | 0 | — | 1 sanitised | 1 unsanitised | > 1 | 0 → **A** |
| Usability: axe WCAG 2.2 A/AA violations (36 runs) | 0 | 0 | ≤ 3 moderate | any serious | any critical | 0 → **A** |
| Usability: best-practice rule types / lint a11y warnings | 0 / 0 | ≤ 3 / ≤ 2 | ≤ 6 / ≤ 5 | more | — | 3 / 1 → **B** |
| Performance: first-load JS per route (gzip, max) | ≤ 130 KB | ≤ 170 KB | ≤ 250 KB | ≤ 350 KB | > 350 KB | 225.5 KB → **C** |
| Performance: redundant requests per view *(judged)* | none | ≤ 2 | ≤ 5 | — | — | 2 on the detail view (R19) + uncached reference data → **B** |
