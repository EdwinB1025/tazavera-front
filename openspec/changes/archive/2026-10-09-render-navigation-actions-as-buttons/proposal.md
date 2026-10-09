Type: Refactor (fast lane)

## Why

Production AUT finding (Product owner, 2026-10-09): "Volver" (the back links at the top and the bottom of the detail views, R63 `add-bottom-back-links`, and the evaluation form's back links), "Cancelar" (the form cancel links, R57 `add-form-cancel-actions`), "Ver evaluaciones" and "Evaluar" in the offering detail header are actions, so they are buttons, not links. Product owner typed this correction for the fast lane; unlike a pure refactor it changes these controls from links to buttons, by Product owner's decision. Texts, destinations, order and positions stay the same.

## What Changes

- `base-controls`: the shared back control (`BackLink`) renders the project's `RouteButton` (a `Button` that navigates with the App Router) with variant `action-3`, size `sm` and the leading `ArrowLeft` icon the back link carried, and still addresses the previous page or its fallback. `RouteButton` gains an optional `icon` passed to `Button`.
- `offering-catalog`: through `BackLink`, the offering detail's and the coffee shop detail's top and bottom back controls become buttons. The offering detail header's "View evaluations" and "Evaluate" become `RouteButton`s (`action-3`, `sm`), same destinations and order.
- `evaluations`: the evaluation form header's back link and the read-only form's bottom back link become `RouteButton`s (`action-3`, `sm`, `ArrowLeft`) to `/{locale}/manage/evaluations`; the editable form's "Cancel" becomes a `RouteButton` (`action-4`, `base`), still last and centred on its own line below 768px; the public read-only evaluation view's top and bottom back controls become buttons through `BackLink`.
- `user-account`: the registration forms' "Cancel" becomes a `RouteButton` (`action-4`, `base`) under the submit; the Change password view's back control becomes a button through `BackLink`.
- `offering-management`: the New offering form's "Cancel" becomes a `RouteButton` (`action-4`, `base`) after the submit; the New offering page's back link becomes a `RouteButton` (`action-3`, `sm`, `ArrowLeft`).
- Variants: back and header actions use the offering card's "View evaluations" (`action-3`, `sm`); Cancel uses the secondary button already next to the submit in the location and contact forms (`action-4`, the submit's size `base`).
- Links inside running text, menus, the header navigation, the status line's "View my offerings" link and the not-found page's home link stay links.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `base-controls`: "Back link to the previous page" (the back control is a button).
- `offering-catalog`: "Offering detail page", "View evaluations link on the offering detail", "Coffee shop detail page".
- `evaluations`: "Evaluation form", "Read-only evaluation view", "Cancelling the evaluation form".
- `user-account`: "Cancelling registration", "Change password view".
- `offering-management`: "Creating offerings".

## Out of Scope (non-goals)

- Any change of text, destination, order or position; any new token, catalog key, component, route, API call or dependency.
- The not-found page's "back to home" link (app-shell), the `Link` component's `back` variant, which stays available, and the renaming of `BackLink`.
- Any `qa/` test.

## Impact

- **Code**: `src/shared/ui/RouteButton.tsx`, `src/shared/ui/BackLink.tsx`; `src/widgets/offering-detail/ui/DetailHeader.tsx`; `src/pages/evaluation-form/ui/EvaluationFormHeader.tsx`, `EvaluationForm.tsx`, `FormActions.tsx`; `src/features/user-account/ui/RegisterForm.tsx`; `src/pages/new-offering/ui/NewOfferingForm.tsx`, `NewOfferingScreen.tsx`.
- **Tests** (role `link` → `button`, navigation asserted through `router.push`): the tests that query these controls.
- **API**: none. **Dependencies**: none.

## Propose status

- Change-id: `render-navigation-actions-as-buttons`; date 2026-10-09.
- Source: Product owner's AUT finding (2026-10-09), settled: back, Cancel, "View evaluations" and "Evaluate" are buttons (`RouteButton`).
- Controls changed (file → variant/size):
  - `src/shared/ui/BackLink.tsx` (offering detail top and bottom, coffee shop detail top and bottom, public evaluation view top and bottom, Change password view) → `action-3`/`sm`, `ArrowLeft`.
  - `src/widgets/offering-detail/ui/DetailHeader.tsx` "View evaluations", "Evaluate" → `action-3`/`sm`.
  - `src/pages/evaluation-form/ui/EvaluationFormHeader.tsx` back, `EvaluationForm.tsx` bottom back → `action-3`/`sm`, `ArrowLeft`.
  - `src/pages/evaluation-form/ui/FormActions.tsx` Cancel → `action-4`/`base`.
  - `src/features/user-account/ui/RegisterForm.tsx` Cancel → `action-4`/`base`.
  - `src/pages/new-offering/ui/NewOfferingForm.tsx` Cancel → `action-4`/`base`; `NewOfferingScreen.tsx` back → `action-3`/`sm`, `ArrowLeft`.
- Resolved: Cancel takes the `action-4`/`base` of the location and contact forms' Cancel; the back keeps its arrow through a new optional `icon` of `RouteButton`; the evaluation Cancel keeps `self-center` through a wrapper.
- Open (for Product owner): the not-found page's "Volver al inicio" stays a link (app-shell, not a detail view); the "Evaluate" button of the detail header uses `action-3` as settled while the card's uses `action-1`; `BackLink` keeps its name.
- `openspec validate render-navigation-actions-as-buttons --strict`: passed.
