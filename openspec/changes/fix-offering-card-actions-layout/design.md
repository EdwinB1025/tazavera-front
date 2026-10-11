## Context

See proposal.md (Why) and backlog entry R69, whose settled end state this design implements. Current state:

- `src/entities/offering/ui/OfferingCard.tsx` (entity) renders the verification state `Badge` as the first child of `CardContent`, and the consumer's `actions` node inside the footer's `ActionGroup`.
- `src/pages/manage-offerings/ui/OwnOfferingsGrid.tsx` (pages) fills `actions` with `OfferingViewButton` and `OfferingActions`; `src/features/offering-management/ui/OfferingActions.tsx` (features) renders the Select `Checkbox` and the Delete `Button` inside one `flex items-center gap-2` wrapper.
- `ActionGroup` (shared) is a two-column grid below `md` whose direct children fill their cell (`max-md:*:w-full max-md:*:min-w-0`), and a wrapping row from `md`.

Measured in Chromium with the project's compiled CSS (markup rendered from the current components, 16px page gutter): at 375px the My offerings card's action group has two cells; the second holds the wrapper, which cannot shrink below Select plus Delete (the Delete button keeps `min-w-action-sm`), so Delete ends at 439px and the page is 439px wide. The public card (View, View evaluations, Evaluate) stays inside the card. Every footer button already measures 32px high: all of them are `size="sm"` buttons (`h-8`), and the view button is the same shared `Button` through `RouteButton`.

## Goals / Non-Goals

**Goals:** the end state of R69 points 1–4; the entity stays unaware of selection; the page composes both slots.

**Non-Goals:** no change to `Button`, `RouteButton`, `Checkbox`, `ActionGroup` or `Card`, so no other screen changes; no new token, text, request or dependency.

## Decisions

### D1 — A badge-row slot on the offering card (entity)

`OfferingCardProps` gains `badgeRowEnd?: ReactNode`, a slot like `actions`. The card always renders the verification `Badge` inside one row, `flex flex-wrap items-center justify-between gap-2`, as the first child of `CardContent`, followed by `badgeRowEnd` (nothing when absent). One render tree for both cases: no boolean switch. Measured in Chromium at 375px and 1280px, wrapping the badge in this row leaves every element of the public card at the same position and height, so the public cards render as today (R69 point 4). `justify-between` puts the slot's content at the row's right edge; `flex-wrap` lets it move under the badge when the row has no room.

Alternative rejected: render the row only when `badgeRowEnd` is given — two render trees for one prop, against the code structure rules, with no visual gain.

### D2 — Select and Delete become two feature components

- `src/features/offering-management/ui/OfferingSelect.tsx` (new, client component): the Select `Checkbox` as today (`checked`, `onChange`, visible label then `sr-only` identification), with props `offering`, `selected`, `onToggle`, `texts: OfferingSelectTexts` (`{ selectLabel: string }`).
- `src/features/offering-management/ui/OfferingActions.tsx`: keeps its name and its place in the footer, and now returns the Delete `Button` alone, with no wrapper, so the button is a direct child of the card's `ActionGroup` and takes its cell below `md` (R69 point 2). Props `offering`, `onDelete`, `texts: OfferingActionsTexts` (now `{ deleteLabel: string }`). The Delete treatment and accessible name are unchanged.
- `src/features/offering-management/lib/identification.ts` (new): `offeringIdentification(offering)` (coffee name and location name joined by `" — "`) and `LABEL_SEPARATOR` (`" "`), moved from `OfferingActions.tsx` so both components build the same names. Imported directly by both files.
- `src/features/offering-management/index.ts` adds `OfferingSelect` and `OfferingSelectTexts`.

### D3 — The page composes both slots

`OwnOfferingsGrid` passes `badgeRowEnd={<OfferingSelect … />}` and `actions={<><OfferingViewButton … /><OfferingActions … /></>}`. `OwnOfferingsGridTexts` adds `OfferingSelectTexts`. The texts the page passes are the same object as today, so no text or catalog changes.

### D4 — One height for the footer buttons

Every footer button of both card lists stays a `size="sm"` shared `Button` (`h-8`): View and View evaluations through `RouteButton`, Evaluate through `RouteButton`, Delete directly. No size changes; the scenarios "Footer actions share one height" (landing) and "Card actions fit the card" (offering-management) pin it by the shared `h-8` class on each footer button. With the wrapper gone, View and Delete are both cells of the same grid row below `md`, with the same width and height.

## Risks / Trade-offs

- [The height difference Product owner reports does not reproduce in Chromium: every footer button measures 32px] → D4 keeps one size for every footer button and the tests pin it; the design lead's visual check at 375px and 1280px confirms it on the device.
- [`qa/src/features/offering-management/ui/OfferingActions.test.tsx` asserts Select and Delete in one wrapper and passes `selected` and `onToggle` to `OfferingActions`] → it becomes stale on purpose (R69 point 1). It fails the QA suite and the typecheck of `qa/` (and `next build`, which typechecks the same files). The build does not rewrite it and does not loosen `OfferingActionsProps`; it lists it in its final report for Product owner's QA update.
