Type: Refactor (fast lane)

## Why

Backlog entry R73 (Product owner, 2026-10-11), taken as a fast lane by Product owner's order of 2026-10-11: the filters and order of the editing lists live only in the page address, so leaving My evaluations or Coffee inventory and coming back from the menu opens the list with no filters and the default order. Specialists and coffee shops work the same filtered list across several visits. Product owner settled the end state: the lists remember their last applied filters and order for the browser tab (option A, `sessionStorage`), without the page number (option A), on every editing list.

## What Changes

- My evaluations and Coffee inventory keep their last applied filters and order for the browser tab. They are written only when the user applies filters or another order, or clears the filters (which stores the empty state; on My evaluations the order "Clear all" keeps stays stored).
- Opening one of those lists in the same tab with no filters or order in its address applies the stored ones: the address then shows them, as when the user applies them by hand, the list starts at page 1, and no extra history entry is added.
- A list with nothing stored behaves as today. My offerings has no filters or order today, so it stores nothing.
- If the browser storage cannot be read or written, the lists work as today, with no error shown.
- The stored filters and order are forgotten when the tab is closed, when the user signs out or the session ends, and when another user signs in.
- No request to the API changes: a restored list sends exactly the request it sends today for the same address.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `filtering`: ADDED "Editing lists remember their filters and order for the tab" (scenarios "Restored on a new opening", "Cleared filters are stored", "Nothing stored", "Browser storage unavailable") and ADDED "Remembered filters forgotten with the session" (scenarios "Forgotten on sign out", "Forgotten when another user signs in"). The URL-state requirements of the evaluation and inventory facets, which this change builds on, live in this capability.

## Non-goals

- No change to the public lists (`/offerings`, the public evaluations, the coffee shop directory): they remember nothing.
- No filters or order added to My offerings.
- The page number is not stored.
- No API or contract change, no new request, no new dependency, token, guard test or interface text.
- No token, user identifier or other personal data is stored: only filter and order values.
- No other backlog entry is folded in.

## Impact

- New: `src/shared/lib/tab-storage.ts` (tab-scoped storage with a silent fallback); `src/shared/ui/FilterMemoryScope.tsx` and `src/shared/ui/RememberedFiltersGate.tsx`; `src/app/shell/forget-list-preferences.ts`.
- Modified: `src/shared/lib/filter-query/index.ts` (the list memory written by the facet navigation, its forgetting), `src/shared/ui/index.ts`; `src/features/evaluation-facets` and `src/features/inventory-facets` (the keys each list remembers); `src/pages/evaluations-list` and `src/pages/manage-inventory` (the screens wire the memory); `src/app/shell/SessionShell.tsx` (forgetting with the session).
- Tests: six new tests, one per new scenario, in the validation suite. No existing assertion changes.
- QA suite: no QA test is expected to become stale; tests that render the wired screens without the memory scope keep today's behaviour.

## Propose status

- Change-id: `remember-list-preferences`
- Date: 2026-10-12
- `openspec validate remember-list-preferences --strict`: valid
- Resolves backlog entry: R73 (fast lane by Product owner's order of 2026-10-11).
- Resolved (backlog entry R73, Product owner): tab scope with `sessionStorage` (point 1, option A); restore when the address carries no filters or order (point 2); written only on apply or clear, clear storing the empty state and My evaluations keeping its order on "Clear all" (point 3); no page number (point 4, option A); My offerings stores nothing (point 5); silent fallback (point 6); no request or contract change (point 7).
- Resolved (architect, design.md): the memory is written by the shared facet navigation inside a list's memory scope (D2); the restore replaces the address before the list's read starts (D3); forgetting is wired by the app shell from the session (D4).
- Open: none blocking. Risk recorded in design.md: an account switch that happens in another tab and reaches this tab only through a reload is not detected, because no user identifier is stored.
