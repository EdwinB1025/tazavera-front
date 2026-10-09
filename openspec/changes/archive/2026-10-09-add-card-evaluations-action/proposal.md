Type: Refactor (fast lane)

# Proposal

## Why

Product owner's AUT finding (maximum priority): from an offering card there is no way to reach the offering's evaluations; only the offering detail header has a "View evaluations" link. Product owner typed this AUT correction for the fast lane and decided (2026-10-09) that "View evaluations" is an action of the offering card. It adds an action to the card by Product owner's decision.

## What Changes

- `OfferingCardActions` (`src/widgets/offering-list/ui/OfferingCardActions.tsx`) renders, for every viewer, a "View evaluations" action between View and the specialist's Evaluate. It opens `/{locale}/evaluations?offeringId={ulid}`, the destination of the offering detail header's link.
- The action is the card actions' control: the shared `RouteButton`, `size="sm"`, `variant="action-3"` like View (focus ring from the shared `Button`). Its accessible name is its text only, like the card's other actions, which do not name the offering.
- Its text is a new `cardViewEvaluationsLabel` key in the card's catalog area (`messages/{es,en,ca}/landing.json`), with exactly the copy of the detail header's `catalog.detailViewEvaluations` (es `Ver evaluaciones`, en `View evaluations`, ca `Mostra les avaluacions`). `OfferingCardActions`' and `OfferingListTexts`' texts gain `viewEvaluationsLabel`, filled from that key by every screen that renders `OfferingList` or `FilteredOfferingsResults` (home, offerings catalog, coffee shop detail).

## Non-goals

- Cards outside `OfferingCardActions` (Manage offerings' own grid) are unchanged.
- The offering detail header is unchanged.
- No new token, dependency or component; no change to the QA suite (`qa/`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `landing`: "Offering card content" lists the "View evaluations" action in the footer, between View and Evaluate, for every viewer; one scenario with its destination and order.

## Impact

- Code: `src/widgets/offering-list/ui/OfferingCardActions.tsx`, `src/widgets/offering-list/ui/OfferingList.tsx` (texts type), the screens that fill the list texts, `messages/{es,en,ca}/landing.json`.
- Tests: `src/widgets/offering-list/ui/OfferingList.test.tsx` (one test; its `TEXTS` fixture gains the label).
- APIs, dependencies, tokens: none.

## Propose status

- **Change-id:** add-card-evaluations-action
- **Date:** 2026-10-09
- **`openspec validate add-card-evaluations-action --strict`:** valid
- **Backlog entries resolved:** none
- **Resolved:**
  - The card gains "View evaluations", for every viewer, ordered View → View evaluations → Evaluate, destination `/{locale}/evaluations?offeringId={ulid}` (Product owner, 2026-10-09).
  - Capability → `landing`, which holds the card's View and Evaluate scenarios ("Offering card content"); MODIFIED with one sentence change and one scenario.
  - Control → `RouteButton` `action-3` `sm`, as View; the card actions are buttons that push the route (fix-production-aut-findings design.md D2), so the test asserts the pushed route in place of an `href`.
  - Text → new `landing.cardViewEvaluationsLabel` with the detail header's exact copy.
- **Open:** none.
