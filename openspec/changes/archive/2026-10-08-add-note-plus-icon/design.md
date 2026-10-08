# Design

## Context

Backlog R58 (production AUT finding 26) and Product owner's decision of 2026-10-08: the "Add note" link of the evaluation form shows a "+" at the end. `src/pages/evaluation-form/ui/NoteField.tsx` renders the closed note as a button styled as a link (`LINK_BUTTON_CLASSES`, add-evaluation design.md D14) whose only content is `addLabel`. The spec `evaluations` requirement "Notes" describes the control, so the change modifies that requirement.

## Goals / Non-Goals

**Goals:** a trailing, decorative plus icon on the "Add note" control, with the text and accessible name unchanged.

**Non-Goals:** no change to the remove-note control, the open or read-only note, the catalogs, the tokens or the API.

## Decisions

### D1. Trailing `Plus` icon on the Add note button

The "Add note" button renders `{addLabel}` followed by `<Plus className="size-4 shrink-0" aria-hidden="true" />`, with `Plus` imported from `@/shared/ui/icons` (the only icon entry point; R58 chose the icon over a literal "+" per the icon rule). The button adds `inline-flex items-center gap-2` to its classes so the icon sits centred after the text: the same icon size and row pattern the shared `Button` uses for its icon (`inline-flex`, `items-center`, `gap-2`, icon `size-4 shrink-0`) and the trailing position of the `X` in `FilterChip`. These are layout and size utilities, not tokens; no token is added. The icon follows the link colour through `currentColor`. Because it is `aria-hidden`, the button's accessible name stays its text: the catalog `addNoteLabel` ("Añadir nota" / "Add note" / "Afegir nota") or, in a part with two axes, the axis-named form `EvaluationGroupCard` already builds. The remove-note button keeps `LINK_BUTTON_CLASSES` unchanged. Alternative rejected: a literal "+" character, which would join the accessible name unless hidden and breaks the icon rule.

## Risks / Trade-offs

- `inline-flex` on an underlined link button: the underline still applies to the text; the icon is not underlined. Accepted as the visual of the project's other icon controls.
- Existing tests query the button by its name "Add note"; they keep passing because the icon is hidden.
