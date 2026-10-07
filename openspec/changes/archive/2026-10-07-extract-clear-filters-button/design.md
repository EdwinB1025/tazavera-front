# Design

Sources: `docs/design/extract-clear-filters-button/design-summary.md` (approved; Open 1 closed as option (b)); backlog R9; `openspec/specs/filtering/spec.md`; the code merged by `add-offering-facets` on `develop` (`8f1e416`).

## Context

See proposal.md (Why). Current state on `develop`:

- `src/features/offering-facets/ui/ClearFiltersButton.tsx` (`"use client"`) takes one prop, `label`. It renders `Button` `variant="primary"`, default size, `type="button"`, with `label` as children, and on click calls `navigateTo(clearFiltersHref(pathname ?? "", new URLSearchParams(searchParams?.toString()), OFFERING_SORT_KEYS))`, where `navigateTo` comes from `useFilterNavigation()` (`router.push(href, { scroll: false })`) and `OFFERING_SORT_KEYS = ["orderBy", "orderDirection"] as const` (`src/features/offering-facets/ui/OfferingFacets.tsx`).
- Its only consumer is `src/pages/offerings/ui/OfferingsScreen.tsx`: `emptyAction={filtered ? <ClearFiltersButton label={filters.clearAll} /> : undefined}`.
- Its test, `src/features/offering-facets/ui/ClearFiltersButton.test.tsx`, has one case: on `/es/offerings?process=washed&orderBy=cupping_avg&orderDirection=desc&page=2` the button named "Clear all" carries `focus-visible:focus-ring` and its click calls `push("/es/offerings?orderBy=cupping_avg&orderDirection=desc", { scroll: false })`.
- The behaviour matches design-summary §0.2–0.3 (primary button, `filters.clearAll`, sort keys kept, `page` dropped, `push` with `scroll: false`). The one difference is the interface: the kept keys are fixed inside the component instead of passed in. That is the difference this refactor removes, not a behaviour change, so the propose continues (design-summary §3, last paragraph).
- `add-evaluation-facets` and `add-public-evaluations` have no code yet; their artifacts still plan `ClearEvaluationFiltersButton`. `extract-filtered-offerings` (R12) has no code yet.

## Goals / Non-Goals

**Goals:**
- One business-agnostic "Clear all" button in `src/shared/ui` with the current behaviour, the kept keys and the text passed by the host.
- The catalog host uses it; the feature copy and its export are gone.

**Non-Goals:**
- No change to `clearFiltersHref`, `useFilterNavigation`, the panel's "Clear all", the `emptyAction` slot or its layout, or the kept keys.
- No edit to the artifacts of other changes (proposal.md, Out of scope).

## API

None. The change consumes no endpoint and presents no API error. No derived or UI type beyond the component's props (D2).

## Files

| Path | FSD layer | Status | Content |
|---|---|---|---|
| `src/shared/ui/ClearFiltersButton.tsx` | shared | New | The shared button (D1–D3) |
| `src/shared/ui/ClearFiltersButton.test.tsx` | shared | New | The moved and added cases (D5) |
| `src/shared/ui/index.ts` | shared | Modified | Exports `ClearFiltersButton` and `ClearFiltersButtonProps` |
| `src/pages/offerings/ui/OfferingsScreen.tsx` | pages | Modified | Imports the button from `@/shared/ui`; passes `label` and `keep` (D4) |
| `src/pages/offerings/ui/OfferingsScreen.test.tsx` | pages | Modified | The filtered-empty case asserts the action's type, label and kept keys (D5) |
| `src/features/offering-facets/ui/ClearFiltersButton.tsx` | features | Removed | — |
| `src/features/offering-facets/ui/ClearFiltersButton.test.tsx` | features | Removed | Its case lives in the shared test (D5) |
| `src/features/offering-facets/index.ts` | features | Modified | Drops the `ClearFiltersButton` and `ClearFiltersButtonProps` export lines |

No route file under `app/` changes.

## Decisions

### D1 — Placement: `src/shared/ui`

The button holds no business data: the text and the kept keys come from the host. It goes to `src/shared/ui` (backlog R9; fsd-architecture skill, "generic part"), exported from the segment entry `@/shared/ui`. It imports `clearFiltersHref` and `useFilterNavigation` from `@/shared/lib/filter-query` (a `shared` segment importing another `shared` segment, as `Sidebar.tsx` already imports `@/shared/lib/hooks`) and `Button` from `./Button` (as `RetryButton` does).

Alternative: keep one copy per feature slice. Rejected: it is the duplication R9 removes. Alternative: a widget. Rejected: the button combines no features or entities.

### D2 — Props: `label` and `keep`

```ts
export type ClearFiltersButtonProps = {
  /** The visible text and accessible name (the host's `filters.clearAll`). */
  label: string;
  /** The query keys that survive; passed to `clearFiltersHref` unchanged. */
  keep: readonly string[];
};
```

Declared before the component. `keep` mirrors the settled helper `clearFiltersHref(pathname, current, keep)`. A "facet keys to drop" prop (the backlog's wording) would need a second helper and would keep unknown keys that `clearFiltersHref` drops today, which changes behaviour (design-summary §2.1). Both props are serializable, so a Server Component host passes them directly.

### D3 — Render and activation

- `"use client"` as the first statement (hooks and a click handler; `client-boundary.test.ts`).
- Renders exactly one `Button` with `type="button"`, `variant="primary"` and the default size, children `label`; no icon, no class of its own, no wrapper. States (rest, hover, focus-visible ring, active) are `Button`'s own; no disabled state.
- On click: `navigateTo(clearFiltersHref(pathname ?? "", new URLSearchParams(searchParams?.toString()), keep))`, with `navigateTo` from `useFilterNavigation()` and `pathname` / `searchParams` from `usePathname()` / `useSearchParams()` of `next/navigation` — the current component's body with `OFFERING_SORT_KEYS` replaced by `keep`. Result: `router.push(href, { scroll: false })`.

### D4 — Catalog host wiring

`OfferingsScreen` renders, only while `filtered` is true as today, `<ClearFiltersButton label={filters.clearAll} keep={OFFERING_SORT_KEYS} />`, importing `ClearFiltersButton` from `@/shared/ui` and `OFFERING_SORT_KEYS` from `@/features/offering-facets` (a page importing a feature: allowed). `OFFERING_SORT_KEYS` is `["orderBy", "orderDirection"]`, the value design-summary §3 states, and the same constant the panel's own "Clear all" passes, so the two "Clear all" actions of the catalog cannot drift apart. Nothing else in the host changes.

### D5 — Tests

`src/shared/ui/ClearFiltersButton.test.tsx` imports from `@/shared/ui` (which also covers the export) and mocks `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) with the current path and query set per case. Cases:

1. Moved from the feature test, adapted to the props: with `label="Clear all"` and `keep={["orderBy", "orderDirection"]}` on `/es/offerings?process=washed&orderBy=cupping_avg&orderDirection=desc&page=2`, exactly one button named "Clear all" renders, its `type` attribute is `button`, its class contains `focus-visible:focus-ring`, and a click calls `push("/es/offerings?orderBy=cupping_avg&orderDirection=desc", { scroll: false })`.
2. With `keep={[]}` on `/es/manage/evaluations?status=open`, a click calls `push("/es/manage/evaluations", { scroll: false })`.

`OfferingsScreen.test.tsx`, case "shows the filtered empty message and Clear all when a filter is applied": besides `emptyAction` being defined, it asserts that `emptyAction.type` is `ClearFiltersButton` from `@/shared/ui`, `emptyAction.props.label` is `getMessages("filters", "es").clearAll` and `emptyAction.props.keep` equals `["orderBy", "orderDirection"]`. The case "keeps the catalog's empty message and no action with only a sort" stays unchanged.

Kept green unchanged: `OfferingList` `emptyAction` cases, `OfferingFacets.test.tsx` (the panel's "Clear all"), `filter-query.test.ts`, `src/shared/ui/index.test.tsx` (it renders a hand-picked set and gains nothing; the shared test imports through the entry), `client-boundary.test.ts`, `color-guard.test.ts`, `focus-guard.test.ts`, `radius-guard.test.ts`, `xss-guard.test.ts`. No host test mocks `@/features/offering-facets` today, so no mock moves.

## Risks / Trade-offs

- [R12 `extract-filtered-offerings` also edits the catalog's `emptyAction` wiring] → no hard order. Whichever merges second merges `develop` and keeps the other's edit: the `@/shared/ui` import and the `keep` prop replace the feature import wherever the wiring then lives (design-summary §5).
- [`add-evaluation-facets` and `add-public-evaluations` still plan `ClearEvaluationFiltersButton`] → each gets an artifact update before its apply so it renders `ClearFiltersButton` from `@/shared/ui` with `keep={["orderBy", "orderDirection"]}` and writes no copy (design-summary approval note; R9 Open 1 (b)). Not part of this change.
- [`add-coffeeshop-directory` would write a third copy if it applied first] → its apply waits for this change (design-summary §5).
- [Removing an export of `offering-facets`] → its only importer is switched in the same commit; `npx tsc --noEmit` and `npm run build` catch any missed one.

## Migration Plan

One branch, no data migration. Rollback is reverting the change's commits; the feature copy returns with them.
