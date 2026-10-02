# Backlog — refactor candidates

Kept by Augusto. Agents read it; only Augusto edits it. One entry per candidate. The architect checks it before /opsx:explore or /opsx:propose and flags any entry the change would affect.

Entry format: what is duplicated, where, why it would pay off, owning capability, proposed change, status.

## R1 — Shared focus indicator

- **Duplicated:** the focus indicator class set, identical in every interactive control:
  `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-focus-offset`
- **Where today:** `src/shared/ui/Button.tsx` (BASE_CLASSES), `src/shared/ui/Link.tsx` (BASE_CLASSES).
- **Why it pays off now:** `add-form-fields` adds five interactive controls (input, select, textarea, checkbox, radio) that need the same indicator. Without a shared definition the set would exist in seven files, and any change to the focus treatment (width, offset, token) would have to be repeated in all of them.
- **Owning capability:** `theming` (shared styles for all components, alongside the color/radius tokens and the `type-*` roles).
- **Proposed change:** `add-focus-ring-utility`, before proposing `add-form-fields`.
- **Scope of the change:** define the shared focus indicator once; migrate Button and Link to it with no visible change; specify in `theming` that every interactive control renders the same focus indicator from the focus tokens.
- **Open decision (Augusto):** how the shared definition is expressed:
  - A. a TypeScript constant in `src/shared/ui/` imported by each component;
  - B. a Tailwind `@utility focus-ring` in `globals.css`, following the pattern of the `type-*` roles (recommended in design chat for consistency).
- **Not covered:** the inverse focus tokens (`focus-ring-inverse`, `focus-offset-inverse`) arrive with `add-form-fields`; the shared definition must allow that variant, or add-form-fields extends it.
- **Status:** proposed — pending Augusto's decision on A/B before opening the change.
- **Affects:** `add-form-fields` (its design summary should state that the controls use the shared focus indicator once this lands).