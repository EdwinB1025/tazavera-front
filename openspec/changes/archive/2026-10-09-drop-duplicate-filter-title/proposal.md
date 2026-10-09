Type: Refactor (fast lane)

## Why

Product owner's AUT finding (2026-10-09, maximum priority): in the sidebar, a list's filters sit in a collapsible sub-section whose toggle already carries the title ("Filters"); inside its body the facet panel shows its own "Filters" heading again, so the title appears twice. Product owner settled that the title appears only in the toggle, and typed the correction as fast lane.

## What Changes

- Inside a sidebar sub-section, the facet panel renders no heading of its own: the sub-section's toggle is its title. The search region is named by the toggle (same text), and the focus the chips send to "the panel title" (after the last chip is removed or after "Clear all") lands on the toggle.
- A facet panel rendered outside a sub-section keeps its visible heading. Today every facet panel lives in a sidebar sub-section; no other placement exists.
- No new text, token or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `filtering`: "Sidebar facets sub-section" (the toggle is the panel's only visible title inside the sub-section; new scenario "Title shown once in the sidebar").

## Non-goals

- No change to the toggle, the sub-section's open/close behaviour, the facets, texts, requests or tokens.
- No other backlog entry is folded in.

## Impact

- Modified: `src/shared/ui/SidebarMenuSub.tsx` (provides the toggle's id to its content), `src/shared/ui/Collapsible.tsx` (optional `id` on the header button), `src/shared/ui/FacetPanel.tsx` (no heading inside a sub-section; region labelled by and focus sent to the toggle).
- Test updated: `src/pages/coffeeshops/ui/CoffeeshopsSidebarScreen.test.tsx` ("renders the sidebar with the list's entry holding the coffee shop facets") also asserts that the sidebar has no "Filtros" heading. No other test asserts the panel heading inside the sidebar; `src/shared/ui/FacetPanel.test.tsx` renders the panel outside a sub-section and keeps its heading assertions.

## Propose status

- Change-id: `drop-duplicate-filter-title`
- Date: 2026-10-09
- `openspec validate drop-duplicate-filter-title --strict`: valid
- Resolves backlog entry: none (Product owner's AUT finding passed directly).
- Resolved (Product owner, 2026-10-09): the title appears only in the toggle; the region keeps its accessible name from the toggle (design.md D1). Focus targets that the chips requirement calls "the panel title" go to the toggle inside the sub-section (design.md D1, follows from the panel having no other title there).
- Open: nothing.
