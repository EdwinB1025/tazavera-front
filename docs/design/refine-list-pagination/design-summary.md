Status: approved

# Design summary — refine-list-pagination

Proposed change-id: `refine-list-pagination` (see Open 3). Capabilities: `content-structure` (the shared `Pagination`) and `landing` (the verified offerings list page size). One commit per capability.

## 0. Settled inputs (not re-decided here)

- Product owner, 2026-10-07: (1) the landing offerings list, when it shows more than two columns, shows fewer offerings so the page is shorter; (2) the paginator shows numbered pages between Previous and Next, on the landing list and on the catalog (`add-offering-catalog`).
- Decisions log: `Pagination` lives in `@/shared/ui` with props `path`, `query`, `currentPage`, `lastPage`, texts (extract-offering-list-parts); the catalog is one column (2026-10-07); page surfaces: `surface-page` → `sage-100` in the light theme (refine-page-surfaces, merging now).
- Design rules: semantic tokens only, `focus-visible:focus-ring`, accessible names, disabled = 50% opacity, texts from catalogs as props, icons only through `src/shared/ui/icons.ts`.

## 1. Scope

1. **Shared `Pagination` (`src/shared/ui/Pagination.tsx`) gains numbered pages.** Every host inherits it: landing (`OfferingList`), catalog (`OfferingList` with `path`/`query`), management (`ManageOfferingsPanel`) and specialist evaluations (`EvaluationsList`), plus the future hosts (public evaluations, coffeeshop directory). Source: `git grep "<Pagination"` over the active branches.
2. **Landing page size** of the verified offerings list (mechanism: Open 1).

Out of scope: catalog layout, card content, Previous/Next behaviour at the boundaries, scroll position after a page change.

## 2. Pagination — component

### 2.1 Structure (DOM order = focus order)

```
<nav aria-label="{navigationLabel}">
  [Previous]  <ul> [1] [2] [3] … [20] </ul>  [Next]
</nav>
```

- Root becomes a `nav` landmark (today a `div`) named by a new text (`navigationLabel`). Source: MVC `resources/views/vendor/pagination/tailwind.blade.php` (`<nav aria-label>`).
- **Numbers are computed from `currentPage` and `lastPage`**, the props the component already takes, not from `meta.links`. Why: `meta.links` labels are API-side English HTML entities (`'&laquo; Previous'`), its URLs point at the API host, and Laravel's default window (3 each side) does not fit 375px. Source: contract `listOfferings` example `meta.links`; current `PaginationProps`.
- **Number activation** uses the same mechanism as Previous/Next: it pushes the list's own address with `page` replaced, keeping every other query parameter (content-structure "Pagination", D3–D6). Numbers are `Button`s, like Previous/Next.
- **Current page:** a `Button` with `aria-current="page"`; activating it opens nothing; it is never `disabled` (no 50% opacity). Source: MVC `aria-current="page"` on the current number.
- **Accessible names:** each number is named `{pageLabel}` with the number interpolated ("Página 3"); the visible digit is contained in the name (label in name). Previous/Next keep their labels as names at every width (also when only the chevron shows, below).
- **Ellipsis:** a non-interactive "…" text, `aria-hidden="true"`.
- `lastPage === 1`: one number, current; Previous and Next disabled (as today). The component still renders only below a successful, non-empty list (spec "Paging only with a successful list", unchanged).

### 2.2 Page-number window

| Width | Always shown | Around the current page | Max slots (numbers + ellipses) |
|---|---|---|---|
| below `md` (768px) | first, last | current only | 5 |
| from `md` | first, last | current − 1 … current + 1 | 7 |

- A gap of exactly one page shows that page instead of an ellipsis; a gap of two or more pages shows one ellipsis.
- Examples from `md`, `lastPage` 20: current 1 → `1 2 … 20`; current 4 → `1 2 3 4 5 … 20`; current 10 → `1 … 9 10 11 … 20`; current 20 → `1 … 19 20`. Below `md`, current 10 → `1 … 10 … 20`.
- Breakpoint `md` rather than `sm`: the catalog column and the management/evaluations panels are narrower than the region (decisions log, catalog one column), so the full window needs `md`'s width (computed below).

### 2.3 Previous / Next

- Variant unchanged: `Button variant="primary" size="base"`.
- **Below `md`:** icon only, a 2.5rem square (`Button` icon-only geometry): `ChevronLeft` / `ChevronRight`, accessible name = the existing `previousLabel` / `nextLabel`. `ChevronLeft` is added to `src/shared/ui/icons.ts` (lucide-react, already a dependency; `ChevronRight` is already exported). Source: MVC uses chevrons; needed to fit 375px (computed below).
- **From `md`:** label only, as today.

### 2.4 Tokens and states

| Part | State | Treatment (semantic tokens) |
|---|---|---|
| Previous / Next | rest, hover, disabled, focus | `Button` `primary`, unchanged |
| Page number | rest | `Button` `action-3`: bg `action-3-bg`, text `action-3-text`, 1px border `action-3-border` |
| Page number | hover | `Button` `action-3` hover: `action-3-bg-hover`, `action-3-text-hover` |
| Page number | current (`aria-current="page"`) | the hover treatment at rest: bg `action-3-bg-hover`, text `action-3-text-hover`, border `action-3-border`; no hover change |
| Page number | focus | `focus-visible:focus-ring` (from `Button`) |
| Ellipsis | — | `text-primary`, no background, no border |

`action-3` (sage, neutral) keeps the numbers distinct from the oxblood Previous/Next and marks the current page by fill plus `aria-current`, not by colour alone (filled vs. tinted pill; the difference between the two fills is styling and is not gated). Source: existing `Button` variants (`src/shared/ui/Button.tsx`), tokens in `globals.css`.

## 3. Contrast (computed by me, executed script `scratchpad/contrast.js`; WCAG 2.x)

Backgrounds the paginator sits on: landing `surface-section`; catalog `surface-page` (develop `cream-100`, and `sage-100` after refine-page-surfaces); management and evaluations panels `surface-card` / `surface-form`.

| Pair (gate) | Light | Dark |
|---|---|---|
| `action-3-text` on `action-3-bg` (number label, 4.5) | 4.78 | 5.59 |
| `action-3-text-hover` on `action-3-bg-hover` (hover / current label, 4.5) | 6.41 | 5.05 |
| `action-3-border` on surface-page / section / card / form (boundary, 3) | 6.41 (cream-100), 6.21 (sage-100) / 5.72 / 6.41 / 6.81 | 14.28 / 11.97 / 13.22 / 13.22 |
| `text-primary` ellipsis on the same surfaces (4.5) | 6.41, 6.21 / 5.72 / 6.41 / 6.81 | 14.28 / 11.97 / 13.22 / 13.22 |

- In the dark theme `action-3-bg-hover` against the surfaces is 2.22–2.64 (computed), but the current number's boundary is its 1px `action-3-border`, which passes everywhere.
- Every pair is already registered in `src/app/styles/theme-tokens.test.ts` (both matrices: `action-3-text-hover`/`action-3-bg-hover`, `action-3-border` on `surface-page`, `-card`, `-section`, `-form`). **No new token, no new guard pair.** Previous/Next pairs are unchanged.

## 4. Layout and spacing (criterion A)

| Element | Padding | Gap / margin | Border | Radius | Container |
|---|---|---|---|---|---|
| `nav` root | none | children 0.25rem apart below `md`, 0.5rem from `md`; wraps as a fallback; centred | none | none | the host's block; on landing 2rem below the grid (existing `OfferingList` `gap-8`, unchanged) |
| number list (`ul`) | none, no list marker | numbers 0.25rem apart below `md`, 0.5rem from `md` | none | none | inline flex row inside `nav` |
| page number | horizontal 0.75rem; 2.5rem tall, at least 2.5rem wide, digits centred | — | 1px `action-3-border`, all sides | `rounded-pill` (from `Button`) | list item |
| ellipsis | none; 1.5rem wide, 2.5rem tall, centred | — | none | none | list item |
| Previous / Next | `Button` base (`h-10 px-4`) from `md`; 2.5rem square below `md` | — | `Button` primary border (unchanged) | `rounded-pill` | `nav` children |

**Fit at 375px (computed by me):** landing content width 343px (375 − 2 × 1rem `PageSection` padding). Worst case below `md`: 2 chevrons + 5 slots = 7 × 2.5rem + 6 × 0.25rem = 304px ≤ 343px, and ≤ 311px for a host with a further 1rem inner padding. No horizontal scroll. From `md`, worst case 7 slots = 328px plus two labelled buttons (≈ 100–125px each, unverified text widths) ≈ 560–590px ≤ 704px (768 − 2 × 2rem). Three-digit page numbers widen a slot; the wrap fallback covers them.

### ASCII reference (visual reference for this summary)

```
375px, page 10 of 20                      1280px, page 10 of 20
  ( < ) (1) … ((10)) … (20) ( > )        ( Anterior ) (1) … (9) ((10)) (11) … (20) ( Siguiente )
((n)) = current: filled sage, aria-current="page"     (n) = tinted sage pill
```

MVC source: `C:/Porjects/Full Stack/Sprint4/MVC/tazavera-app/resources/views/vendor/pagination/tailwind.blade.php` (chevrons, numbered window, ellipsis, `aria-current`); translated to the tokens above, no MVC colours.

## 5. Landing page size

- **The limit applies at every width, not only at three columns** (technical constraint, verified): the list is rendered on the server, which does not know the viewport, and the API page holds a fixed number of items; showing fewer cards only at `xl` (CSS) would make the hidden offerings of every page unreachable at that width.
- **Proposed size: 6 offerings per landing page.** 6 fills whole rows at 1, 2 and 3 columns (6, 3 and 2 rows; computed by me), so the grid never ends in a half row. Today: 15 (5 rows at `xl`, 8 at `md`).
- **Fact:** `GET /offerings` pages by a fixed 15: `OfferingController::index` calls `->paginate()` with no argument and the model sets no `$perPage` (`tazavera-api`, read only); the contract documents no page-size parameter. So 6 per page needs an API parameter or front-side re-paging: **Open 1**.
- **To see more:** the numbered pagination below the list (Product owner's request 2), and the catalog through the header's existing "Offerings" entry (`PrimaryNav` on `feature/add-offering-catalog`). No extra link: Open 2.
- Grid (`OFFERING_GRID_CLASSES`), skeleton fallback (3 cards) and states: unchanged.

## 6. Texts (catalog areas; passed as props through `PaginationTexts`)

New keys, next to `paginationPreviousLabel` / `paginationNextLabel` in `landing` (used by landing, catalog and management), and the same two in `evaluations` (its host reads its own `previousLabel`/`nextLabel`):

| Key | es | en | ca |
|---|---|---|---|
| `paginationNavigationLabel` (`evaluations`: `paginationNavigationLabel`) | Paginación | Pagination | Paginació |
| `paginationPageLabel` | Página {page} | Page {page} | Pàgina {page} |

`{page}` follows the existing placeholder style (`messages/es/filters.json`). `PaginationTexts` gains `navigationLabel` and `pageLabel`; every host passes them.

## 7. Contract operations

- `listOfferings` (landing, catalog, management): `meta.current_page`, `meta.last_page` (existing fallbacks kept), `meta.total`/`meta.per_page` only if Open 1 picks option B. States unchanged: loading skeleton, empty message, error + retry, success with pagination.
- `listMyEvaluations` (evaluations host): same `meta` fields; unchanged otherwise.
- **Finding (contract gap):** `listOfferings` documents no `page` query parameter, though the API honours it (Laravel paginator) and landing already sends `?page=`. `listCoffeeShops` documents it (contract line 502). Report to Product owner; do not adapt.

## 8. Dependencies and order

- Layer: `content-structure` (shared `Pagination`) → `landing`.
- `PaginationTexts` gains two required texts, so every host must pass them. Hosts on active branches: `add-offering-catalog`, `add-offering-management`, `add-specialist-evaluations` (all near archive). **Order: propose after refine-page-surfaces merges; apply after those three merge**, so the change updates all four hosts at once and no branch inherits a type error at merge. Public evaluations and coffeeshop directory consume the new texts when they adopt `Pagination` (decisions-log entry recommended, affects: add-public-evaluations, add-coffeeshop-directory).
- refine-page-surfaces: no shared edit beyond `surface-page`'s value, covered in 3.
- Backlog: no entry names pagination (`docs/backlog.md`). No duplication added: one component, all hosts.
- Spec changes: content-structure "Pagination" (numbers, window, current page, nav name, spacing replaces "1rem apart"); landing "Verified offerings list" (page size).

## Open

1. **ANSWERED 2026-10-07 (Product owner): A.** The API accepts `page` and `perPage` (standard 15, maximum 50) on every paginated list (`tazavera-api` `6eb8d0f`, PROD `e84b444`); by Product owner's decision it is not documented in Scribe, and the front treats it as communicated by Product owner (decisions log "mapa del directorio con Leaflet y perPage"). The landing sends `perPage=6`. Note: the API's `links`/`meta.links` URLs drop `perPage`; the front computes its page numbers from `current_page`/`last_page`, so it is unaffected. How does the landing request 6 offerings per page?
   - A. API: `GET /offerings` accepts a page-size parameter (e.g. `perPage`, validated, default 15, same style as the existing filters), the contract is updated, landing sends 6. Clean `meta.last_page`; one request.
   - B. Front only: landing page k shows items 6(k−1)+1 … 6k, read from the one or two API pages of 15 that hold them; last page = ⌈`meta.total` / 6⌉. No API change; up to two requests and a pure paging function to test.
   - C. Keep 15 per page on the landing (no limit).
   - Recommendation: A (one request, contract-traceable; the API already follows this filter style). B if the API must not change now. Source: `OfferingController::index`, contract `listOfferings`.
   - Blocks propose: yes.
2. **CLOSED 2026-10-07 (orchestrator, autonomy mandate): A, no link.** Add a "See the full catalog" link below the landing list?
   - A. No (pagination plus the header's "Offerings" entry). B. Yes, a `Link` to `/{locale}/offerings` below the paginator, with a new text.
   - Recommendation: A; the catalog is one click away in the header and request 2 keeps pagination on the landing.
   - Blocks propose: no (default A).
3. **CLOSED 2026-10-07 (orchestrator): A, `refine-list-pagination`; the folder is renamed.** Change-id. The paginator change reaches every paged list (evaluations too), not only offerings.
   - A. `refine-list-pagination`. B. keep `refine-offering-pagination`.
   - Recommendation: A. Blocks propose: no.

## Review log

### 2026-10-07 — generation (design lead)
- Drafted from Product owner's request of 2026-10-07, `src/shared/ui/Pagination.tsx`, `OfferingList`, `HomeScreen`, the catalog's use on `feature/add-offering-catalog`, the content-structure and landing specs, contract `listOfferings`, `tazavera-api` `OfferingController::index` (read only) and the MVC Tailwind pagination view.
- Settled (criterion B, technical or reuse): numbers computed from `currentPage`/`lastPage` (meta.links unusable as is); same push mechanism as Previous/Next; limit applies at every width (server render, fixed API page); `action-3` numbers and existing tokens (all pairs already registered, no new token); `md` as the window breakpoint (fit computed); order after the three host branches merge.
