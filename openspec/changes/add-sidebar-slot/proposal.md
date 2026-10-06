## Why

The approved `add-filter-controls` design puts the list facets in the shell sidebar, and `add-offering-management` puts its navigation entries there too, but today the sidebar is a management-only region the shell fills itself: a route cannot put its own content in it, it opens over the whole screen on every small-viewport visit (finding F1) and, once collapsed from `md`, nothing can expand it again (finding F2). This change, part 1 of 4 of `add-filter-controls`, gives the shell one mechanism through which a route supplies its sidebar, fixes F1 and F2, and makes the sidebar's entries usable as links with passing contrast, so the facet and management changes can build on it.

## What Changes

- A parallel route slot `app/[locale]/@sidebar/` lets a route supply its sidebar; its `default` and an optional catch-all render the shell's default sidebar, so a soft navigation away from a route with its own sidebar content clears it. `app/[locale]/default.tsx` keeps unknown paths a not-found page.
- The sidebar appears on the offerings list route (`/{locale}/offerings`) for every session state, with no navigation entries (its facets come in `add-offering-facets`), besides management routes for an authenticated user. Every other route keeps a single column.
- The sidebar state moves up to the shell: the shell knows whether the route in view has a sidebar, and shows a re-open control in the header only on such routes, while the sidebar is collapsed (from `md`) or closed (below `md`) (F2).
- Below `md` the sidebar is closed on arrival (F1); from `md` it is expanded on arrival.
- Sidebar entries: a link form for the entry control, the hover label switching to the navigation hover text colour, and the sidebar under the inverse scope so the focus ring passes on the sidebar surface (add-offering-management finding F2).
- Convention: a management area supplies its entries, and a list its controls, through the slot; the role-based entries seam of the shell (`add-specialist-evaluations` D5) keeps working beside it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: "Management sidebar" (where it appears, closed on arrival below `md`, content supplied by the route), "Shell layout and main area" (the sidebar column for any route that has a sidebar); new requirements for the sidebar re-open control and the sidebar entry presentation.

## Impact

- Routing: new `app/[locale]/@sidebar/default.tsx`, `app/[locale]/@sidebar/[[...rest]]/page.tsx`, `app/[locale]/@sidebar/offerings/page.tsx`, `app/[locale]/default.tsx`; `app/[locale]/layout.tsx` passes the slot to the shell.
- Code: `src/shared/ui/Sidebar.tsx` and `index.ts`, `src/widgets/app-sidebar`, `src/widgets/app-header` (a leading slot in the header), `src/app/shell/SessionShell.tsx` and `AppShell.tsx`, two new thin page slices `src/pages/default-sidebar` and `src/pages/offerings-sidebar`.
- No API operation, no dependency, no new token and no new catalog key (the re-open control reuses `shell.toggleSidebar`).
- Coordinates with `add-specialist-evaluations` (entries seam, `asChild`), `add-offering-facets` and `add-evaluation-facets` (slot content, `useSidebar`, sidebar id), `add-offering-management` (entries through the slot).

## Non-goals

- No facet controls, no facet sets, no "Filters" trigger in the page body, no sort select (`add-facet-controls`, `add-offering-facets`, `add-evaluation-facets`).
- No offerings list screen: `/{locale}/offerings` stays a not-found page until `add-offering-catalog` adds it.
- No management entries of any area, and no change to the sidebar's current-entry look beyond the hover label (filter-controls finding F3, second half, stays out).
- No change to the unused filter tokens (filter-controls finding F5) or the primary button boundary (F6).
