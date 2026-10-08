Type: Refactor (fast lane)

# Proposal

## Why

knip finds 61 unused exports in `src/` (scaffold primitives in `src/shared/ui/Sidebar.tsx`, `DropdownMenu.tsx`, `Sheet.tsx` and `AlertDialog.tsx`, module constants exported for nobody, and over-wide public indexes) plus 199 unused type re-exports in the public indexes. `fetchVerifiedOfferings` is called by no module since the landing sends its request through `Offerings` (backlog R16). Exports nobody imports suggest paths the app does not use and make the public API of each slice harder to read (backlog R36).

## What Changes

- Scaffold primitives that no module uses are deleted from `Sidebar.tsx`, `DropdownMenu.tsx`, `Sheet.tsx` and `AlertDialog.tsx`; primitives used only inside their own module stop being exported (design.md D2).
- Module constants used only inside their module stop being exported (`FACET_ROW_*`, `GROUP_GAP`, `SEARCH_DELAY_MS`, `THEMES`, `GEOCODE_TIMEOUT_MS`).
- Every public index (`index.ts` of a slice or shared segment) stops exporting the values and types that no other slice imports.
- `fetchVerifiedOfferings` is deleted (resolves R16).
- The `content-structure` requirement "Acyclic shared segment imports" drops its clause that the public exports of each shared segment stay the same, and a new requirement states that a public index exports only what another slice imports.
- What users see and the requests sent to the API stay the same.

## Non-goals

- No change to exported types declared in non-index modules (props and result types next to their component or function) or to the generated `src/shared/api/schema.ts` (design.md D3).
- No change to the unused-file, unlisted-dependency and unresolved-import findings of knip (design.md D3).
- R4 (the menu panel radius) is a `Change` and does not ride with this refactor.
- No new tests, no test deleted; no file under `qa/` is edited.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-structure`: a public index exports only what another slice imports; the clause keeping every shared segment's exports unchanged is dropped.

## Impact

- Code: `src/shared/ui/{Sidebar,DropdownMenu,Sheet,AlertDialog,facet-row,flavor-wheel-geometry,use-combobox-search}.ts(x)`, `src/shared/lib/theme.ts`, `src/features/location-management/model/submit-location.ts`, `src/widgets/offering-list/api/offerings.ts`, and the `index.ts` of the shared segments, entities, features, widgets and `src/app/shell`.
- Tests: none change in `src/`. QA copies that import a removed export go stale and are listed in the final report.
- APIs, dependencies: none (knip runs through `npx`, it is not added to `package.json`).

## Propose status

- **Change-id:** prune-unused-exports
- **Date:** 2026-10-08
- **`openspec validate prune-unused-exports --strict`:** valid
- **Backlog entries resolved:** R36 — Prune the unused exports; R16 — Unused `fetchVerifiedOfferings`
- **Resolved:** how unused exports are found and verified (design.md D1), what happens to each kind of finding (D2), the scope boundary (D3), the tests and QA copies (D4) and the commit plan (D5).
- **Open:** nothing.
