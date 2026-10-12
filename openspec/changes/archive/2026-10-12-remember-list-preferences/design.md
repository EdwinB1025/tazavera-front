# Design

## Context

See proposal.md (Why). Today the address is the only filter state of the editing lists (filtering spec, "Evaluation filter state in the URL" and "Inventory filter state in the URL"):

- My evaluations: the route page `app/[locale]/manage/evaluations/page.tsx` and its slot `app/[locale]/@sidebar/manage/evaluations/page.tsx` both receive the route's `searchParams` and pass them to `EvaluationsListScreen` and `EvaluationsSidebarScreen` (`src/pages/evaluations-list`), which parse them with `parseEvaluationFilters` (`src/features/evaluation-facets`). The list is read on the client, in an effect of `useEvaluationsPage`, once the session gate (`EvaluationsGate`) renders it for a signed-in specialist.
- Coffee inventory: the same pattern with `ManageInventoryScreen` and `ManageInventorySidebarScreen` (`src/pages/manage-inventory`) and `parseInventoryFilters` (`src/features/inventory-facets`); the read runs in `InventoryResults`, inside the `SessionGate` of `InventoryListClient`.
- Every user change of filters or order goes through `useFilterNavigation` (`src/shared/lib/filter-query`): the facets call `navigate` (each committed facet, a chip's removal, the sort of the toolbar) or `navigateTo` ("Clear all" of the panel); `ClearFiltersButton` (`src/shared/ui`, the empty state's "Clear all") calls `navigateTo`. `navigate` ends in `navigateTo`, which does `router.push(href, { scroll: false })`. `Pagination` pushes with its own router call.
- A soft navigation that changes only the query re-renders both the route page and the `@sidebar` slot on the server with the new `searchParams` (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md`); `router.replace` navigates without adding a history entry (`.../04-functions/use-router.md`).
- The session is read with `useSession()` (`src/features/auth`), called once by the app shell in `src/app/shell/SessionShell.tsx`. Both sign-out paths (`ShellChrome.handleSignOut`, `AccountClient` after deletion) settle the session to `anonymous` through `signOut`, and a session that cannot be restored settles to `anonymous` as well.
- Browser storage is used today only by `src/features/auth/model/flow.ts` (keys `tazavera.pending-flow`, `tazavera.signed-in`) and `src/shared/api/tokens.ts`; neither offers a reusable, failure-safe helper, and `shared` cannot import `features/auth`.

## Goals / Non-Goals

**Goals:** the requirements of the `filtering` delta, with no request added, removed or changed, and the list and its sidebar facets always reading the same address.

**Non-Goals:** the public lists, My offerings (it has nothing to keep), the page number, any user identifier in storage.

## Decisions

### D1. Tab storage with a silent fallback (`src/shared/lib/tab-storage.ts`, shared)

A new module with three functions over `sessionStorage`, each wrapped in `try`/`catch` so a missing `window`, a blocked storage, a quota error or any other exception falls back silently:

- `readTabValue(key: string): string | null`: the value, or `null` when absent or unreadable.
- `writeTabValue(key: string, value: string): void`: does nothing on failure.
- `removeTabValues(prefix: string): void`: removes every key that starts with `prefix`; does nothing on failure.

It knows nothing about lists. Alternative rejected: reusing auth's storage code; it lives in `features/auth`, throws on blocked storage and stores credentials-related records.

### D2. The list memory is written by the facet navigation inside a memory scope (`src/shared/lib/filter-query`, `src/shared/ui/FilterMemoryScope.tsx`)

`src/shared/lib/filter-query/index.ts` adds:

```ts
/** A list's memory: its storage name and the query keys it keeps. */
export type FilterMemory = { name: string; keys: readonly string[] };
export const FilterMemoryContext: React.Context<FilterMemory | null>;
/** The kept query of a list (`""` when none), read through D1. */
export function rememberedQuery(memory: FilterMemory): string;
/** Forgets every list's kept query (D4). */
export function forgetRememberedFilters(): void;
```

The storage key of a list is `tazavera.list-filters.<name>`; `forgetRememberedFilters` removes the prefix `tazavera.list-filters.` through `removeTabValues`. When `useFilterNavigation` runs inside a memory scope, `navigateTo(href)` first writes the href's query restricted to the memory's `keys`, in the href's order and never with `page`, then pushes as today. So every user apply (`navigate`), "Clear all" of the panel and of the empty state (`navigateTo`) and the removal of a chip writes the new state, and a cleared list writes `""` (or, on My evaluations, the sort pair "Clear all" keeps). Outside a scope (the public lists) nothing changes. Pagination, which does not use `navigateTo`, writes nothing, and an address opened from a link writes nothing.

`FilterMemoryScope` (`"use client"`, `src/shared/ui`) provides the context: props `name`, `keys`, `children`. The scope is needed twice per list because the route page and the `@sidebar` slot are separate trees: each list's two screens wrap their content in a scope with the same `name` and `keys`.

Alternatives rejected: writing from the address on every render of the list (an empty address after "Clear all" cannot be told from an opening from the menu, so a cleared list would restore again); a navigation flag in storage (one more stored value and a consumption race with double effects).

### D3. The restore replaces the address before the list's read (`src/shared/ui/RememberedFiltersGate.tsx`)

`RememberedFiltersGate` (`"use client"`, `src/shared/ui`; props `fallback: ReactNode`, `children: ReactNode`) reads the memory of the enclosing scope, `usePathname()` and `useSearchParams()` on every render. When the address carries none of the memory's `keys` and `rememberedQuery` is not `""`, the restore is pending: the gate renders `fallback` and an effect calls `router.replace(\`${pathname}?${kept}\`, { scroll: false })`; otherwise it renders `children`. The decision is recomputed from the current address and storage on every render, so the gate shows the list as soon as the replaced address arrives, whether or not the page segment remounts, and a cleared list (whose storage was written before its navigation) is never restored. Outside a scope it renders `children`.

The gate wraps only the part of the list that starts the read, inside the session gate, so it runs only on the client and before any read: in `EvaluationsListScreen` it wraps `EvaluationsList` (fallback `null`; the toolbar stays), in `InventoryListClient` it wraps `InventoryResults` (fallback `InventorySkeletonGrid`). An address with only `page` counts as carrying no key: the restore drops the page. The replace changes the opened history entry into the restored address, so no entry is added; both the page and the slot re-render with the restored `searchParams`, so the list, its toolbar and its facets read the same address, and the list's single read carries exactly the request of that address.

### D4. Forgetting with the session (`src/app/shell/forget-list-preferences.ts`, app)

`useForgetListPreferences(session: Session)` is called by `SessionShell` with the value of `useSession()` (not the test override). It keeps the `ulid` of the last authenticated user in a ref, in memory only. In an effect on the session: an `anonymous` session calls `forgetRememberedFilters()` and resets the ref; an `authenticated` session whose `ulid` differs from a non-null ref calls `forgetRememberedFilters()`; then the ref takes the current `ulid`. `loading` changes nothing. Both sign-out paths and an ended session reach `anonymous`, so no sign-out caller changes; the app layer is the lowest layer that may import both `features/auth` and `shared`.

### D5. The keys each list keeps (features) and the wiring (pages)

- `src/features/evaluation-facets/model/query.ts` exports `MY_EVALUATION_KEYS = ["status", "scoreMin", "scoreMax", "process", "city", "orderBy", "orderDirection"]` (the "mine" facet set and the sort pair); the slice's index exports it.
- `src/features/inventory-facets/model/query.ts` exports `INVENTORY_FILTER_KEYS` (the six keys of `INVENTORY_LIMITS`); the slice's index exports it.
- `EvaluationsListScreen` and `EvaluationsSidebarScreen` wrap their content in `FilterMemoryScope name="my-evaluations" keys={MY_EVALUATION_KEYS}`; `ManageInventoryScreen` and `ManageInventorySidebarScreen` (on the list only, when it has `searchParams`) in `FilterMemoryScope name="coffee-inventory" keys={INVENTORY_FILTER_KEYS}`. My offerings is not wired.

## Risks / Trade-offs

- [An account switch made in another tab and reaching this tab only through a reload is not detected, because no user identifier is stored (D4)] → Signing out in this tab, an ended session and a switch within the page load all forget; closing the tab forgets too.
- [During a restore the list's area shows its fallback for one navigation] → The fallback is the list's own loading state on Coffee inventory; on My evaluations the toolbar stays and the list's loading placeholder follows at once.
- [Stored values could be stale or tampered with] → They go through the same address parsing as a typed address: invalid values are dropped before the request.

## Migration Plan

None: nothing is stored before the change, and removing it leaves at most unused `sessionStorage` keys that die with the tab.
