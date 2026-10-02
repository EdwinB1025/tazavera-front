# Design summary — add-form-fields

Input for `/opsx:propose`. All decisions below were taken by the product owner (Augusto). No open decisions.

- Change-id: `add-form-fields`
- Capability: `form-fields`
- Depends on: `add-base-control` (Button, Link, radius tokens incl. `radius-check`, icon entry point `src/shared/ui/icons.ts`).
- Existing tokens in `src/app/styles/globals.css` are not modified; new tokens are added only. Traditional and dark palettes are never mixed: traditional tokens point to traditional primitives, dark tokens to night primitives.
- Design rules 1–9 from `add-base-control` apply unchanged (semantic tokens only, neutral variants, mandatory states, accessibility, responsive per component and mobile-first, single icon entry point, `readOnly` prop, controlled/uncontrolled, theme-agnostic components).

## 1. Scope

In scope: Field, Input (incl. password reveal), Select, Textarea, Checkbox, Radio group.
- `default` variant (light surfaces): all six.
- `inverse` variant (dark surfaces: sidebar and full-screen mobile filter panel): Field, Input, Select, Checkbox, Radio group. Textarea has no inverse variant (not used on dark surfaces).

Out of scope: coffee-bean scale and intensity slider (`add-evaluation-scales`); facet subcomponents and facet option rows (filtering change); labels, help texts and error copy (supplied by each consuming capability).

## 2. Components — default variant

### Field
- Structure: label above (`type-label`), control, optional help text (`type-meta`), error message below (`type-error`). Texts are props supplied by the consuming capability.
- `required` prop: visual asterisk next to the label, hidden from assistive tech; sets `required` on the control.
- Error: control border switches to `feedback-error`; message shown; control gets `aria-invalid`; `aria-describedby` points to help and error. Error is never conveyed by color alone. Per-field API validation errors (422) arrive here; mapping API errors to copy belongs to the feature.

### Input
- `h-10`, `radius-field`, 2px border `border-strong`, background `surface-input`, text `type-control`, placeholder `text-placeholder` in italics.
- Password mode with show/hide toggle (Lucide eye icons via `icons.ts`); icon color `text-secondary`. `text-input-icon` is not used (white, 1.14:1).
- Hover: no visual change; state is shown on focus.
- Focus: ring `focus-ring` + offset `focus-offset`.
- Disabled: opacity 50%, cursor not-allowed, no hover change (same as all controls).

### Select
- Native `<select>`. Same box and states as Input, plus a Lucide chevron in `text-secondary`. The open option list is native and not styled.

### Textarea
- Own style, intentionally different from Input: background `surface-textarea`, border `border-muted`, `radius-field`, same focus and disabled as Input. Default variant only.

### Checkbox
- Box 16px, radius `radius-check`, border `border-strong`, checked fill `surface-checked`.
- The checked state is carried by the mark: color `checked-mark` (new token).
- Label to the right of the box; the whole label is clickable so the hit area is at least 24×24px (WCAG 2.5.8).

### Radio group
- Group rendered as `fieldset` with a `legend` in `type-label` (group name supplied by the consuming capability).
- Each option: circle 16px (intrinsic shape, circular in both themes), border `border-strong`, checked fill `surface-checked`, inner dot `checked-mark`. Label to the right, clickable, hit area at least 24×24px.

## 3. Inverse variant

Purpose: controls placed on `nav-surface-dark` (sidebar) and on the full-screen mobile filter panel, which uses the same styles.

| Element | Token |
|---|---|
| Field label / radio legend | `nav-text-dark` |
| Field help text | `nav-text-dark` |
| Field error message and error border | `feedback-error-inverse` (new) |
| Input / select: background | transparent |
| Input / select: border at rest | `border-inverse` (new) |
| Input / select: border on hover | `nav-text-dark` |
| Input / select: text | `nav-text-dark` |
| Input / select: placeholder (italics) | `text-placeholder-inverse` (new) |
| Select chevron, password eye icon | `nav-text-dark` |
| Focus ring / offset | `focus-ring-inverse` / `focus-offset-inverse` (new) |
| Checkbox / radio: unchecked border | `border-inverse` |
| Checkbox / radio: checked fill | `surface-checked` |
| Checkbox mark / radio dot | `checked-mark` |
| Checkbox / radio option label | `nav-text-dark` |

## 4. New tokens

| Token | Traditional | Dark theme |
|---|---|---|
| `checked-mark` | petrol-900 | night-petrol-950 |
| `focus-ring-inverse` | cream-100 | = `focus-ring` (night-sage-100) |
| `focus-offset-inverse` | sage-800 | = `focus-offset` (night-petrol-950) |
| `border-inverse` | sage-400 | = `border-strong` (night-petrol-600) |
| `text-placeholder-inverse` | petrol-300 | = `text-placeholder` (night-petrol-400) |
| `feedback-error-inverse` | oxblood-300 | = `feedback-error` (night-oxblood-500) |

## 5. Verified contrasts (WCAG relative luminance)

| Pair | Traditional | Dark | Minimum |
|---|---|---|---|
| `checked-mark` / `surface-checked` | 6.82 | 4.91 | 3 |
| `border-strong` / `surface-input` | 12.24 | — | 3 |
| `feedback-error` / `surface-input` | 7.16 | — | 3 / 4.5 |
| `text-placeholder` / `surface-input` | 6.81 | — | 4.5 |
| `border-muted` / `surface-textarea` | 4.25 | — | 3 |
| `text-secondary` (eye, chevron) / `surface-input` | 6.42 | — | 3 |
| `nav-text-dark` / `nav-surface-dark` | 6.41 | 12.27 | 4.5 |
| `focus-ring-inverse` / `nav-surface-dark` | 6.41 | 12.27 | 3 |
| `border-inverse` / `nav-surface-dark` | 3.41 | 4.19 | 3 |
| `text-placeholder-inverse` / `nav-surface-dark` | 4.75 | 7.36 | 4.5 |
| `feedback-error-inverse` / `nav-surface-dark` | 4.50 | 5.26 | 4.5 |
| `surface-checked` / `nav-surface-dark` | 3.79 | 4.22 | 3 |

Why the inverse tokens exist: on `nav-surface-dark` (traditional sage-800) the default tokens fail — `focus-ring` 1.80, `border-strong` 1.80, `text-label` 1.07, `feedback-error` 1.05.

Note: `feedback-error-inverse` traditional is exactly at the 4.5:1 minimum; any change to oxblood-300 or sage-800 must re-check this pair.

## 6. Responsive

None of these controls needs responsive behaviour. `type-control` already switches size at `md` (16px on mobile to avoid browser zoom on focus).

## Propose status

- Change-id: `add-form-fields`
- Date: 2026-10-02 (artifact review applied the same day)
- Validation: `openspec validate add-form-fields --strict` → `Change 'add-form-fields' is valid` (4/4 artifacts complete: proposal, specs, design, tasks). Re-validated after the artifact review: `Change 'add-form-fields' is valid`.

Resolved (product-owner decisions in the explore review after this summary was written):

- **Field ↔ control contract:** option 2, a thin context (design.md D1). Field generates the ids with `useId` and provides `controlId`, `helpId`, `errorId`, `invalid` and `required`; each control reads them as defaults with explicit props winning, and works standalone without Field. Field and every interactive control are client components. The exact attribute table is normative in design.md so the tests can assert it.
- **Inverse focus:** option (a), local reassignment (design.md D2). The inverse variant reassigns `--color-focus-ring` and `--color-focus-offset` to the inverse pair in its own scope and keeps `focus-visible:focus-ring`; `focus-guard.test.ts` is unchanged. "Focus tokens of the active theme" in the `theming` spec covers the whole focus family, inverse pair included — no `theming` delta; the `form-fields` spec states that inverse controls use the inverse focus tokens. The mechanism is generalized to one `variant-inverse` scope utility carrying the whole inverse token reassignment (D2 table) — a decision taken during propose, accepted by Augusto in the artifact review below.
- **readOnly:** not in scope (design.md D3). Design rule 7 applies to components with an interactive and a static version (bean scale, slider). Input and Textarea pass the native `readOnly` attribute through; Select, Checkbox and Radio group expose none.
- **Delegated details settled in design.md (D9):** `checked-mark` renders as `text-checked-mark` (mark) and `bg-checked-mark` (radio dot); the 24×24px hit area is `flex min-h-6 min-w-6 items-center gap-2` on the clickable label; the select chevron is `appearance-none` plus a positioned `ChevronDown`; the password toggle is a `type="button"` control with `Eye`/`EyeOff` at `size-4 text-text-secondary` and a show/hide accessible name; the error boundary swaps to `border-feedback-error`.
- **Shape of the change:** kept as one change; tasks are vertical slices, one component per slice with its own tests, Field first (the controls depend on its context), so the build can stop cleanly between slices.

Artifact review (2026-10-02, before apply) — product-owner decisions applied to the artifacts:

1. **Checkbox and Radio group are their own field.** Each renders its own label (Checkbox: label to the right; Radio group: the `fieldset` legend) and accepts help text and an error message directly (`type-meta` / `type-error`), with its own ids, `aria-describedby` (help first, then error), `aria-invalid` and `required`. They are never placed inside Field, which wraps only Input, Select and Textarea. Spec Field requirement, design D1/D1.1 and tasks 6.1/7.1 updated.
2. **Standalone controls get their accessible name from the consumer.** A control used without Field takes the consumer-supplied `aria-label` and passes it through. Spec scenario "Control without a field" and tasks 3.1, 4.1 and 5.1 updated.
3. **Textarea-on-dark-surfaces clause removed** from the spec requirement and its scenario: it describes consumers, cannot be tested, and is already in Out of Scope.
4. **The `variant-inverse` generalisation** is accepted as a decision taken during propose (recorded under Resolved above).
5. **Inverse variant on Field.** Field takes `variant` and renders `variant-inverse` on its root, so label, help and error resolve to the inverse tokens. The field context carries the variant; Input and Select use it as their default and an explicit prop wins, as for the D1 attributes. Design D1/D4 and tasks 2.1, 3.1 and 4.1 updated.
6. **Password toggle focus.** The toggle is interactive and carries `focus-visible:focus-ring`; task 3.1 asserts it on the toggle itself (the focus guard only checks the class exists in the file).
7. **Behaviour instead of undefined classes.** `appearance-none` (checkbox and radio inputs) and `size-2` (radio dot) are removed from tasks 6.1/7.1: the tasks state the behaviour — a custom box/circle replaces the native control; the dot appears when selected, in `bg-checked-mark` — and the build chooses those classes. Classes design.md defines stay exact.
8. **Task 1.2 lists `checked-mark` / `surface-checked` once**, in the both-theme list.

Remains open: nothing. No `docs/backlog.md` entry affects this change.