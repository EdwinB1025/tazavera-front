## Context

Product owner's AUT finding (2026-10-09): `SidebarMenuSub` (`src/shared/ui/SidebarMenuSub.tsx`) renders a `CollapsibleHeader` toggle titled "Filters", and the `FacetPanel` (`src/shared/ui/FacetPanel.tsx`) in its body renders an `h2` with the same title, which also names the `role="search"` form (`aria-labelledby`) and takes focus after "Clear all" or the removal of the last chip. Every facet panel (`OfferingFacets`, `CoffeeshopFacets`, `EvaluationFacets`) is rendered only inside a sidebar sub-section (`AppSidebar` `subsection`). No API endpoint is consumed or changed.

## Goals / Non-Goals

**Goals:** inside a sub-section the title shows only in the toggle; the search region keeps the same accessible name; a panel outside a sub-section keeps its heading.

**Non-Goals:** changing the facet features, the sidebar screens, `AppSidebar`, texts or tokens.

## Decisions

### D1. The sub-section hands its toggle to the panel

- `CollapsibleHeader` takes an optional `id`, set on its button.
- `SidebarMenuSub` creates the toggle's id, passes it to `CollapsibleHeader` and provides it to its content through a context exported from `SidebarMenuSub.tsx` (default `null`).
- `FacetPanel` reads that context. With a toggle id it renders no `h2`, labels the form with `aria-labelledby` set to the toggle's id (its text content is the title, the chevron is `aria-hidden`), and moves the "title" focus target to the toggle (`document.getElementById`). Without one it behaves as today.
- `FacetPanel` imports the context from its sibling file `./SidebarMenuSub` (same `shared/ui` segment).
- Rejected: hiding the heading visually (`sr-only`) — it would still be a second heading for assistive technology; a boolean prop on every facet feature — it would thread through three features and five screens.

## Risks / Trade-offs

- [jsdom asserts roles, not paint] → the updated test asserts the absence of the heading and the region's name; Product owner checks the visual end state in a browser.
