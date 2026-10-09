# Proposal

## Why

Every list route loads 207–249 KB of gzipped JavaScript on first load (technical review 2026-10-09, §1.4 and top risk 3; Performance grade C, the coffee shop detail at the D boundary). The offering facets' comboboxes bring cmdk and the Radix Popover behind them into the first load of the offerings list and of a coffee shop's Offerings tab, although the facets sit in a sidebar sub-section that is closed on arrival. Product owner decided on 2026-10-09 (decisions log, "carga diferida de las facetas") to load them with a dynamic import the first time the filters panel opens, as the map already loads Leaflet.

## What Changes

- The facet comboboxes, and the libraries only they use (cmdk and the Radix Popover behind them), load with a dynamic import the first time the filters sub-section opens, not with the route.
- While that first load is pending, each combobox's place in the panel shows the existing loading status (spinner and "Loading…", the existing `loading` text of the `account` catalog).
- Which filters exist, their order, their behaviour once loaded, the URL handling, the mobile overlay and the desktop sidebar stay as they are. The new-offering form's combobox is not a facet and keeps loading with its route.
- No dependency, token, colour or new text.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `filtering`: adds the requirement that facet comboboxes load on the first opening of the facets sub-section, with a loading state while they load.

## Impact

- Files: a new shared loader for the combobox (`src/shared/ui`), the sidebar sub-section (`SidebarMenuSub`, which tells its content whether it has been opened), the offering facet panel and its texts, and the two sidebar screens that pass the texts.
- Tests: one new test per added scenario; three existing tests of `OfferingFacets.test.tsx` wait for the lazily loaded comboboxes (query calls only, assertions unchanged).
- Target: every list route (offerings, public evaluations, coffee shop directory, coffee shop detail) at or under 170 KB gz First Load JS with the review's method. The floor measured by the review (206.8 KB gz on About, which renders no facet) is above that target, so the target is not reachable by this change alone; the change is implemented anyway and the before/after numbers are reported (design.md "Measurement plan").

## Non-goals

- Lazy-loading the radio lists, the score range, the taxonomy cascade or the text field, or the facet panels without comboboxes (public evaluations, coffee shop directory).
- Reducing the framework, React, next-intl or app-shell code every route loads.

## Propose status

- Change-id: `lazy-load-facet-controls`
- Date: 2026-10-09
- `openspec validate lazy-load-facet-controls --strict`: valid
- Source: Product owner's decision of 2026-10-09 (decisions log "carga diferida de las facetas"); no design folder, so this status is recorded here.
- Resolved: the import boundary is a shared combobox loader started by the sub-section's first opening (design.md D1–D2); the loading text is the existing `account` `loading` key (design.md D3).
- Open: the 170 KB gz target is likely unreachable by this change (the review's floor is 206.8 KB gz on a route with no facet); the numbers are reported after task 3.1.
