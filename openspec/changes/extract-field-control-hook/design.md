# Design

Sources: backlog R22 (`docs/backlog.md`); technical review §2.4 and §3.1, row R22 (`docs/review/technical-review.md`); form-fields design D1 and D1.1 (the attribute contract); commit 4731a77 and decisions log 2026-10-07 "Combobox dentro de Field". Fast lane: no design folder.

## Context

Current state on `qa`:

- `Input`, `Select` and `PasswordInput` each call `useContext(FieldContext)` and resolve, prop first: `variant = variantProp ?? field?.variant ?? "default"`, `id = idProp ?? field?.controlId`, `describedBy = describedByProp ?? ([field?.helpId, field?.errorId].filter(Boolean).join(" ") || undefined)`, `ariaInvalid = ariaInvalidProp ?? (field?.invalid ? "true" : undefined)`, `required = requiredProp ?? (field?.required ? true : undefined)` and `invalid = ariaInvalid === true || ariaInvalid === "true"`. Measured complexity 19, 20 and 23.
- `Textarea` does the same without the variant (it has no `variant` prop). Complexity 15.
- `Checkbox` never reads the context (it is never placed in a `Field`). It resolves the same attributes over its own `useId` ids: `id = idProp ?? checkboxId`, `describedBy` from its help and error ids (only when the message is a non-empty value), `ariaInvalid` from its error, `invalid` as above; `required` passes through untouched in `rest`. Complexity 25.
- `Combobox` (`Combobox.tsx:102`) reads the context only for `inField` (`field !== null`) and `field.controlId`, used to find the Field's `<label>` and point its `for` at cmdk's input id. It renders the project `Input`, which resolves the field attributes itself. Complexity 27, 183 lines.

## Goals / Non-Goals

**Goals:** one resolution of the field attributes in `shared/ui`, used by every control that resolves them today; each control keeps its exact props, defaults, attributes and class names.

**Non-Goals:** no change to `Field`, `FieldContext`, `Combobox`, `RadioGroup`, any class name or any test.

## API

None. No endpoint is consumed and no API error is presented. No generated API type is used; the hook's types are UI types (D2).

## Files

| Path | FSD layer | Status | Content |
|---|---|---|---|
| `src/shared/ui/use-field-control.ts` | shared (ui) | New | The hook and its two types (D1–D2) |
| `src/shared/ui/Input.tsx` | shared (ui) | Modified | Resolves through the hook (D3) |
| `src/shared/ui/Select.tsx` | shared (ui) | Modified | Resolves through the hook (D3) |
| `src/shared/ui/Textarea.tsx` | shared (ui) | Modified | Resolves through the hook (D3) |
| `src/shared/ui/PasswordInput.tsx` | shared (ui) | Modified | Resolves through the hook (D3) |
| `src/shared/ui/Checkbox.tsx` | shared (ui) | Modified | Resolves through the hook with its own field value (D3) |

`src/shared/ui/index.ts`, `field-context.ts`, `Field.tsx` and `Combobox.tsx` do not change. No route file changes.

## Decisions

### D1 — Placement

`src/shared/ui/use-field-control.ts`, beside `field-context.ts`, with `"use client"` as its first statement (it calls a hook; `client-boundary.test.ts`). Controls import it by sibling path (`./use-field-control`), never through `@/shared/ui`. It is not exported from `src/shared/ui/index.ts`: no other slice imports it.

### D2 — Signature

```ts
export type FieldControlProps = {
  variant?: FieldContextValue["variant"];
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  required?: boolean;
};

export type FieldControl = {
  variant: FieldContextValue["variant"];
  id: string | undefined;
  describedBy: string | undefined;
  ariaInvalid: AriaAttributes["aria-invalid"];
  required: boolean | undefined;
  invalid: boolean; // ariaInvalid is true or "true"
};

export function useFieldControl(
  props: FieldControlProps,
  ownField?: FieldContextValue,
): FieldControl;
```

The hook always reads `FieldContext`; the field it resolves from is `ownField` when given, else the context value (or `null` outside a Field). Each result is the explicit prop when it is not `undefined`, else the field's value, exactly as the current chains: `variant` falls back to `"default"`, `describedBy` joins the field's help and error ids that are set (help first) or is `undefined` when none is, `ariaInvalid` is `"true"` when the field is invalid, `required` is `true` when the field is required, and every field value is `undefined` outside a Field.

### D3 — Per control

| Control | Passes to the hook | Uses from the result |
|---|---|---|
| `Input` | `variant`, `id`, `aria-describedby`, `aria-invalid`, `required` props | all six |
| `Select` | same as `Input` | all six |
| `PasswordInput` | same as `Input` | all six |
| `Textarea` | `id`, `aria-describedby`, `aria-invalid`, `required` props (no `variant`) | all but `variant` |
| `Checkbox` | `id`, `aria-describedby`, `aria-invalid`, `required` props, plus `ownField` built from its own ids: `controlId` its `useId` id, `helpId` / `errorId` only when its help / error is a non-empty value, `invalid` when the error is, `required: false`, `variant` its `variant` prop | `id`, `describedBy`, `ariaInvalid`, `required`, `invalid` |

`Checkbox` passing `required: false` makes the result its own `required` prop, which it renders as today (it passed through in `rest`). Its `variant` stays the prop with default `"default"`. Because it always passes `ownField`, an enclosing `Field` still has no effect on it.

### D4 — Combobox left out

`Combobox` needs the raw context (whether there is a Field, and the Field's control id to find its label), not resolved attributes; the hook does not expose them, and making it do so would add a second purpose to it. Its input attributes already go through the hook inside the `Input` it renders. Its size (183 lines, complexity 27) stays above the limits of AGENTS.md and is reported, not split here.

## Risks / Trade-offs

- [An attribute changes by accident] → each task runs the control's protecting tests, which assert the id, `aria-describedby`, `aria-invalid`, `required` and the border classes; verify reads the diff of each control.
- [`Checkbox` stays above the complexity limit] → its row-presentation ternaries, not the field resolution, carry most of it; reported, not split here.

## Migration Plan

One branch, no data migration. Rollback is reverting the change's commits.
