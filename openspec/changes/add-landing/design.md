# Design

## Context

See `proposal.md` — Why, and `docs/design/add-landing/design-summary.md`, which settles the product decisions (the hero, the list and its states, the card regions, the badge families, the about sections, the copy process). This document works out the implementation and records what that left open. The constraints that shape the approach:

- `add-app-shell` and `add-auth` are built in parallel and own every surface this change consumes: `src/shared/lib/i18n/messages.ts` (its D10 area-catalog reader), `src/shared/config/locales.ts`, `src/shared/lib/utils.ts` (`cn`), the `app/[locale]/` routing whose `app/[locale]/page.tsx` already renders `src/pages/home/`, `src/shared/api/index.ts` and `src/shared/api/client.ts` (the request client of `add-auth`'s D2/D5), and `src/features/auth` (`useSession`, `add-auth`'s D1). This change imports all of it and never redefines it. `feature/add-app-shell` and `feature/add-auth` are merged into `feature/add-landing` before apply — the same precondition `add-auth`'s design established for its own merge.
- `contracts/openapi.yaml` is not touched. The design summary §7 preconditions are real gaps in the current contract: `GET /offerings` declares no `verified` parameter and `GET /taxonomies` returns no `nameCa`. The product owner updates the contract before apply. `page` is likewise undeclared as a parameter but is carried by the contract's own pagination URLs (`links`, `meta.links`), so the paginator's `page` is used as-is.
- Next 16 facts taken from `node_modules/next/dist/docs/` (resolved from the main worktree's install; this worktree has no `node_modules`): a `page` file renders a route and its dynamic segment arrives as `params` (`01-app/01-getting-started/03-layouts-and-pages.md`, `01-app/03-api-reference/03-file-conventions/page.md`); state, effects and event handlers require `"use client"` (`01-app/01-getting-started/05-server-and-client-components.md`); local images under `public/` render through `next/image`'s `Image` with `src`, `width`, `height` and `alt` (`01-app/01-getting-started/12-images.md`, `01-app/03-api-reference/02-components/image.md`); a client component navigates programmatically with `useRouter`'s `router.push(href)` (`01-app/03-api-reference/04-functions/use-router.md`).
- Breakpoints: `md` = 768px and `lg` = 1024px (Tailwind defaults; the summary's "Declared breakpoints: hero md, Card lg").
- The hero photograph: the product owner supplied `coffee-beans.png` in `docs/design/add-landing/` of the `tazavera-front` worktree on 2026-10-04 and said it may remain there. The build copies the bytes from wherever the product owner keeps that file.

## Goals / Non-Goals

**Goals:**

- Both public screens on the settled contracts, with no edit to the shell, the session, the request client or the generated schema.
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
| `src/shared/api/index.ts`, `src/shared/api/client.ts` | `add-auth` (D2, D5, D7) | the request client and the home of the derived types |
| `src/features/auth` (`useSession`) | `add-auth` (D1) | deciding whether the Evaluate link renders |

The first task verifies every one of these resolves under `npx tsc --noEmit` before any feature work, which is what proves the merges landed. Rejected: writing local shims for the missing surfaces — they would collide with the owning changes on the same files, exactly the outcome `add-auth`'s D3 rejected.

### D2 — Derived types, defined before any component

`src/shared/api/schema.ts` declares no named schemas, so everything derives from `operations`. Added to `src/shared/api/index.ts` beside `add-app-shell`'s session types, before any component:

```ts
import type { operations } from "./schema";

type ListOfferingsResponse =
  operations["listOfferings"]["responses"][200]["content"]["application/json"];
type ListTaxonomiesResponse =
  operations["listOlfactoryTaxonomies"]["responses"][200]["content"]["application/json"];

/** One item of `GET /offerings` `data`; every field is optional in the contract. */
export type OfferingSummary = ListOfferingsResponse["data"][number];

/** `meta` of the offerings pagination; the list reads `current_page` and `last_page`. */
export type OfferingsPageMeta = ListOfferingsResponse["meta"];

/** One node of an offering's `sensoryTaxonomy` tree: `ref`, `type`, `level`, `count`, `children`. */
export type OfferingTaxonomyNode = NonNullable<
  OfferingSummary["sensoryTaxonomy"]
>[number];

/** One node of `GET /taxonomies` `data`: `ulid`, `level`, `nameEs`, `nameEn`, `nameCa`, `color`, `children`. */
export type TaxonomyNode = ListTaxonomiesResponse["data"][number];
```

UI-specific types live beside their component, declared before it, exactly as `Button` does: `RatingTier` and the score rule in `src/entities/offering/lib/rating.ts`, `OfferingCardProps` (with its resolved taxonomy badge data) in the entity's card module, `BadgeProps` and `CardProps` in `src/shared/ui`. `src/shared/api/schema.ts` is left byte-for-byte untouched.

### D3 — Where the pieces live

- Full screens are the `pages` layer: `src/pages/home/` (the entry screen `add-app-shell` reserved for this change) and `src/pages/about/`. Their `ui/*Screen.tsx` files stay thin async wrappers that load the catalog and delegate to sync, testable components — the testing rule keeps untestable async components free of logic.
- The verified-offerings block is `src/widgets/offering-list/`: one self-contained block combining the offering entity with the shared controls (fsd-architecture question 2). Its `api/` segment holds the two requests, its `lib/` segment the taxonomy resolution. Rejected: fetching inside the page slices (pages are composition only) and a `taxonomy` entity (the taxonomy data has exactly one consumer; a second entity for one resolver is premature — if a later change needs taxonomy data elsewhere, the resolver lifts then).
- The offering entity is `src/entities/offering/`: the card that fills the shared Card and the rating rule the summary fixes in `lib/`. The session is never read here: entities may not import features, so the widget reads `useSession()` and passes a `canEvaluate` prop down.
- Card and Badge are `src/shared/ui` (the summary fixes it): generic, no business knowledge, re-exported from `src/shared/ui/index.ts`.

### D4 — API endpoints consumed, and how errors reach the user

**`GET {NEXT_PUBLIC_API_URL}/offerings`** — one page of verified offerings.

| | |
|---|---|
| Method and path | `GET /offerings` (`operations["listOfferings"]`) |
| Auth | None. The contract attaches no security scheme to this read; the request client sends no credential header on it (`add-auth` D5: "Public endpoints need no session") |
| Request | Query `verified=1` (design summary §7 precondition — absent from the current contract) and `page` (the paginator's parameter, carried by the contract's `links` and `meta.links` URLs). No body. `orderBy`/`orderDirection` and the filter parameters are not used. |
| Response `200` | `{ data: Offering[], links, meta }`. Per item the fields of the mapping table below. `meta` carries `current_page`, `from`, `last_page`, `path`, `per_page`, `to`, `total`. |
| Errors | Transport failure, or any non-2xx status (a `422` on an unexpected parameter, `5xx` from the API) |
| Presented to the user | The list's error state: one message from the `landing` catalog with the retry action. The API's error body and status are never rendered, whatever the failure |

**`GET {NEXT_PUBLIC_API_URL}/taxonomies`** — the olfactory taxonomy tree.

| | |
|---|---|
| Method and path | `GET /taxonomies` (`operations["listOlfactoryTaxonomies"]`) |
| Auth | None |
| Request | No parameters, no body |
| Response `200` | `{ data: TaxonomyNode[] }` — per node `ulid`, `level` (0–2), `nameEn`, `nameEs`, `nameCa` (design summary §7 precondition — absent from the current contract), `descriptionEn`, `descriptionEs`, `color` (a `#RRGGBB` string), `categories`, `children` |
| Errors | Transport failure or any non-2xx status |
| Presented to the user | Exactly like an offerings failure: the same list error state with the retry action, which refetches both requests. Recorded assumption: the taxonomy badges are essential card content, so the block does not degrade to badges-less cards; one error state covers both requests |

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

The block requests `GET /taxonomies` once per load and flattens the tree (children recursively; the tree is at most levels 0–2) into a lookup by `ulid`. Each `ref` of an offering's `sensoryTaxonomy` — including its `children` — resolves through that lookup: the label is `nameCa` for `ca`, `nameEs` for `es` and `nameEn` for `en`, the color is the node's `color`, and the row comes from the offering node's own `level`. A `ref` that finds no node renders no badge (spec: "Unresolved reference"). The lookup is built once and reused across pages; a retry rebuilds it.

Rejected: requesting taxonomies per card or per page — the summary settles "once", and the tree is a slow-moving vocabulary.

### D6 — Card (`src/shared/ui`, shadcn base)

Four generic parts — `Card`, `CardAside`, `CardContent`, `CardFooter` — with exactly the settled look: `bg-surface-card`, `rounded-container`, `border-l-4 border-border-accent`, `shadow-lg` on the card; `border-border-subtle` as the side column's separator. The parts render in the summary §2's order — side column, content, footer: beside the content the side column sits first (left in the row layout) and below `lg` (1024px) the parts stack in that same order. The separator border lies on the boundary between the side column and the content in both layouts, so it follows the layout edge (the build picks the border classes and its tests assert its choice). The parts compose with `cn`; the consumer fills them. The part order is this design's reading of the summary, which lists `CardAside` before `CardContent` in §2 and §4 and fixes the footer last; recorded in `## Propose status` as an assumption.

The shadcn card is the base and is rewired in the `add-app-shell` D6 manner: its classes are remapped to the settled tokens and it is re-exported from `src/shared/ui/index.ts`. Rejected: shipping the generated template untouched (its classes name primitives and default scales, which the guard tests refuse) and designing a container from scratch (the summary settles "shadcn base").

### D7 — Badge (`src/shared/ui`, shadcn base)

One `Badge` with the variant union `rating-exceptional | rating-excellent | rating-good | rating-commercial | verified | provisional | taxonomy`. All variants render `type-badge` and `rounded-field`:

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

`ui/OfferingCard.tsx` fills `Card` per the mapping table of D4: `CardAside` with the score and rating badge, `CardContent` with the status badge, the coffee name in `type-card-heading`, the coffeeshop and roaster captions in `type-label`, the origin line in `type-meta`, and the taxonomy rows, and `CardFooter` with both counts in `type-meta` and the two links (the `base-controls` Link treatment, `focus-visible:focus-ring` on every control per the summary §6). All labels, captions and link texts arrive as props.

`lib/rating.ts` holds the range rule the summary fixes here: `ratingTierFor(score)` parses the decimal string and returns `rating-exceptional` at ≥ 90, `rating-excellent` at ≥ 85, `rating-good` at ≥ 80, `rating-commercial` below. When `cuppingAvg` is absent or unparsable it returns `null` and the card shows no score and no rating badge (spec: "No score"), the rest of the card rendering normally.

The Evaluate link renders only on `canEvaluate: true`, which the consumer computes from the session — `state === "authenticated"` and `user.role === "specialist"` (`SessionUser` fields are optional in the contract, so the role is read defensively). The View link always renders. Both hrefs are built from the route locale and the offering `ulid` as in the mapping table.

### D9 — The verified-offerings block (`src/widgets/offering-list`)

`ui/OfferingList.tsx` is `"use client"`: it holds the fetch state, so the whole block is a Client Component (state, effects and event handlers — `01-app/01-getting-started/05-server-and-client-components.md`). On mount it requests the taxonomy tree and page 1; it renders skeleton cards while loading, the centered empty message on an empty page, the error message with the retry action on any failure (D4), and one `OfferingCard` per item on success with the Previous/Next buttons of the settled pagination. The block's root element carries `id="offerings"`, the scroll target of the hero action.

`api/offerings.ts` wraps the `add-auth` request client in exactly two calls — `fetchVerifiedOfferings(page)` for `GET /offerings?verified=1&page={page}` and `fetchTaxonomies()` for `GET /taxonomies` — returning the typed payloads and throwing on any non-2xx or transport failure; the wrapper follows the merged client's exact call shape.

`lib/resolve-taxonomies.ts` builds the lookup of D5 and picks the name by the locale prop the block receives. The session gate of D8 (`canEvaluate`) is computed in `ui/OfferingList.tsx` from `useSession()` and passed to every card.

Rejected: loading the list on the server and hydrating it — the retry and pagination interactions need client state anyway, and the pages are already dynamic (`add-app-shell` D9), so server loading would buy nothing.

### D10 — Screens, routes and the client boundary

- `app/[locale]/about/page.tsx` (route file, FSD layer `app`): awaits `params` and renders the about screen with the route's locale. Nothing else — the route rule and `01-app/03-api-reference/03-file-conventions/page.md`.
- `app/[locale]/page.tsx` stays `add-app-shell`'s route file and is not modified; it already renders `src/pages/home`.
- `src/pages/home/ui/HomeScreen.tsx` (modified) reads the `landing` catalog for the route's locale through `src/shared/lib/i18n/messages.ts` — the mechanism of `add-app-shell`'s D10 and the same call `add-auth`'s D6 makes for `auth` — and composes `HomeHero` and `OfferingList`, passing every text down as props. It stays a thin async composition.
- `src/pages/home/ui/HomeHero.tsx` (sync, testable): eyebrow, the three-part heading of D11, paragraph, `ExploreButton`, the two registration links (`base-controls` Link) and the photograph of D12.
- `src/pages/home/ui/ExploreButton.tsx` (`"use client"`): the primary Button whose activation scrolls the offerings list into view with `document.getElementById("offerings")?.scrollIntoView({ behavior: "smooth", block: "start" })` — an event handler, hence a Client Component.
- `src/pages/about/ui/AboutScreen.tsx` (thin, async): reads the same catalog and renders `AboutContent`.
- `src/pages/about/ui/AboutContent.tsx` (sync, testable): the five sections of the summary §5 in order with alternating backgrounds starting at `bg-surface-page` on the hero section and switching to `bg-surface-section` and back per section, the three evaluation cards (shared Card), the two registration links, and the closing `ExploreButton`.
- `src/pages/about/ui/ExploreButton.tsx` (`"use client"`): the closing primary Button; its activation navigates with `useRouter().push(\`/${locale}\`)` (`01-app/03-api-reference/04-functions/use-router.md`, whose documented example is a button pushing a route).

Rejected for the closing action: wrapping the Button in a link (an interactive control inside an anchor is invalid) and duplicating the button classes onto an anchor (it would fork the `base-controls` treatment).

### D11 — Texts: the `landing` catalog

`messages/es/landing.json`, `messages/en/landing.json`, `messages/ca/landing.json` — this change's own area files, touching no other change's catalog (`add-app-shell` D10). The three catalogs carry one identical key set (enforced by the message-catalog guard).

Copy process (summary §5.6): the developer writes the copy in Spanish from the summary's quoted outlines and translates it to English and Catalan. The one fixed text is the entry heading, in Spanish exactly `Tu café, el que merece cada sorbo` (spec: "Settled Spanish heading"). The heading renders as three parts so one word can take `text-text-accent`: before, the emphasized word, after — in Spanish `Tu café, el que ` / `merece` / ` cada sorbo`. The emphasized word `merece` is this design's assumption (the summary fixes the sentence but not the emphasis); English and Catalan are written as their translations with exactly one emphasized word each. Correctable in artifact review without any behaviour change.

The catalogs cover, from the summary's outlines: the entry eyebrow ("THE GUIDE TO GOOD COFFEE"), the heading parts, the introduction paragraph (SCA-based objective evaluations), the explore action ("Explore coffees"), the two registration links ("Register your coffeeshop", "Register as a specialist"), the photograph's descriptive `alt`, the list's empty message and error message with the retry action, the Previous/Next labels, the card's captions (coffeeshop, roaster), the count labels, the View and Evaluate link labels, the status badge labels (verified, provisional), and the about copy ("OUR STORY" eyebrow, the story, the three evaluation steps, the audience section, the closing action). Components never read the catalog; screens pass these texts as props.

### D12 — Hero photograph

`public/images/coffee-beans.png` is copied byte-for-byte from the product owner's `docs/design/add-landing/coffee-beans.png` (currently in the `tazavera-front` worktree; wherever it lives, that file is the source). It renders through `next/image`'s `Image` with its intrinsic width and height and the descriptive `alt` from the catalog, hidden below `md` and shown beside the hero text from `md` up (summary §1). If the source file is missing when the asset task starts, the task stops and reports rather than substituting artwork.

### D13 — Files created or modified

Next.js route files are in the root `app/` folder and only import their screen from `src/pages/`. Tests live beside the file they test.

**Created**

| Path | FSD layer | Holds |
|---|---|---|
| `app/[locale]/about/page.tsx` | `app` | Route file: awaits `params`, renders the about screen |
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
| `src/widgets/offering-list/ui/OfferingList.tsx` | `widgets` | `"use client"`: states, cards, pagination, session gate |
| `src/widgets/offering-list/ui/OfferingList.test.tsx` | `widgets` | Loading, empty, error, retry, paging, Evaluate gate |
| `src/widgets/offering-list/ui/OfferingSkeletonCard.tsx` | `widgets` | The loading placeholder card |
| `src/widgets/offering-list/api/offerings.ts` | `widgets` | The two requests over the `add-auth` client |
| `src/widgets/offering-list/api/offerings.test.ts` | `widgets` | URLs (`verified=1`, `page`), error propagation |
| `src/widgets/offering-list/lib/resolve-taxonomies.ts` | `widgets` | `ref` → localized name + color lookup |
| `src/widgets/offering-list/lib/resolve-taxonomies.test.ts` | `widgets` | Name by locale, nested `children`, unresolved `ref` |
| `src/entities/offering/index.ts` | `entities` | Public API of the offering entity |
| `src/entities/offering/ui/OfferingCard.tsx` | `entities` | The card filled with one offering |
| `src/entities/offering/ui/OfferingCard.test.tsx` | `entities` | Field mapping, origin line, badges, links, `canEvaluate` |
| `src/entities/offering/lib/rating.ts` | `entities` | `RatingTier` and the score → tier rule |
| `src/entities/offering/lib/rating.test.ts` | `entities` | Tier boundaries and the absent score |
| `src/shared/ui/Card.tsx` | `shared` | Generic card regions (shadcn base, rewired) |
| `src/shared/ui/Card.test.tsx` | `shared` | Regions and the settled classes |
| `src/shared/ui/Badge.tsx` | `shared` | Badge families (shadcn base, rewired) |
| `src/shared/ui/Badge.test.tsx` | `shared` | Variant classes, icons, luminance pairs, depth opacity |
| `messages/es/landing.json` | `app` | Spanish texts |
| `messages/en/landing.json` | `app` | English texts |
| `messages/ca/landing.json` | `app` | Catalan texts |
| `public/images/coffee-beans.png` | `app` | Hero photograph (copied from the product owner's file) |

**Modified**

| Path | FSD layer | Change |
|---|---|---|
| `src/pages/home/ui/HomeScreen.tsx` | `pages` | The empty main area gains the hero and the offerings block |
| `src/shared/ui/index.ts` | `shared` | Export the card parts and the badge |
| `src/shared/ui/index.test.tsx` | `shared` | The segment test renders the card and badge exports too |
| `src/shared/ui/icons.ts` | `shared` | `Clock` joins the entry (provisional badge) |
| `src/shared/ui/icons.test.ts` | `shared` | The icon expectations gain `Clock` |
| `src/shared/api/index.ts` | `shared` | The derived types of D2 join `add-app-shell`'s session types |

`src/shared/api/schema.ts` is generated and is **not** modified. `contracts/openapi.yaml` is not touched. No other change's message catalog is touched.

## Risks / Trade-offs

- **This change cannot compile before both merges.** Its imports are the surfaces of `add-app-shell` and `add-auth`. → The product owner merges before apply (stated during propose, the pattern `add-auth` set); the first task verifies every imported surface resolves before any feature work, so a missing merge fails immediately and loudly.
- **The two API preconditions are absent from the contract today.** `verified=1` and `nameCa` do not exist in `contracts/openapi.yaml` (verified 2026-10-04). → The contract update is a hard precondition of apply, recorded in `## Propose status` and the migration plan; the first task also verifies the regenerated `schema.ts` exposes both before the list work starts.
- **`page` is not a declared parameter.** It is only implied by the contract's pagination URLs. → It is the paginator's standard parameter and the settled pagination depends on it; if the API ever rejected it, paging would fail visibly in the list's error state rather than silently.
- **A taxonomy failure blocks the whole list** (recorded assumption in D4). → If the product owner prefers cards without badges over the error state, that is one correction to the block's error handling and touches no other decision.
- **The emphasized heading word is assumed (`merece`).** The summary fixes the Spanish sentence but not the emphasis. → Correctable in artifact review as copy; the three-part mechanism does not change.
- **The taxonomy colors are inline styles — the one exception to token-only colors.** → Confined to one variant of one component, asserted by its tests; `color-guard.test.ts` keeps guarding every literal.
- **The shadcn base arrives through the `add-app-shell` merge** (`cn` and the pulled-component conventions). → If its helpers differ at merge time, only D6/D7 composition changes; the settled look and behaviour do not.
- **`HomeScreen.tsx` is touched by two changes.** `add-app-shell` created it empty for this change (its design.md Open Questions). → Confined to that one file; the shell, the routing and the catalogs stay single-owner.

## Migration Plan

No data and no existing behaviour to migrate; the change adds two public pages and the shared card and badge.

1. `feature/add-app-shell` and `feature/add-auth` are merged into `feature/add-landing`, and the contract update (§7: `verified=1`, `nameCa`) plus the regenerated `schema.ts` are in place — all before apply.
2. `coffee-beans.png` is available at the product owner's `docs/design/add-landing/` before the asset task runs.
3. Rollback is reverting the change: the entry route returns to `add-app-shell`'s empty home screen and `/about` disappears; nothing outside the front end links to either route yet.

## Open Questions

None. The two copy-level unknowns (the emphasized word, the developer's final wording) are settled as recorded assumptions above and do not change the specs, the approach or the task breakdown.
