## Context

See proposal.md (Why) and backlog entry R71, whose settled end state this design implements. Current state:

- `src/pages/manage-inventory/ui/InventoryCardActions.tsx` (pages) renders "View" and "Create offering" as two `RouteButton`s (`size="sm"`) whose children are the label strings; `InventoryResults.tsx` passes it only the item's `ulid`.
- `src/entities/offering/ui/OfferingViewButton.tsx` (entities) renders a `RouteButton` whose child is `label: string`. Two consumers: `src/pages/manage-offerings/ui/OwnOfferingsGrid.tsx` (My offerings) and `src/widgets/offering-list/ui/OfferingCardActions.tsx` (public cards, which must not change).
- `src/features/offering-management/lib/identification.ts` holds `offeringIdentification(offering)` (coffee name and location name joined by `" — "`, empty parts skipped) and `LABEL_SEPARATOR` (`" "`). `OfferingSelect` renders its label then `LABEL_SEPARATOR` then a `sr-only` span with the identification; `OfferingActions` (Delete) puts the same words in `aria-label`. The feature's public index does not export them.
- `RouteButton` takes no `aria-label`. The project already names route buttons with a visible label plus a `sr-only` suffix inside the button (`src/widgets/evaluation-row/ui/EvaluationRowParts.tsx`, `PublicEvaluationRowCard.tsx`).

No API endpoint is added or changed: the names come from fields already on the card (`CoffeeInventoryItem.coffee.name`, `CoffeeInventoryItem.roastery.name`, `OfferingSummary.coffeeInventory.coffee.name`, `OfferingSummary.location.name`). No error presentation changes. No derived API type is needed.

## Goals / Non-Goals

**Goals:** R71 points 1–3; the entities stay unaware of features; the pages compose the names.

**Non-Goals:** no change to `Button`, `RouteButton`, `InventoryCard`, `OfferingCard` or any other shared control, so no other screen's rendered output or accessible name changes; no new text, catalog key, token, request or dependency.

## Decisions

### D1 — One identification helper for both lists (features)

`src/features/offering-management/lib/identification.ts` gains `inventoryIdentification(item: CoffeeInventoryItem): string`: `item.coffee?.name` and `item.roastery?.name` joined by the same `" — "` separator, empty parts skipped, as `offeringIdentification` does. `src/features/offering-management/index.ts` exports `offeringIdentification`, `inventoryIdentification` and `LABEL_SEPARATOR`, which the two pages import. Keeping both helpers in one file keeps the separators in one place, so every card action in the management area names its item alike.

### D2 — Visible label plus a visually hidden identification (no shared-control change)

Each of the three buttons keeps its label as its first child, then `LABEL_SEPARATOR`, then `<span className="sr-only">` holding the identification — the markup `OfferingSelect` already uses. The accessible name therefore starts with the visible label (WCAG 2.5.3) and the visible text is the label alone. `RouteButton` is not changed (no `aria-label` prop), so every other screen renders as today.

### D3 — The pages compose; the entity only widens its label

- `OfferingViewButtonProps.label` widens from `string` to `ReactNode`; the component renders it as today. The public `OfferingCardActions` still passes its string, so its markup and accessible name do not change (R71 point 3). The entity imports nothing new.
- `OwnOfferingsGrid` passes as `label` the fragment of D2 built from `texts.viewLabel` and `offeringIdentification(offering)`.
- `InventoryCardActions` takes the `item` (`CoffeeInventoryItem`) in place of `ulid` and builds both buttons' content from `inventoryIdentification(item)`; its routes still use `encodeURIComponent(item.ulid ?? "")`. `InventoryResults` passes `item`.

Every touched unit stays within the size limits (each component under 80 lines).

## Risks / Trade-offs

- [Validation tests that look the changed buttons up by the old exact name: `src/pages/manage-offerings/ui/ManageOfferingsPanel.test.tsx` ("Card actions fit the card": `getAllByRole("button", { name: TEXTS.viewLabel })`) and `src/pages/manage-inventory/ui/InventoryListClient.test.tsx` ("Card actions": `{ name: TEXTS.view }` and `{ name: TEXTS.createOffering }`)] → only those lookups take the new full name; their `expect` assertions stay as they are (tasks 1.1 and 2.1).
- [QA tests that look these buttons up by the old exact name] → they become stale on purpose; the build leaves them untouched and lists them in its final report.
