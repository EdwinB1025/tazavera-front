# Design

Sources: backlog R34 (`docs/backlog.md`); technical review §3.1, row R34 (`docs/review/technical-review.md`); the AGENTS.md size limits; add-evaluations design D3, D4, D9–D12 and D14–D17 (the form's behaviour, kept as it is). Fast lane: no design folder.

## Context

Current state on `qa`: `src/pages/evaluation-form/ui/EvaluationForm.tsx` (339 counted lines) declares `EXTRACTION_METHODS`, `ExtractionMethod`, `EvaluationFormTexts`, `EvaluationFormProps`, the layout class constants and the helpers `initialState` and `allGroups`; `EvaluationForm` (244 lines, complexity 25) holds nine `useState` calls (form values, `ulid`, `busy`, `message`, `roastLevelMissing`, `closed`, `highlighted`, `openGroups`, `legendOpen`), the `save`, `onSave` and `onClose` flows, and renders the header, the context card, the eight groups with the fragrance checkbox, the descriptor blocks and the 1–9 legend, and the actions or the read-only status. `src/pages/evaluation-form/ui/EvaluationGroupCard.tsx` declares `EvaluationGroupTexts`, `FormStateUpdate` and `EvaluationGroupCardProps` (11 props); `EvaluationGroupCard` (205 lines, complexity 17) renders the collapsible card, the descriptive and affective parts with their intensity sliders, bean scales, descriptor block panels and notes, and the Extrinsic notes. `FormBusy` is declared in `FormActions.tsx`. `EvaluationDetail.tsx`, `form-fixtures.ts` and `form-texts.ts` import `EvaluationFormTexts` from `./EvaluationForm`; both `EvaluationGroupCard.test.tsx` files render `EvaluationGroupCard` with `group`, `state`, `onChange`, `texts`, `complete` and `readOnly` and rely on its uncontrolled open state.

## Goals / Non-Goals

**Goals:** the form's state in one reducer of the slice's `model` segment, driven by one hook; every component and function of the slice's touched files at most 80 lines with a complexity of at most 15, and every file at most 300 lines; identical DOM, classes, texts, accessible names, focus and validation behaviour, requests, bodies and request order.

**Non-Goals:** no change to the props of `EvaluationForm` or `EvaluationGroupCard`, to `EvaluationFormTexts`' keys, to any other component of the slice, to `@/entities/evaluation`, to any message key or to any test.

## API

Unchanged; listed because the hook now issues the calls. All three go through `@/entities/evaluation` (the shared request client, bearer token):

| Method and path | Request | Response | Errors as shown today |
|---|---|---|---|
| `POST /user/evaluations` | `buildCreateBody(values, offering.ulid)` | the evaluation; its `ulid` replaces the URL with `/{locale}/manage/evaluations/{ulid}` | `403` not-yours message; `409` already-closed message; any other failure the failure message |
| `PUT /user/evaluations/{evaluation_ulid}` | `buildUpdateBody(values)` | the evaluation | as above |
| `PATCH /user/evaluations/{evaluation_ulid}/close` | no body, after a successful save | none | `403` not-yours message; `409` incomplete message with the incomplete groups expanded and highlighted; any other failure the failure message |

A missing roast level sends nothing and shows the required-field message. No new API type.

## Files

| Path | FSD layer | Status | Content |
|---|---|---|---|
| `src/pages/evaluation-form/model/form-updates.ts` | pages (model) | New | `FormValuesUpdate`, `FormStateUpdate` and the pure updaters (D1) |
| `src/pages/evaluation-form/model/form-model.ts` | pages (model) | New | `FormBusy`, `FormModel`, `FormAction`, `initialFormModel`, `formReducer` (D2) |
| `src/pages/evaluation-form/model/use-evaluation-form.ts` | pages (model) | New | `FormMessages`, `EvaluationFormModel`, `useEvaluationForm` (D3) |
| `src/pages/evaluation-form/ui/group-texts.ts` | pages (ui) | New | `EvaluationGroupTexts`, moved unchanged (D6) |
| `src/pages/evaluation-form/ui/EvaluationFormHeader.tsx` | pages (ui) | New | The back link, eyebrow, heading and captions (D4) |
| `src/pages/evaluation-form/ui/ContextFieldsCard.tsx` | pages (ui) | New | `EXTRACTION_METHODS`, `ExtractionMethod`, the roast level and extraction method card (D4) |
| `src/pages/evaluation-form/ui/EvaluationGroupList.tsx` | pages (ui) | New | The eight group cards, the fragrance checkbox, the descriptor blocks and the 1–9 legend (D4) |
| `src/pages/evaluation-form/ui/AxisControls.tsx` | pages (ui) | New | `IntensityControl`, `PreferenceControl`, `AxisNote` (D5) |
| `src/pages/evaluation-form/ui/GroupParts.tsx` | pages (ui) | New | `DescriptivePart`, `AffectivePart`, `ExtrinsicNotes` and their shared column (D5) |
| `src/pages/evaluation-form/ui/EvaluationForm.tsx` | pages (ui) | Modified | `EvaluationFormTexts`, `EvaluationFormProps`, `EvaluationForm` composing the parts (D4) |
| `src/pages/evaluation-form/ui/EvaluationGroupCard.tsx` | pages (ui) | Modified | `EvaluationGroupCardProps`, `EvaluationGroupCard` composing the parts (D5) |
| `src/pages/evaluation-form/ui/FormActions.tsx` | pages (ui) | Modified | Imports `FormBusy` from the model (D6) |

`src/pages/evaluation-form/index.ts`, `EvaluationDetail.tsx`, `form-fixtures.ts`, `form-texts.ts` and every test file do not change. No route file changes.

## Decisions

### D1 — Pure updaters of the form values

`model/form-updates.ts` holds the value edits the controls make today, each a function returning a `FormValuesUpdate`, with exactly today's spreads:

```ts
export type FormValuesUpdate = (values: EvaluationFormState) => EvaluationFormState;
/** How a control hands an edit to the form (the group card's `onChange`). */
export type FormStateUpdate = (update: FormValuesUpdate) => void;

export function withRoastLevel(value: string): FormValuesUpdate;          // toRoastLevel(value)
export function withExtractionMethod(value: string): FormValuesUpdate;    // "" → null
export function withFragranceNotEvaluated(checked: boolean): FormValuesUpdate;
export function withDescriptors(selection: DescriptorSelectionKey, value: string[]): FormValuesUpdate;
export function withIntensity(axis: DescriptiveAxisKey, score: number): FormValuesUpdate;
export function withPreference(axis: AxisKey, score: number): FormValuesUpdate;
export function withNote(part: PartKey, axis: AxisKey, note: string | null): FormValuesUpdate;
export function withGeneralObservation(note: string | null): FormValuesUpdate;
```

The argument types follow the controls' `onChange` signatures; where one differs from the above, the build uses the control's type and notes it in the commit body.

### D2 — The reducer

`model/form-model.ts` declares the state of the whole form and the reducer. `FormBusy` moves here from `FormActions.tsx` unchanged. `initialFormModel(offering, evaluation)` returns today's initial values: the values from `formStateFromEvaluation` or `emptyFormState` with the offering's roast level, `ulid` from the evaluation or `null`, `closed` when the evaluation is closed or the offering is `null`, every group and the legend open exactly when `closed`, and `busy`, `message`, `roastLevelMissing` and `highlighted` cleared. `allGroups` moves here unchanged.

```ts
export type FormBusy = "save" | "close" | null;

export type FormModel = {
  values: EvaluationFormState;
  ulid: string | null;
  busy: FormBusy;
  message: string | null;
  roastLevelMissing: boolean;
  closed: boolean;
  highlighted: boolean;
  openGroups: Record<GroupKey, boolean>;
  legendOpen: boolean;
};

export type FormAction =
  | { type: "edit"; update: FormValuesUpdate }
  | { type: "groupOpen"; group: GroupKey; open: boolean }
  | { type: "legendOpen"; open: boolean }
  /** An action starts: busy set, highlight cleared. */
  | { type: "start"; busy: "save" | "close" }
  | { type: "roastLevelMissing" }
  /** A save is sent: roast-level error and message cleared. */
  | { type: "send" }
  | { type: "fail"; message: string }
  | { type: "create"; ulid: string }
  /** An action ends: busy cleared; the message set unless `null`. */
  | { type: "settle"; message: string | null }
  /** The close succeeded: busy cleared, read-only, every group and the legend open. */
  | { type: "close"; message: string }
  /**
   * The close failed: busy cleared and the message set; on a `409`
   * (`incomplete` not `null`) those groups open and the form is highlighted.
   */
  | { type: "refuse"; message: string; incomplete: GroupKey[] | null };

export function initialFormModel(
  offering: OfferingDetail | null,
  evaluation: EvaluationItem | undefined,
): FormModel;
export function formReducer(model: FormModel, action: FormAction): FormModel;
```

Each dispatch replaces the group of setter calls that run together today, at the same point of the flow, so the renders between the awaits do not change.

### D3 — The hook

`model/use-evaluation-form.ts` declares `useEvaluationForm({ locale, offering, evaluation, messages })`, which owns `useReducer(formReducer, …, initialFormModel)` and moves today's `failureFor`, `save`, `onSave` and `onClose` unchanged apart from dispatching (D2). `messages` is the structural subset of `EvaluationFormTexts["actions"]` the flows read, so the model imports no `ui` type; `EvaluationForm` passes `texts.actions`. The incomplete groups of a `409` are read from the completeness computed at the click, as today. `window.history.replaceState` stays in `save`.

```ts
export type FormMessages = {
  savedMessage: string;
  closedMessage: string;
  incompleteMessage: string;
  notYoursMessage: string;
  alreadyClosedMessage: string;
  failureMessage: string;
};

export type EvaluationFormModel = {
  model: FormModel;
  /** The closed form's read-only presentation (design.md D4, D17 of add-evaluations). */
  readOnly: boolean;
  completeness: ReturnType<typeof completenessOf>;
  edit: FormStateUpdate;
  setGroupOpen: (group: GroupKey, open: boolean) => void;
  setLegendOpen: (open: boolean) => void;
  onSave: () => Promise<void>;
  onClose: () => Promise<void>;
};
```

The model files render nothing and carry no `"use client"`: they run inside the client boundary `EvaluationForm.tsx` already declares (Next.js `use client` reference, `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`).

### D4 — The form composes

`EvaluationForm` keeps `EvaluationFormProps` and `EvaluationFormTexts` (same keys; `ExtractionMethod` is imported from `./ContextFieldsCard`), calls `useEvaluationForm` and renders, inside the same `form` with the same classes and `onSubmit`:

- `EvaluationFormHeader` — props `{ locale, offering, texts }`; the back link, eyebrow, the coffee name or the offering-missing label, and the two captions only when the offering exists.
- `ContextFieldsCard` — props `{ offering, values, readOnly, roastLevelMissing, onEdit, texts }`; the section card with the roast level field (only when the offering exists) and the extraction method field with the stored custom method; it owns `EXTRACTION_METHODS`, `ExtractionMethod` and `CONTEXT_FIELDS_CLASSES`.
- `EvaluationGroupList` — props `{ locale, taxonomies, form, texts }` (`form` is the hook's `EvaluationFormModel`); the groups wrapper, each `EvaluationGroupCard` with today's props, the fragrance checkbox as its `top` when editable, the read-only or editable `DescriptorBlock` as today, and the `ScaleLegend` right after Flavor / Aftertaste.
- The read-only status paragraph or `FormActions`, kept inline in `EvaluationForm` as today.

Each new component declares the texts type of the keys it reads; `EvaluationFormTexts` satisfies each structurally, so the form passes its whole `texts`.

### D5 — The group card composes

`EvaluationGroupCard` keeps `EvaluationGroupCardProps` (same 11 props, same defaults) and its uncontrolled open state, the collapsible card, the header with its indicator, the highlight and the body with `top`. Its parts move to sibling files, one component per variant:

- `AxisControls.tsx`: `IntensityControl` (the intensity slider of one descriptive axis, read-only or editable as today), `PreferenceControl` (the bean scale of one affective axis, read-only or editable as today) and `AxisNote` (the note field of one axis, its "Add note" text naming the axis when the part has two). Each takes `{ axis, state, onChange, texts, readOnly }` (`AxisNote` also `part` and `pair`) and disables the fragrance axis when "Fragrance not evaluated" is checked, as today.
- `GroupParts.tsx`: a local column shell (`data-part`, part classes, heading, axes panel, block panels, notes), `DescriptivePart` and `AffectivePart` (each with its split classes when the group has both parts) and `ExtrinsicNotes` (the `generalObservation` note). The class constants of the parts move with them.

Edits go through the D1 updaters, so the card's markup holds no spread of the form values.

### D6 — Moved types

`EvaluationGroupTexts` moves unchanged to `ui/group-texts.ts`; `EvaluationForm.tsx` and the new parts import it from there. `FormStateUpdate` moves to `model/form-updates.ts` (D1) and `FormBusy` to `model/form-model.ts` (D2); `FormActions.tsx` and `EvaluationGroupCard.tsx` import them from the model. No test imports any moved name.

## Risks / Trade-offs

- [The renders between awaits change] → each dispatch replaces exactly one group of today's setter calls (D2); `EvaluationForm.test.tsx` asserts the busy state, the messages, the URL replacement, the expanded and highlighted groups and the request bodies and order.
- [Markup changes by accident] → each task runs the protecting tests in both suites; verify reads each moved block against the removed one.
- [A reducer run twice in Strict Mode] → the reducer and the updaters are pure; the requests and `replaceState` stay in the hook's handlers.

## Migration Plan

One branch, no data migration. Rollback is reverting the change's commits.
