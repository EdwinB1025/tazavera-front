# Design

## Context

See proposal.md for motivation. Current state that shapes the approach:

- `src/shared/ui` holds the action controls (`Button`, `Link`), the data-entry controls of `add-form-fields` (`Field`, `Input`, `PasswordInput`, `Select`, `Textarea`, `Checkbox`, `RadioGroup`), `Badge` and `Card`, the icon entry point `icons.ts`, and Radix primitives pulled from the shadcn registry and rewired to tokens (`Sheet`, `DropdownMenu`, `Sidebar`). Every interactive control is a client component applying the shared `focus-visible:focus-ring` indicator, and the guard tests (`color-guard`, `radius-guard`, `focus-guard`, `client-boundary`, `xss-guard`, `icons`) enforce the rules at code level.
- `Checkbox` and `RadioGroup` set the own-field contract this change follows: the control renders its own label, takes `help` and `error` as its own props, renders nothing for an empty string, reads help before error, and never places itself inside a `Field`.
- `Badge` exposes `BADGE_GEOMETRY_CLASSES` (`type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5`) once `refactor-badge-geometry` is merged (decision D4 of `docs/design/add-evaluation-scales/handoff.md`): that constant is the single source of the badge geometry and its guard fails on a second literal copy of the seven tokens in `src/`.
- `src/app/styles/globals.css` already defines `evaluation-bean-on/off`, `evaluation-slider-track/start/end/thumb/thumb-border` in both themes, the radius family (`radius-pill/container/field/check`), the typographic roles (`type-label`, `type-body`, `type-meta`, `type-badge`, `type-error`, `type-card-heading`) and `@utility focus-ring`. Only the two bean-mark tokens are missing (decision below).
- `src/app/styles/theme-tokens.test.ts` carries the contrast matrices; its comment defers `evaluation-bean-*` and `evaluation-slider-*` pairs to this change, which registers them.
- The installed `radix-ui` is 1.6.7 (`@radix-ui/react-radio-group` 1.4.7, `@radix-ui/react-toggle-group` 1.1.19, `@radix-ui/react-alert-dialog` 1.1.23; verified in `node_modules/radix-ui/package.json`). No new npm dependency is introduced.
- This change consumes **no API endpoint** and no generated type: no method, path, auth, request, response or error shape is involved. The consumers map `deleteAnEvaluation`, `deactivateAUser` and `permanentlyDeleteAUser` to the dialog, `listOlfactoryTaxonomies` to the chip rows and the evaluation score fields to the scales later. **API errors reach the user only as copy a consumer passes in**: a request failure message as the dialog's `error` (rendered in the alert region, dialog stays open), and per-field validation messages as a control's `error`. No shared card is used, so no card field mapping applies.
- Settled product inputs are `docs/design/add-evaluation-scales/design-summary.md` (every Open answered 2026-10-06) and decisions D1–D4 of `docs/design/add-evaluation-scales/handoff.md`; this document records how they are reached in code and settles the single-component details the summary delegates.

## Goals / Non-Goals

**Goals:**

- Four controlled, theme-agnostic shared components whose accessibility contract is fully assertable in jsdom (attributes, roles, keyboard outcomes, exact classes where the summary pins a treatment).
- One source for the badge geometry and one source for the bean artwork, both through the existing entry points (`./Badge`, `icons.ts`).
- Every contrast pair the summary measured registered in the theme-token guard, and the color guard covering the `fill-`/`stroke-` utilities the bean introduces.

**Non-Goals:**

- Inverse variants of the three scale controls (decision D2): they render on the content surfaces only.
- Any selection limit on the chip group (decision D1): no `max`, no disabled-at-max state.
- Fixing the `Button` boundary defects F1/F2 (`fix-button-boundaries`) and the badge geometry exposure (`refactor-badge-geometry`).
- Visual capture: the 375/1280 review belongs to `add-specialist-evaluations` (Open 5 a). Nothing here renders on a route.

## Decisions

### D1 — Files, layers and entry points

All files are FSD layer `shared`; no route, page or widget is touched. One file per rewired primitive, as `Sheet.tsx` does.

| File | Change |
|---|---|
| `src/shared/ui/BeanScale.tsx` | new — the bean scale (client component) |
| `src/shared/ui/IntensitySlider.tsx` | new — the intensity slider (client component) |
| `src/shared/ui/DescriptorChipGroup.tsx` | new — the descriptor chip group (client component) |
| `src/shared/ui/ToggleGroup.tsx` | new — the Radix Toggle Group pulled from the shadcn registry and rewired to tokens, consumed only inside the segment |
| `src/shared/ui/ConfirmDialog.tsx` | new — the confirmation dialog (client component) |
| `src/shared/ui/AlertDialog.tsx` | new — the Radix Alert Dialog pulled from the shadcn registry and rewired to tokens, consumed only inside the segment |
| `src/shared/ui/icons.ts` | modified — the project's bean SVG joins the icon entry point (decision D4) |
| `src/shared/ui/index.ts` | modified — export `BeanScale`, `IntensitySlider`, `DescriptorChipGroup`, `ConfirmDialog` and their prop types; the two primitives stay segment-internal |
| `src/app/styles/globals.css` | modified — the two bean-mark tokens (decision D9) and one thumb utility (decision D5) |
| `src/app/styles/theme-tokens.test.ts` | modified — the seven deferred contrast pairs (decision D9) |
| `src/shared/ui/color-guard.test.ts` | modified — `fill-`/`stroke-` utilities (decision D10) |
| `src/shared/ui/focus-guard.test.ts` | modified — the three new scale controls join the shared-focus list (the dialog's focusable controls are `Button`s, which already carry the ring) |
| tests beside each file above | new/modified — `BeanScale.test.tsx`, `IntensitySlider.test.tsx`, `DescriptorChipGroup.test.tsx`, `ConfirmDialog.test.tsx`, `icons.test.ts`, `index.test.tsx` |

`xss-guard`, `radius-guard` and `client-boundary` need no change: they scan `src/shared/ui` and already cover the new files. The badge-geometry guard of `refactor-badge-geometry` stays green because the chip content imports the constant (decision D6) and never rewrites the seven tokens as literals.

### D2 — UI-specific types, declared before any component

No generated type from `src/shared/api/schema.ts` is used and no derived type is needed (the change consumes no operation). Each file declares its own prop types above the component, and the `readOnly` contract is enforced by a discriminated union rather than a runtime assertion: `onChange`/`onValueChange` is required unless `readOnly`, and bean size `sm` is rejected unless `readOnly` (design summary §1: `sm` is below the 24px target). Tests pin these with `@ts-expect-error` cases and `npx tsc --noEmit`, the `Textarea` precedent.

```ts
type BeanScaleSize = "sm" | "md" | "lg" | "responsive";

type BeanScaleProps = {
  label: ReactNode;
  value: number | null; // 1..9, or 0..9 with one decimal when readOnly
  valueText: string;
  disabled?: boolean;
  required?: boolean;
  help?: ReactNode;
  error?: ReactNode;
} & (
  | { readOnly: true; valueLabel: string; onChange?: never; size?: BeanScaleSize }
  | {
      readOnly?: false;
      valueLabel?: never;
      onChange: (value: number) => void;
      size?: Exclude<BeanScaleSize, "sm">;
    }
);

type IntensitySliderProps = {
  label: ReactNode;
  value: number | null; // 0..15; null renders as 0 (Open 4 a)
  valueText: string;
  valueLabel: string;
  scaleLabels: [string, string, string];
  disabled?: boolean;
  help?: ReactNode;
  error?: ReactNode;
} & (
  | { readOnly: true; onChange?: never }
  | { readOnly?: false; onChange: (value: number) => void }
);

type ChipOption = { value: string; label: string; color: string; level: 0 | 1 };
type ChipRow = { id: string; title?: ReactNode; options: ChipOption[] };

type DescriptorChipGroupProps = {
  legend: ReactNode;
  rows: ChipRow[];
  value: string[];
  disabled?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  emptyText?: ReactNode; // readOnly only
} & (
  | { readOnly: true; onValueChange?: never }
  | { readOnly?: false; onValueChange: (value: string[]) => void }
);

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  pending?: boolean;
  error?: ReactNode;
};
```

`size` defaults to `"responsive"`. `onChange` receives an integer; `onValueChange` receives the taxonomy `ulid` list. All help/error wiring follows the `RadioGroup` contract (own ids, `aria-describedby` with help before error, empty string renders nothing).

### D3 — Bean scale: Radix base, own key handler, geometric cut

The bean scale is a `"use client"` component rendering one `RadioGroup` primitive from `radix-ui` (`RadioGroup as RadioGroupPrimitive`, as `Sheet.tsx` does), with nine `RadioGroup.Item` beans named "1" to "9", the row one roving tab stop on the checked bean or on bean 1 when `value` is `null`. The primitive supplies `role="radiogroup"`/`role="radio"`, `aria-checked`, the roving tab index, controlled `value`/`onValueChange`, `disabled` and `required`; the group carries the label ids, `aria-describedby` and `aria-invalid` exactly as `RadioGroup.tsx` does.

**Keyboard (verified, then settled).** The summary's contract is Right/Up +1, Left/Down −1, Home 1, End 9 (spec "Keyboard operation"). The installed primitive does not provide it, verified in `node_modules/@radix-ui/react-radio-group/dist/index.mjs` and `node_modules/@radix-ui/react-roving-focus/dist/index.mjs` and against the Radix documentation (https://www.radix-ui.com/primitives/docs/components/radio-group, keyboard interactions; https://github.com/radix-ui/primitives/issues/3622):

- the documented Radio Group keys are Tab, Space and the four arrows only — Home and End are undocumented;
- `MAP_KEY_TO_FOCUS_INTENT` maps `Home`/`End` to first/last **focus**, and an item selects on focus only while `isArrowKeyPressedRef` is set by one of the four arrow keys, so Home/End never select;
- arrows are restricted to the group orientation (`getFocusIntent`), and Up maps to "prev" while the contract needs Up = +1.

Therefore one own key handler on the radiogroup root covers all six keys: ArrowRight/ArrowUp select one point more, ArrowLeft/ArrowDown one point less, Home selects 1 and End selects 9; each key selects the target bean and moves focus to it, and calls `preventDefault()` and `stopPropagation()` so the primitive's own arrow handling and its focus-followed click do not act a second time. Plain clicks keep selecting through the primitive. Alternative considered: a hand-rolled radiogroup (roles and roving tabindex by hand) — rejected, it rebuilds what the primitive already ships and the summary recommends the primitive; the handler is the remedy the summary anticipates ("an own key handler covers it if it fails").

**Marks and states.** Each bean is a square button of `md` 24px or `lg` 32px (`rounded-full`, no padding or border) rendering the `BeanMark` artwork (D4). Beans 1..`value` render the on artwork, the rest the off artwork. Focus applies `focus-visible:focus-ring` on the focused bean; hover changes only the cursor; disabled is 50% opacity with a not-allowed cursor and no focus (`disabled:opacity-50 disabled:cursor-not-allowed`, the `add-base-control` rule). The error message (`type-error`) carries the error; the group takes `aria-invalid`, as the spec states.

**Read-only.** No buttons render. The root is `role="meter"` with `aria-valuemin="0"`, `aria-valuemax="9"`, `aria-valuenow`, `aria-valuetext={valueLabel}` and `aria-labelledby` on the label, not focusable. Beans 1..`floor(v)` render on, `ceil(v)` renders the off mark with the on mark layered above it and clipped from the left to the fraction's width — one inline `clip-path: inset(0 <100 − 100·frac>% 0 0)`, a geometric cut, never `color-mix` — and the rest render off.

**Layout.** The summary §1 layout is the contract: root block with no outer spacing; label `type-label` with `mb-2`; a flex row (`items-center`, wrap, column gap 0.75rem, row gap 0.25rem) holding the bean row (flex, no wrap, 0.25rem apart) and the value text `type-body italic tabular-nums text-text-primary` (no underline: an underline means a link here); help `type-meta mt-1`, error `type-error mt-1`. The tests pin the value-text classes and the cumulative on/off artwork; the spacing classes stay the build's choice, asserted as it chose them.

### D4 — Bean artwork in the icon entry point

`icons.ts` gains one project SVG export, `BeanMark` (rule 6: the project's own SVGs join this module). It renders `aria-hidden`, with the disc a full circle filling the viewBox in `fill-evaluation-bean-on` or `fill-evaluation-bean-off`, and the MVC bean path scaled about the centre to sit inside the disc (the MVC drawing overflows its disc) with its fill and stroke in `fill-evaluation-bean-mark-on` / `stroke-evaluation-bean-mark-on` or `-mark-off`. The number inside the bean is dropped (settled). The MVC path is reused as it is — Product owner drew it, so its licence allows the reuse (Open 7 a); `Logo.tsx`'s `fill-logo-*` classes are the precedent for token-colored artwork. `BeanScale` takes the mark as `variant: "on" | "off"` and stacks two marks only for the read-only fraction (D3).

### D5 — Intensity slider: three layers, inline `--fill`, one thumb utility

`"use client"` around a native `<input type="range" min="0" max="15" step="1">` (native `role="slider"`, arrows and Home/End come for free). The track block (20px high) renders under the input:

1. a 6px `rounded-pill` layer carrying the gradient across the **whole track width**, built in the component from `evaluation-slider-start` to `evaluation-slider-end` (Tailwind gradient utilities with those two token stops);
2. an off layer in `bg-evaluation-slider-track` starting at `--fill` and running to the right edge — so a mid value shows only the first part of the gradient, as the MVC does;
3. the input on top with a transparent track.

`--fill` is set inline on the track block as a percentage (`value/15` of the width, `0` for `null` per Open 4 a). It is a length, not a color, so the Badge "only inline colors" rule is untouched.

The thumb is styled by one new `@utility intensity-slider-thumb` in `globals.css`, beside `@utility focus-ring`: it styles `::-webkit-slider-thumb` and `::-moz-range-thumb` as a 20px `rounded-full` circle in `var(--color-evaluation-slider-thumb)` with a 2px `var(--color-evaluation-slider-thumb-border)` edge. The utility is settled over per-element pseudo-class utilities because arbitrary pseudo-element variants escape the color guard's grammar (finding F3's known gap), while the utility keeps the colors in the token layer. The input carries `focus-visible:focus-ring` and is `rounded-pill` so the ring follows the track.

Header row (`justify-between items-baseline`, 0.75rem gap, `mb-2`): label `type-label`, value `type-body italic tabular-nums text-text-primary`. Marks row (`type-meta tabular-nums`, 0.25rem above the track block, inset 0.625rem each side so each mark sits under the thumb centre) and scale-labels row (`type-meta font-semibold text-text-label`, 0.125rem above, same inset) are `aria-hidden`. Help `type-meta mt-1`, error `type-error mt-1`. Read-only renders the same layers with no input and no thumb, as `role="meter"` min 0 max 15 with `aria-valuenow`, `aria-valuetext={valueLabel}` and `aria-labelledby`, not focusable.

### D6 — Descriptor chip group: border shell plus badge content (reading B)

Structure (decision D3 of the handoff): `fieldset` (no border, padding or margin) with `legend type-label mb-2`, `aria-describedby` on the fieldset for help and error and `aria-invalid` with an error; one `ToggleGroup` root (`type="multiple"`, controlled `value`/`onValueChange`) wrapping the rows; each titled row a `role="group"` with `aria-labelledby` on its `type-meta` title (0.375rem below the legend block); rows stacked 0.75rem apart; chips in a row flex-wrapping with 0.5rem gaps.

Each chip is a **button that carries only the 2px `border-muted` shell** — `inline-flex items-center rounded-field border-2 border-border-muted` plus `focus-visible:focus-ring` and `disabled:opacity-50 disabled:cursor-not-allowed` — and one content child that carries the badge geometry:

- **unselected:** a span applying `BADGE_GEOMETRY_CLASSES`, imported from `./Badge` (segment-internal import; any other layer would use `@/shared/ui`), holding a decorative `size-2 rounded-full` dot in the option's data color (inline style — data is the only sanctioned inline color) and the label in `text-text-strong`;
- **selected:** `Badge variant="taxonomy"` with the option's `color` and `level`, whose children are a `Check` icon (`size-4 shrink-0`, `aria-hidden`) and the label.

Both children carry the same geometry, so the chip measures 21 + 4 + 4 = 29px in both states (above the 24px target) and the geometry has one source: the constant and `Badge` both come from `Badge.tsx`. The shell's `rounded-field` matches the badge radius (feedback spec "Badge presentation", review log B2). No `max` prop exists (decision D1): the only disabled state is the whole group's.

Read-only renders no buttons: the chosen options appear as plain taxonomy `Badge`s in their rows, rows without a choice are omitted, and `emptyText` renders when nothing is chosen.

`src/shared/ui/ToggleGroup.tsx` holds the registry primitive rewired to tokens (the `Sheet.tsx` pattern): `ToggleGroup` root and item composed on `radix-ui`'s `ToggleGroup`, `aria-pressed` coming from the primitive in `type="multiple"`. The rows and the chip visuals stay in `DescriptorChipGroup.tsx`.

### D7 — Chip group keyboard: reading-order arrows

The settled behaviour is "one tab stop for the block, arrow keys moving through all chips in reading order" (spec "Keyboard operation"); the keys are settled here. The primitive's roving focus restricts arrows to one orientation (same `getFocusIntent` as D3), so one own key handler on the toggle-group root maps **ArrowRight and ArrowDown to the next chip and ArrowLeft and ArrowUp to the previous one**, wrapping, moving focus only — toggling stays on Space, Enter and click, the native button behaviour, which keeps navigation from changing the selection. This is the WAI-ARIA APG composite-toolbar convention for a row of toggle buttons; the bean scale keeps its own value-scale mapping (D3) because a score grows upward while a chip list reads forward. Disabled chips are skipped because the primitive excludes them from the roving candidates. The handler calls `preventDefault()` so the primitive does not also move focus.

### D8 — Confirmation dialog on the alert-dialog primitive

`AlertDialog.tsx` rewires the shadcn registry's Radix Alert Dialog to tokens as `Sheet.tsx` does: portal, overlay (`fixed inset-0 z-50 bg-nav-hover-shadow`, `Sheet`'s overlay classes), content, title, description, cancel and action pieces. `ConfirmDialog.tsx` composes it:

- the content is `role="alertdialog"` (the primitive sets it), `aria-labelledby` the title and `aria-describedby` the description; the panel is `bg-surface-card rounded-container shadow-lg` with 1.5rem padding, no border, centred in the viewport, `calc(100% - 2rem)` wide up to 32rem (`max-w-lg`, the MVC value);
- the title is `type-card-heading`, the description `type-body` 0.5rem below it, the error `type-error` in a `role="alert"` region 0.75rem below the description;
- the actions sit 1.5rem below the text block with 0.75rem between them: below `sm` they stack full width with the confirm above the cancel; from `sm` one right-aligned row, cancel then confirm (MVC order). Confirm is `Button variant="primary"` with `loading={pending}`; cancel is `Button variant="action-4"` rendered through the primitive's `Cancel` (composed `asChild`), which is what the primitive focuses on open — verified in `node_modules/@radix-ui/react-alert-dialog/dist/index.mjs`: `onOpenAutoFocus` prevents the default and calls `cancelRef.current.focus()`, and `onPointerDownOutside`/`onInteractOutside` call `preventDefault()`, so the overlay never closes the dialog. Escape closes through the dialog primitive and is intercepted with `onEscapeKeyDown` prevented while `pending`, as is the cancel button (`disabled={pending}`). Focus returns to the trigger on close (the dialog primitive's default). `onConfirm` runs the consumer's request; the consumer closes on success and passes `error` on failure.

### D9 — Tokens and contrast registration

Two tokens, both themes, no existing token modified; every primitive already exists in `globals.css`:

- `--color-evaluation-bean-mark-on`: `var(--color-cream-100)` in `@theme`, `var(--color-night-petrol-950)` under `[data-theme="dark"]`;
- `--color-evaluation-bean-mark-off`: `var(--color-brown-900)` in `@theme`, `var(--color-night-sage-100)` under `[data-theme="dark"]`.

`src/app/styles/theme-tokens.test.ts` registers the seven pairs the summary measured (both matrices), and the exclusion comment listing `evaluation-bean-*` / `evaluation-slider-*` is updated:

1. icon `evaluation-bean-mark-off` / `evaluation-bean-off`;
2. icon `evaluation-bean-mark-on` / `evaluation-bean-on`, the translucent bg documented over `surface-form` and `surface-card` in the traditional theme (a `DOCUMENTED_BASES["evaluation-bean-on"]` entry);
3. bound `evaluation-slider-thumb` / `surface-form` and `surface-card`;
4. bound `evaluation-slider-thumb` / `evaluation-slider-track`;
5. bound `border-muted` / `surface-form` and `surface-card`;
6. text `text-strong` / `surface-card`;
7. exempt `evaluation-slider-thumb-border` / `evaluation-slider-thumb` (decorative).

Only pairs the matrices do not already assert are added. Other host surfaces are registered by the consumer that uses them (summary §4).

### D10 — Color guard covers `fill-` and `stroke-`

`color-guard.test.ts`'s grammar gains the `fill-` and `stroke-` property groups beside `bg/text/border/ring/ring-offset`, with the same token-or-built-in rule and the same self-check style: it fails on `fill-nope` and passes on `fill-evaluation-bean-on` (finding F3). Known gap kept open: arbitrary variant prefixes (such as pseudo-element variants) still do not parse — which is why the thumb colors live in the `@utility` (D5) rather than in variant classes.

## Risks / Trade-offs

- [The primitive's focus-followed click may fire when the bean key handler moves focus after an arrow key (its arrow flag is set on `document`)] → the handler stops propagation as well as preventing default, and the tests assert the observable outcome — the value and the focused bean per key — plus `onChange` receiving exactly the target score.
- [Radix internals cited above change in an upgrade] → the six-key contract is asserted in `BeanScale.test.tsx`, so an upgrade that breaks it fails the suite; the handler itself is ours and portable to a hand-rolled group if the primitive is ever dropped.
- [The `pending` state disables the cancel button while it may hold focus] → pending starts when the user activates the confirm action, whose button holds focus at that moment; the dialog's focus trap keeps focus inside.
- [The unverified items of the summary remain so: the Catalan scale labels and the 375/1280 rendering] → the labels are consumer copy (Open 9 b) and the captures belong to `add-specialist-evaluations` (Open 5 a); the 375px fit is arithmetic (248px of beans plus ~30px of value text in 295px).
- [The chip content depends on `refactor-badge-geometry`'s export] → decision D4's merge gate precedes every task (tasks.md precondition), and the chip tests use the constant rather than its literal value so an order change there breaks nothing here.

## Migration Plan

None. The change adds components and tokens no screen consumes yet; rollback is removing the change's files.
