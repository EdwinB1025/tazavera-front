# Design

## Context

Backlog R36 counts 61 unused exports. knip 5 (`npx -y knip@5 --no-progress`, default configuration, not added to `package.json`) on `origin/qa` at `1371285` reports:

| Finding | Before | After |
|---|---:|---:|
| Unused exports | 61 | 1 |
| Unused exported types | 417 | 214 |
| Unused exported types in an `index.ts` | 199 | 0 |
| Unused files | 2 | 2 |
| Unlisted dependencies | 1 | 1 |
| Unresolved imports (QA copies) | 3 | 3 |

knip treats the Vitest test files of `src/` and `qa/` as entries, so an export a test imports counts as used. `fetchVerifiedOfferings` (R16) is not in the 61 for that reason: only its QA copy, `qa/src/widgets/offering-list/api/offerings.test.ts`, imports it, and that copy already fails to load on `origin/qa`.

## Goals / Non-Goals

**Goals:**
- No value exported that no module or test imports, and no public index exporting what no other slice imports.
- `fetchVerifiedOfferings` deleted (R16).
- Identical rendering and requests.

**Non-Goals:**
- Exported types of non-index modules, the generated schema, and the other knip findings (D3).
- R4 (the menu panel radius, typed `Change`).

## Decisions

### D1. Finding and verifying

Each finding of knip's "Unused exports" list and each "Unused exported types" finding in an `index.ts` is checked with a whole-word search over `src/`, `app/`, `proxy.ts` and `qa/` before it is removed. A name imported only through a module path (a test importing `./DropdownMenu`, a sibling importing `./Sheet`) keeps its module export and leaves only the index.

### D2. What happens to each kind of finding

- **Scaffold primitive used nowhere** (no module renders it): the component is deleted with its classes and any import it alone used. `AlertDialogAction`; `DropdownMenuGroup`, `DropdownMenuCheckboxItem`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`; `SheetClose`, `SheetFooter`; `SidebarInset`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`.
- **Primitive used only inside its module**: it stays and stops being exported. `AlertDialogPortal`, `AlertDialogOverlay`, `DropdownMenuPortal`, `SheetPortal`, `SheetOverlay`.
- **Module constant used only inside its module**: it stops being exported. `FACET_ROW_CLASSES`, `FACET_ROW_REST_CLASSES`, `FACET_ROW_SELECTED_CLASSES`, `FACET_ROW_LABEL_REST_CLASSES`, `FACET_ROW_LABEL_SELECTED_CLASSES`, `FACET_ROW_DISABLED_CLASSES` (`facet-row.ts`), `GROUP_GAP` (`flavor-wheel-geometry.ts`), `SEARCH_DELAY_MS` (`use-combobox-search.ts`), `THEMES` (`theme.ts`), `GEOCODE_TIMEOUT_MS` (`submit-location.ts`).
- **Index re-export no other slice imports**: the line or name leaves the index; the module keeps its export when a sibling or test imports it. Values: `DropdownMenuPortal`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuCheckboxItem`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`, `SheetClose`, `SheetPortal`, `SheetOverlay`, `SheetHeader`, `SheetFooter` (`shared/ui`); `getCatalogs` (`shared/lib/i18n`); `uniqueCities` (`entities/coffeeshop`); `COFFEESHOP_SORT_OPTIONS`, `EVALUATION_SORT_OPTIONS`, `OFFERING_SORT_OPTIONS`, `fetchOwnOfferings`, `RegisterSuccessPanel`, `RoleRow` (features); `NavigationMenu`, `UserMenu`, `CoffeeshopList`, `EvaluationSheet`, `OfferingDetailContent`, `Offerings`, `OfferingList`, `CATALOG_GRID_CLASSES`, `buildOfferingsQuery`, `EvaluationListPresentation` (widgets). Types: every "Unused exported types" finding in an `index.ts`.
- **Dead function**: `fetchVerifiedOfferings` is deleted from `src/widgets/offering-list/api/offerings.ts`; `LANDING_PAGE_SIZE` stays, `VerifiedOfferings` uses it.
- **Kept on purpose** (the one export knip still reports): `getCatalogs` in `src/shared/lib/i18n/messages.ts`. Its consumer, `src/shared/lib/i18n/request.ts`, is the next-intl request configuration that the next-intl plugin loads by path, which knip reports as an unused file.

### D3. Scope boundary

- The exported types of non-index modules (props, texts and result types declared next to their component or function, 214 findings) stay: they are the contract of a module, not a public index, and dropping their `export` keyword changes no import.
- `src/shared/api/schema.ts` is generated and never edited by hand.
- The unused files (`docs/design/add-theme-tokens/tokens.css`, `src/shared/lib/i18n/request.ts`, see D2), the unlisted `postcss` dependency and the unresolved imports of three QA copies are outside this refactor.

### D4. Tests

No test is added, deleted or changed: every `src/` test that uses a pruned name imports it by module path, and those module exports stay. The validation test `src/widgets/offering-list/api/offerings.test.ts` keeps its header comment about `fetchVerifiedOfferings`, since a test changes only its imports. QA copies are not edited; a QA copy that imports a removed export and breaks the typecheck is excluded in `tsconfig.json` with a comment and listed in the final report.

### D5. Commits

All findings belong to `content-structure` (no spec of another capability names a removed export). One commit per task, by layer: shared (task 1.1), entities and features (1.2), widgets and app (1.3).

## Risks / Trade-offs

- A name that a future change needs comes back as a one-line export; deleted scaffold primitives come back from the shadcn source if a design calls for them.
