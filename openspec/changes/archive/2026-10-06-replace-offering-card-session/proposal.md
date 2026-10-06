# Proposal

## Why

`OfferingCard` takes a `session` prop and computes the specialist role itself, so the entity owns session logic and can only ever show one hard-coded action: the Evaluate link. The decisions log ("2026-10-06 — ranura de acción de `OfferingCard`", Product owner, proposal 5) settles a refactor in `landing` that replaces the `session` prop with an action slot the consumer fills, ordered before the features that need their own actions on the card (`add-offering-management` Open 2 answered a: a select checkbox and a Delete button; `add-specialist-evaluations` §8: its `EvaluateLink`, which reads `useSession()`). Landing's rendering does not change: the entry-page list fills the slot with the same Evaluate logic the card renders today.

## What Changes

- `OfferingCard` loses its `session` prop and its role check, and gains an optional `actions` slot, rendered in the footer's links group after the View link. The card renders no action of its own beyond View and no wrapper around the slot's content.
- The entry-page list fills the slot with today's Evaluate logic, moved unchanged from the entity: one Evaluate link to `/{locale}/manage/evaluations/new?offering={ulid}` for a signed-in specialist, nothing otherwise. Every landing render stays identical.
- `evaluateLabel` moves from `OfferingCardTexts` to `OfferingListTexts`: eleven keys remain on the card's texts type and the union of keys reaching the widget is unchanged, so `HomeScreen.tsx` and its exact-texts test do not change. The catalog key stays `cardEvaluateLabel` in `messages/{es,en,ca}/landing.json`.
- Spec delta in `landing`: a new requirement "Offering card actions" (the consumer-supplied actions render after the View link in the same group; nothing else), and one reworded clause in "Offering card content": the Evaluate link for a signed-in specialist is the entry-page list's filling of the card's actions slot. One clause, no behaviour change (orchestrator's answer to Q1).
- The card's tests move the Evaluate assertions from the entity to the widget, where the logic moves, and replace the entity's session cases with slot cases.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `landing`: a new requirement "Offering card actions" (the card's footer renders the actions its consumer supplies, after the View link, and no action of its own beyond View), and the last clause of "Offering card content" reworded to name the entry-page list as the filler of the Evaluate link through the card's actions slot.

## Out of Scope

- No `useSession()` wiring and no `EvaluateLink` feature: `add-specialist-evaluations` brings them (`add-auth` is merged, so the session module exists).
- The `session` props of `OfferingList`, `VerifiedOfferings` and the anonymous `Session` constant in `HomeScreen` stay; `add-specialist-evaluations` removes that plumbing when it replaces the widget's filling with `EvaluateLink`.
- The filling of the catalog's cards is out of this change's scope: `add-offering-catalog` decides it (orchestrator's answer to Q2).
- No new text key, token, contract operation or visible change. The messages files are untouched.

## Impact

- Code (4 files): `src/entities/offering/ui/OfferingCard.tsx` (entities; `session` removed, `actions` added, `evaluateLabel` out of `OfferingCardTexts`), `src/entities/offering/ui/OfferingCard.test.tsx` (entities), `src/widgets/offering-list/ui/OfferingList.tsx` (widgets; fills `actions`, `evaluateLabel` in `OfferingListTexts`), `src/widgets/offering-list/ui/OfferingList.test.tsx` (widgets). `VerifiedOfferings.tsx`, `HomeScreen.tsx`, the slice entry points and the message catalogs do not change.
- API: none. `OfferingSummary.ulid` still builds both link addresses.
- Dependencies: none added.
- Consumers unblocked: `add-offering-management` Open 2 (its §6.2 "Card actions" wrapper), `add-specialist-evaluations` §8 (its `EvaluateLink`). `add-offering-catalog` decides its own cards' filling.
- Order: `extract-offering-list-parts` and `label-rating-badge` are merged, so the change starts from `develop` with no shared-file conflict left to simulate.
- Backlog (`docs/backlog.md` holds R1, R3, R4, R5, R8): no entry names this change.
