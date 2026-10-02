# Proposal

## Why

The component layer so far covers action controls only (`add-base-control`, merged). Every screen that collects data — registration, evaluation forms, filter inputs — is blocked until the data-entry controls exist: a labeled field with help and error text, and the input, select, textarea, checkbox and radio controls that fill it. This change is the second block of the component roadmap; it also defines the semantic tokens the checked state and the dark sidebar surfaces need.

## What Changes

- **Field**: label above, control, optional help text, optional error message; `required` marker (visual only) that also marks the control; error state that switches the control border, shows the message and wires `aria-invalid` and `aria-describedby` to the control. Error is never conveyed by color alone. Field associates label, help and error with its control and passes the invalid and required state down; a control rendered without a Field works standalone.
- **Input**: text input with placeholder styling and states (rest, focus, disabled, error); password mode with a show/hide toggle using eye icons from the icon entry point.
- **Select**: native select styled as the input box with a chevron icon; the open option list stays native and unstyled.
- **Textarea**: its own surface and border treatment, distinct from Input; default variant only.
- **Checkbox**: 16px box whose checked state is carried by the mark (not by the fill alone); label to the right, the whole label clickable so the hit area is at least 24×24px.
- **Radio group**: `fieldset` with `legend` group name; options as circles with an inner dot when selected; same tokens and hit area as Checkbox.
- **Inverse variant** for Field, Input, Select, Checkbox and Radio group: the same controls on dark surfaces (sidebar, full-screen mobile filter panel) with the inverse token set, including an inverse focus treatment that keeps the single shared focus indicator (its colors reassign to the inverse focus tokens in the control's own scope).
- **New semantic tokens** (new tokens only, no existing token modified): `checked-mark`, `focus-ring-inverse`, `focus-offset-inverse`, `border-inverse`, `text-placeholder-inverse`, `feedback-error-inverse`, each defined in both themes with verified WCAG contrasts.
- **Verification**: the guard suite gains the new controls (shared focus indicator, client boundary) and the theme-token test gains the new tokens' completeness and contrast pairs.

No breaking changes: existing tokens, utilities and controls keep their current meaning.

## Capabilities

### New Capabilities

- `form-fields`: data-entry controls — field, input (incl. password reveal), select, textarea, checkbox, radio group — their default and inverse variants, the field's association of label, help text and error with its control, and the semantic tokens the checked and inverse states require.

### Modified Capabilities

None. The `theming` requirements are unchanged: the inverse focus tokens join the focus token family that its shared-indicator requirement already covers. `base-controls` is unchanged.

## Out of Scope (non-goals)

- Coffee-bean scale and intensity slider: change `add-evaluation-scales` (same capability, later change).
- Facet subcomponents — combobox, range, chips, show more, taxonomy cascade, facet option rows: filtering change.
- Static or read-only display versions of these controls (design rule 7's `readOnly` prop): values are displayed by other components; `Input` and `Textarea` pass the native `readOnly` attribute through like any native prop, `Select`, `Checkbox` and `Radio group` have none.
- Textarea on inverse surfaces: not used on dark surfaces.
- Labels, help texts and error copy: each consuming capability supplies them.
- Form composition, submission and validation logic, including mapping API 422 errors to per-field copy: features that consume these controls.
- Placement of controls on the sidebar or the mobile filter panel: `app-shell` and the filtering change.

## Impact

- **Code (all under `src/`)**: new files in `src/shared/ui` — Field (with its context), Input, Select, Textarea, Checkbox, RadioGroup and their tests (FSD layer `shared`); modified: `src/app/styles/globals.css` (six semantic tokens added; no existing token modified), `src/shared/ui/icons.ts` (eye and chevron artwork re-exported), `src/shared/ui/index.ts` (new exports), `src/shared/ui/focus-guard.test.ts` (the new controls join the shared-focus list), `src/app/styles/theme-tokens.test.ts` (new tokens' completeness and contrast pairs).
- **Dependencies**: none. `lucide-react` is already approved; no new package is needed.
- **API**: none. This change consumes no API endpoints and touches no generated types; all texts are props supplied by consuming capabilities, and per-field API validation errors arrive as the field's error text.
- **Existing behavior**: unchanged. No screen consumes the new controls yet; placement happens in later changes.
