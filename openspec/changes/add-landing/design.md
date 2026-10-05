# Design

## Context

See `proposal.md` — Why, and `docs/design/add-landing/design-summary.md`, which settles the product decisions (the hero, the list and its states, the card regions, the badge families, the about sections, the copy process). This document works out the implementation and records what that left open. The constraints that shape the approach:

- `add-app-shell` is built in parallel and owns every surface this change consumes: `src/shared/lib/i18n/messages.ts` (its D10 area-catalog reader), `src/shared/config/locales.ts`, `src/shared/lib/utils.ts` (`cn`), the `app/[locale]/` routing whose `app/[locale]/page.tsx` already renders `src/pages/home/`, and `src/shared/api/index.ts` (its D4 `Session`, `SessionUser` and `UserRole` types and the home of the derived types). This change imports all of it and never redefines it. The only merge precondition is `develop` containing `add-app-shell`; nothing here depends on `add-auth`.
- `contracts/openapi.yaml` is not touched. The design summary §7 preconditions are met since `bff523c` on this branch: `GET /offerings` declares the `verified` parameter and `GET /taxonomies` returns `nameCa`, in the contract and in the generated `src/shared/api/schema.ts`. Neither file is modified by any commit after `bff523c`. `page` is likewise undeclared as a parameter but is carried by the contract's own pagination URLs (`links`, `meta.links`), so the paginator's `page` is used as-is.
- Next 16 facts taken from `node_modules/next/dist/docs/` (resolved from the main worktree's install; this worktree has no `node_modules`): a `page` file renders a route and receives its dynamic segment as `params` and its query as `searchParams`, passing both into its screen (`01-app/01-getting-started/03-layouts-and-pages.md`, `01-app/03-api-reference/03-file-conventions/page.md`); state, effects and event handlers require `"use client"` (`01-app/01-getting-started/05-server-and-client-components.md`); local images under `public/` render through `next/image`'s `Image` with `src`, `width`, `height` and `alt` (`01-app/01-getting-started/12-images.md`, `01-app/03-api-reference/02-components/image.md`); a client component navigates programmatically with `useRouter`'s `router.push(href)` and re-renders the route's Server Components — re-running their data requests — with `router.refresh()` (`01-app/03-api-reference/04-functions/use-router.md`); the document metadata is exported from a `layout` or `page` file as a `Metadata` object or a `generateMetadata` function, in Server Components only (`01-app/03-api-reference/04-functions/generate-metadata.md`).
- Breakpoints: `md` = 768px and `lg` = 1024px (Tailwind defaults; the summary's "Declared breakpoints: hero md, Card lg").
- The hero photograph: the build copies `docs/design/add-landing/coffee-beans.png` to `public/images/coffee-beans.png` — the exact paths the product owner fixed on 2026-10-04. The source file has been in the tree since `bff523c`.

## Goals / Non-Goals

**Goals:**

- Both public screens on the settled contracts, with no edit to the shell, the session types or the generated schema, and no dependency beyond `add-app-shell`.
- One reusable card and one badge family that later changes consume instead of rebuilding.
- Every visible text through the `landing` catalog with components taking texts as props, exactly as `add-app-shell`'s D10 requires.
- All data logic outside the page slices and outside the entity, in testable units (the testing rule: async Server Screens stay thin).

**Non-Goals:**

- Any request beyond the two public reads. No write, no filter, no sort control.
- Behaviour of the routes the links target (offering detail, registration, new evaluation).
- Static rendering: `add-app-shell`'s D9 nonce already makes every page dynamic.
- New dependencies of any kind.

## Decisions

### D1 — Consumed contracts and the merge precondition

| Surface | Owner | Used here for |
|---|---|---|
| `src/shared/lib/i18n/messages.ts` | `add-app-shell` (D10) | reading the `landing` area catalog per locale in the screens |
| `src/shared/config/locales.ts` | `add-app-shell` (D2) | locale names for links and taxonomy name selection |
| `src/shared/lib/utils.ts` (`cn`) | `add-app-shell` (D6) | class composition in the card and badge |
| `src/shared/api/index.ts` | `add-app-shell` (D4) | the `Session`, `SessionUser` and `UserRole` types — the Evaluate seam — and the home of the derived types |

The first task verifies every one of these resolves under `npx tsc --noEmit` before any feature work, which is what proves `develop` contains `add-app-shell` — the only merge precondition of this change. Nothing here imports `@/features/auth` or the `add-auth` request client. Rejected: writing local shims for the missing surfaces — they would collide with the owning change on the same files.

### D2 — Derived types, defined before any component

`src/shared/api/schema.ts` declares no named schemas, so everything derives from `operations`. Added to `src/shared/api/index.ts` beside `add-app-shell`'s session types, before any component:

```ts
import type { operations } from "./schema";

type ListOfferingsResponse =
  operations["listOfferings"]["responses"][200]["content"]["application/json"];
type ListTaxonomiesResponse =
  operations["listOlfactoryTaxonomies"]["responses"][200]["content"]["application/json"];

/** One item of `GET /offerings` `data`; every field is optional in the contract. */
export type OfferingSummary = NonNullable<ListOfferingsResponse["data"]>[number];

/** `meta` of the offerings pagination; the list reads `current_page` and `last_page`. */
export type OfferingsPageMeta = NonNullable<ListOfferingsResponse["meta"]>;

/** One node of an offering's `sensoryTaxonomy` tree: `ref`, `type`, `level`, `count`, `children`. */
export type OfferingTaxonomyNode = NonNullable<
  OfferingSummary["sensoryTaxonomy"]
>[number];

/** One node of `GET /taxonomies` `data`: `ulid`, `level`, `nameEs`, `nameEn`, `nameCa`, `color`, `children`. */
export type TaxonomyNode = NonNullable<ListTaxonomiesResponse["data"]>[number];
```

The generated responses mark `data` and `meta` optional, so every type D2 derives from an optional field wraps its indexed access in `NonNullable<…>` before indexing (review round 1): the meanings of the comments above are unchanged and `src/shared/api/schema.ts` is not edited.

UI-specific types live beside their component, declared before it, exactly as `Button` does: `RatingTier` and the score rule in `src/entities/offering/lib/rating.ts`, `OfferingCardProps` (with its resolved taxonomy badge data) in the entity's card module, `BadgeProps` and `CardProps` in `src/shared/ui`. `src/shared/api/schema.ts` is left byte-for-byte untouched.

### D3 — Where the pieces live

- Full screens are the `pages` layer: `src/pages/home/` (the entry screen `add-app-shell` reserved for this change) and `src/pages/about/`. Their `ui/*Screen.tsx` files stay thin wrappers that load the catalog and delegate to sync, testable components — the testing rule keeps the wrappers free of logic.
- The verified-offerings block is `src/widgets/offering-list/`: one self-contained block combining the offering entity with the shared controls (fsd-architecture question 2). Its `api/` segment holds the two server fetches of D4, its `lib/` segment the taxonomy resolution, and its `ui/` a thin async Server Component that fetches beside a sync presentation component and the two client actions (pagination, retry) — the testing rule keeps the untestable async component free of logic. Rejected: fetching inside the page slices (pages are composition only) and a `taxonomy` entity (the taxonomy data has exactly one consumer; a second entity for one resolver is premature — if a later change needs taxonomy data elsewhere, the resolver lifts then).
- The offering entity is `src/entities/offering/`: the card that fills the shared Card and the rating rule the summary fixes in `lib/`. The session is never read here or anywhere in this change: it enters as a prop of the `Session` type from `@/shared/api` (the `add-app-shell` D3 input pattern) and no file imports `@/features/auth`.
- Card and Badge are `src/shared/ui` (the summary fixes it): generic, no business knowledge, re-exported from `src/shared/ui/index.ts`.

### D4 — API endpoints consumed, and how errors reach the user

**Fetching rule (recorded for the project):** public endpoints are fetched on the server with plain `fetch`; authenticated endpoints are fetched on the client through the `add-auth` request client. Both endpoints this change consumes are public — the contract attaches no security scheme to either — so both are fetched on the server in the Server Component that renders the list, with plain `fetch` against `NEXT_PUBLIC_API_URL` and no credential header. Nothing here depends on the `add-auth` request client.

**`GET {NEXT_PUBLIC_API_URL}/offerings`** — one page of verified offerings.

| | |
|---|---|
| Method and path | `GET /offerings` (`operations["listOfferings"]`) |
| Auth | None. The contract attaches no security scheme to this read and the server fetch sends no credential header |
| Request | Query `verified=1` (the `verified` filter in the contract since `bff523c`) and `page`, taken from the route's search params (`searchParams.page`) so the selected page lives in the URL. No body. `orderBy`/`orderDirection` and the filter parameters are not used. |
| Response `200` | `{ data: Offering[], links, meta }`. Per item the fields of the mapping table below. `meta` carries `current_page`, `from`, `last_page`, `path`, `per_page`, `to`, `total`. |
| Errors | Transport failure, or any non-2xx status (a `422` on an unexpected parameter, `5xx` from the API) |
| Presented to the user | The list's error state: one message from the `landing` catalog with the retry action (D9). The API's error body and status are never rendered, whatever the failure |

**`GET {NEXT_PUBLIC_API_URL}/taxonomies`** — the olfactory taxonomy tree.

| | |
|---|---|
| Method and path | `GET /taxonomies` (`operations["listOlfactoryTaxonomies"]`) |
| Auth | None |
| Request | No parameters, no body |
| Response `200` | `{ data: TaxonomyNode[] }` — per node `ulid`, `level` (0–2), `nameEn`, `nameEs`, `nameCa` (in the contract since `bff523c`), `descriptionEn`, `descriptionEs`, `color` (a `#RRGGBB` string), `categories`, `children` |
| Errors | Transport failure or any non-2xx status |
| Presented to the user | Exactly like an offerings failure: the same list error state with the retry action, which re-renders the route's Server Components and so refetches both requests (D9). Recorded assumption: the taxonomy badges are essential card content, so the block does not degrade to badges-less cards; one error state covers both requests |

**Card field mapping** (design rule: every field that fills the shared card):

| Card region | API field |
|---|---|
| Side column — score | `cuppingAvg` (a decimal string like `'84.25'`), shown over `/100` |
| Side column — rating badge | derived from `cuppingAvg` by the rule of D8 |
| Content — status badge | `verificationStatus` (`verified` or `provisional`) |
| Content — coffee name | `coffeeInventory.coffee.name` |
| Content — coffeeshop caption | `location.name` |
| Content — roaster caption | `coffeeInventory.roastery.name` |
| Content — origin line | `coffeeInventory.coffee.country`, `.region`, `.process`, `.variety` (null values omitted, fixed order) |
| Content — taxonomy badge rows | `sensoryTaxonomy` including nested `children`: each `ref` resolved against `GET /taxonomies` by `ulid` to `nameEs`/`nameEn`/`nameCa` and `color`; the node's own `level` picks the row |
| Footer — counts | `evaluationCount`, `defectiveEvaluationCount` |
| Footer — View link | `ulid` → `/{locale}/offerings/{ulid}` |
| Footer — Evaluate link | `ulid` → `/{locale}/manage/evaluations/new?offering={ulid}` |
| Pagination | `meta.current_page`, `meta.last_page` |

No other API field is displayed: the affective averages, the concordances, `cataConcordance`, `roastLot`, `producer`, `altitude`, `lot`, `latitud`, `longitud`, `description*` and the taxonomy `categories` never render.

### D5 — Taxonomy resolution

The Server Component of D9 requests `GET /taxonomies` once per route render and flattens the tree (children recursively; the tree is at most levels 0–2) into a lookup by `ulid`. Each `ref` of an offering's `sensoryTaxonomy` — including its `children` — resolves through that lookup: the label is `nameCa` for `ca`, `nameEs` for `es` and `nameEn` for `en`, the color is the node's `color`, and the row comes from the offering node's own `level`. A `ref` that finds no node renders no badge (spec: "Unresolved reference"). The lookup is built once per render and shared by every card of that render.

Rejected: requesting taxonomies per card or per page — the summary settles "once", and the tree is a slow-moving vocabulary.

### D6 — Card (`src/shared/ui`, shadcn base)

Four generic parts — `Card`, `CardAside`, `CardContent`, `CardFooter` — with exactly the settled look: `bg-surface-card`, `rounded-container`, `border-l-4 border-border-accent`, `shadow-lg` on the card; `border-border-subtle` as the side column's separator. The parts render in the summary §2's order — side column, content, footer: beside the content the side column sits first (left in the row layout) and below `lg` (1024px) the parts stack in that same order. The separator border lies on the boundary between the side column and the content in both layouts, so it follows the layout edge (the build picks the border classes and its tests assert its choice). The parts compose with `cn`; the consumer fills them. Review round 3 adds the opt-in stacked layout and the full-height column with the footer at the bottom (D14). The part order is this design's reading of the summary, which lists `CardAside` before `CardContent` in §2 and §4 and fixes the footer last; recorded in `## Propose status` as an assumption.

The shadcn card is the base and is rewired in the `add-app-shell` D6 manner: its classes are remapped to the settled tokens and it is re-exported from `src/shared/ui/index.ts`. Rejected: shipping the generated template untouched (its classes name primitives and default scales, which the guard tests refuse) and designing a container from scratch (the summary settles "shadcn base").

### D7 — Badge (`src/shared/ui`, shadcn base)

One `Badge` with the variant union `rating-exceptional | rating-excellent | rating-good | rating-commercial | verified | provisional | taxonomy`. All variants render `type-badge` and `rounded-field`, plus the inline layout and padding of D14:

| Variant | Treatment |
|---|---|
| `rating-*` | `bg-evaluation-rating-exceptional\|excellent\|good\|commercial`, text `text-badge-text` |
| `verified` | `bg-badge-verified-bg`, `text-badge-verified-text`, `Check` icon before the label |
| `provisional` | `bg-badge-provisional-bg`, `text-badge-provisional-text`, `Clock` icon before the label |
| `taxonomy` | background and text as inline styles from data (below); level 1 renders the background at 92% and level 2 at 85% (`color-mix(in srgb, <color> 92%|85%, transparent)`), the label fully opaque |

The taxonomy variant's inline styles are the **sole** permitted inline colors in `src/`, because they are data: `style={{ backgroundColor: … }}` from the taxonomy `color` and `style={{ color: … }}` chosen by the WCAG 2.2 relative luminance `L` of that color — white when `L ≤ 0.179`, black above. That threshold always picks the better pair, so the label never drops below 4.58:1 (spec: "Badge label contrast"). `color-guard.test.ts` scans literals; runtime values from the API stay out of its scope and the badge tests assert the computed pairs.

`Check` already exists in `src/shared/ui/icons.ts`; `Clock` joins that entry point (and only there — `icons.test.ts` enforces the single lucide import site).

Variants map through plain class records, as `Button` does. The shadcn badge is the base but its `class-variance-authority` import is replaced by that record pattern, so the change adds no dependency. Rejected: adopting `class-variance-authority` — it would be a new dependency for two small components, and dependencies need explicit approval.

### D8 — OfferingCard (`src/entities/offering`) and the rating rule

`ui/OfferingCard.tsx` fills `Card` per the mapping table of D4: `CardAside` with the score and rating badge, `CardContent` with the status badge, the coffee name in `type-card-heading`, the coffeeshop and roaster captions in `type-label`, the origin line in `type-meta`, and the taxonomy rows, and `CardFooter` with both counts in `type-meta` and the two links (the `base-controls` Link treatment, `focus-visible:focus-ring` on every control per the summary §6). All labels, captions and link texts arrive as props. The taxonomy rows of D4 wrap: each row carries `flex-wrap`, so no row overflows the card below `md` (spec "Rows by level").

`lib/rating.ts` holds the range rule the summary fixes here: `ratingTierFor(score)` parses the decimal string and returns `rating-exceptional` at ≥ 90, `rating-excellent` at ≥ 85, `rating-good` at ≥ 80, `rating-commercial` below. When `cuppingAvg` is absent or unparsable it returns `null` and the card shows no score and no rating badge (spec: "No score"), the rest of the card rendering normally.

The card receives the session as a prop of the `Session` type from `@/shared/api` — the `add-app-shell` D3 input pattern — and renders the Evaluate link exactly when the session's user role is `specialist` (`SessionUser` fields are optional in the contract, so the role is read defensively). No file imports `@/features/auth`; the tests drive the decision with `Session` fixtures. The View link always renders. Both hrefs are built from the route locale and the offering `ulid` as in the mapping table.

### D9 — The verified-offerings block (`src/widgets/offering-list`)

Per the D4 rule both reads happen on the server. `ui/VerifiedOfferings.tsx` is a thin async Server Component: it awaits `fetchVerifiedOfferings(page)` and `fetchTaxonomies()`, builds the taxonomy lookup of D5, maps a failure of either request into the error result, and delegates every branch to the sync presentation component — it holds no rendering logic of its own (the testing rule: async Server Components are untestable in Vitest).

`api/offerings.ts` holds exactly two calls over plain `fetch` against `NEXT_PUBLIC_API_URL` — `fetchVerifiedOfferings(page)` for `GET /offerings?verified=1&page={page}` and `fetchTaxonomies()` for `GET /taxonomies` — returning the typed payloads and throwing on any non-2xx or transport failure. `lib/resolve-taxonomies.ts` builds the lookup of D5 and picks the name by the locale the block receives.

`ui/OfferingList.tsx` (sync, testable) renders the whole presentation from its result: one `OfferingCard` per item on success (passing the `session` prop of D8 through), the centered empty message on an empty page, the error message with the retry action on a failure (D4), and the Previous/Next pagination of the settled behaviour. The loading state is the skeleton cards of `ui/OfferingSkeletonCard.tsx`, rendered as the `Suspense` fallback around `VerifiedOfferings` by the home screen (D10).

The two interactions are small Client Components (`"use client"` — event handlers): `ui/OfferingPagination.tsx` renders the Previous/Next buttons — disabled at `meta.current_page === 1` and at `meta.current_page === meta.last_page` — whose activation pushes `/{locale}?page={n}` with `useRouter`; `ui/RetryButton.tsx` renders the retry action, whose activation calls `router.refresh()` so the Server Components re-run their data requests (`01-app/03-api-reference/04-functions/use-router.md`). The block's root element carries `id="offerings"`, the scroll target of the hero action.

Rejected: fetching on the client — the D4 rule places public reads on the server and the paging state lives in the URL, so the list needs no client fetch state at all.

### D10 — Screens, routes and the client boundary

- `app/[locale]/about/page.tsx` (route file, FSD layer `app`): awaits `params` and renders the about screen with the route's locale. Nothing else — the route rule and `01-app/03-api-reference/03-file-conventions/page.md`.
- `app/[locale]/page.tsx` (`add-app-shell`'s route file) is extended minimally: it awaits `params` and `searchParams` and passes the route's locale and the requested page to the home screen — the documented `page` props (`01-app/03-api-reference/03-file-conventions/page.md`). It gains no other logic.
- `src/pages/home/ui/HomeScreen.tsx` (modified) reads the `landing` catalog for the route's locale through `src/shared/lib/i18n/messages.ts` — the mechanism of `add-app-shell`'s D10 — and composes `HomeHero` beside the offerings block, passing every text down as props. It also holds the single session supply expression in the `add-app-shell` D3 pattern: an anonymous `Session` constant today, so `app/[locale]/page.tsx` needs no session wiring; the link stays hidden in this change; `add-specialist-evaluations` makes it session-aware on the client, because the session lives in the browser and cannot reach this server-side constant. It wraps `VerifiedOfferings` in a `Suspense` boundary whose fallback is the skeleton cards of D9. It stays a thin composition.
- `src/pages/home/ui/HomeHero.tsx` (sync, testable): eyebrow, the three-part heading of D11, paragraph, `ExploreButton`, the two registration links (`base-controls` Link) and the photograph of D12.
- `src/pages/home/ui/ExploreButton.tsx` (`"use client"`): the primary Button whose activation scrolls the offerings list into view with `document.getElementById("offerings")?.scrollIntoView({ behavior: "smooth", block: "start" })` — an event handler, hence a Client Component.
- `src/pages/about/ui/AboutScreen.tsx` (thin, async): reads the same catalog and renders `AboutContent`.
- `src/pages/about/ui/AboutContent.tsx` (sync, testable): the five sections of the summary §5 in order with alternating backgrounds starting at `bg-surface-page` on the hero section and switching to `bg-surface-section` and back per section, the three evaluation cards (shared Card), the two registration links, and the closing `ExploreButton`.
- `src/pages/about/ui/ExploreButton.tsx` (`"use client"`): the closing primary Button; its activation navigates with `useRouter().push(\`/${locale}\`)` (`01-app/03-api-reference/04-functions/use-router.md`, whose documented example is a button pushing a route).

Rejected for the closing action: wrapping the Button in a link (an interactive control inside an anchor is invalid) and duplicating the button classes onto an anchor (it would fork the `base-controls` treatment).

### D11 — Texts: the `landing` catalog

`messages/es/landing.json`, `messages/en/landing.json`, `messages/ca/landing.json` — this change's own area files, touching no other change's catalog (`add-app-shell` D10). The three catalogs carry one identical key set (enforced by the message-catalog guard).

Copy process (summary §5.6): the developer writes the copy in Spanish from the summary's quoted outlines and translates it to English and Catalan. The heading is translated per locale like every other text (product owner, 2026-10-04); the one fixed text is its Spanish form, exactly `Tu café, el que merece cada sorbo` (spec: "Settled Spanish heading"). The heading renders as three parts so one word can take `text-text-accent`: before, the emphasized word, after — in Spanish `Tu café, el que ` / `merece` / ` cada sorbo`. The emphasized word `merece` is this design's assumption (the summary fixes the sentence but not the emphasis); English and Catalan are written as their translations with exactly one emphasized word each. Correctable in artifact review without any behaviour change.

The catalogs cover, from the summary's outlines: the entry eyebrow ("THE GUIDE TO GOOD COFFEE"), the heading parts, the introduction paragraph (SCA-based objective evaluations), the explore action ("Explore coffees"), the two registration links ("Register your coffeeshop", "Register as a specialist"), the photograph's descriptive `alt`, the list's empty message and error message with the retry action, the Previous/Next labels, the card's captions (coffeeshop, roaster), the count labels, the View and Evaluate link labels, the status badge labels (verified, provisional), the page's metadata description (D13), and the about copy ("OUR STORY" eyebrow, the story, the three evaluation steps, the audience section, the closing action). Components never read the catalog; screens pass these texts as props.

### D12 — Hero photograph

The build copies `docs/design/add-landing/coffee-beans.png` to `public/images/coffee-beans.png` byte-for-byte — the exact paths the product owner fixed on 2026-10-04. The photograph renders through `next/image`'s `Image` with its intrinsic width and height and the descriptive `alt` from the catalog, hidden below `md` and shown beside the hero text from `md` up (summary §1). If `docs/design/add-landing/coffee-beans.png` is missing when the asset task starts, the task stops and reports rather than substituting artwork.

### D13 — Files created or modified

Next.js route files are in the root `app/` folder and only import their screen from `src/pages/`. Tests live beside the file they test.

**Created**

| Path | FSD layer | Holds |
|---|---|---|
| `app/[locale]/about/page.tsx` | `app` | Route file: awaits `params`, renders the about screen |
| `app/layout.test.tsx` | `app` | The page metadata: title `Tazavera` and the description per locale (spec "Metadata by locale") |
| `src/pages/home/ui/HomeHero.tsx` | `pages` | Hero composition; texts as props |
| `src/pages/home/ui/HomeHero.test.tsx` | `pages` | Heading accent word, registration links, photograph visibility |
| `src/pages/home/ui/ExploreButton.tsx` | `pages` | `"use client"`: the explore action scrolling to the list |
| `src/pages/home/ui/ExploreButton.test.tsx` | `pages` | Scroll target and behaviour |
| `src/pages/about/index.ts` | `pages` | Public API of the about screen |
| `src/pages/about/ui/AboutScreen.tsx` | `pages` | Thin: loads the `landing` catalog, renders `AboutContent` |
| `src/pages/about/ui/AboutContent.tsx` | `pages` | The five sections; texts as props |
| `src/pages/about/ui/AboutContent.test.tsx` | `pages` | Section order and backgrounds, evaluation cards, links, closing action |
| `src/pages/about/ui/ExploreButton.tsx` | `pages` | `"use client"`: closing action opening the entry route |
| `src/pages/about/ui/ExploreButton.test.tsx` | `pages` | Navigation target |
| `src/widgets/offering-list/index.ts` | `widgets` | Public API of the block |
| `src/widgets/offering-list/ui/VerifiedOfferings.tsx` | `widgets` | Thin async Server Component: the two server fetches and the result mapping |
| `src/widgets/offering-list/ui/OfferingList.tsx` | `widgets` | Sync presentation: cards, empty and error states, pagination |
| `src/widgets/offering-list/ui/OfferingList.test.tsx` | `widgets` | Success, empty, error and retry cases with `Session` fixtures |
| `src/widgets/offering-list/ui/OfferingPagination.tsx` | `widgets` | `"use client"`: the Previous/Next buttons over the route's search params |
| `src/widgets/offering-list/ui/OfferingPagination.test.tsx` | `widgets` | Navigation targets and boundary disabling |
| `src/widgets/offering-list/ui/RetryButton.tsx` | `widgets` | `"use client"`: the retry action re-rendering the route |
| `src/widgets/offering-list/ui/OfferingSkeletonCard.tsx` | `widgets` | The loading placeholder card |
| `src/widgets/offering-list/ui/OfferingSkeletonCard.test.tsx` | `widgets` | The skeleton presentation of the loading state |
| `src/widgets/offering-list/api/offerings.ts` | `widgets` | The two public server fetches over plain `fetch` |
| `src/widgets/offering-list/api/offerings.test.ts` | `widgets` | URLs (`verified=1`, `page`), error propagation |
| `src/widgets/offering-list/lib/resolve-taxonomies.ts` | `widgets` | `ref` → localized name + color lookup |
| `src/widgets/offering-list/lib/resolve-taxonomies.test.ts` | `widgets` | Name by locale, nested `children`, unresolved `ref` |
| `src/entities/offering/index.ts` | `entities` | Public API of the offering entity |
| `src/entities/offering/ui/OfferingCard.tsx` | `entities` | The card filled with one offering |
| `src/entities/offering/ui/OfferingCard.test.tsx` | `entities` | Field mapping, origin line, badges, links, `Session` fixture cases |
| `src/entities/offering/lib/rating.ts` | `entities` | `RatingTier` and the score → tier rule |
| `src/entities/offering/lib/rating.test.ts` | `entities` | Tier boundaries and the absent score |
| `src/shared/ui/Card.tsx` | `shared` | Generic card regions (shadcn base, rewired) |
| `src/shared/ui/Card.test.tsx` | `shared` | Regions and the settled classes |
| `src/shared/ui/Badge.tsx` | `shared` | Badge families (shadcn base, rewired) |
| `src/shared/ui/Badge.test.tsx` | `shared` | Variant classes, icons, luminance pairs, depth opacity |
| `messages/es/landing.json` | `app` | Spanish texts |
| `messages/en/landing.json` | `app` | English texts |
| `messages/ca/landing.json` | `app` | Catalan texts |
| `public/images/coffee-beans.png` | `app` | Hero photograph (copied from `docs/design/add-landing/coffee-beans.png`) |

**Modified**

| Path | FSD layer | Change |
|---|---|---|
| `src/pages/home/ui/HomeScreen.tsx` | `pages` | The empty main area gains hero and list; the session supply expression and the `Suspense` fallback |
| `app/[locale]/page.tsx` | `app` | Passes the route's locale and the search-param page to the home screen |
| `app/layout.tsx` | `app` | The page metadata: the create-next-app title and description become `Tazavera` and the description from the `landing` catalog for the route's locale (es, en, ca) |
| `src/shared/ui/index.ts` | `shared` | Export the card parts and the badge |
| `src/shared/ui/index.test.tsx` | `shared` | The segment test renders the card and badge exports too |
| `src/shared/ui/icons.ts` | `shared` | `Clock` joins the entry (provisional badge) |
| `src/shared/ui/icons.test.ts` | `shared` | The icon expectations gain `Clock` |
| `src/shared/api/index.ts` | `shared` | The derived types of D2 join `add-app-shell`'s session types |
| `src/app/shell/AppShell.test.tsx` | `app` | The shell tests take a plain placeholder child instead of the home screen, and the main-area case asserts the child the main area holds |

Review round 3 (D14) creates no file. It changes files already listed above: `Card.tsx`, `Badge.tsx`, `OfferingCard.tsx`, `OfferingList.tsx`, `OfferingSkeletonCard.tsx`, `HomeScreen.tsx`, `HomeHero.tsx`, `AboutContent.tsx` and their tests.

`src/shared/api/schema.ts` is generated and is **not** modified. `contracts/openapi.yaml` is not touched. No other change's message catalog is touched.

### D14 — Page layout (review round 3)

The browser check showed the pages edge to edge, with no spacing and full-width cards: the earlier decisions never settled layout. Round 3 settles it. The values are end states, and the build picks the utilities; the default Tailwind spacing and container scales are allowed, since the guards cover only colours and radii.

- **Sections and container.** Every section of both screens spans the viewport with its background. Its content sits in a centered container at most 72rem wide (`max-w-6xl`), with 1rem side padding below `md` and 2rem from `md` up, and 3rem vertical padding below `md` and 4rem from `md` up. The container and section classes are one constant per screen file (`HomeScreen.tsx`, `AboutContent.tsx`). FSD forbids importing between `pages` slices, so the two files each hold their own copy. This duplication is the build's candidate for `docs/backlog.md` (a shared section primitive), not part of this change.
- **Entry page sections.** `HomeScreen` renders two sections: the hero on `bg-surface-page`, and the offerings block (the `Suspense` boundary and its fallback) on `bg-surface-section`. The block keeps `id="offerings"` as the scroll target.
- **Hero.** From `md` up, the hero is a two-column grid of equal columns with both columns vertically centered. In the text column, eyebrow, heading and paragraph are 1rem apart, with 1.5rem before the actions.
- **Link groups.** The two registration links (hero and About) form a wrapping row with a 1.5rem column gap and a 0.5rem row gap.
- **Offerings grid.** `OfferingList` renders its cards (and the skeleton fallback its cards) in a grid of one column, two from `md` and three from `xl`, with a 1.5rem gap. Grid items stretch, so the cards of a row share one height.
- **Card stacked layout.** `Card` gains a `layout` prop, `"default" | "stacked"`, defaulting to `"default"`, so existing consumers do not change. `"stacked"` keeps the parts stacked at every width: the side column's separator stays on its bottom edge, with none of the `lg` float or right border. In the stacked layout, the card is also a full-height column with the footer pushed to the bottom. The default layout stays a block, because its `lg` floats do not work inside a flex container. `CardAside`, `CardContent` and `CardFooter` read the layout from the card: a React context provided by `Card`, since the parts are siblings that the consumer composes. `OfferingCard` uses `layout="stacked"`, and its side column puts score, `/100` and rating badge on one row.
- **Rows and pagination.** The three taxonomy rows are stacked 0.5rem apart. Previous and Next are centered below the grid, 1rem apart. Both were found in the browser check of task 13.2.
- **Card footer.** Counts are 1rem apart. The View link, and Evaluate when shown, form a group at the end of the footer. The footer wraps.
- **Badge.** All variants are inline flex rows with the icon before the label, 0.25rem apart, with 0.5rem horizontal and 0.125rem vertical padding. The badge's base classes therefore grow beyond `type-badge rounded-field`.
- **About.** The three evaluation cards share the container width equally from `md` up.

## Risks / Trade-offs

- **This change cannot compile before `add-app-shell` is present.** Its imports are the surfaces of `add-app-shell`. → The only merge precondition is `develop` containing `add-app-shell` (product owner, 2026-10-04); the first task verifies every imported surface resolves before any feature work, so a missing merge fails immediately and loudly.
- **The session has no live source in this change.** The Evaluate link needs a session whose role is `specialist`, but nothing outside `add-auth` can produce one and this change imports no session module. → The `add-app-shell` D3 pattern: `HomeScreen` supplies an anonymous `Session` constant at one expression and the tests drive the decision with `Session` fixtures; the link stays hidden in this change; `add-specialist-evaluations` makes it session-aware on the client, because the session lives in the browser and cannot reach this server-side constant.
- **The contract and the generated types must stay frozen where `bff523c` left them.** A stray commit touching `contracts/openapi.yaml` or `src/shared/api/schema.ts` would silently change the data this change codes against. → Both files are not modified by any commit after `bff523c`, checked in tasks 1.1 and 8.1.
- **`page` is not a declared parameter.** It is only implied by the contract's pagination URLs. → It is the paginator's standard parameter and the settled pagination depends on it; if the API ever rejected it, paging would fail visibly in the list's error state rather than silently.
- **A taxonomy failure blocks the whole list** (recorded assumption in D4). → If the product owner prefers cards without badges over the error state, that is one correction to the block's error handling and touches no other decision.
- **The emphasized heading word is assumed (`merece`).** The summary fixes the Spanish sentence but not the emphasis. → Correctable in artifact review as copy; the three-part mechanism does not change.
- **The taxonomy colors are inline styles — the one exception to token-only colors.** → Confined to one variant of one component, asserted by its tests; `color-guard.test.ts` keeps guarding every literal.
- **The shadcn base arrives through the `add-app-shell` merge** (`cn` and the pulled-component conventions). → If its helpers differ at merge time, only D6/D7 composition changes; the settled look and behaviour do not.
- **`HomeScreen.tsx` and `app/[locale]/page.tsx` are touched by two changes.** `add-app-shell` created both and reserved the home screen's main area for this change (its design.md Open Questions). → Confined to those two files — the screen's content and the route file's `searchParams` pass; the shell, the proxy and the catalogs stay single-owner.

## Migration Plan

No data and no existing behaviour to migrate; the change adds two public pages and the shared card and badge.

1. The only merge precondition is `develop` containing `add-app-shell`. The §7 preconditions (`verified=1`, `nameCa`) are in the contract and the types since `bff523c`, and no commit touches `contracts/openapi.yaml` or `src/shared/api/schema.ts` after it.
2. The hero photograph source `docs/design/add-landing/coffee-beans.png` has been in the tree since `bff523c`; the asset task copies it to `public/images/`.
3. Rollback is reverting the change: the entry route returns to `add-app-shell`'s empty home screen and `/about` disappears; nothing outside the front end links to either route yet.

## Open Questions

None. The two copy-level unknowns (the emphasized word, the developer's final wording) are settled as recorded assumptions above and do not change the specs, the approach or the task breakdown.
