Type: Refactor (fast lane)

# Proposal

## Why

Production AUT finding 26 (backlog R58): the evaluation form's "Add note" control ("Añadir nota") shows its text only. Product owner decided on 2026-10-08 that it shows a "+" at the end. The fast-lane typing is Product owner's; unlike a behaviour-keeping refactor, this change **changes a visible detail by Product owner's decision**: it adds a decorative trailing plus icon to the control the `evaluations` requirement "Notes" describes, so it updates that requirement and adds the test of its new scenario.

## What Changes

- The "Add note" control of every axis and part shows a plus icon after its text. The icon is decorative (hidden from assistive technology), so the visible text and the accessible name stay exactly the catalog text (`addNoteLabel`, or its axis-named form in a part with two axes).
- The icon is the `Plus` already exported from the shared icon entry point, sized and spaced like the project's other inline control icons.

## Non-goals

- No catalog key, token, colour or dependency is added; no text changes.
- No change to the remove-note control, the open note field, the read-only note or what is sent to the API.
- No API or contract change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: the "Add note" control shows a decorative plus icon after its text.

## Impact

- Code: `src/pages/evaluation-form/ui/NoteField.tsx`.
- Tests: `src/pages/evaluation-form/ui/NoteField.test.tsx` (one new test). Protecting: the other tests of that file, `src/pages/evaluation-form/ui/EvaluationForm.test.tsx` and the QA tests `vitest related` selects.
- APIs, dependencies: none.

## Propose status

- **Change-id:** add-note-plus-icon
- **Date:** 2026-10-08
- **`openspec validate add-note-plus-icon --strict`:** valid
- **Backlog entry resolved:** R58 — "Añadir nota" shows a trailing plus icon (production AUT finding 26, 2026-10-08)
- **Resolved:** the icon, its position, its hiding and its sizing and spacing (design.md D1).
- **Open:** none.
