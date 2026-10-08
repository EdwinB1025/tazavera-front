# Design

## Context

See proposal.md for the five AUT points. Findings that shape the approach:

- **Flavours.** `GET /offerings` items carry two trees: `sensoryTaxonomy`, one tree per CVA attribute (`fragrance`, `aroma`, `flavor`, `aftertaste`, `mouthfeel`, `main_tastes`, `defects`), and `cataConcordance`, the consensus grouped as `aromatics`, `main_tastes` and `defects`, which counts each evaluator once per note (docs/design/add-flavor-wheel/design-summary.md §2.1–2.2). The card resolves `sensoryTaxonomy` (`src/widgets/offering-list/lib/resolve-taxonomies.ts`, called from `ui/Offerings.tsx`; a copy in `src/pages/manage-offerings/lib/resolve-taxonomies.ts`, called from `ui/ManageOfferingsPanel.tsx`), so a note marked on several attributes renders once per attribute. That was already flagged in add-flavor-wheel's design summary ("the card reads `cataConcordance` and de-duplicates by ref").
- **Baseline data.** A provisional offering has fewer than five closed specialist evaluations, so the API returns empty `sensoryTaxonomy` and `cataConcordance` for it (contract example of `listOfferings`; add-offering-catalog handoff Q3). The baseline evaluation is read only by `GET /evaluations?evaluationType=baseline&offeringId=…` (`src/widgets/evaluation-sheet`), one request per offering. The list response has no baseline data.
- **Card actions.** Links inside cards: `OfferingCard` View (`src/entities/offering/ui/OfferingCard.tsx`), `EvaluateLink` (`src/features/evaluate-offering`), `CoffeeshopCard` View (`src/entities/coffeeshop/ui/CoffeeshopCard.tsx`) and the public row of `EvaluationRowCard` ("View", "View offering"; `src/widgets/evaluation-row/ui/EvaluationRowCard.tsx`). The map action (`ShowOnMapButton`) and the specialist row actions are already buttons. The project's button navigation is `Button` + `useRouter().push` (`src/pages/about/ui/ExploreButton.tsx`, `src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx`; `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`).
- **Back links.** Fixed routes in `src/pages/offering-detail/ui/OfferingDetailScreen.tsx` and `src/widgets/offering-detail/ui/OfferingDetailContent.tsx` (`/{locale}/offerings`), `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx` and `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.tsx` (`/{locale}/coffeeshops`), `src/pages/public-evaluation/ui/ViewScreen.tsx` (`/{locale}/evaluations`).
- **Header.** `PrimaryNav` hides below `md` (`src/widgets/app-header/ui/PrimaryNav.tsx`) and nothing replaces it. `UserMenu` presents its entries as `DropdownMenuItem asChild` over the shared `Link`, on the `nav` menu surface.
- **Pagination.** The server lists render inside `Suspense` boundaries without a key (`src/pages/home/ui/HomeScreen.tsx`, `src/widgets/offering-list/ui/FilteredOfferingsResults.tsx`, `src/pages/coffeeshops/ui/CoffeeshopsScreen.tsx`); the public evaluations list already keys its boundary by the query (`src/pages/public-evaluations/ui/ListScreen.tsx`).

## Goals / Non-Goals

**Goals:** the five points of proposal.md with the smallest code change, the API usage unchanged, the existing tests kept except the assertions the spec deltas change.

**Non-Goals:** the baseline fallback (Open question 1), caching reference reads (R30), merging the two `resolveTaxonomies` copies (reported as a backlog candidate), renaming `EvaluateLink`.

## Decisions

### D1. Card flavours from the CATA concordance, each reference once (point 1)

Both `resolveTaxonomies` copies take the offering instead of a node list — `resolveTaxonomies(offering: OfferingSummary, lookup: TaxonomyLookup): ResolvedTaxonomyBadge[]` — and walk `offering.cataConcordance ?? []` (all three groups, children included, in tree order), never `sensoryTaxonomy`. A reference already seen is skipped, so each value renders once with the level of its first occurrence; resolution, locale names, data colour, the level-to-row rule and the unresolved-reference rule stay as they are. `Offerings.tsx` and `ManageOfferingsPanel.tsx` pass the offering. An empty concordance yields no badge.

Alternatives: keep `sensoryTaxonomy` and de-duplicate across axes (rejected: the axes double-count and the concordance already condenses them, as the detail's wheel does); fetch the baseline per card (rejected: changes the API usage pattern; Open question 1).

### D2. A route button for card navigation (point 2)

New `src/shared/ui/RouteButton.tsx` (client), exported from `src/shared/ui/index.ts`: `RouteButton` takes `ButtonProps` without `onClick` and `type`, plus `href` with the in-application route type of `LinkProps["href"]`, and renders `Button` whose click calls `useRouter().push(href)`. It reuses `Button` whole (treatments, focus ring, disabled opacity). Card actions use the compact size `sm`, as the map action does. Treatments: View (offering, coffee shop, evaluation row) `action-3`, as the existing View/Edit of "My evaluations"; Evaluate `action-1`; View offering `action-4`.

Alternative: a link styled as a button (rejected: AUT 5 asks for the shared action button, and the project's button navigation is `Button` + `router.push`).

### D3. View moves from the offering card to its consumers (point 2)

The card cannot read the session (entities sit below features). `OfferingCard` renders no View; its footer group renders only `actions`, and `viewLabel` leaves `OfferingCardTexts` for `OfferingListTexts` and `ManageOfferingsTexts`. New `src/entities/offering/ui/OfferingViewButton.tsx` (`{ ulid, locale, label }`, a `RouteButton` to `/{locale}/offerings/{ulid}`, `action-3`, `sm`), exported from the slice. New `src/widgets/offering-list/ui/OfferingCardActions.tsx` (client) reads `useSession()` from `@/features/auth`: when authenticated it renders `OfferingViewButton`, then `EvaluateLink` (which keeps its own specialist rule); anonymous or loading it renders `EvaluateLink` only (which renders nothing). `OfferingList` passes it as each card's `actions`. "My offerings" is behind the coffeeshop gate, so `ManageOfferingsPanel` passes `OfferingViewButton` before `OfferingActions`.

### D4. Evaluate, coffee shop View and evaluation row actions (point 2)

`EvaluateLink` keeps its name and session rule and renders a `RouteButton` (`action-1`, `sm`) to the same route. `CoffeeshopCard` renders its View as a `RouteButton` (`action-3`, `sm`); the `actions` slot (map action) is unchanged. The public variant of `EvaluationRowCard` renders "View" (`action-3`) and "View offering" (`action-4`) as `RouteButton`s, `sm`, keeping the visible text plus the visually hidden suffix as their content, so the accessible names do not change.

### D5. Back from a navigation record (point 3)

New `src/shared/lib/navigation-history.ts`: a module store with `recordNavigation(url)`, `previousUrl()` and `usePreviousUrl()` (`useSyncExternalStore`, server snapshot `null`). Each recorded URL (path plus query) updates the store:

- same path as the current entry (only the query changed: tab, filter, page) → the current entry takes the new URL, the previous one stays;
- path equal to the current one except its first segment (language change) → the current entry takes the new URL and the previous entry's first segment becomes the new locale;
- otherwise → the current entry becomes the previous one and the new URL the current one.

New `src/app/shell/NavigationTracker.tsx` (client, renders nothing): `usePathname()` and `useSearchParams()` feed `recordNavigation` in an effect. `AppShell` mounts it inside `<Suspense fallback={null}>`, so reading the search params does not block prerendering (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md`).

New `src/shared/ui/BackLink.tsx` (client), exported from `src/shared/ui/index.ts`: `{ fallback, children }`, renders the shared `Link` with `variant="back"` and `href = usePreviousUrl() ?? fallback`. It stays a link, so it can be opened in a new tab; the first render (server and hydration) addresses the fallback.

### D6. Back links in scope and their fallbacks (point 3)

`BackLink` replaces the back `Link` of the offering detail (`OfferingDetailScreen.tsx`, `OfferingDetailContent.tsx`; fallback `/{locale}/offerings`), the coffee shop detail (`CoffeeshopDetailScreen.tsx`, `CoffeeshopDetailContent.tsx`; fallback `/{locale}/coffeeshops`) and the public evaluation view (`ViewScreen.tsx`; fallback `/{locale}/evaluations`). The fallback is today's fixed route. Out of scope, with fixed destinations: the evaluation form, the new-offering form and the not-found page. Labels unchanged (Open question 2).

### D7. Navigation menu on a small viewport (point 4)

The three entries move from `PrimaryNav` into `src/widgets/app-header/lib/nav-entries.ts` (`primaryNavEntries(locale, texts)`: path, query, label), read by `PrimaryNav` and by the new `src/widgets/app-header/ui/NavigationMenu.tsx` (client). `NavigationMenu` is a `DropdownMenu` like `UserMenu`: a ghost icon-only trigger with the `Menu` icon (new export of `src/shared/ui/icons.ts`), `aria-label` from the new `navigationMenu` text, the trigger classes of `UserMenu` with `md:hidden`; the content `align="start"` on the `nav` surface; one `DropdownMenuItem asChild` per entry over the shared `Link`, the current entry (path equal to `currentPath`) with `aria-current="page"`. `AppHeader` renders it in the left group, after the logotype. Texts: `AppHeaderTexts.navigationMenu`, mapped in `AppShell` from `shell.navigationMenu`: es "Menú de navegación", en "Navigation menu", ca "Menú de navegació".

### D8. Keyed list boundaries for the page change (point 5)

Cause: the list routes are dynamic and have no `loading.js`, so they are not prefetched and each page change is a server round trip (`node_modules/next/dist/docs/01-app/02-guides/prefetching.md`, "Prefetching static vs. dynamic routes"). `router.push` runs as a transition, and React keeps an already revealed `Suspense` boundary on its old content during a transition, so the previous page stays in view, with no feedback, until the API reads behind the new page have finished. Fix: key each list boundary by its request so a page change mounts a new boundary, which shows its skeleton at once: `HomeScreen` by the page, `FilteredOfferingsResults` and `CoffeeshopsScreen` by `JSON.stringify` of the request query, the precedent of the public evaluations list.

Not fixed (reported): the catalog's `@sidebar` slot renders `FilteredOfferingsFacets`, which awaits `GET /coffees` and `GET /taxonomies`, uncached, outside any boundary, so the catalog's navigation still waits for those two reads before the new page shows. Caching them is backlog R30. No live measurement is possible in the build's container (no API); the cause comes from the code and the Next.js guide above.

## Risks / Trade-offs

- [Back after a browser Back] The record follows URLs, not the history stack: after the browser's own Back, the back link points at the page just left. → Accepted: it is the page the user came from.
- [Previous page from another list] The coffee shop label "Volver a cafeterías" may lead elsewhere. → Open question 2.
- [Skeleton flash] Keyed boundaries show the skeleton on every query change, including a filter. → Intended by the spec ("Prompt page change"); the catalog keeps the facets visible.
- [Duplicated resolver] D1 edits both `resolveTaxonomies` copies. → Reported as a backlog candidate.

## Open Questions

1. Baseline fallback for an offering without consensus (proposal.md Propose status 1). The spec states no badge for now.
2. Coffee shop detail back label.
