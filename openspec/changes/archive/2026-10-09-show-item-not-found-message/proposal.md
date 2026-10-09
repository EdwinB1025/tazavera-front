## Why

Backlog entry R18 (Product owner's decision, 2026-10-08): an item that does not exist is not a 404 page and not a failure. Today an unknown offering, coffee shop or public evaluation shows "could not be loaded" with a Retry that can never succeed, and a public evaluation that is not closed, an unknown evaluation in the specialist area and an unknown offering on the new-evaluation form show the whole 404 page. The contract now documents the `404` of every read by identifier, body `{"message": "..."}` (R40, `contracts/openapi.yaml` at `2bdde09`), so the front may tell "not found" apart from a failure.

## What Changes

- An unknown offering, coffee shop or evaluation (the read answers its documented `404`; a public evaluation that is not closed; an unknown offering on the new-evaluation form) keeps the view's layout and back button and shows, inside the view and above the back button, the item's title and one line under it, with no Retry. Full strings per item, from R18, in es, en and ca.
- A failed request (transport failure or any other non-success status) keeps today's error message with Retry.
- A signed-in user without the specialist role keeps the 404 page on the evaluation routes; a new-evaluation route without an `offering` query value keeps the 404 page.
- `fetchEvaluation` (public read) maps `404` to the shared `not-found` result kind, as the offering, coffee shop and specialist evaluation reads already do.
- New catalog keys: `catalog` `detailNotFoundTitle` / `detailNotFoundLine`; `coffeeshops` `detailNotFoundTitle` / `detailNotFoundLine`; `public-evaluations` `viewNotFoundTitle` / `viewNotFoundLine`; `evaluations` `formNotFoundTitle` / `formNotFoundLine`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-catalog`: "Offering detail page" (new scenario "Unknown offering"; "Error and retry" excludes the `404`) and "Coffee shop detail page" (new scenario "Unknown coffee shop"; "Unknown coffee shop or failure" now covers only the failure, its name kept because a MODIFIED block cannot drop a scenario).
- `evaluations`: "Evaluation form" ("An unknown offering or evaluation" shows the not-found message; new scenario "No offering on the new form" keeps the 404 page; "The form cannot be loaded" excludes the `404`) and "Read-only evaluation view" (new scenario "Opening an unknown evaluation"; "Opening an evaluation that is not closed" shows the not-found message; "The evaluation cannot be loaded" excludes the `404`).

## Non-goals

- No change to the 404 page, unknown URLs, the role gate or the lists' empty states.
- No new token, component in `src/shared`, or dependency. No API change.
- No other backlog entry is folded in.

## Impact

- API: `src/entities/evaluation/api/public-evaluations.ts`.
- Views: `src/widgets/offering-detail/ui/OfferingDetail.tsx`, `OfferingDetailContent.tsx`; `src/pages/offering-detail/ui/OfferingDetailScreen.tsx`; `src/widgets/coffeeshop-detail/ui/CoffeeshopDetail.tsx`, `CoffeeshopDetailContent.tsx`, `texts.ts`; `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx`; `src/pages/public-evaluation` (texts); `src/pages/evaluation-form/ui/EvaluationDetail.tsx`, `NewEvaluationScreen.tsx`, `EvaluationScreen.tsx`, a new `NotFoundNotice.tsx`.
- Catalogs: `messages/{es,en,ca}/catalog.json`, `coffeeshops.json`, `public-evaluations.json`, `evaluations.json`.
- Tests: see tasks.md; updated assertions are named there.

## Propose status

- Change-id: `show-item-not-found-message`
- Date: 2026-10-09
- `openspec validate show-item-not-found-message --strict`: valid
- Resolves backlog entry: R18.
- Resolved (R18, Product owner 2026-10-08; texts by the orchestrator, delegated by Product owner): not-found is a message inside the view, above the back button, with no Retry; a failure keeps the error with Retry; a signed-in user without the right role keeps the 404 page. Texts from R18: offering "Oferta no encontrada" / "Offering not found" / "Oferta no trobada"; coffee shop "Cafetería no encontrada" / "Coffee shop not found" / "Cafeteria no trobada"; both with "Puede que se haya retirado o que el enlace no sea correcto." / "It may have been removed, or the link may be wrong." / "Pot ser que s'hagi retirat o que l'enllaç no sigui correcte."; evaluation "Evaluación no encontrada" / "Evaluation not found" / "Avaluació no trobada" with "Puede que aún no esté publicada o que el enlace no sea correcto." / "It may not be published yet, or the link may be wrong." / "Pot ser que encara no estigui publicada o que l'enllaç no sigui correcte.", and with the offering line in the specialist area.
- Settled in design.md (single-component details): heading level and classes (D2), the new form without an `offering` value keeps the 404 page (D4), an evaluation whose offering answers `404` in the specialist area stays an error (D4).
- Open: nothing.
