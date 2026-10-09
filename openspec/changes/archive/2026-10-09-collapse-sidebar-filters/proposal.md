Type: Refactor (fast lane)

# Proposal

## Why

Product owner's AUT pass found the list screens' filters shown as an always-open block in the sidebar beside its navigation. Product owner typed this AUT correction for the fast lane and decided (2026-10-09) that the filters become a collapsible sub-section of the sidebar entry of the list they filter, closed by default, opened by its own toggle or by the list toolbar's "Filters" button. It changes the sidebar by Product owner's decision.

## What Changes

- `shared/ui`: a sidebar sub-section part (`SidebarMenuSub`) built on the project's `Collapsible`: its header is the toggle (accessible name = the consumer's title, `aria-expanded`, the collapsible's `focus-visible:focus-ring`) with the sidebar entry's hover treatment, indented below its entry. Its open state lives in `SidebarProvider` (`subsectionOpen`, `setSubsectionOpen`), starts closed and closes again when the sub-section unmounts (a route change), so the toolbar trigger in the page body can open it.
- `app-sidebar` widget: `AppSidebar` takes `listEntry` (label and href of the list's own entry) and `subsection` (title and content). The sub-section nests under the list entry; on a management route whose role entries are shown, it nests under the current role entry instead (the role entry renders it through a shared outlet); with neither, it stands alone at the top of the sidebar content.
- `FiltersTrigger` (the toolbar's "Filters"): opens the sidebar and the sub-section. From `md` it shows while the sidebar is collapsed or the sub-section is closed; below `md` it always shows and opens the drawer with the sub-section open. `aria-expanded` reports both open.
- Screens:
  - Offerings list: entry "Explore offerings" (`shell.exploreOfferings`) to `/{locale}/offerings`, marked current, with the facets below it.
  - Coffee shop directory: entry "Explore coffee shops" (`shell.exploreCoffeeshops`, the header's label for the list) to `/{locale}/coffeeshops`, marked current, with the facets below it.
  - My evaluations (`/{locale}/manage/evaluations`): the facets nest under the existing "My evaluations" role entry.
  - Public evaluations and the coffee shop Offerings tab: no existing entry or entry label for these lists, so the sub-section stands alone (open question for Product owner).
  - The toggle's label is the filters heading (`filters.title`).
- Facets keep reading and writing the URL as today; a collapsed sub-section keeps its content mounted (inert), so applied filters, chips and "Clear all" are unchanged.

## Non-goals

- No new token, text or dependency; `Collapsible`, `FacetPanel` and the facets are unchanged.
- The header's user menu (edited by another session) and the header re-open control are unchanged.
- No change to the QA suite (`qa/`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: "Management sidebar" (the offerings list and coffee shop directory show their list's entry) and a new "Sidebar entry sub-section" requirement (collapsible, closed by default, opens on its toggle).
- `filtering`: a new "Sidebar facets sub-section" requirement (facets live in the sub-section; "Filters" opens it; filters keep applying while it is collapsed) and the three filter toolbar requirements (trigger shown while the sidebar is collapsed or the sub-section closed).

## Impact

- Code: `src/shared/ui/Sidebar.tsx`, new `src/shared/ui/SidebarMenuSub.tsx`, `src/shared/ui/FiltersTrigger.tsx`, `src/widgets/app-sidebar/ui/AppSidebar.tsx`, `src/features/manage-evaluations/ui/EvaluationsSidebarEntry.tsx`, the sidebar screens of offerings, coffee shops, coffee shop detail, public evaluations and my evaluations.
- Tests: `src/shared/ui/SidebarMenuSub.test.tsx` (new), `src/widgets/app-sidebar/ui/AppSidebar.test.tsx`, `src/shared/ui/FiltersTrigger.test.tsx`, `src/pages/coffeeshops/ui/CoffeeshopsSidebarScreen.test.tsx`, `src/pages/offerings-sidebar/ui/OfferingsSidebarScreen.test.tsx`.
- APIs, dependencies, tokens, texts: none.

## Propose status

- **Change-id:** collapse-sidebar-filters
- **Date:** 2026-10-09
- **`openspec validate collapse-sidebar-filters --strict`:** valid
- **Backlog entries resolved:** none (Product owner's AUT finding)
- **Resolved:**
  - Filters become a collapsible sub-section of the list's sidebar entry, closed by default (Product owner, 2026-10-09).
  - Screens: offerings list (under a new "Explore offerings" entry), coffee shop directory (under a new "Explore coffee shops" entry, the header's label), my evaluations (under the existing "My evaluations" entry); public evaluations and the coffee shop Offerings tab have no entry or entry label, so their sub-section stands alone.
  - "Filters" opens it: the toolbar trigger sets the sidebar open and the sub-section open through `SidebarProvider`; from `md` it now also shows while the sidebar is open with the sub-section closed; below `md` it opens the drawer with the sub-section open.
  - Toggle label: `filters.title`; collapsible: the project's `Collapsible`; no new token, text or dependency.
- **Open:** whether public evaluations and the coffee shop Offerings tab should get an entry (it needs a label, i.e. new text); the facet panel keeps its own "Filters" heading below the toggle (unchanged `FacetPanel`).
