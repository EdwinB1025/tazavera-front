Type: Refactor (fast lane)

# Proposal

## Why

Every data-entry control repeats the same resolution of the enclosing `Field`: variant, control id, `aria-describedby` from the help and error ids, `aria-invalid` and `required`, each with the rule "context values are defaults, an explicit prop always wins" (form-fields design D1). The copy sits in `Input`, `Select`, `Textarea` and `PasswordInput`, and `Checkbox` repeats it over its own help and error ids. It pushes each control's cyclomatic complexity to 15–25, and every new control would add another copy (backlog R22; technical review §2.4 and §3.1, row R22). Nothing the user sees changes.

## What Changes

- A shared hook `useFieldControl` in the `shared/ui` segment, beside `field-context.ts`, resolves the field attributes once: it reads the `Field` context (or a field value the control supplies itself) and lets each explicit prop win (design.md D1–D2).
- `Input`, `Select`, `Textarea` and `PasswordInput` take their field attributes from the hook instead of their own `??` chains (design.md D3).
- `Checkbox` takes its attributes from the same hook, passing its own label-help-error ids as the field value, so it keeps ignoring any enclosing `Field` (design.md D3).
- `Combobox` stays as it is: it reads the `Field` context only to know whether it sits in a `Field` and to point the Field's label at cmdk's input id; its field attributes already come from the `Input` it renders (design.md D4).
- No prop, default, rendered attribute or class name of any control changes.

## Out of scope (non-goals)

- `Field`, `FieldContext` and `FieldContextValue`: unchanged.
- `Combobox`'s own Field handling (commit 4731a77, decisions log 2026-10-07 "Combobox dentro de Field") and its size (above the limits before this change; not split here).
- `RadioGroup` and the other controls, which do not read the `Field` context.
- The `Checkbox` row presentation and its class choices.
- No new test, no changed assertion, no new text, token, contract operation or dependency; the hook is not added to `src/shared/ui/index.ts`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `form-fields`: one ADDED requirement, "One field resolution for every field control", stating the observable property the refactor establishes. It adds no behaviour.

## Impact

- **Code** (FSD layer `shared`, segment `ui`): new `src/shared/ui/use-field-control.ts`; modified `src/shared/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx`, `PasswordInput.tsx`, `Checkbox.tsx`.
- **Tests**: none added or changed. Protecting tests: `Field.test.tsx`, `Input.test.tsx`, `Select.test.tsx`, `Textarea.test.tsx`, `PasswordInput.test.tsx`, `Checkbox.test.tsx`, `Combobox.test.tsx` (in `src/shared/ui/` and `qa/src/shared/ui/`).
- **Dependencies, contract, texts, tokens**: none.
- **Resolves**: backlog R22.

## Propose status

- **Change-id:** `extract-field-control-hook`
- **Date:** 2026-10-08
- **Validation:** `openspec validate extract-field-control-hook --strict` → "Change 'extract-field-control-hook' is valid".
- **Resolves:** backlog R22.
- **Resolved:** the hook takes an optional field value of the control's own (`ownField`), so `Checkbox` adopts it while keeping its own label-help-error binding (design.md D2–D3); `Combobox` is left out because it needs the raw context, not resolved attributes, and its input already resolves through the hook inside `Input` (design.md D4).
- **Open:** nothing.
