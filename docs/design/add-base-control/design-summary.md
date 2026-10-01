# Design summary — Base controls (components change 1 of 6)

Input for `/opsx:propose`. All decisions below were taken by the product owner (Augusto) in design chat. Items under "Open decisions" are NOT decided: the architect must not resolve them; flag them back.

- Proposed change-id: `add-base-controls` (to confirm)
- Capability: to confirm (capability grouping is still pending in config.yaml)
- Depends on: `add-theme-tokens` (merged). Existing tokens in `src/app/styles/globals.css` are NOT modified by this change; new tokens are added only.

## 1. Scope

In scope: Button, Link, Field, Input (incl. password reveal), Select, Textarea, Checkbox, Radio group. Each with a `default` variant (light surfaces) and an `inverse` variant (dark surfaces: sidebar and mobile filter panel), unless stated otherwise. Design rules shared by all component changes. Radius tokens. Icon entry point.

Out of scope (later changes): coffee-bean scale and intensity slider (change 2); facet subcomponents — combobox, range, chips, show more, taxonomy cascade, facet option rows (change 3); badge, callout, toast, modal, empty state (change 4); card, collapsible, tabs, label/value row, pagination (change 5); layouts and app logo (change 6). Labels, help texts and error copy: each capability provides them when it uses a component.

## 2. Design rules (apply to every component change)

1. **Tokens:** components use semantic tokens only — never primitives, hex values or Tailwind default colors. Radii also come from tokens (section 3).
2. **Variants:** props `variant` and `size` with neutral values, never domain names.
3. **States:** every interactive component declares rest, hover, `focus-visible` and disabled; plus loading, error or selected where applicable.
4. **Accessibility:** visible focus using focus tokens; full keyboard operation; icon-only controls require an accessible label. Error state is never conveyed by color alone (always with text).
5. **Responsive:** each component declares whether it needs responsive behaviour. If it does, mobile-first (base = mobile, then `sm:` 640, `md:` 768, `lg:` 1024, `xl:` 1280 — Tailwind defaults). Legacy markup was desktop-first (`max-md:`); it is inverted, not copied.
6. **Icons:** `lucide-react` (dependency approved) and the project's own SVGs (app logo, coffee-bean) are consumed through a single entry point in `shared`.
7. **Read-only:** components with an interactive and a static version expose a `readOnly` prop on the same component (no separate static component).
8. **Controlled / uncontrolled:** native inputs (input, select, textarea, checkbox, radio) support both modes; custom controls (bean scale, slider) are controlled only.
9. **Themes:** components are theme-agnostic; theme switching comes only from token reassignment under `[data-theme="dark"]`.

## 3. Radius tokens (new)

| Token | Traditional | Dark theme | Used by |
|---|---|---|---|
| `radius-pill` | full | 0 | all buttons, nav-button, taxonomy/scale pills, slider track |
| `radius-container` | 16px | 0 | card, form container, card section, filter panel, tabs container, modal, toast, callout |
| `radius-field` | 8px | 0 | input, select, textarea, menu and menu item, error box, badges, pagination |

Exceptions: checkbox 4px (0 in dark theme); axis header has no bottom radius (fits its collapse toggle); navigation has no radius in either theme; avatar, coffee bean and slider thumb stay circular in both themes (intrinsic shape, not a corner radius).

## 4. Components

### Button
- Variants: `primary`, positional actions `action-1`…`action-4`, `nav-button` (existing tokens `action-primary-*`, `action-{n}-*`, `nav-button-*`).
- Sizes: `base` = `h-10`, `sm` = `h-8`. Same typographic role `type-button` in both. Size is chosen by context, not responsive.
- Radius: `radius-pill`.
- States: rest, hover, `focus-visible`, disabled, loading.
- Optional icon; icon-only buttons require an accessible label.
- Responsive: no.

### Link
- Internal routes only, rendered with `next/link`. External navigation (e.g. the OAuth redirect to the authorization server) is handled by the component that needs it, not by Link.
- Always underlined. Tokens `text-link`, `text-link-hover`.
- Variant "back": arrow icon (Lucide) + text.
- States: rest, hover, `focus-visible`. No radius. Responsive: no.

### Field
- Structure: label above (`type-label`), control, optional help text (`type-meta`), error message below (`type-error`).
- Label, help and error texts are props supplied by the consuming capability.
- `required` prop: shows a visual asterisk next to the label (hidden from assistive tech) and sets `required` on the control.
- Error: control border switches to `feedback-error` and the message is shown; the control gets `aria-invalid`; `aria-describedby` points to help and error. Per-field API validation errors (422) arrive here; mapping API errors to copy belongs to the feature.

### Input (default variant)
- `h-10`, `radius-field`, 2px border `border-strong`, background `surface-input`, text `type-control`, placeholder `text-placeholder` in italics.
- Password mode with show/hide toggle (eye icon). See open decision 1 for the icon color.
- States: rest, hover, `focus-visible` (ring `focus-ring` + offset `focus-offset`), disabled, error.

### Select (default variant)
- Native `<select>`. Same box as Input (`h-10`, `radius-field`, `border-strong` 2px, `surface-input`, `type-control`) plus a Lucide chevron. The open option list is native and not styled.

### Textarea (default variant)
- Own form style, intentionally different from Input: background `surface-textarea`, border `border-muted`, `radius-field`, same focus ring as Input.

### Checkbox (default variant)
- Border `border-strong`, checked fill `surface-checked`, radius 4px (0 in dark theme). See open decision 2 for the check mark.

### Radio group (default variant)
- Circle with inner dot when selected. Same tokens as Checkbox (`border-strong`, `surface-checked`). Circle shape in both themes.

## 5. Inverse variant (dark surfaces)

Purpose: controls placed on the sidebar (`nav-surface-dark`) and on the full-screen mobile filter panel, which uses the same styles. Derived from the real sidebar styles of the legacy app.

Fields (input, select and, in change 3, search/combobox/range):
- Rest: transparent background, border `border-inverse`, text `nav-text-dark`, placeholder `text-placeholder-inverse` in italics.
- Hover: border becomes more prominent.
- Focus: ring `focus-ring-inverse` with offset `focus-offset-inverse`.

Checkbox / radio inverse: checked fill `surface-checked` (moss-400, 3.79:1 on sage-800).

New semantic tokens:

| Token | Traditional | Dark theme | Contrast on sidebar (trad / dark) |
|---|---|---|---|
| `focus-ring-inverse` | cream-100 | = `focus-ring` (night-sage-100) | 6.41 / 12.27 |
| `focus-offset-inverse` | sage-800 | = `focus-offset` (night-petrol-950) | — |
| `border-inverse` | sage-400 | = `border-strong` (night-petrol-600) | 3.41 / 4.19 |
| `text-placeholder-inverse` | petrol-300 | = `text-placeholder` (night-petrol-400) | 4.75 / 7.36 |

Contrasts computed with the WCAG relative-luminance formula against `nav-surface-dark` (traditional sage-800 `#2E5A52`, dark night-sage-950 `#112320`). Reason for the new focus token: existing `focus-ring` (petrol-900) on sage-800 is 1.80:1.

## 6. Verified contrasts (default variant, traditional)

| Pair | Ratio | Minimum |
|---|---|---|
| `feedback-error` / `surface-input` (error border and text) | 7.16 | 3 / 4.5 |
| `border-strong` / `surface-input` | 12.24 | 3 |
| `text-placeholder` / `surface-input` | 6.81 | 4.5 |
| `border-muted` / `surface-textarea` | 4.25 | 3 |
| `text-label` / `surface-page` | 5.97 | 4.5 |

## 7. Open decisions (do not resolve in the spec)

1. **Password eye icon color:** existing token `text-input-icon` is white (traditional), 1.14:1 on `surface-input` — effectively invisible. Needs a new token or reuse of an existing text token (e.g. `text-secondary`, 6.42:1). Existing tokens are not modified.
2. **Checkbox / radio check mark:** checked fill `surface-checked` (moss-400) is 1.80:1 against `surface-input`; the mark color must be defined so the checked state reaches ≥3:1.
3. **Disabled state:** exact treatment (opacity value, cursor) not defined.
4. **Button padding per size and loading indicator** (spinner icon, label behaviour) not defined.
5. **Input hover (default variant)** treatment not defined.
6. Change-id and capability name.

## Propose status

- Change-id: `add-base-control`
- Date: 2026-10-01
- Validation: `openspec validate add-base-control --strict` → `Change 'add-base-control' is valid` (4/4 artifacts complete: proposal, specs, design, tasks).

Resolved during propose (product-owner decisions in design chat after this summary was written):

- **Scope split (open decision 6, change identity):** this summary's form-field scope — Field, Input (incl. password reveal), Select, Textarea, Checkbox, Radio (§1, §4) and the inverse variant with its tokens `focus-ring-inverse`, `focus-offset-inverse`, `border-inverse`, `text-placeholder-inverse` (§5) — moves to the next change `add-form-fields`. This change covers Button and Link (§4), the radius family (§3) and the icon entry point (§1). The summary's proposed id `add-base-controls` is not used: the change is `add-base-control` (must match branch `feature/add-base-control` and this folder's name); capability is `base-controls`.
- **Radius per theme:** radius tokens follow the color pattern (value in `@theme`, reassigned to `0` under `[data-theme="dark"]`). The checkbox exception becomes a fourth token, `radius-check` (4px traditional, 0 dark), instead of a literal.
- **Check mark (open decision 2):** the checked state is carried by the mark; new token `checked-mark` (petrol-900 traditional / night-petrol-950 dark; 6.82:1 and 4.91:1 against `surface-checked`). The box boundary stays `border-strong` (12.24:1). The radio dot uses the same token. Lands in `add-form-fields`.
- **Disabled (open decision 3):** opacity 50%, `cursor: not-allowed`, no hover change; disabled controls are exempt from WCAG contrast.
- **Button padding and loading (open decision 4):** base `px-4`, sm `px-3`, icon–label gap `gap-2`, icons 16px; icon-only buttons square (`w-10`/`w-8`). Loading shows a spinning Lucide `Loader2` before the label; the label is kept so the width does not change; while busy the button sets `aria-busy="true"` and `aria-disabled="true"`, ignores activation and keeps keyboard focus (the native `disabled` attribute stays exclusive to the disabled state — see the artifact review below); no animation under `prefers-reduced-motion`.
- **Password eye icon (open decision 1):** reuse `text-secondary` (6.42:1 on `surface-input`); no new token. Lands in `add-form-fields`.
- **Input hover, default variant (open decision 5):** no visual change; the state is shown on focus. Lands in `add-form-fields`.
- **`nav-button` placement and focus:** the navigation-action button renders in the header (`nav-header`), not on the sidebar, so `focus-ring` + `focus-offset` apply. Documented pairs re-verified with the WCAG formula: `focus-ring`/`nav-header` 4.63 (traditional) and 12.27 (dark); `focus-ring`/`focus-offset` 11.53 and 14.28. `focus-ring-inverse` and `focus-offset-inverse` stay in `add-form-fields`.
- **Artifact review (2026-10-01, before apply):** the busy state no longer uses the native `disabled` attribute (it drops keyboard focus) — it uses `aria-disabled="true"` + `aria-busy="true"` and ignores activation while keeping keyboard focus; Link's `href` is typed `/${string}` so external URLs are a compile error with no runtime branch (the "External destination refused" scenario states this); `ButtonProps` extends `ButtonHTMLAttributes<HTMLButtonElement>` so `form`, `name`, `value` and `aria-*` pass through (the spread-props risk is resolved); a guard test against Tailwind's default radius utilities in `src/shared/ui` was adopted.

Remains open (residuals and deferred items):

- This summary's §1, §4 (form-field controls), §5 (inverse variant and its token table) and open decisions 1, 2 and 5 are superseded by the decisions above and belong to `add-form-fields`, which is not yet proposed. §6's verified pairs mostly support `add-form-fields`; `add-base-control` adds the `nav-button` focus pairs listed above to the verification matrix.
- Deferred: coffee-bean scale and intensity slider (change 2); facet subcomponents (change 3); badge, callout, toast, modal, empty state (change 4); card, collapsible, tabs, label/value row, pagination (change 5); layouts and app logo (change 6, `app-shell`). If `app-shell` places `nav-button` on the dark sidebar, its focus treatment is revisited there.
- Pending implementation detail (non-decisions, settled in `openspec/changes/add-base-control/design.md`): `radius-pill` literal `9999px`; back-link icon Lucide `ArrowLeft`; icon entry point at `src/shared/ui/icons.ts`; Button `type` defaults to `"button"`.
- No product-owner decisions remain open for `add-base-control`.