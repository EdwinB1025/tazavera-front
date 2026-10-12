# Design

## Context

See proposal.md (Why). Today:

- `ManagementSidebarEntries` (`src/features/offering-management`, icon `List`) renders the "Manage offerings" entry and its `children` in one menu list; `LocationsSidebarEntry` (`src/features/location-management`, icon `MapPin`, `current` prop) is the "Manage locations" item.
- Four sidebar screens compose them, one per page slice: `ManageOfferingsSidebarEntries` (`src/pages/manage-offerings`), `NewOfferingSidebarEntries` (`src/pages/new-offering`), `ManageLocationsSidebarEntries` (`src/pages/manage-locations`) and `ManageInventorySidebarScreen` (`src/pages/manage-inventory`, used by the `@sidebar` slot of both the inventory list and the inventory detail; the list passes its `searchParams`, the detail none).
- `ManageInventorySidebarScreen` adds "Explore coffee inventory" through `AppSidebar`'s `listEntry` prop: `ListEntry` (`src/widgets/app-sidebar`) renders it in its own menu list, always current, without an icon, with the `subsection` (the inventory facets, in `FilterMemoryScope`) nested through `SidebarSubsectionOutlet`.
- `AppSidebar` nests a `subsection` under an entry only when it has a `listEntry` or role entries (the specialist's); a coffee shop has no role entries.
- The user menu's "Explore coffee inventory" item (`src/widgets/app-header/ui/UserMenu.tsx`) uses the `Compass` icon from `src/shared/ui/icons.ts`.

## Goals / Non-Goals

**Goals:** the delta of "Management sidebar entry" and "Coffee inventory sidebar", with one inventory entry component shared by the five routes and no import between slices of the same layer.

**Non-Goals:** changing `AppSidebar`, `ListEntry` (still used by the offerings and coffee shop lists) or the user menu; merging the four sidebar screens into one.

## Decisions

### D1. `InventorySidebarEntry` in the `offering-management` feature (features layer)

New `src/features/offering-management/ui/InventorySidebarEntry.tsx`, exported from the slice's `index.ts`, following `LocationsSidebarEntry`:

```ts
export type InventorySidebarEntryProps = {
  locale: string;
  /** The entry's visible text (`sidebarExploreInventory`). */
  label: string;
  /** Whether an inventory route is the current page. */
  current: boolean;
  /** The list's sub-section, rendered under the entry (only on the inventory list). */
  subsection?: ReactNode;
};
```

It renders one `SidebarMenuItem` with `SidebarMenuButton asChild isActive={current} icon={Compass}` around a `next/link` to `/${locale}/manage/inventory` with `aria-current="page"` when current, followed by `subsection`. It belongs to `offering-management` because the inventory pages and their catalog text (`sidebarExploreInventory` in the `offering-management` catalog) already live in that capability. Each of the four sidebar screens passes it as the last child of `ManagementSidebarEntries`, after `LocationsSidebarEntry`, so the three entries share one menu list: `current={false}` on the offerings list, create and locations screens, `current` on `ManageInventorySidebarScreen`. Pages import both features through their public indexes, the existing pattern. Alternative rejected: a widget composing the three entries; it would move the current screens' composition for no behaviour gain and widen the change.

### D2. Icon `Compass`

The existing sidebar inventory entry has no icon, so the icon comes from `src/shared/ui/icons.ts`: `Compass`, already exported there and already the icon of the user menu's "Explore coffee inventory" item, so both entry points show the same mark. No new export or dependency.

### D3. The inventory facets are handed to the entry directly

`ManageInventorySidebarScreen` stops passing `listEntry` and `subsection` to `AppSidebar`. With `searchParams` (the list) it passes `subsection={<SidebarMenuSub title={filters.title}>…facets in FilterMemoryScope…</SidebarMenuSub>}` to `InventorySidebarEntry`; without them (the detail) it passes none. `SidebarMenuSub` (`@/shared/ui`) is the element `AppSidebar` builds today and `SidebarSubsectionOutlet` renders inside `ListEntry`'s item, so the sub-section keeps its place under the entry, its toggle and its open state. Alternative rejected: keeping `AppSidebar`'s `subsection` and making it nest under any `entries`; that changes a widget shared by other routes.

## Risks / Trade-offs

- [The four sidebar screens keep near-identical composition] → unchanged by this change (each is about ten lines); a shared composition can be a later backlog entry if Product owner wants one.
- [A QA test asserts the two-entry list] → `qa/src/pages/new-offering/ui/NewOfferingSidebarEntries.test.tsx` updates only that expectation, per the prompt of this run.
