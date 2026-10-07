# Design — refine-list-pagination

## Context

See proposal.md (Why). The design source of truth is `docs/design/refine-list-pagination/design-summary.md` (approved; Open 1 answered A, Opens 2–3 closed) and the decisions log of `docs/general-context.md` (2026-10-07, "mapa del directorio con Leaflet y `perPage`").

Current state:

- `src/shared/ui/Pagination.tsx` (`extract-offering-list-parts` D3–D6) renders a `div` with Previous and Next (`Button variant="primary" size="base"`), `flex flex-wrap justify-center gap-4`. Props: `currentPage`, `lastPage`, `path`, `query?`, `texts: PaginationTexts` (`previousLabel`, `nextLabel`). Activation pushes `pageAddress(path, query, page)` through `useRouter` (Client Component).
- Hosts (all pass `PaginationTexts` through their own texts type):
  - landing: `src/widgets/offering-list/ui/OfferingList.tsx`, texts from `src/pages/home/ui/HomeScreen.tsx` (`landing` catalog keys `paginationPreviousLabel` / `paginationNextLabel`);
  - catalog (`feature/add-offering-catalog`): the same `OfferingList` with `path`/`query`, texts from `src/pages/offerings/ui/OfferingsScreen.tsx` (`landing` keys);
  - "My offerings" (`feature/add-offering-management`): `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx`, texts from `ManageOfferingsScreen.tsx` (`landing` keys);
  - "My evaluations" (`feature/add-specialist-evaluations`): `src/pages/evaluations-list/ui/EvaluationsList.tsx`, texts from `EvaluationsListScreen.tsx` (`evaluations` keys `previousLabel` / `nextLabel`); it renders the paginator only when `last_page > 1` (kept).
- Landing fetch: `fetchVerifiedOfferings(page)` in `src/widgets/offering-list/api/offerings.ts`; on `feature/add-offering-catalog` it delegates to `fetchOfferings({ verified: "1", page })`, which appends the query in key order.
- `src/shared/ui/icons.ts` exports `ChevronRight` but not `ChevronLeft`.

Constraint: three hosts live on unmerged branches. **This change's apply runs after `add-offering-catalog`, `add-offering-management` and `add-specialist-evaluations` are merged into `develop` and `develop` into `feature/refine-list-pagination`** (design summary §8), so the new required texts reach all four hosts in one change. File paths below are those of the merged tree.

Next.js: the only Next.js API involved is `useRouter` from `next/navigation`, already used by `Pagination`; its guide is `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`. No routing file changes.

## Goals / Non-Goals

**Goals:** the numbered, windowed paginator of design summary §2 for every host; the compact Previous/Next below `md`; the landing at 6 offerings per page (§5, Open 1 A).

**Non-Goals:** see proposal.md (Non-goals). Also: no new token, no new contrast pair, no change to `Button`, no page size for any other list.

## Decisions

### D1 — Derived and UI types (before any component)

No generated API type changes. `OfferingsPageMeta` and `EvaluationPageMeta` (`src/shared/api`) already carry `current_page` and `last_page`. `src/shared/ui/Pagination.tsx` declares:

```ts
export type PaginationTexts = {
  /** Accessible name of the navigation landmark. */
  navigationLabel: string;
  previousLabel: string;
  nextLabel: string;
  /** Accessible name of a page number; `{page}` is replaced by the number. */
  pageLabel: string;
};

/** One position of the number list and the widths it shows at (D3). */
export type PageSlot =
  | { kind: "page"; page: number; narrow: boolean; wide: boolean }
  | { kind: "ellipsis"; narrow: boolean; wide: boolean };
```

`PaginationProps` is unchanged apart from the wider `texts`. `PageSlot` and the pure function `pageSlots(currentPage: number, lastPage: number): PageSlot[]` are exported from `Pagination.tsx` for its tests; `src/shared/ui/index.ts` keeps exporting only `Pagination`, `PaginationProps` and `PaginationTexts`.

### D2 — Structure and focus order

`nav` root with `aria-label={texts.navigationLabel}` → Previous `Button` → `ul` of slots (each an `li`) → Next `Button`. DOM order is focus order. Numbers are `Button`s (`variant="action-3"`, `size="base"`) whose children are the digits and whose `aria-label` is `texts.pageLabel.replace("{page}", String(page))`. The ellipsis is a `span` with the text "…" and `aria-hidden="true"`, not focusable. The `ul` has no list marker and no padding.

Alternative rejected: numbers from the API's `meta.links` (English HTML-entity labels, API-host URLs, a 3-page window that does not fit 375px) — design summary §2.1.

### D3 — Page-number window: one list for both widths

The component renders on the server and client without knowing the viewport, so it renders **one ordered list of slots** that is the merge of the two windows, and hides by width the slots that belong to only one of them:

- narrow window (below `md`): first, last, current; wide window (from `md`): first, last, current − 1 … current + 1 (clamped to 1 … lastPage).
- Within each window, a gap of exactly one page between two shown pages shows that page; a gap of two or more shows one ellipsis right after the lower page.
- Merge: page slots are the union of both windows' pages in ascending order, each with `narrow` / `wide` set by membership. Ellipses of both windows that follow the same page are one slot with `narrow` and `wide` true; otherwise an ellipsis is its own slot placed right after the page it follows (before any page shown only at the other width).
- A slot with `narrow: false` is hidden below `md`; a slot with `wide: false` is hidden from `md`. Hidden by `display: none`, so it leaves the accessibility tree and the focus order at that width.

Worked results (`lastPage` 20), as `pageSlots` returns them (n = narrow only, w = wide only, unmarked = both):

| current | slots |
|---|---|
| 1 | `1`, `…`(n), `2`(w), `…`(w), `20` — read: narrow `1 … 20`, wide `1 2 … 20` |
| 3 | `1`, `2`, `3`, `…`(n), `4`(w), `…`(w), `20` — narrow `1 2 3 … 20`, wide `1 2 3 4 … 20` |
| 4 | `1`, `…`(n), `2`(w), `3`(w), `4`, `…`(n), `5`(w), `…`(w), `20` — narrow `1 … 4 … 20`, wide `1 2 3 4 5 … 20` |
| 10 | `1`, `…`, `9`(w), `10`, `11`(w), `…`, `20` — narrow `1 … 10 … 20`, wide `1 … 9 10 11 … 20` |
| 20 | `1`, `…`, `19`(w), `20` — narrow `1 … 20`, wide `1 … 19 20` |

`lastPage` 1 → one slot `1`; `lastPage` 3 → `1 2 3` at both widths, no ellipsis. `currentPage` outside 1 … `lastPage` is not handled (the hosts' `meta` fallbacks keep it inside).

Alternative rejected: two separate lists toggled by width (duplicate buttons in the DOM, duplicate names in jsdom queries).

### D4 — Activation

A number other than the current one calls `router.push(pageAddress(path, query, page))`, the same function as Previous/Next (content-structure "Pagination"; `extract-offering-list-parts` D4). The current number carries `aria-current="page"`, is never `disabled`, and its click pushes nothing.

### D5 — Treatments (design summary §2.4)

| Part | Treatment |
|---|---|
| Previous / Next | `Button variant="primary" size="base"`, unchanged at rest, hover, disabled and focus |
| Page number, rest / hover / focus | `Button variant="action-3"` as it is (`bg-action-3-bg`, `text-action-3-text`, `border-action-3-border`; hover `action-3-bg-hover` / `action-3-text-hover`; `focus-visible:focus-ring`) |
| Current page number | `action-3-bg-hover` background and `action-3-text-hover` text at rest, `action-3-border` border, so hovering changes nothing |
| Ellipsis | `text-text-primary`, no background or border |

All pairs are already registered in `src/app/styles/theme-tokens.test.ts` (design summary §3): no new token and no new guard pair.

### D6 — Geometry and spacing (design summary §4)

- `nav`: `flex`, wraps, centred, items centred vertically; gap 0.25rem below `md`, 0.5rem from `md`.
- `ul`: inline flex row, same gaps as `nav`.
- Page number: 2.5rem tall, at least 2.5rem wide, 0.75rem horizontal padding, digits centred; radius and border from `Button`.
- Ellipsis: 1.5rem wide, 2.5rem tall, centred.
- Previous / Next below `md`: a 2.5rem square with the chevron (`ChevronLeft` / `ChevronRight`, from `src/shared/ui/icons.ts`, `aria-hidden`) and the label kept in the DOM but visually hidden, so the accessible name is the label at every width; from `md`: `Button` base geometry (`h-10 px-4`) with the visible label and the chevron hidden.
- On landing the paginator stays 2rem below the grid (`OfferingList` `gap-8`, unchanged).

The exact classes are the build's choice; its tests assert the classes it chose.

### D7 — Texts

New catalog keys (design summary §6), passed through `PaginationTexts`:

| Catalog | Key | es | en | ca |
|---|---|---|---|---|
| `landing` | `paginationNavigationLabel` | Paginación | Pagination | Paginació |
| `landing` | `paginationPageLabel` | Página {page} | Page {page} | Pàgina {page} |
| `evaluations` | `paginationNavigationLabel` | Paginación | Pagination | Paginació |
| `evaluations` | `paginationPageLabel` | Página {page} | Page {page} | Pàgina {page} |

Mapping in each screen: `navigationLabel ← paginationNavigationLabel`, `pageLabel ← paginationPageLabel`, from `landing` in `HomeScreen`, `OfferingsScreen` and `ManageOfferingsScreen`, and from `evaluations` in `EvaluationsListScreen`.

### D8 — Landing page size (design summary §5, Open 1 A)

`fetchVerifiedOfferings(page)` requests `GET {NEXT_PUBLIC_API_URL}/offerings?verified=1&page={page}&perPage=6` (key order `verified`, `page`, `perPage`), through `fetchOfferings` with a module constant `LANDING_PAGE_SIZE = 6`. It applies at every width (server render; the API page is fixed). `meta.current_page` / `meta.last_page` then reflect pages of 6. Grid, skeleton fallback (3 cards) and states are unchanged. `perPage` is not in `contracts/openapi.yaml`: it is accepted by the API (standard 15, maximum 50) and communicated by Product owner (decisions log 2026-10-07); the API's `links` URLs drop it, which does not matter because the numbers come from `current_page` / `last_page` (D2). No other list sends `perPage`.

### D9 — API endpoints consumed and error presentation

| Operation | Method, path | Auth | Request | Response used | Errors |
|---|---|---|---|---|---|
| `listOfferings` (landing) | `GET /offerings` | none | `verified=1`, `page`, `perPage=6` | `data`, `meta.current_page`, `meta.last_page` | any non-2xx or transport failure → the list's existing error message with retry (landing "Error and retry"); unchanged |
| `listOfferings` (catalog, "My offerings") | `GET /offerings` | none | unchanged | `meta.current_page`, `meta.last_page` | unchanged |
| `listMyEvaluations` ("My evaluations") | `GET /user/evaluations` | as today | unchanged | `meta.current_page`, `meta.last_page` | unchanged |

The paginator itself makes no request and shows no error: it renders only under a successful, non-empty list. Contract gap (reported in the design summary §7, not adapted): `listOfferings` documents no `page` parameter although the API honours it.

### D10 — Files

| File | FSD layer | Change |
|---|---|---|
| `src/shared/ui/icons.ts` | shared | export `ChevronLeft` |
| `src/shared/ui/Pagination.tsx` | shared | D1–D6 |
| `src/shared/ui/Pagination.test.tsx` | shared | new cases; `TEXTS` gains two keys; layout case rewritten |
| `src/shared/ui/index.test.tsx` | shared | the Pagination case passes the four texts |
| `src/widgets/offering-list/api/offerings.ts` (+ test) | widgets | D8 |
| `src/widgets/offering-list/ui/OfferingList.test.tsx` | widgets | `TEXTS` gains two keys |
| `src/pages/home/ui/HomeScreen.tsx` (+ test) | pages | two text mappings |
| `src/pages/offerings/ui/OfferingsScreen.tsx` (+ test) | pages | two text mappings |
| `src/pages/manage-offerings/ui/ManageOfferingsScreen.tsx`, `ManageOfferingsPanel.test.tsx` | pages | two text mappings; `TEXTS` gains two keys |
| `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx`, `EvaluationsList.test.tsx` | pages | two text mappings; `TEXTS` gains two keys |
| `messages/{es,en,ca}/landing.json`, `messages/{es,en,ca}/evaluations.json` | — | D7 keys |

No route file, no new slice, no import across slices (`Pagination` stays in `@/shared/ui`).

## Risks / Trade-offs

- [`Button` appends `className` after its variant and geometry classes without merging] → the current number's fill (D5), the numbers' `px-3`-style padding and the square Previous/Next below `md` (D6) override classes `Button` already sets. A same-property utility does not win by its position in `class`; the build must use utilities that the generated CSS orders after `Button`'s (for example width-prefixed or state-prefixed ones) and confirm the result in the captures. If no override is reliable without changing `Button`, stop and report it (a `base-controls` change, not this one).
- [Three-digit page numbers widen a slot] → the `nav` wraps as a fallback (design summary §4); the spec's 375px fit is stated up to 99 pages.
- [Apply before the three host branches merge] → the new required texts would break their type check at merge. Mitigated by the order in Context; task 1.1 checks it first.
- [The landing loses 9 offerings per page compared with today] → accepted by Product owner (request 1); the numbered pages and the header's "Offerings" entry reach the rest.
- [`perPage` is undocumented in the contract] → accepted by Product owner (decisions log); if Scribe later documents it under another name, the one constant and the one query key change.
