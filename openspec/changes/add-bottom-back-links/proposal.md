Type: Refactor (fast lane)

## Why

Production AUT finding 33 (2026-10-08), backlog entry R63: every detail view must also show "Back" at the end of the page, keeping the top one, with the same destination, so a visitor who reads to the end does not have to scroll back up. Product owner typed this correction for the fast lane; unlike a pure refactor it adds visible behaviour, by Product owner's decision (AUT finding 33) with the design lead's placement.

## What Changes

- `offering-catalog`: the offering detail and the coffee shop detail repeat their back link (same component, text and destination) as the last block of the page container, after the tabs and outside every tab panel, 2rem below them. Only the success state; the loading and error states keep only the top link.
- `evaluations`: the public read-only evaluation view repeats its back link at the end of its second section, after the evaluation presentation, 2rem below it. The evaluation form repeats its fixed back link to My evaluations after the read-only status only when the form is shown read-only (no action bar); an editable evaluation keeps ending with Save draft, Close evaluation and Cancel (R57) and gets no bottom back link.
- The bottom link of the public evaluation sits on the section surface: its link and link-hover pairs on `surface-section` are registered in the contrast matrix of both themes (they pass; no new token).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-catalog`: "Offering detail page" and "Coffee shop detail page" gain the scenario "Back link at the end".
- `evaluations`: "Read-only evaluation view" gains the scenario "Back link at the end"; "Evaluation form" gains the scenario "Back link at the end of a read-only evaluation".

## Out of Scope (non-goals)

- Any change to the top back links, their destinations or the `BackLink` component (`base-controls` unchanged).
- A bottom back link on loading or error states, or on an editable evaluation form.
- Any new token, catalog key, route or API call.

## Impact

- **Code**: `src/widgets/offering-detail/ui/OfferingDetailContent.tsx`, `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.tsx`, `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx` (FSD `widgets`); `src/pages/evaluation-form/ui/EvaluationForm.tsx` (`pages`).
- **Tests**: `OfferingDetailContent.test.tsx`, `CoffeeshopDetailContent.test.tsx`, `EvaluationSheetView.test.tsx`, `EvaluationForm.test.tsx`, `src/app/styles/theme-tokens.test.ts` (matrix pairs only).
- **API**: none. **Dependencies**: none.

## Propose status

- Change-id: `add-bottom-back-links`; date 2026-10-08.
- Backlog entry resolved: R63 (table row `0s`).
- Resolved (Product owner 2026-10-08, design lead's recommendations closed by the orchestrator): the bottom link repeats the top one (component, text, destination) only on the success state; it is the last block of the page container, after the last tab panel or section and outside any tab; it is wrapped in a plain `div` so it keeps its own width; on the evaluation form it renders only without an action bar (Cancel of R57 and a bottom Back are not combined); the `text-link`/`text-link-hover` on `surface-section` pairs are registered in both themes (measured 5.72/10.28 traditional, 11.97/13.35 dark).
- Resolved in design.md: the evaluation form's bottom link follows the form's read-only branch, which also covers an open evaluation of a deleted offering (no action bar either) (D4).
- Open: none.
- `openspec validate add-bottom-back-links --strict`: passed.
