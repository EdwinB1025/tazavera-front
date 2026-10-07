Status: draft — pending Product owner review

# Design summary — add-evaluation-scales

Input for `/opsx:explore` and `/opsx:propose`, once Product owner approves it. Drafted by the design lead on 2026-10-06. Anything not settled by a source is listed under "Open".

- Change-id: `add-evaluation-scales`
- Capability: `form-fields` (bean scale, intensity slider, descriptor chip group). The confirmation dialog's requirement goes in `feedback` (see §5).
- Depends on: `add-theme-tokens`, `add-base-control`, `add-focus-ring-utility`, `add-form-fields` and `add-landing` (taxonomy `Badge`), all merged into `develop`.
- Consumed by: `add-specialist-evaluations` (all four components), `add-user-account` (dialog), and later `add-offering-catalog` (read-only scales for the consensus).
- Backlog: no entry in `docs/backlog.md` names this change. R4 (menu panel radius) touches `base-controls` radii but not these components.
- Decisions log: no entry names this change. D14 (the add-landing page layout) does not apply, because this change adds no page.

## 0. Settled inputs (not re-decided here)

| Source | What it settles |
|---|---|
| `add-specialist-evaluations/design-summary.md` §3 | Chip group control: shadcn/ui **Toggle Group** (Radix), multiple selection. Unselected chips are outlined; selected chips are filled with the taxonomy data colour (the add-landing taxonomy `Badge` look). Rows wrap. Main tastes disable the remaining chips once two are selected. Level 2 is not shown. |
| `add-specialist-evaluations/design-summary.md` §4 | Bean scale as a radio group with arrows and Home/End, cumulative fill, value as text outside the bean ("6/9"); tokens `evaluation-bean-on/off` and `evaluation-bean-mark-on/off`. Native `range` slider 0–15, 6px track with `radius-pill`, 20px thumb, marks drawn by the component and labels passed as props. Both have a `readOnly` version. Bean size `md` below `md` and `lg` from `md`. Ported from the MVC and adjusted to the front's tokens; an SVG that cannot be adjusted is redrawn from the original. |
| `bycoding/contexto_diseño_claude_1003.md` §5 ("Escalas de evaluación") | The bean has two layers: a background disc, enlarged until it contains the drawing, in `evaluation-bean-on/off`, and the drawing ("mark") in `evaluation-bean-mark-on` (cream-100 / night-petrol-950) or `-off` (brown-900 / night-sage-100). No number inside the bean. Sizes sm 16, md 24, lg 32px. Hover changes only the cursor. Bean `readOnly` is display only: one decimal, partial bean drawn by a geometric cut (not `color-mix`), announced as "6,4 de 9". Slider `readOnly` has no thumb. Both scales are controlled only. |
| `add-base-control/design-summary.md` §2 | Rules 1–9: semantic tokens only, neutral `variant`/`size` values, required states, focus, mobile-first, icons through `icons.ts`, `readOnly` on the same component, custom controls controlled only, theme-agnostic. |
| `add-base-control/design-summary.md` §3 and Propose status | Radius tokens. The bean and the slider thumb stay circular in both themes (`rounded-full`). Disabled is 50% opacity with a not-allowed cursor and no hover change. |
| `openspec/specs/form-fields/spec.md` | "Data-entry control states" (focus ring, disabled, hover) and "Theme-driven rendering" (new tokens defined in both themes) apply to all three form controls. |
| `openspec/specs/feedback/spec.md` | "Taxonomy badge" (data-colour background, white or black label by luminance, 92% background at level 1) and "Badge presentation" (`radius-field`). |
| `contracts/openapi.yaml` (develop) | Descriptive scores are `integer`, nullable, "between 0 and 15". Affective scores are `integer`, nullable, "between 1 and 9". Taxonomy nodes carry `ulid`, `level`, `nameEn/Es/Ca`, `color` (`#RRGGBB`), `categories` and `children` (`listOlfactoryTaxonomies`). |
| `.claude/CLAUDE.md` §2 | Shadcn is allowed only for what the project does not own. Never shadcn's Button, Input, Select, Checkbox, Radio or Textarea. |

## 1. Bean scale (`BeanScale`, `src/shared/ui/BeanScale.tsx`)

**MVC mapping.**
- `resources/views/flux/icon/coffee-bean.blade.php`: the SVG (viewBox `-2.4 -2.4 28.80 28.80`, disc `rect` with `rx=14.4` at `scale(0.58)`, bean path with `fill`/`stroke` in the line colour), the `sm/md/lg` sizes, and the number inside the bean. The front drops the number (settled).
- `resources/views/layouts/evaluations/partials/affective-bean.blade.php`: nine `<button>`s with cumulative `bean-on`/`bean-off`, `gap-1`, and the label above the row.
- `resources/views/layouts/offerings/partials/consensus-axis.blade.php`: the read-only row. The fraction bean there uses `color-mix`; the front uses a geometric cut instead (settled). The value is shown as text after the row.
- `resources/css/app.css` `.bean-on`/`.bean-off` (lines 938–946): translated to `evaluation-bean-on/off`. No MVC colour is copied.

**Bean graphic.**
- It is the project's own SVG, exported from `src/shared/ui/icons.ts` (rule 6).
- The disc is a full circle filling the viewBox. The MVC bean path is scaled about the centre so the whole drawing sits inside the disc (the MVC drawing overflows its disc).
- The disc fill uses `evaluation-bean-on` or `evaluation-bean-off`. The path fill and stroke use `evaluation-bean-mark-on` or `-mark-off`.
- The SVG is `aria-hidden`.

**Props.** Labels and value texts are passed as props, already resolved from the catalog by the consumer.

| Prop | Type | Notes |
|---|---|---|
| `label` | `ReactNode` | Group name, rendered visibly and referenced by `aria-labelledby` |
| `value` | `number \| null` | Controlled. An integer from 1 to 9; `null` means nothing chosen. With `readOnly`, a number from 0 to 9 with one decimal |
| `onChange` | `(value: number) => void` | Required unless `readOnly` |
| `valueText` | `string` | Visible value, for example "6/9", "–/9" or "6,4/9". The consumer formats it with the catalog suffix |
| `valueLabel` | `string` | `readOnly` only: the accessible value, for example "6,4 de 9" |
| `size` | `"sm" \| "md" \| "lg" \| "responsive"` | Default `"responsive"`: `md` (24px) below `md`, `lg` (32px) from `md`. `sm` (16px) is allowed only with `readOnly`, because it is below the 24px target size (WCAG 2.5.8) |
| `readOnly` | `boolean` | Display only (rule 7) |
| `disabled`, `required` | `boolean` | |
| `help`, `error` | `ReactNode` | Same contract as `RadioGroup`: an empty string renders nothing, help is read before error |

**States.**
- **Rest:** beans `1..value` show the on disc and on mark; the rest show the off disc and off mark.
- **Hover:** cursor only (settled).
- **Focus:** `focus-visible:focus-ring` on the focused bean (`rounded-full`).
- **Disabled:** 50% opacity and a not-allowed cursor, with no hover; the beans leave the focus order.
- **Error:** `type-error` message below, `aria-invalid` on the group. The beans have no boundary of their own to recolour, so the error is carried by the message text, never by colour alone.
- **readOnly:**
  - Beans `1..floor(v)` are on and the rest are off.
  - Bean `ceil(v)` draws the off bean with the on bean on top, clipped from the left to the fraction's width (a geometric cut).
  - It renders no buttons and is not focusable.

**Accessibility.**
- Interactive: `role="radiogroup"` labelled by `label`. Nine `role="radio"` options named "1" to "9", so assistive technology announces "6, 6 of 9" with the group name. One tab stop (roving `tabindex` on the checked bean, or on bean 1 when `value` is `null`).
  - Right and Up arrows move and select +1; Left and Down move −1; Home selects 1; End selects 9.
  - Recommended base: the Radix `RadioGroup` primitive from the installed `radix-ui` (1.6.7), so no new dependency. Its Home/End behaviour is **unverified**: the tests must assert it, and an own key handler covers it if it fails. This is a single-component detail the architect settles in design.md (AGENTS.md "Design context").
- `readOnly`: `role="meter"` with `aria-valuemin="0"`, `aria-valuemax="9"`, `aria-valuenow`, `aria-valuetext={valueLabel}` and `aria-labelledby` pointing at the label.

**Layout and spacing.**
- **Root:** block, with no outer margin and no padding, border or radius. The consumer spaces it.
- **Label:** `type-label`, 0.5rem below it (as `RadioGroup`'s `legend mb-2`).
- **Row:** flex, `items-center`, wraps, with 0.75rem between columns and 0.25rem between rows. The beans and the value text are its two children. Only the value text may drop to a second line; the beans never wrap.
- **Beans:** flex, no wrap, 0.25rem apart.
  - The 4px focus-ring spread fits that gap exactly, so it never overlaps the neighbouring bean (computed by the design lead).
  - Each bean is a square of 24px (`md`) or 32px (`lg`): no padding or border, `rounded-full`.
- **Width at 375px (computed by the design lead):** the bean row is 9 × 24 + 8 × 4 = 248px, plus about 30px of value text. That fits the 295px left after 1rem page padding and 1.5rem card padding.
- **Value text:** `type-body`, italic, tabular numerals, `text-primary`. The MVC underline (`tz-paragraph italic underline`) is dropped, because in this project an underline means a link (base-controls Link).
- **Help and error:** 0.25rem above each (`RadioGroup`'s `mt-1`).

## 2. Intensity slider (`IntensitySlider`, `src/shared/ui/IntensitySlider.tsx`)

**MVC mapping.**
- `resources/views/layouts/evaluations/partials/descriptive-intensity.blade.php`:
  - an `input range` from 0 to 15, step 1, with its fill in `--fill`;
  - a header with the label on the left and the value "x/15" on the right;
  - marks 0/5/10/15 and labels BAJA/MEDIA/ALTA under the track.
- `resources/views/layouts/offerings/partials/descriptive-intensity-static.blade.php`: the static version, a `div` with the same `--fill`.
- `resources/css/app.css` `.tz-intensity-slider` (lines 949–980): a fixed gradient under an "off" layer that starts at `--fill`, and a 20px thumb. It is translated as follows:
  - the gradient runs from `evaluation-slider-start` to `evaluation-slider-end`;
  - the off layer is `evaluation-slider-track`;
  - the thumb is `evaluation-slider-thumb` with a `evaluation-slider-thumb-border` edge.

**Props.**

| Prop | Type | Notes |
|---|---|---|
| `label` | `ReactNode` | A visible `<label>` bound to the input. The slider is its own field and is never placed in `Field`, like Checkbox |
| `value` | `number \| null` | Controlled, an integer from 0 to 15. How `null` renders is Open 4 |
| `onChange` | `(value: number) => void` | Required unless `readOnly` |
| `valueText` | `string` | Visible, for example "8/15" |
| `valueLabel` | `string` | Accessible value (`aria-valuetext`), for example "8 de 15" |
| `scaleLabels` | `[string, string, string]` | Low, medium and high, from the catalog |
| `readOnly`, `disabled` | `boolean` | |
| `help`, `error` | `ReactNode` | Same contract as Checkbox |

**States.**
- **Rest:**
  - The track is 6px high with `rounded-pill`.
  - The fill runs from 0 to `value/15` in the start-to-end gradient. The gradient spans the whole track width, so a mid value shows only its first part, as in the MVC.
  - The rest of the track is `evaluation-slider-track`.
  - The thumb is a 20px `rounded-full` circle with a 2px `evaluation-slider-thumb-border` edge.
- **Hover:** cursor only (same rule as the bean).
- **Focus:** `focus-visible:focus-ring` on the input, which is `rounded-pill` so the ring follows the track.
- **Disabled:** 50% opacity, not-allowed cursor.
- **Error:** `type-error` message below and `aria-invalid` on the input.
- **readOnly:** the same track and fill with no thumb (settled). It renders as `role="meter"` with min 0, max 15, `aria-valuenow`, `aria-valuetext={valueLabel}` and `aria-labelledby` pointing at the label. It is not focusable.

**Accessibility.**
- The native range gives `role="slider"`, arrow and Home/End keys, and min and max.
- The accessible name comes from `label`; `aria-valuetext` comes from `valueLabel`.
- The marks and the scale labels are `aria-hidden`, because the value is announced by the slider.

**Layout and spacing.**
- **Root:** block, full width of its container, with no outer margin, padding, border or radius.
- **Header row:** flex, `justify-between`, `items-baseline`, 0.75rem gap, 0.5rem below it. The label is `type-label`. The value is `type-body`, italic, tabular numerals, `text-primary`, without the MVC underline (same reason as §1).
- **Track block:** 20px high (the thumb), with the 6px track centred vertically.
- **Marks row (0/5/10/15):** 0.25rem above it, `justify-between`, `type-meta` with tabular numerals. It is inset 0.625rem on both sides, half the thumb, so each mark sits under the thumb centre at that value (computed by the design lead).
- **Scale-labels row:** 0.125rem above it, the same 0.625rem inset, `justify-between`, `type-meta` in `font-semibold`, coloured `text-label`. The MVC used `--color-text-filter-label`, which translates to `text-label`.
- **Help and error:** 0.25rem above each.
- **Gradient and thumb styling:**
  - The gradient is built in the component from the start and end tokens (`add-theme-tokens/design-summary.md`, line 49).
  - `--fill` is set inline as a percentage. It is a length, not a colour, so the Badge "only inline colours" rule is untouched.
  - Thumb pseudo-elements (`::-webkit-slider-thumb`, `::-moz-range-thumb`) or a `@utility` in `globals.css`: the architect settles this in design.md (single component).

## 3. Descriptor chip group (`DescriptorChipGroup`, `src/shared/ui/DescriptorChipGroup.tsx`)

**MVC mapping.**
- `resources/views/layouts/evaluations/partials/descriptor-cascade.blade.php`: chips per taxonomy node, `rounded-full`, the selected chip filled with the node colour, unselected chips with a data-colour border, a 25% tint and data-colour text, `flex-wrap gap-3`.
  - The front changes the structure. Rows come from the settled §3 rule (one row per level-0 node with matching level-1 children, plus one shared row of childless level-0 nodes), instead of children revealed on selection. Level 2 is dropped.
  - The MVC's data-colour text on a 25% tint is not used: its contrast depends on the data and cannot be guaranteed (see Open 2).
- `resources/views/layouts/evaluations/partials/evaluation-axis.blade.php` (lines 55 and 109) and `livewire/evaluations/evaluation-form.blade.php` (line 63, main tastes): where the block is placed.

**Props.**
- The component receives rows that are already built. Mapping `GET /taxonomies` to rows is the consumer's job (`add-specialist-evaluations` §3).

| Prop | Type | Notes |
|---|---|---|
| `legend` | `ReactNode` | Block name (the `fieldset` `legend`) |
| `rows` | `{ id: string; title?: ReactNode; options: { value: string; label: string; color: string; level: 0 \| 1 }[] }[]` | `title` is the level-0 node name for a row of children. The shared row has none. `value` is the taxonomy `ulid`, `label` is the localized name, `color` is `#RRGGBB` |
| `value` | `string[]` | Controlled |
| `onValueChange` | `(value: string[]) => void` | Required unless `readOnly` |
| `max` | `number` | Optional. Once `value.length === max`, the unselected chips are disabled (main tastes: 2) |
| `readOnly`, `disabled` | `boolean` | |
| `help`, `error` | `ReactNode` | `help` carries the limit ("Up to 2"), so the disabled chips are explained in text |
| `emptyText` | `ReactNode` | `readOnly` only, shown when nothing is selected |

**States.** Proposed. The colour and boundary treatment is Open 2; the reuse of the Badge geometry is Open 3.
- **Unselected:**
  - transparent background and a 2px `border-muted` border;
  - a 0.5rem `rounded-full` dot in the data colour before the label (decorative, `aria-hidden`);
  - the label in `text-strong`.
- **Selected:**
  - the button keeps the same 2px `border-muted` border;
  - its content is the existing `Badge variant="taxonomy"` with the node's `color` and `level`, so the background, the depth opacity and the white or black label come from the feedback spec;
  - a `Check` icon (`icons.ts`, 1rem, `aria-hidden`) replaces the dot, so the selected state does not rest on colour.
- **Hover:** cursor only.
- **Focus:** `focus-visible:focus-ring`.
- **Disabled** (whole group, or chips beyond `max`): 50% opacity, not-allowed cursor; the chip is skipped by arrow keys.
- **Error:** `type-error` message below and `aria-invalid` on the `fieldset`.
- **readOnly:**
  - only the selected options render, as plain taxonomy `Badge`s, in the same rows;
  - empty rows are omitted, and `emptyText` shows when nothing is selected;
  - it is a list with no buttons.

**Accessibility.**
- A `fieldset` with `legend` and `aria-describedby` pointing at the help and the error.
- One Radix `ToggleGroup` root, `type="multiple"`, from the installed `radix-ui` (1.6.7; `@radix-ui/react-toggle-group` 1.1.19, verified in `node_modules/radix-ui/package.json`), pulled through the shadcn registry and rewired to tokens as `Sheet` was.
- One tab stop for the block, with arrow keys moving through all chips in reading order. Each chip is a button with `aria-pressed`.
- Each titled row is `role="group"` with `aria-labelledby` pointing at its title.

**Layout and spacing.**
- **Root:** `fieldset` with no border, padding or margin.
- **Legend:** `type-label`, 0.5rem below it.
- **Rows:** a vertical stack with 0.75rem between rows.
- **Row title:** `type-meta`, 0.375rem below it.
- **Chips in a row:** flex, wrapping, 0.5rem gap in both directions.
- **Chip:**
  - `inline-flex`, `items-center`, `type-badge`, a 2px border, `rounded-field`;
  - inner padding 0.125rem vertical and 0.5rem horizontal, with 0.25rem between icon or dot and label (the `Badge` geometry);
  - height 21 + 4 + 4 = 29px, at least the 24px target (computed by the design lead).
- **Radius:** `rounded-field`, matching the `Badge` it shows when selected (feedback spec "Badge presentation"). See review log B2.
- **Help and error:** 0.25rem above each.

## 4. Contrast (measured by the design lead with an executed script)

- Script: `scratchpad/contrast.mjs` (design-lead session). It uses WCAG 2.2 relative luminance, with values resolved from `globals.css` on `develop` (`78fc6e4`).
- Translucent tokens are blended over each surface. The surfaces are `surface-page`, `-card`, `-form` and `-section`, in both themes.
- Ranges below are minimum to maximum across those four surfaces.

| Gated pair | Kind | Traditional | Dark | Gate |
|---|---|---|---|---|
| `evaluation-bean-mark-off` / `evaluation-bean-off` | icon (bean identifiable, off) | 7.02 | 7.44 | 3 ✔ |
| `evaluation-bean-mark-on` / `evaluation-bean-on` (blended) | icon (bean identifiable, on) | 7.31–7.72 | 4.89 | 3 ✔ |
| `evaluation-slider-thumb` / surface | boundary (thumb) | 5.72–6.81 | 11.97–14.28 | 3 ✔ |
| `evaluation-slider-thumb` / `evaluation-slider-track` | boundary (thumb on the off track) | 4.50 | 10.48 | 3 ✔ |
| `text-primary` / surface (value text) | text | 5.72–6.81 | 11.97–14.28 | 4.5 ✔ |
| `text-secondary` / surface (`type-meta` marks, row titles) | text | 5.39–6.42 | 7.18–8.57 | 4.5 ✔ |
| `text-label` / surface (labels, scale labels) | text | 5.32–6.34 | 8.61–10.28 | 4.5 ✔ |
| `text-strong` / surface (unselected chip label) | text | 10.28–12.24 | 13.35–15.93 | 4.5 ✔ |
| `border-muted` / surface (chip boundary) | boundary | 3.13–3.72 | 4.09–4.88 | 3 ✔ |
| `feedback-error` / surface | text | 6.01–7.16 | 5.14–6.13 | 4.5 ✔ |
| `focus-ring` / surface | boundary | 10.28–12.24 | 11.97–14.28 | 3 ✔ |

Not gated, and recorded only to explain why:
- **Off-bean disc against the surface** (1.51–1.80 traditional, 1.61–1.92 dark). The bean is identified by its mark against its own disc (rows 1–2).
- **On against off disc** (4.32–4.56 traditional, 2.55 dark). The state is also carried by the mark colour swap and by the value text.
- **Thumb against the filled end** (1.00). The 20px thumb overhangs the 6px track, and those parts meet the surface (row 3).
- **`thumb-border` against the surface** (1.00–1.36). Decorative, `exempt: true`.
- **Off track against the surface** (1.14–1.51). The value is given as text.
- **Unselected chip dot.** Decorative.
- **Selected chip label.** Already gated by the feedback spec's luminance rule.

Pairs the guard tests (`theme-tokens.test.ts`, both theme matrices) must register. The comment at lines 244–245 defers `evaluation-bean-*` and `evaluation-slider-*` to this change.
1. icon `evaluation-bean-mark-off` / `evaluation-bean-off`
2. icon `evaluation-bean-mark-on` / `evaluation-bean-on`, with bases `surface-form` and `surface-card` in the traditional theme (translucent token)
3. bound `evaluation-slider-thumb` / `surface-form` and `surface-card`
4. bound `evaluation-slider-thumb` / `evaluation-slider-track`
5. bound `border-muted` / `surface-form` and `surface-card`
6. text `text-strong` / `surface-card`
7. exempt `evaluation-slider-thumb-border` / `evaluation-slider-thumb`

Other host surfaces (for example `surface-section` for a collapsible group) are registered by the consumer that uses them. All four surfaces pass today.

**New tokens** (settled, both themes, completeness test): `--color-evaluation-bean-mark-on` (cream-100 / night-petrol-950) and `--color-evaluation-bean-mark-off` (brown-900 / night-sage-100). Every primitive already exists in `globals.css`. No other token is added.

## 5. Confirmation dialog (`ConfirmDialog`, `src/shared/ui/ConfirmDialog.tsx`)

**Capability.** The general context places the dialog in this change ("El diálogo de borrado va en add-evaluation-scales"). `openspec/config.yaml` lists "modal" under `feedback`, so its requirement goes in a `feedback` delta spec, committed per capability. A change spanning capabilities has precedent: `add-landing` spanned four.

**MVC mapping.** `resources/views/livewire/settings/delete-user-form.blade.php`:
- `flux:modal`, `max-w-lg`;
- a heading, a subheading, and actions aligned right: Cancel (`filled`), then the destructive button (`danger`);
- `space-y-6` between the blocks.

The MVC's password field is not carried over: `deactivateAUser` and `permanentlyDeleteAUser` take no body. They need the `profile:write` scope, which is `add-user-account`'s step-up.

**Base.** Open 1 (shadcn AlertDialog or an own dialog).

**Props.**

| Prop | Type | Notes |
|---|---|---|
| `open`, `onOpenChange` | `boolean`, `(open: boolean) => void` | Controlled |
| `title` | `ReactNode` | `aria-labelledby` |
| `description` | `ReactNode` | `aria-describedby` |
| `confirmLabel`, `cancelLabel` | `string` | |
| `onConfirm` | `() => void` | The consumer runs the request and closes the dialog on success |
| `pending` | `boolean` | The confirm `Button` shows `loading`; Cancel is disabled; Escape is ignored |
| `error` | `ReactNode` | Shown when the request fails. The dialog stays open |

**States.**
- **Closed:** nothing renders.
- **Open:**
  - `role="alertdialog"`, modal, with the page behind it inert;
  - initial focus on Cancel, the least destructive action;
  - Escape cancels, and a click on the overlay does not close it;
  - focus returns to the trigger on close.
- **Pending:** as in the props table.
- **Error:** `type-error` in a `role="alert"` region. Retry is allowed.

**Tokens.**
- Overlay: `bg-nav-hover-shadow`, `Sheet`'s overlay classes. Decorative, not gated.
- Panel: `bg-surface-card` with the `shadow-lg` Card treatment.
- Title: `type-card-heading` (`text-primary`, 6.41 / 13.22, measured). Description: `type-body`.
- Confirm: `Button variant="primary"`. Cancel: `Button variant="action-4"`, the MVC's neutral `filled`.
- Both labels pass: 6.85 / 5.38 and 5.36 / 5.52, measured. The button boundaries fail (findings F1 and F2).

**Layout and spacing.**
- **Panel:**
  - fixed and centred;
  - width `calc(100% - 2rem)` up to a 32rem maximum (MVC `max-w-lg`);
  - padding 1.5rem, `rounded-container`, no border.
- **Description:** 0.5rem below the title.
- **Error:** 0.75rem below the description.
- **Actions:** 1.5rem below the text block, 0.75rem between buttons.
  - Below `sm`: stacked full width, confirm above Cancel.
  - From `sm`: one row aligned right, Cancel then confirm (MVC order).
- **At 375px** (computed by the design lead): the panel is 343px wide, with 295px of content.

## 6. Responsive behaviour

| Component | Below `md` (768px) | From `md` |
|---|---|---|
| Bean scale | `responsive` size gives 24px beans; the value text may wrap under the beans | 32px beans on one line |
| Slider | Full container width | Same |
| Chip group | Chips wrap within each row | Same |
| Dialog | Panel 2rem narrower than the viewport; buttons stacked below `sm` (640px) | Panel up to 32rem; buttons in one row |

None of them may cause horizontal scroll at 375px.

## 7. Texts (catalog)

This change adds no screen and no catalog file. Every text reaches the components as a prop, and the tests use fixture strings. Suggested keys for the consumers (Open 9):

| Text | es | en | ca |
|---|---|---|---|
| Scale labels | BAJA · MEDIA · ALTA (MVC `descriptive-intensity`) | LOW · MEDIUM · HIGH | BAIXA · MITJANA · ALTA (unverified translation) |
| Bean value | "{value}/9" · "{value} de 9" | "{value}/9" · "{value} of 9" | "{value}/9" · "{value} de 9" |
| Slider value | "{value}/15" · "{value} de 15" | "{value}/15" · "{value} of 15" | "{value}/15" · "{value} de 15" |
| Dialog | title, description, confirm and cancel per use (evaluation delete, account deactivate, account delete) | | |

## 8. Contract

This change consumes no operation. Its consumers map these to it:
- `deleteAnEvaluation`, `deactivateAUser` and `permanentlyDeleteAUser`: the dialog.
  - A 200 response closes it.
  - A 403 or a network error shows `error` and keeps it open.
- `listOlfactoryTaxonomies`: the chip rows.
- The score fields of `createAnEvaluation`, `updateAnEvaluation` and `getAnEvaluation`: the scales.

## 9. Tests (expected, for the architect's tasks)

**Bean scale:**
- nine radios named 1–9 in a labelled radiogroup;
- a click sets the value;
- arrows ±1, and Home/End give 1 and 9;
- the cumulative on and off classes;
- one tab stop;
- `null` puts the tab stop on bean 1;
- disabled: 50% opacity and no focus;
- error wiring;
- `readOnly`: a meter with `aria-valuetext`, no radios, and the cut bean clipped to the fraction (asserted on its style or class);
- `sm` without `readOnly` is rejected (a type error or a dev assertion; the architect settles which).

**Slider:**
- the label is bound to the input;
- min 0, max 15, step 1;
- `aria-valuetext`;
- `onChange` with an integer;
- `--fill` equal to `value/15`;
- the marks and scale labels render and are `aria-hidden`;
- `readOnly`: a meter with no input.

**Chip group:**
- buttons with `aria-pressed`;
- toggling adds and removes the `ulid`;
- `max` disables the unselected chips and keeps the selected ones enabled;
- a selected chip renders the taxonomy `Badge` and a `Check` icon;
- an unselected chip renders the dot and the `border-muted` class;
- titled rows are labelled groups;
- `readOnly` renders only the selected badges, and `emptyText` when none is selected.

**Dialog:**
- `alertdialog` with its name and description;
- initial focus on Cancel;
- Escape cancels, and the overlay does not close it;
- `pending` shows the confirm as loading, disables Cancel and ignores Escape;
- `error` is shown in an alert region;
- focus returns to the trigger.

**Guards:**
- register the §4 pairs;
- token completeness for the two new tokens;
- extend `color-guard.test.ts` to `fill-` and `stroke-` utilities (finding F3). It must fail on `fill-nope` and pass on `fill-evaluation-bean-on`.

## 10. Visual reference

Product owner adds the captures to this folder.
1. **Evaluation form** (MVC route `evaluations.create` or `evaluations.edit`; views `livewire/evaluations/evaluation-form.blade.php` and `layouts/evaluations/partials/evaluation-axis.blade.php`): one axis open, showing the slider, the bean row and the descriptor cascade with one root selected. Capture at 375px and 1280px.
2. **Offering detail consensus** (`layouts/offerings/partials/consensus.blade.php` with `consensus-axis.blade.php`): a fractional bean. Also `evaluation-axis-static.blade.php`, the static slider.
3. **Delete-account modal** (`livewire/settings/delete-user-form.blade.php` on the settings profile page): open.

## Open

1. **Dialog base.**
   - Question: does the dialog use the shadcn AlertDialog or an own component?
   - Options:
     - a) shadcn AlertDialog, Radix `AlertDialog` from the installed `radix-ui` 1.6.7 (`@radix-ui/react-alert-dialog` 1.1.23, verified in `node_modules/radix-ui/package.json`). No new npm dependency. Pulled from the registry and rewired to tokens like `Sheet`. It gives focus trap, inert background, initial focus on Cancel, Escape and focus return.
     - b) Own component on the native `<dialog>` with `showModal()`, with the initial focus, focus return and pending-Escape handling written by hand.
     - c) Own component on the Radix `Dialog` already used by `Sheet`, with `role="alertdialog"` added by hand.
   - Recommendation: a). The project already owns `radix-ui`, and `Sheet` set the precedent; it adds no dependency, and AlertDialog is the pattern built for this case. b) and c) rebuild what a) ships.
   - Source: AGENTS.md "Research"; `.claude/CLAUDE.md` §2 "Library first".
   - Blocks propose: yes.
   - **Answered 2026-10-06 (Product owner): a)** shadcn AlertDialog on the installed `radix-ui`.
2. **Chip colours, unselected and boundary.**
   - Question: how does an unselected chip show its taxonomy, and what draws the boundary?
   - Options:
     - a) As in §3: a `border-muted` border in both states (measured to pass), a data-colour dot, a `text-strong` label, and a `Check` icon when selected.
     - b) A data-colour border with a `text-strong` label. The boundary contrast depends on the data and cannot be gated.
     - c) The MVC look (25% tint, data-colour text). The text contrast depends on the data and fails for light colours.
   - Recommendation: a). Source: criterion D and the feedback spec "Badge label contrast".
   - Blocks propose: yes.
   - **Answered 2026-10-06 (Product owner): a)** `border-muted` border in both states, data-colour dot, `text-strong` label, `Check` when selected.
3. **Chip geometry and Badge duplication.**
   - Question: the unselected chip needs the `Badge` geometry (`type-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-field`) without a `Badge`. Copying it makes a second copy.
   - Options:
     - a) The chip copies the six classes, and Product owner adds a backlog entry.
     - b) A refactor change in `feedback` first exposes the badge geometry (or a neutral outline state) from `Badge.tsx`, and this change uses it.
     - c) `Badge` gains an outline taxonomy state inside this change (a `feedback` delta).
   - Recommendation: b) by criterion C (the refactor goes first). If the delivery date does not allow it, a) with the backlog entry.
   - Blocks propose: yes.
   - **Answered 2026-10-06 (Product owner): b)** a refactor change in `feedback` (`refactor-badge-geometry`, backlog R6) exposes the badge geometry from `Badge.tsx` first; this change uses it and waits for its merge.
4. **Slider with no value.**
   - Question: how does a slider show `null`?
   - Options:
     - a) It shows 0 and the form treats it as 0, as the MVC does (`x-init="value = value ?? 0"`, `descriptive-intensity.blade.php` line 3). Descriptive scores are then never missing, and the evaluations completeness rule only bites on bean scores and descriptors.
     - b) An unset look: no fill, the thumb at 0 at 50% opacity, value text "–/15". The first interaction sets a value. Choosing 0 needs a keypress or click that a native range does not report when the value does not change, so it needs an extra handler.
   - Recommendation: a), the MVC source and the simplest; confirm with the evaluations close rule.
   - Blocks propose: yes.
   - **Answered 2026-10-06 (Product owner): a)** the slider shows 0 and the form treats it as 0. The evaluations completeness rule applies to bean scores and descriptors only.
5. **Visual review without a screen.**
   - Question: these components have no route until `add-specialist-evaluations`, so the 375/1280 capture of the verification task has nothing to capture.
   - Options:
     - a) Defer the visual review to the first consumer, and verify only class and attribute tests here.
     - b) A development-only preview route (new route, new scope).
     - c) Storybook (new dependency).
   - Recommendation: a).
   - Blocks propose: yes, because it shapes the verification task.
   - **Answered 2026-10-06 (Product owner): a)** the 375/1280 captures move to `add-specialist-evaluations`; this change verifies with class and attribute tests.
6. **Dialog button boundaries (F1, F2).**
   - Question: the confirm (`primary`) boundary fails 3:1 in the dark theme, and the Cancel (`action-4`) boundary fails in both themes.
   - Options:
     - a) Ship the dialog on `Button` as it is and fix F1 and F2 in a `base-controls` change.
     - b) Give the dialog buttons a border.
   - Recommendation: a). The defect is in merged code, and b) would diverge from every other button.
   - Blocks propose: no.
   - **Answered 2026-10-06 (Product owner): a)** F1 and F2 go to their own `base-controls` change (`fix-button-boundaries`), which also measures `action-1`/`action-2`.
7. **Bean SVG source.**
   - Question: the MVC path carries `SVGRepo_*` ids, and its licence is unverified.
   - Options: a) keep the path after checking its licence; b) redraw the bean.
   - Recommendation: a), if the licence allows it.
   - Blocks propose: no.
   - **Answered 2026-10-06 (Product owner): a)** keep the MVC bean SVG as it is. Product owner drew it, so its licence allows the reuse.
8. **Row head selectable?**
   - Question: can a matching level-0 node that heads a row of children also be chosen as a chip?
   - Options: a) no, the head is a title only (the reading of `add-specialist-evaluations` §3); b) yes, it is the first chip of its row (MVC).
   - Recommendation: a). The component supports both through `rows`, so this is a data-mapping decision for `add-specialist-evaluations`.
   - Blocks propose: no.
   - **Answered 2026-10-06 (Product owner): a)** the row head is a title only.
9. **Catalog area for the scale texts.**
   - Question: where do the scale texts live in the catalog?
   - Options: a) in each consumer's area (`evaluations`, later `offering-catalog`); b) a shared `scales` area.
   - Recommendation: b), because two capabilities reuse the same labels. The keys are added by the first consumer.
   - Blocks propose: no.
   - **Answered 2026-10-06 (Product owner): b)** a shared `scales` catalog area.

## Findings on existing code

- **F1.** In the dark theme, the `action-primary` boundary measures 2.48–2.96 against the four surfaces (gate 3). No single oxblood fill passes both gates (measured):
  - night-oxblood-600 gives a 4.10–4.89 boundary but only 3.26 for the cream label;
  - the derived #aa5451 gives a 3.12–3.72 boundary but only 4.28 for the label.

  A fix needs a border or a dark label token. Defect in merged code (`base-controls`): a **new change**.
- **F2.** The `action-3-bg` and `action-4-bg` boundaries measure 1.17–1.55 against every surface in both themes. `action-1` and `action-2` were not measured. Same path: **new change** in `base-controls`.
- **F3.** `color-guard.test.ts` checks only `bg/text/border/ring` utilities. `fill-` and `stroke-` utilities, which the bean uses, and pseudo-element variants pass unchecked. Covered by this change's guard task (§9).

## Review log

- **2026-10-06, design lead (draft).** Generated from the sources in §0.
  - B1: the dialog's capability, settled by the general context (it lives in this change) together with the `config.yaml` list (its requirement goes in `feedback`) and the precedent of `add-landing`.
  - B2: chip radius. `add-base-control` §3 lists "taxonomy/scale pills" under `radius-pill`, while the implemented feedback spec gives badges `radius-field`. The chip shows a `Badge` when selected, so `rounded-field` follows the implemented spec (criterion B, semantic).
  - B3: the MVC underline on the value text is dropped, because base-controls Link reserves underlines for links.
  - Contrast measured by script, in both themes, on four surfaces.

## Propose status

- Change-id: `add-evaluation-scales`
- Date: 2026-10-06 (architect, `/opsx:propose`)
- `openspec validate add-evaluation-scales --strict`: **valid** (run after every artifact).
- Artifacts: `openspec/changes/add-evaluation-scales/` — `proposal.md`, `specs/form-fields/spec.md` (ADDED: bean scale, intensity slider, descriptor chip group; MODIFIED: "Inverse variant on dark surfaces", scoped to the controls that carry an inverse variant), `specs/feedback/spec.md` (ADDED: confirmation dialog), `design.md` (D1–D10), `tasks.md` (six groups, the merge-gate precondition in task 1.1). Commits are one per capability: `docs(form-fields)` with the shared artifacts, `docs(feedback)` with the feedback delta.

Resolved, with its decision:

- **Open 1 → a)** shadcn AlertDialog on the installed `radix-ui`: `src/shared/ui/AlertDialog.tsx` (registry primitive rewired to tokens, the `Sheet` pattern) plus `ConfirmDialog.tsx` (design.md D8).
- **Open 2 → a)** neutral chip: the button carries only the 2px `border-muted` shell in both states; the unselected content is the badge geometry with a data-color dot and a `text-strong` label, the selected content a taxonomy `Badge` with a `Check` (design.md D6).
- **Open 3 → b)** the refactor goes first: this change depends on `refactor-badge-geometry`, `DescriptorChipGroup` imports `BADGE_GEOMETRY_CLASSES` from `./Badge`, that change's badge-geometry guard stays green here, and backlog R6 is resolved and removed by that change, not this one. This change resolves no backlog entry.
- **Open 4 → a)** the slider shows 0 with no value and the form treats it as 0 (`--fill` 0, thumb at the start of the track).
- **Open 5 → a)** the 375/1280 captures move to `add-specialist-evaluations`; this change verifies with class and attribute tests only.
- **Open 6 → a)** F1 and F2 stay out; `fix-button-boundaries` (`base-controls`) fixes them and measures `action-1`/`action-2`.
- **Open 7 → a)** the MVC bean SVG is reused as it is; Product owner drew it, so its licence allows the reuse.
- **Open 8 → a)** the row head is a title only; the mapping is `add-specialist-evaluations`' data work.
- **Open 9 → b)** a shared `scales` catalog area, its keys added by the first consumer.
- **Handoff D1** `max` dropped: no `max` prop, no disabled-at-max state, no `max` test; the "main tastes: 2" citations are superseded.
- **Handoff D2** content surfaces only: the three scale controls get no inverse variant, and the `form-fields` inverse requirement is modified to say so.
- **Handoff D3 (reading B)** the chip button carries only the 2px `border-muted` shell; the selected content is `Badge variant="taxonomy"` (`Check` + label) and the unselected content a span applying `BADGE_GEOMETRY_CLASSES` (dot + label), so the badge geometry has one source and the 29px height holds in both states.
- **Handoff D4** proposed against the committed `refactor-badge-geometry` summary; `tasks.md` states that the apply starts only after that change is merged into `develop` and `develop` into this branch (verified by task 1.1).
- Delegated details settled in `design.md`: the bean's own six-key handler (verified: Radix's Home/End move focus but never select, its arrows are orientation-restricted and Up maps to "prev", so the primitive alone breaks the settled contract — D3); `sm` without `readOnly` and a missing `onChange`/`onValueChange` rejected as type errors through discriminated unions (D2); the slider thumb as one `@utility intensity-slider-thumb` in `globals.css` (D5); the bean artwork as `BeanMark` in `icons.ts` (D4); the chip arrows as the toolbar convention — Right/Down next, Left/Up previous, wrapping, focus only (D7); the dialog layout and pending/error handling per §5 (D8); the seven contrast pairs and the two mark tokens per §4 (D9); the `fill-`/`stroke-` color-guard extension per F3 (D10).

Remains open (nothing blocking propose or apply):

- The chip arrow directions are the one behavior the artifacts left implicit (they settle "arrow keys in reading order"); design.md D7 picks the WAI-ARIA APG toolbar convention and can be reopened if a different mapping was intended.
- The unverified items stay with their owners: the Catalan scale labels (consumer copy, Open 9 b) and the 375/1280 rendering (Open 5 a).
- F1 and F2 remain visible until `fix-button-boundaries` lands; every gated pair of §4 passes and its seven registrations are task 1.3.
