# Design

## Context

See proposal.md — Why. The backlog entry R21 and the technical review §3.1 row R21 replace the design folder (fast lane). No API endpoint, error presentation, route or card mapping changes.

## Goals / Non-Goals

**Goals:** remove the three cycles named in R21 while keeping every public export of `@/shared/ui`, `@/shared/api` and the visible behaviour.

**Non-Goals:** see proposal.md — Non-goals.

## Decisions

- **D1 — Where `CoffeeSummary` is defined.** It moves into `src/shared/api/coffees.ts` (layer `shared`, segment `api`), built from `operations["listCoffees"]` of the generated `./schema` with the same derivation and doc comment it has today in `index.ts`. `src/shared/api/index.ts` drops its local definition and the now unused `ListCoffeesResponse` alias, and adds `CoffeeSummary` to its existing `export type { ... } from "./coffees"` line. Alternative considered: a new `types.ts` file shared by `index.ts` and `coffees.ts`; rejected because the type has a single owner module and a new file adds more change than it removes. In `coffees.ts`, only the import and type lines change; the `fetch` call and its lines stay as they are (another change of the round edits them).
- **D2 — Sidebar.** `src/shared/ui/Sidebar.tsx` imports `Button` from `./Button`. The icon import from `@/shared/ui/icons` stays: it is the icon library's entry point, not the segment's index.
- **D3 — RetryButton shim.** `src/widgets/offering-list/ui/RetryButton.tsx` is deleted; `src/widgets/offering-list/ui/OfferingList.tsx` imports `RetryButton` from `@/shared/ui` (it already imports `Pagination` from there); `src/widgets/offering-list/index.ts` removes its two `RetryButton` lines. A search shows no slice or test imports `RetryButton` from `@/widgets/offering-list`.

## Risks / Trade-offs

- [The widget's public index loses `RetryButton` and `RetryButtonProps`] → no importer exists today; consumers already take them from `@/shared/ui`. Typecheck and build confirm it.
- [Overlap with `route-public-reads-through-client` on `coffees.ts`] → only the import and type lines are touched, so a merge conflict, if any, is limited to the import block.
