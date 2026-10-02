# Design

## Context

See proposal.md for motivation. Current state that shapes the approach:

- `src/shared/ui` holds the action controls (Button, Link), the icon entry point `icons.ts`, and the shared focus utility `focus-ring` (2px offset + 2px ring from `--color-focus-offset` / `--color-focus-ring`). Controls are client components styled with semantic-token utilities; the guard tests (`color-guard`, `radius-guard`, `focus-guard`, `client-boundary`, `icons`) enforce the rules at code level.
- `src/app/styles/globals.css` holds primitives, semantic tokens per theme (traditional in `@theme`, dark under `[data-theme="dark"]`), the radius family (`radius-pill/container/field/check`) and the typographic roles (`type-label`, `type-control`, `type-meta`, `type-error`).
- This change consumes no API endpoint and no generated type: all texts are props supplied by consuming capabilities (see proposal.md — Impact). The only API-error surface is the field's error message, where a consuming feature presents a per-field 422 validation error as copy it maps itself; non-field API errors belong to the feedback capability. No card is used, so no card field mapping applies.
- Design rules 1–9 of `add-base-control` apply unchanged. Product-owner decisions from `docs/design/add-form-fields/design-summary.md` and the explore review are recorded below as given.

## Goals / Non-Goals

**Goals:**

- One field wrapper that binds label, help text and error message to whatever control it holds, and controls that stay usable and correctly attributed without it.
- Identical focus behaviour everywhere: the one shared indicator, with inverse colors where the surface demands them.
- Full testability of the accessibility contract in jsdom: the attributes are fixed and enumerable, so tests can assert them exactly.

**Non-Goals:**

- Static/read-only renderings of these controls (design rule 7 is out of scope here — see D3).
- Form state management, validation logic, or API error mapping beyond displaying supplied copy.
- Styling the native option list of the select or the native pickers.

## Decisions

### D1 — Field binds to its control through a thin context

Field generates the ids with `useId` (control id, help id, error id) and provides them through a context together with the invalid and required state. Each control reads that context **as defaults**; an explicit prop always wins over the context value. A control rendered outside a Field gets no context and works on its own (no injected attributes). Field and every interactive control are client components (`"use client"`).

The context value (UI-specific type, declared before the components):

```ts
type FieldContextValue = {
  controlId: string;
  helpId?: string;
  errorId?: string;   // set when an error message is shown
  invalid: boolean;
  required: boolean;
};
```

Exact attributes each control receives from the context (normative for the tests):

| Attribute | Value | Applied to |
|---|---|---|
| `id` | `controlId` | the `<input>` / `<select>` / `<textarea>` element; the `<fieldset>` in a radio group |
| `aria-describedby` | the present ids among `helpId`, `errorId`, space-separated in that order; omitted when neither exists | same element as `id` |
| `aria-invalid` | `"true"` when `invalid`, omitted otherwise | same element as `id` |
| `required` | `required` boolean when `required` | the `<input>` / `<select>` / `<textarea>`; each radio `<input>` of a radio group |

Alternatives considered: `cloneElement` injection (implicit, untypeable, breaks when the child forwards props elsewhere); Field rendering the control itself (loses composition — the password input, select options and radio options would need Field to know them all); render props (explicit but noisy at every call site). The context keeps Field and the controls independently testable.

### D2 — Inverse focus reassigns the focus tokens locally

The inverse variant reassigns `--color-focus-ring` and `--color-focus-offset` to `--color-focus-ring-inverse` / `--color-focus-offset-inverse` in the control's own scope and keeps applying the shared `focus-visible:focus-ring` class. One utility, one ring geometry; only the resolved colors vary. `focus-guard.test.ts` stays unchanged except for adding the new controls to its shared-focus list (D9): no control defines a focus treatment of its own.

The `theming` requirement "focus tokens of the active theme" is read as covering the whole focus family, inverse pair included, so no `theming` delta is made; the `form-fields` spec states that inverse controls resolve the shared indicator to the inverse focus tokens.

Alternative considered: a second `focus-ring-inverse` utility. Rejected: it would give the project two focus indicators, and the focus guard would have to be weakened to allow it.

The same reassignment mechanism carries the whole inverse variant: one scope utility `variant-inverse` in `src/app/styles/globals.css` reassigns the tokens below, so every control keeps one class set across both variants (design rule 9) and the inverse surface resolves through the same semantic names:

| Reassigned | To |
|---|---|
| `--color-text-label` | `--color-nav-text-dark` |
| `--color-text-secondary` | `--color-nav-text-dark` |
| `--color-text-strong` | `--color-nav-text-dark` |
| `--color-text-placeholder` | `--color-text-placeholder-inverse` |
| `--color-border-strong` | `--color-border-inverse` |
| `--color-feedback-error` | `--color-feedback-error-inverse` |
| `--color-focus-ring` | `--color-focus-ring-inverse` |
| `--color-focus-offset` | `--color-focus-offset-inverse` |

Two inverse treatments stay explicit classes because they are not a variable swap: the input and select background (`bg-transparent`) and their hover border (`hover:border-nav-text-dark`, a hover variant cannot reassign a token). Checked fills and marks are identical in both variants (`surface-checked`, `checked-mark`), so they are untouched.

### D3 — No readOnly treatment in this change

Design rule 7 (`readOnly` prop) applies to controls that have both an interactive and a static version — the bean scale and the intensity slider. No form-field control has a static version in the design (values are displayed elsewhere). Input and Textarea pass the native `readOnly` attribute through like any other native attribute; Select, Checkbox and Radio group expose no `readOnly`.

### D4 — Variants

Controls with a dark-surface rendering take `variant: "default" | "inverse"` (neutral values, design rule 2), defaulting to `default`; `inverse` renders the `variant-inverse` scope utility of D2. Textarea renders the default variant only and takes no `variant` prop.

### D5 — New semantic tokens

Six tokens are added to `src/app/styles/globals.css` (new tokens only; no existing token modified). Traditional values go in the semantic `@theme` block, dark values under `[data-theme="dark"]`, following the established pattern:

| Token | Traditional | Dark theme |
|---|---|---|
| `checked-mark` | petrol-900 | night-petrol-950 |
| `focus-ring-inverse` | cream-100 | = `focus-ring` (night-sage-100) |
| `focus-offset-inverse` | sage-800 | = `focus-offset` (night-petrol-950) |
| `border-inverse` | sage-400 | = `border-strong` (night-petrol-600) |
| `text-placeholder-inverse` | petrol-300 | = `text-placeholder` (night-petrol-400) |
| `feedback-error-inverse` | oxblood-300 | = `feedback-error` (night-oxblood-500) |

Contrasts were verified in `docs/design/add-form-fields/design-summary.md` (§5) with the WCAG relative-luminance formula; `theme-tokens.test.ts` gains the pairs. Utilities generated from the names follow the project convention (`checked-mark` → `text-checked-mark`, `border-inverse` → `border-border-inverse`, `focus-ring-inverse` → `text-focus-ring-inverse`/`bg-focus-ring-inverse`, etc.).

### D6 — Artwork

Password visibility toggle: Lucide `Eye` / `EyeOff`; select chevron: Lucide `ChevronDown`; checkbox check mark: Lucide `Check`. All re-exported through `src/shared/ui/icons.ts` (single icon source). The radio dot is a CSS circle, not artwork (intrinsically circular, exempt from the radius family like the avatar and slider thumb). Icons take the control's current text color (existing base-controls requirement).

### D7 — Controlled and uncontrolled (design rule 8)

The native controls support both modes: `value` + `onChange` (controlled) or `defaultValue` / `defaultChecked` (uncontrolled). Radio group takes `value` / `defaultValue` and `onChange` at group level. The password visibility toggle is internal UI state and is neither a value nor a mode.

### D8 — Files (design rule: full paths with FSD layer)

All in FSD layer `shared`, segment `ui`. No routes and no `pages/` screens are created or modified.

Created:

| Path | Contents |
|---|---|
| `src/shared/ui/field-context.ts` | `FieldContextValue` type and the context (UI-specific types, declared before the components) |
| `src/shared/ui/Field.tsx`, `Field.test.tsx` | Field and its tests |
| `src/shared/ui/Input.tsx`, `Input.test.tsx` | text input incl. password reveal |
| `src/shared/ui/Select.tsx`, `Select.test.tsx` | select |
| `src/shared/ui/Textarea.tsx`, `Textarea.test.tsx` | textarea |
| `src/shared/ui/Checkbox.tsx`, `Checkbox.test.tsx` | checkbox |
| `src/shared/ui/RadioGroup.tsx`, `RadioGroup.test.tsx` | radio group |

Modified:

| Path | Change |
|---|---|
| `src/app/styles/globals.css` | six tokens (D5) |
| `src/shared/ui/icons.ts` | re-export `Eye`, `EyeOff`, `ChevronDown`, `Check` |
| `src/shared/ui/index.ts` | export the new controls and their prop types |
| `src/shared/ui/focus-guard.test.ts` | the new controls join the shared-focus list |
| `src/app/styles/theme-tokens.test.ts` | token completeness and the new contrast pairs |

The `color-guard`, `radius-guard` and `client-boundary` tests cover the new files automatically (they scan the directory).

### D9 — Contract details (delegated to design by the product owner)

- **`checked-mark` utility names**: the token renders through `text-checked-mark` (check mark) and `bg-checked-mark` (radio dot), following the `--color-{name}` → `{property}-{name}` convention.
- **24×24px hit area**: the clickable label of a checkbox or radio option carries `flex min-h-6 min-w-6 items-center gap-2`, so the hit area reaches at least 24 by 24 pixels with the project's 8px icon–label gap.
- **Select chevron**: the select renders with `appearance-none` inside a `relative` wrapper with a positioned `ChevronDown` (`size-4`, `text-text-secondary`, `pointer-events-none`); the open option list stays native and unstyled.
- **Password visibility toggle**: a `type="button"` control in the input's `relative` wrapper with `Eye` / `EyeOff` at `size-4 text-text-secondary`; its accessible name states its current action (show/hide wording).
- **Error boundary**: every control swaps its border color class to `border-feedback-error` when its field is invalid (resolving to `border-feedback-error-inverse` inside `variant-inverse`).

## Risks / Trade-offs

- [`feedback-error-inverse` traditional is exactly at 4.5:1 (oxblood-300 on sage-800)] → recorded in the token test; any change to those primitives must re-check the pair.
- [The local focus-token reassignment of D2 is invisible to the focus guard, so a regression would not fail it] → the control tests assert the inverse scope classes on inverse controls and their absence on default ones.
- [jsdom cannot verify hit areas, rendered geometry or contrast] → hit areas and geometry are asserted through the exact class sets (project convention); contrasts are asserted in `theme-tokens.test.ts`.
- [Six controls in one implementation session] → tasks are vertical slices, one control per slice with its own tests, Field first (the controls depend on its context), so the build can stop cleanly between slices.
- [Native select rendering varies by platform] → the closed box is styled (`appearance-none`, positioned chevron); the open list stays native and unstyled by design.

## Migration Plan

Additive only: no screen consumes the new controls yet and no existing token, utility or test changes meaning. Rollback is removing the change's files.
