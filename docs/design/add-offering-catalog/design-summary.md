Status: approved

# Design summary — add-offering-catalog

Capability: `offering-catalog`. Change-id: `add-offering-catalog`. Branch (when created): `feature/add-offering-catalog`.

Drafted by the design lead on 2026-10-06 from the MVC views, `contracts/openapi.yaml` on `develop`, the main specs in `openspec/specs/` and the code already on `develop`. Numbers marked *(measured)* come from an executed script run by the design lead; anything marked *(unverified)* was not checked.

## 1. Scope

Two public screens and the route behind an existing header entry:

1. **Offering catalog** at `/{locale}/offerings`: every offering the API returns for the URL's query, as offering cards in the landing grid, with Previous/Next pagination and the loading, empty and error states. It reads the filters and sorting from the URL query; the filter controls themselves belong to `add-filter-controls`.
2. **Offering detail** at `/{locale}/offerings/{ulid}`: one offering from `GET /offerings/{offering_ulid}`, with its header, data sections and taste profile.
3. **"Top rated" / "Mejor valorados" header entry.** Already built: `src/widgets/app-header/ui/PrimaryNav.tsx` (lines 51–57) points it at `/{locale}/offerings?verified=1&orderBy=cupping_avg&orderDirection=desc`, from `openspec/specs/app-shell/spec.md` ("Primary navigation on a medium or larger viewport"). Today that route returns 404. This change supplies the route the entry opens. It does not change the entry. **The board's assumption is confirmed with one correction:** this change owns the route and the screen behind the entry, but the entry itself is `app-shell`'s, and it is already merged.
4. **Detail page ownership confirmed.** The card's View link already addresses `/{locale}/offerings/{ulid}` (`OfferingCard.tsx:144`). The landing spec says the destination belongs to "a later change" (`openspec/specs/landing/spec.md`, "View link for everyone"). This is that change.

Out of scope:
- the filter and sort controls (`add-filter-controls`);
- the list of an offering's evaluations (see Open 6);
- creating and deleting offerings (`add-offering-management`);
- `GET /coffees` and `GET /roasteries`: consumed by `add-offering-management` and by the offering-list filters of `add-filter-controls` (decisions log, 2026-10-06).

## 2. Contract operations consumed

| operationId | Route | Security | Used by | Notes |
|---|---|---|---|---|
| `listOfferings` | `GET /offerings` | none (public) | Catalog | Paginated: `data[]`, `links`, `meta` (`current_page`, `last_page`, `per_page` 15, `total`). Query parameters: the 40 filter and sort parameters of the contract (`coffeeName` … `orderDirection`). `page` is not a declared parameter, but the `links` and `meta.links` URLs use `?page=n`, and landing already pages with it (`src/widgets/offering-list/api/offerings.ts:33`). |
| `getAnOffering` | `GET /offerings/{offering_ulid}` | none (public) | Detail | `data` with the same fields as a list item. Only `200` is documented. |
| `listOlfactoryTaxonomies` | `GET /taxonomies` | none (public) | Catalog cards, detail taste profile | Names by locale and data colours for each `ref` (the landing mechanism, design.md D5 of add-landing). |

Fetching rule (settled, `.claude/CLAUDE.md` §2): all three are public, so they run on the server with plain `fetch` against `NEXT_PUBLIC_API_URL`, with no credential header, as `fetchVerifiedOfferings` does today.

What the interface shows for each response state:

| State | Catalog | Detail |
|---|---|---|
| Loading | Skeleton cards in the grid's place (reuse `OfferingSkeletonCard` in `OFFERING_GRID_CLASSES`, 3 cards as on landing) | Skeleton of the header and two placeholder cards (built from `Card` + `CardContent` with the placeholder classes of `OfferingSkeletonCard`) |
| 200 with items | Cards + pagination | Full detail |
| 200 with `data: []` | Centered empty message | n/a |
| Any non-2xx or transport failure, either request | Error message + Retry (reuse `RetryButton`, `router.refresh()`) | Error message + Retry + the back link |
| 404 for an unknown ulid | n/a | Same as the error state. The contract documents no 404 (Open 7). |
| 422 from an invalid filter value | Same error state. The contract documents no 422 for `listOfferings` *(the API's FormRequest rules exist, `FilterOfferingRequest`; error body not read)*. | n/a |

API values are shown as they are, including `roastLevel`, `process`, `verificationStatus` (rendered through the existing status badge) and the numeric strings (settled, general context "Forma de trabajar").

## 3. Routes and composition (FSD)

| Layer | Piece | Notes |
|---|---|---|
| `app/[locale]/offerings/page.tsx` | Route: awaits `params` and `searchParams`, passes the locale and the raw search params to the screen. No logic. | As `app/[locale]/page.tsx` does |
| `app/[locale]/offerings/[ulid]/page.tsx` | Route: passes the locale and the ulid to the screen | |
| `src/pages/offerings` | `OfferingsScreen`: loads the catalog texts, renders the two sections, the filter slot and the list in `Suspense` | New |
| `src/pages/offering-detail` | `OfferingDetailScreen`: loads the texts and renders the detail block in `Suspense` | New |
| `src/widgets/offering-list` | Reused for the catalog after it is generalized (Open 1) | Landing's widget |
| `src/widgets/offering-detail` | Async fetch component plus sync presentation, the `VerifiedOfferings` / `OfferingList` split (testing rule: async Server Components stay thin) | New |
| `src/entities/offering` | `OfferingCard` reused unchanged; `ratingTierFor` reused for the detail score | Existing |

### 3.1 How the catalog reads the query (interface with add-filter-controls)

- **The URL query is the only state.** The catalog page reads `searchParams`. It forwards to `GET /offerings` only the parameter names the contract declares for `listOfferings`, plus `page`, keeping repeated array parameters (`cataRef`, `fragranceCata`, …) as they are. Any other key is dropped.
- **No validation on the front.** A value the API rejects ends in the error state (section 2).
- **Pagination keeps the rest of the query.** Previous/Next replace only `page` and keep every other parameter. A change of filters (owned by `add-filter-controls`) navigates to a URL without `page`, so it returns to page 1. *(Recommendation to `add-filter-controls`; not this change's code.)*
- **The filter area is a slot.** `OfferingsScreen` renders a `filters` region between the page heading and the results. In this change it is empty. `add-filter-controls` fills it with its feature component, which reads and writes the same query names. The catalog does not depend on that change. That change depends on this one for the page and the slot (section 9).
- **No default filter or sort.** Without a query, the catalog requests `GET /offerings` as is, so verified and provisional offerings show together (contract: "Omit it to return both"). The API's default order is *(unverified)*. The "Top rated" entry supplies its own query.

## 4. Components and reuse

| Part | Component and variant | States | Accessible name / semantics |
|---|---|---|---|
| Page eyebrow | `<p className="type-eyebrow-strong">` (as `HomeHero`) | — | text |
| Page heading | `<h1 className="type-heading">` | — | the heading text |
| Filter slot | plain `<div>` region | empty in this change | owned by `add-filter-controls` |
| Offering cards | `OfferingCard` from `@/entities/offering`, **unchanged** | as landing | `h3` coffee name inside each card |
| Grid | `OFFERING_GRID_CLASSES` | — | — |
| Pagination | `OfferingPagination`, generalized to keep the query (Open 1) | disabled on first and last page (`Button` disabled = 50% opacity) | button labels |
| Empty / error / retry | `OfferingList` branches + `RetryButton` (`Button` primary) | — | message text; the button label |
| Skeleton | `OfferingSkeletonCard` | loading | shapes only (as landing) |
| Back link (detail) | `Link variant="back"` (ArrowLeft 16px, 0.5rem gap, from `src/shared/ui/Link.tsx`) | rest, hover, focus | text "Back" from the catalog. Destination in Open 8. |
| Status badge | `Badge variant="verified" \| "provisional"` | — | icon + label (never colour only) |
| Score row | the card's composition: `type-score` value, `type-meta` "/100", `Badge variant={ratingTierFor(...)}`. Absent when `cuppingAvg` is missing, as on the card | — | see D4 note below |
| Detail section cards | `Card layout="stacked"` with `CardContent` only | — | each with an `h2` |
| Data lists | `<dl>` with `<dt className="type-label">` and `<dd className="type-body">` | — | native term/description semantics |
| Taste profile | `Badge variant="taxonomy"` per resolved node, in a tree (section 6.3) | — | badge label text |
| Evaluate link (detail) | `Link` (default), specialist only (Open 9) | — | label text |

**Landing's open D4 (score shown twice on the card).** This change reuses `OfferingCard` unchanged, so the catalog shows exactly what landing shows. The detail header reuses the same score-row composition. Whatever Product owner decides for D4 applies to both screens and to the card in one place. This summary does not decide it.

**New components:** none in `src/shared/ui`. New pieces are compositions in the new widget and pages.

## 5. Semantic tokens and contrast

Only existing semantic tokens are used. No new primitive or semantic token is needed.

| Part | Token(s) | Sits on |
|---|---|---|
| Section 1 (heading, filter slot / detail header) | `bg-surface-page` | — |
| Section 2 (results / detail cards) | `bg-surface-section` | — |
| Eyebrow | `text-label` (via `type-eyebrow-strong`) | surface-page |
| Headings h1 | `text-primary` (via `type-heading`) | surface-page |
| Card heading h2 | `text-accent` (via `type-subheading`) | surface-card |
| `dt` | `text-label` (via `type-label`) | surface-card |
| `dd` | `text-primary` (via `type-body`) | surface-card |
| Captions (coffeeshop / roaster on detail) | `text-label` (via `type-label`) | surface-page |
| Meta (`/100`, counts) | `text-secondary` (via `type-meta`) | surface-page, surface-card |
| Empty / error message | `text-primary` (via `type-body`) | surface-section |
| Back link | `text-link`, hover `text-link-hover` | surface-page |
| Card boundary | `border-accent` left 4px (Card's own) | surface-section |
| Taste-tree guide line | `border-subtle`, 1px left | surface-card (decorative: not gated) |
| Focus | `focus-visible:focus-ring` (`focus-ring` / `focus-offset`) | every surface above |

Contrast of the gated pairs *(measured, design lead's script; WCAG 2.2 relative luminance; ratings composited over `surface-card` at 45% traditional / 30% dark)*:

| Pair | Traditional | Dark | Registered in `theme-tokens.test.ts` today |
|---|---|---|---|
| text-primary / surface-page | 6.41 | 14.28 | yes |
| text-primary / surface-card | 6.41 | 13.22 | yes |
| text-primary / surface-section | 5.72 | 11.97 | yes |
| text-secondary / surface-page | 6.05 | 8.57 | yes |
| **text-secondary / surface-card** | 6.05 | 7.93 | **no** |
| text-label / surface-page | 5.97 | 10.28 | yes |
| **text-label / surface-card** | 5.97 | 9.51 | **no** |
| text-accent / surface-card | 6.85 | 6.82 | yes |
| **text-link / surface-page** | 6.41 | 14.28 | **no** |
| **text-link-hover / surface-page** | 11.53 | 15.93 | **no** |
| focus-ring / surface-page, surface-card, surface-section | 11.53 / 11.53 / 10.28 | 14.28 / 13.22 / 11.97 | yes |
| **badge-text / rating-exceptional, excellent, good, commercial** | 4.85 / 5.04 / 5.12 / 4.69 | 6.61 / 6.48 / 6.42 / 7.08 | **no** (see Finding F1) |

Every pair passes its gate. The guard pairs this change must register, in both matrices: `text-secondary`/`surface-card`, `text-label`/`surface-card`, `text-link`/`surface-page`, `text-link-hover`/`surface-page`. The four `badge-text`/rating pairs are added only if Product owner takes F1 into this change (Open 10). Taxonomy badges are covered by the existing sweep (`1b4817a`, add-landing D10). Badge and button pairs already registered are not repeated.

## 6. Layout and spacing (criterion A)

Breakpoints: Tailwind defaults as used in the project (`md` 768px, `lg` 1024px, `xl` 1280px).

### 6.1 Page layout (decisions log D14, `openspec/specs/landing/spec.md` "Page layout")

Both screens:
- **Sections:** full-width sections, vertical padding 3rem below `md`, 4rem from `md`. Consecutive sections touch; their padding separates them.
- **Container:** centered, at most 72rem wide, full width below that, side padding 1rem below `md` and 2rem from `md`.
- **Borders and radius:** sections have none.
- **Shared classes:** the section and container classes are today copied in `HomeScreen.tsx:36-43` and `AboutContent.tsx`. See Open 2 before a third and fourth copy.

### 6.2 Catalog `/{locale}/offerings`

Section 1, on `surface-page`:
- **Heading block:** a flex column with the eyebrow and the h1 0.5rem apart (MVC `layouts/offerings/index.blade.php:3-6`, `gap-0 mb-2`: tight pair). No padding, border or radius of its own.
- **Filter slot:** 2rem below the heading block (gap 2rem between the block and the slot, as the landing hero's column gap `gap-8`). Full container width. No padding, border or radius from the catalog; `add-filter-controls` owns its inner box. While the slot is empty, it renders nothing, so it adds no gap.

Section 2, on `surface-section`:
- **Results:** `OfferingList`'s block as on landing:
  - grid and pagination 2rem apart;
  - grid gap 1.5rem: 1 column below `md`, 2 from `md`, 3 from `xl`; cards of a row share their height;
  - pagination centered, its buttons 1rem apart, wrapping.
- **Empty message:** centered text, no box.
- **Error block:** message and Retry centered in a column, 1rem apart.
- **Cards:** inner spacing, border and radius are the card's own:
  - padding 1.5rem per region;
  - 4px `border-accent` on the left;
  - `rounded-container` (16px traditional, 0 dark);
  - `shadow-lg`.

### 6.3 Detail `/{locale}/offerings/{ulid}`

Section 1, on `surface-page` (MVC `layouts/offerings/show.blade.php:2-25`). It holds two blocks in a flex column, 1.5rem apart.

1. **Back link:** `Link variant="back"`. No box.
2. **Header block:** title group and score row.
   - **Title group:** a flex column, children 0.5rem apart:
     - the status badge (the badge keeps its own `px-2 py-0.5`, `rounded-field`);
     - the h1 coffee name;
     - one caption line per name: coffeeshop (`location.name`) and roaster (`coffeeInventory.roastery.name`), labelled as on the card.
   - **Layout below `md`:** the title group, then the score row 1rem below it, both left-aligned.
   - **Layout from `md`:** one row, title group on the left and score row on the right, top-aligned, at least 1rem apart. This follows MVC `show.blade.php:8-18`, where the concordance badge sits at the top right.
   - **Score row:** as the card's (`flex-wrap`, baseline-aligned, 0.5rem gap). No box of its own.

Section 2, on `surface-section`:
- **Card grid:** 1 column below `lg`, 2 equal columns from `lg`, 1.5rem gap, cards of a row stretched to equal height. The taste-profile card spans both columns.
- **Card order:** Origin, Lot and roast, Status and evaluations, SCA attributes, Taste profile. The groups follow MVC `general-info.blade.php` and `consensus.blade.php`; the field set comes from the contract (section 7.3).
- **Each card:** `Card layout="stacked"` with only `CardContent` (padding 1.5rem; 4px left `border-accent`; `rounded-container`; `shadow-lg`). Inside it, a flex column with the h2 and its content 1rem apart. The MVC uses `gap-3` between subheading and grid; this summary rounds it to 1rem, the project's step for heading-to-content (HomeHero `gap-4`).
- **Data list (`dl`):** one row per field, each row a flex line with the term at the start and the value at the end, at least 1rem apart, wrapping when narrow (MVC `general-info.blade.php:7-10`, `justify-between`).
  - Rows: 1 column below `md`; 2 columns from `md` inside cards that span the full width.
  - Gaps: 0.75rem between rows, 1.5rem between columns (MVC `gap-x-6 gap-y-3`).
  - Separators, borders and radius: none on rows.
- **SCA attributes card:** the same `dl`, one row per affective average. The presentation of each value is Open 5.
- **Taste profile card.** Its layout follows MVC `cata-wheel-static.blade.php:34-84`, translated to tokens:
  - Root groups wrap in a flex row, 1rem apart horizontally and vertically.
  - Each group is a flex column, 0.5rem apart: the level-0 badge, then its level-1 children.
  - The children block is indented 1.25rem, with a 1px left border in `border-subtle` (decorative), 0.75rem padding on its left and 0.5rem between rows.
  - Each level-1 row shows its badge, then its level-2 badges. They sit in a flex row from `lg`, 0.375rem apart, and stack below `lg`. Level-2 badges wrap with 0.375rem gaps.
  - No radius on the block.
- **Error state:**
  - section 1 keeps only the back link;
  - section 2 shows the error message and Retry, centered in a column 1rem apart.
- **Loading state:**
  - in section 1, the back link and three placeholder bars: the badge (1rem tall, a quarter of the width), the title (1.5rem tall, two thirds) and a caption (1rem, half). The bars sit 0.5rem apart and use `bg-surface-section` and `rounded-field`, as `OfferingSkeletonCard`;
  - in section 2, two skeleton cards in the card grid.

### 6.4 At 375px

- No horizontal scroll.
- Every row wraps: the score row, the `dl` rows, the taste rows and the pagination.
- The h1 uses `type-heading` (text-2xl below `md`).
- The detail header stacks (section 6.3).

### 6.5 Visual reference (mock-ups, ASCII; no MVC capture was taken)

Catalog, 1280px:
```
┌ header (app-shell) ─ Logo  Top rated  About us ───────── ES ▾  Sign in ┐
│ surface-page  py-16                                                  │
│   COFFEES                       (eyebrow)                            │
│   Discover offerings            (h1)                                 │
│   [ filter area — add-filter-controls ]                              │
├──────────────────────────────────────────────────────────────────────┤
│ surface-section py-16                                                │
│   [card] [card] [card]     gap 1.5rem                                │
│   [card] [card] [card]                                               │
│            [Previous] [Next]                                         │
└──────────────────────────────────────────────────────────────────────┘
```
Detail, 1280px:
```
│ surface-page                                                         │
│   ← Back                                                             │
│   [✓ Verified]                                     84.25 /100 [84.25]│
│   Huila El Mirador  (h1)                                             │
│   Coffeeshop: Tazavera Gràcia                                        │
│   Roaster: Nómada Roasters                                           │
├──────────────────────────────────────────────────────────────────────┤
│ surface-section                                                      │
│   ┃ ORIGIN               ┃ LOT AND ROAST                             │
│   ┃ Country   Colombia   ┃ Roast lot        L-2026-014               │
│   ┃ Region    Huila …    ┃ Production date  2026-09-19 …             │
│   ┃ STATUS AND EVALUATIONS ┃ SCA ATTRIBUTES                          │
│   ┃ TASTE PROFILE (full width)                                       │
│   ┃ [Fruity · 5]   [Floral · 3]                                      │
│   ┃  │ [Berry · 4]  [Blueberry · 4]                                  │
```
Detail, 375px: one column; the score row below the captions; the cards stacked.

Sources: `resources/views/layouts/offerings/index.blade.php`, `layouts/offerings/show.blade.php`, `layouts/offerings/partials/general-info.blade.php`, `partials/consensus.blade.php`, `partials/consensus-axis.blade.php`, `partials/cata-wheel-static.blade.php`, `livewire/coffees/partials/offeringcard.blade.php`, `livewire/coffees/offering-filterbar.blade.php`, `components/welcome/navbar.blade.php:11` ("Lo mas valorado"). An MVC capture at 375px and 1280px is still to be taken (unverified).

## 7. Texts (message catalog, es / en / ca, passed as props)

Area: a new `catalog` area (`messages/{locale}/catalog.json`) for the texts below. The card, pagination and retry labels come from the existing `landing` keys (Open 3). Spanish wording follows the MVC where it exists; the English and Catalan strings are the design lead's proposals.

### 7.1 Catalog

| Key | es | en | ca |
|---|---|---|---|
| `listEyebrow` | Cafés | Coffees | Cafès |
| `listHeading` | Descubre ofertas | Discover offerings | Descobreix ofertes |
| `listEmptyMessage` | No hay ofertas que coincidan. | No offerings match. | No hi ha ofertes que coincideixin. |
| `listErrorMessage` | No se pudieron cargar las ofertas. | The offerings could not be loaded. | No s'han pogut carregar les ofertes. |
| `metaDescription` | (proposal) Explora las ofertas de café evaluadas con el protocolo de cata SCA. | Explore the coffee offerings evaluated with the SCA cupping protocol. | Explora les ofertes de cafè avaluades amb el protocol de tast SCA. |

### 7.2 Detail headings and states

| Key | es | en | ca |
|---|---|---|---|
| `detailBackLabel` | Volver | Back | Tornar |
| `detailOriginHeading` | Origen | Origin | Origen |
| `detailLotHeading` | Lote y tueste | Lot and roast | Lot i torrat |
| `detailStatusHeading` | Estado y evaluaciones | Status and evaluations | Estat i avaluacions |
| `detailAttributesHeading` | Atributos SCA | SCA attributes | Atributs SCA |
| `detailTasteHeading` | Perfil de cata | Taste profile | Perfil de tast |
| `detailTasteEmpty` | Sin datos de cata disponibles. | No cupping data available. | Sense dades de tast disponibles. |
| `detailErrorMessage` | No se pudo cargar la oferta. | The offering could not be loaded. | No s'ha pogut carregar l'oferta. |

### 7.3 Detail field labels

| Key | Field | es | en | ca |
|---|---|---|---|---|
| `fieldCountry` | `coffee.country` | País | Country | País |
| `fieldRegion` | `coffee.region` | Región | Region | Regió |
| `fieldProducer` | `coffee.producer` (nullable: row omitted when null) | Productor | Producer | Productor |
| `fieldVariety` | `coffee.variety` | Variedad | Variety | Varietat |
| `fieldProcess` | `coffee.process` | Proceso | Process | Procés |
| `fieldAltitude` | `coffee.altitude` | Altitud | Altitude | Altitud |
| `fieldCoffeeLot` | `coffee.lot` | Lote | Lot | Lot |
| `fieldRoastLot` | `coffeeInventory.roastLot` | Lote de tueste | Roast lot | Lot de torrat |
| `fieldProductionDate` | `coffeeInventory.productionDate` | Fecha de producción | Production date | Data de producció |
| `fieldRoastLevel` | `coffee.roastLevel` | Nivel de tueste | Roast level | Nivell de torrat |
| `fieldEvaluationCount` | `evaluationCount` | Total | Total | Total |
| `fieldDefectiveCount` | `defectiveEvaluationCount` | Defectuosas | Defective | Defectuoses |
| `fieldConcordanceAffective` | `concordanceAffective` | Concordancia afectiva | Affective concordance | Concordança afectiva |
| `fieldConcordanceDescriptive` | `concordanceDescriptive` | Concordancia descriptiva | Descriptive concordance | Concordança descriptiva |
| `attrFragrance` … `attrOverall` | the 8 `*AffectiveAvg` | Fragancia, Aroma, Sabor, Retrogusto, Acidez, Dulzor, Cuerpo, Global | Fragrance, Aroma, Flavor, Aftertaste, Acidity, Sweetness, Mouthfeel, Overall | Fragància, Aroma, Sabor, Retrogust, Acidesa, Dolçor, Cos, Global |

Notes:
- The verification status is shown by the badge in the header, so the Status card has no extra "Verification" row (MVC `general-info.blade.php:46-56` has one; dropping it avoids showing the state twice).
- The MVC's "N/A" for missing values is not carried over: a null value omits its row, the card's origin-line rule (`openspec/specs/landing/spec.md`, "Origin line skips null values").
- The location `description` and `roastery.description` are free API text, not shown in this draft (Open 4).

## 8. Accessibility

- **Headings:** one `h1` per screen; the detail cards are `h2`; the catalog cards keep their `h3`.
- **Data lists:** the detail data uses `dl`/`dt`/`dd`.
- **Status:** the status badge carries an icon and a label; the rating badge carries the score text. Neither relies on colour alone.
- **Interactive controls:** the back link, the pagination buttons, Retry and the card links are all existing controls with `focus-visible:focus-ring`.
- **Accessible names:** every control has a visible label, so none needs an extra name.
- **Disabled pagination:** disabled buttons are non-interactive (`Button`'s disabled state, 50% opacity).
- **Header entry:** opening `/{locale}/offerings` from any query marks "Top rated" with `aria-current="page"`, because the spec compares paths and ignores the query (`app-shell` spec, "Current page entry"). See Open 11.
- **Document title:** `Tazavera` on both screens, as the landing metadata rule (Open 12).

## 9. Dependencies

- **Capabilities used:** `theming`, `base-controls` (`Button`, `Link`), `content-structure` (`Card` stacked), `feedback` (`Badge`), `app-shell` (header entry, shell), `landing` (`offering-list` widget, `OfferingCard`, `landing` catalog keys).
- **add-landing (merged):**
  - its widget must be generalized (Open 1);
  - its D4 applies to this change's card and score row;
  - its backlog candidate D8 (shared section primitive) is touched (Open 2).
- **add-auth (Apply):** until it lands, the screens pass the anonymous session constant, as `HomeScreen.tsx:26` does, so the Evaluate link stays hidden. Merge order is free. The decisions-log entry Q-merge does not name this change.
- **add-filter-controls (Summary):** depends on this change for the catalog route and the filter slot. The interface it must honour is in section 3.1: contract parameter names, the URL as the only state, `page` dropped on change.
- **add-evaluation-scales (Summary):** may own a read-only bean scale. That only matters if Open 5 takes option (b).
- **add-specialist-evaluations:** owns `/manage/evaluations/new?offering=` (the Evaluate link target) and the evaluations list (Open 6).
- **Backlog:** R1–R4 do not name this change. The candidate "shared section primitive" (general context, "Al retomar" 8; add-landing handoff D8) is not in `docs/backlog.md` yet. It affects this change (Open 2).
- **Decisions log:** D14 (2026-10-06, add-landing) names this change: applied in section 6.1.

## 10. Tests (expected coverage)

- **Query pass-through (pure function):**
  - keeps only the contract's `listOfferings` names plus `page`;
  - keeps repeated array values;
  - drops unknown keys;
  - builds the request URL.
- **Pagination:** Previous/Next push the current path with `page` replaced and every other parameter kept, and are disabled at the boundaries. This adds to the existing `OfferingPagination.test.tsx`, which must keep landing's `/{locale}?page=n`.
- **Catalog presentation:** success, empty and error, with the catalog texts as props, and the filter slot rendered between heading and results.
- **Detail presentation (sync component):**
  - the header (status badge, h1, captions, score row present and absent);
  - each `dl` row;
  - the producer row omitted when null;
  - the attribute rows;
  - the taste tree by level, with an unresolved `ref` giving no badge;
  - the empty-taste message;
  - the error state with Retry and the back link.
- **Detail fetch:** non-2xx throws and maps to error.
- **Catalog guard:** the new `catalog` area is present in es, en and ca with the same keys (the existing guard).
- **Contrast guard:** the four new pairs of section 5, in both matrices.
- **Layout classes:** exact classes per section 6, asserted as chosen (jsdom has no CSS engine).
- **Verification task:** captures of `/es/offerings`, `/es/offerings?verified=1&orderBy=cupping_avg&orderDirection=desc` and `/es/offerings/{ulid}` at 375px and 1280px, against the local read mock (the local database has no offerings).

## 11. Findings on existing code

- **F1: guard registers the wrong label token for the rating badges.** `theme-tokens.test.ts:341-344` (and the dark matrix) register `text-primary` on the rating backgrounds. `Badge.tsx:34-37` renders the rating label with `text-badge-text`. In the traditional theme these are different colours (moss-700 against sage-800). The real pairs pass *(measured: 4.69–5.12 traditional, 6.42–7.08 dark)*, so there is no visible defect. Path (workflow §4): unplanned coverage on `add-landing`'s behaviour; since that change is archived, it goes to the backlog or into this change's guard task (Open 10).
- **F2: the offering-list widget is landing-specific.**
  - `fetchVerifiedOfferings` hardcodes `verified=1` (`api/offerings.ts:33`);
  - `OfferingPagination` pushes `/${locale}?page=n` (`OfferingPagination.tsx:51,57`);
  - `resolve-taxonomies` lives in the widget, where a second widget cannot import it (FSD, same layer).

  Path: refactor before reuse (Open 1).

## Open

1. **How does the catalog reuse landing's offering-list widget?**
   - Options:
     - (a) Generalize it in this change: the fetch takes the forwarded query (landing passes `verified=1`); `OfferingPagination` takes a base path and the current query; `buildTaxonomyLookup`/`resolveTaxonomies` move down to `src/entities/offering` (or a new `taxonomy` entity) so the detail widget can use them. Landing's behaviour and tests stay as they are.
     - (b) A separate refactor change first, in `landing`, then this change.
     - (c) A second widget for the catalog (duplication: not recommended).
   - Recommendation: (b) if Product owner wants the backlog rule applied strictly (`AGENTS.md`: the refactor goes first as its own change); otherwise (a), since no landing behaviour changes. Source: criterion C; `src/widgets/offering-list/*`.
   - **Answered 2026-10-06 (Product owner): (a), reduced.** Pagination (`Pagination`, `@/shared/ui`, `path` + `query`) and the taxonomy read and lookup (`src/entities/taxonomy`) were already extracted by `extract-offering-list-parts`. This change only generalizes the offerings fetch: it takes a query (for example `fetchOfferings(query)`); landing calls it with `verified=1` and keeps its behaviour and tests; the catalog passes the URL query (filters, sort, page) without forcing `verified`.
   - Blocks propose: no.
2. **Shared section and container primitive.** The two screens would add a third and fourth copy of `SECTION_CLASSES`/`CONTAINER_CLASSES` (today in `HomeScreen.tsx` and `AboutContent.tsx`).
   - Options:
     - (a) Add the backlog entry and a refactor change in `src/shared/ui` (for example a `PageSection` with a `surface` prop) before this change.
     - (b) Copy the classes again and leave the candidate for later.
   - Recommendation: (a). It is the "next public page" the landing handoff D8 named. Source: add-landing handoff D8; general context "Al retomar" 8.
   - **Answered 2026-10-06 (Product owner): (a).** Refactor first; this change uses the shared primitive.
   - Blocks propose: no (waits for the refactor to be merged).
3. **Message catalog area for the card texts.**
   - Options:
     - (a) The catalog screens read the card, pagination and retry labels from the `landing` area and their own texts from a new `catalog` area.
     - (b) Move the shared card keys to a new shared area and update landing.
     - (c) Duplicate the keys in `catalog`.
   - Recommendation: (a). It needs no landing change and adds no duplicate.
   - Blocks propose: no.
4. **Detail fields not drafted.**
   - Options:
     - (a) Leave out `location.description`, `roastery.description`, `latitud`/`longitud` and `coffeeInventory.ulid`.
     - (b) Show the two descriptions as `type-body` paragraphs under the captions, and the coordinates as text.
     - (c) Add a map: a new dependency, so not recommended.
   - Recommendation: (a) for coordinates and ULIDs (not reader-facing); Product owner's call on the descriptions. The MVC shows neither (`show.blade.php`).
   - Blocks propose: no.
5. **SCA attribute averages (1–9).**
   - Options:
     - (a) Plain text value with the scale, for example `7.2 / 9`, in the `dl`.
     - (b) The MVC's nine-bean row (`consensus-axis.blade.php`), which needs the coffee-bean icon and a read-only scale component that `add-evaluation-scales` would own.
   - Recommendation: (a) now, with (b) as a later change once the scale exists, so this change does not wait on `add-evaluation-scales`. The bean tokens exist (`evaluation-bean-on/off`), but no component does.
   - **Answered 2026-10-06 (Product owner): (b).** Each average is the read-only bean scale of `add-evaluation-scales` (`readOnly`, `value` 0–9 with one decimal, geometric fraction cut, value also as text, `valueLabel` such as "7,2 de 9"; scales summary §3). This change depends on `add-evaluation-scales` being merged first.
   - Blocks propose: no (waits for `add-evaluation-scales`).
6. **Tabs and the evaluations of the offering.** The MVC detail has three tabs: General, Evaluations, Technical (`show.blade.php:27-58`). `listEvaluations` has no offering filter; the closest is `coffeeId` + `locationId` *(semantics unverified)*. The "Technical" tab shows the coffeeshop's own evaluation, which no contract operation exposes per offering.
   - Options:
     - (a) No tabs: one page with the section cards of 6.3, and no evaluations list.
     - (b) Tabs, with an evaluations tab using `coffeeId` + `locationId`, owned by `add-specialist-evaluations`.
     - (c) Ask the API for an `offering` filter (a contract change, Product owner's).
   - Recommendation: (a). It needs no unsupported operation.
   - **Answered 2026-10-06 (Product owner): tabs, two now.** Below the header of §6.3 (unchanged, from the MVC), the detail has tabs (shadcn/Radix Tabs, `radix-ui` installed): "Inventory data" (`coffeeInventory`: roast lot, production date, the coffee's fields, the roastery, `location`) and "Consensus" (the SCA averages with the read-only bean scale of Open 5, `cuppingAvg`, evaluation and defective counts, concordances, `sensoryTaxonomy`, `cataConcordance`, `verificationStatus`). The active tab is kept in the URL (`?tab=`), as in the MVC. No evaluations list.
   - Later change (planned by Product owner, not in this change): a third tab with the offering's provisional evaluation, presented with the same style as the Consensus tab (read-only bean scales and the same layout), not as the evaluation form (Product owner, 2026-10-06, replacing the earlier read-only-form idea). It needs the API to expose that evaluation (no contract operation finds it today); Product owner will create the provisional-evaluation seeders. The provisional evaluation is an evaluation of type `baseline`, created by the coffeeshop (API design, `tazavera-documentation/end-points.md`); how it reaches the public detail page (inside `GET /offerings/{ulid}` or a public evaluation read, which stays public) is decided when that change is planned.
   - Blocks propose: no.
7. **Unknown ulid.**
   - Options:
     - (a) Every failure, 404 included, shows the error state with Retry.
     - (b) Call Next's `notFound()` on a 404. The contract documents no 404, so this relies on API behaviour (route model binding) *(unverified in the contract)*.
   - Recommendation: (a). It invents no error format (`AGENTS.md`, API contract). It is the landing pattern.
   - Blocks propose: no.
8. **Back link destination.**
   - Options:
     - (a) `/{locale}/offerings`, plain.
     - (b) Browser history back.
     - (c) The catalog with the query the visitor came from. The MVC keeps `request()->query()`, but the card's View link carries no query today, so (c) would change `OfferingCard`.
   - Recommendation: (a). It is predictable and changes no landing code.
   - Blocks propose: no.
9. **Evaluate link on the detail page for a signed-in specialist.**
   - Options:
     - (a) Yes, same rule and target as the card.
     - (b) No (the MVC detail has none).
   - Recommendation: (a). It is the natural entry point and reuses the card's rule.
   - Blocks propose: no.
10. **F1: rating-badge guard pairs.**
    - Options:
      - (a) Register `badge-text`/rating pairs in this change's guard task.
      - (b) A backlog entry for `feedback`.
    - Recommendation: (a). It is coverage only, adds no token and touches the pairs this change renders.
    - Blocks propose: no.
11. **Current-page marking.** `/{locale}/offerings` without a query (or with any filters) also marks "Top rated" as the current page, because the spec ignores the query.
    - Options:
      - (a) Accept: the catalog is the "Top rated" destination.
      - (b) Change the `app-shell` rule to compare the query too, which is a correction to a merged spec.
    - Recommendation: (a).
    - Blocks propose: no.
12. **Page title and heading for the detail.**
    - Options:
      - (a) Document title `Tazavera` on both screens, as the landing rule.
      - (b) The coffee name on the detail (MVC `show.blade.php:1` uses it).
    - Recommendation: (a), for consistency with the settled landing rule. (b) adds a per-route title mechanism.
    - Blocks propose: no.
13. **Catalog heading when opened from "Top rated".**
    - Options:
      - (a) One heading, "Discover offerings", whatever the query.
      - (b) A "Top rated" heading when the query equals the entry's query.
    - Recommendation: (a). It adds no query-matching mechanism.
    - Blocks propose: no.
14. **English and Catalan strings and the new Spanish keys** in section 7 are proposals. Product owner confirms or edits them.
    - Blocks propose: no.

## Review log

- 2026-10-06, design lead, generation mode.
  - **Settled from sources:**
    - routes from the card's View link and `PrimaryNav`;
    - fetch rule (CLAUDE.md §2);
    - D14 layout (decisions log);
    - reuse of `OfferingCard`, `OFFERING_GRID_CLASSES`, `OfferingSkeletonCard`, `RetryButton`, `Badge`, `Card` stacked and `Link` back;
    - null values omit their row (landing origin-line rule);
    - the "Verification" row dropped as a duplicate of the header badge (semantic, criterion B);
    - spacing values from the MVC partials cited in section 6.
  - **Measured:** every gated pair in section 5, in both themes (script in the design lead's scratch directory).
  - **Board assumption:** confirmed for the detail page; corrected for the header entry, which already exists in `app-shell` and only needs this change's route.
