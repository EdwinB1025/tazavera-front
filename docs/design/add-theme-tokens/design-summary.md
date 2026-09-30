# Design summary — Change 1: design tokens and themes (capability `theming`)

Source of exact color values: `tokens.css` (same folder). Typography values are defined in this document. This summary records the decisions and rules behind them. Written in English because OpenSpec artifacts are in English.

## Scope

- Capability: `theming`, as declared in `openspec/config.yaml`. Do not create a new capability for this change.
- In scope: color tokens (primitive + semantic layers) for two themes, typography tokens and roles, spacing decision, token-level verification.
- Pending with the architect: theme activation mechanism (decided by the architect for the stack); success and warning feedback colors (derived from the text tokens, added in the component change that needs them).

## Token architecture

- Three-layer model: primitives → semantic → (no component layer for now).
- Components use semantic tokens and typographic roles only, never primitives.
- Tokens live in `@theme` inside `src/app/styles/globals.css` (Tailwind CSS 4, no tailwind.config); typographic roles are `@utility` blocks in the same file.
- Translucent variants are defined inside semantic tokens with `color-mix(... transparent)`; opaque mixes use `color-mix` with a named surface token. Never as primitives and never with the `/NN` modifier in components.
- There is no default border color: every border takes its color explicitly from a token.

## Primitive layer — traditional theme

- Families by real hue (OKLCH): cream, sage, petrol, moss, chartreuse, oxblood, brown, score.
- Names avoid Tailwind default palettes (e.g. `olive` collides with Tailwind 4.2, so the family is `moss`).
- Scale: step number = OKLCH lightness target (50 ≈ 0.97, 100 ≈ 0.93, then ≈0.08 per step down to 950 ≈ 0.25).
- Exception: in `cream` the number only orders light → dark (cream-300 is a hover step).
- New 700 steps generated in OKLCH at L 0.45: `petrol-700`, `oxblood-700` (error, keeps the error red hue), `moss-700` (recalculated; the legacy value sat at L 0.53).
- `brown-900` darkened to L 0.29 (ΔE 0.02) to meet text contrast on navigation surfaces.
- `score-*` are used only in rating badges.
- `oxblood-600` and `chartreuse-300` are kept but currently unused.
- White comes from Tailwind's `--color-white`.

## Unification rule and its final assignments

- Rule: an opaque mix with ΔE OKLab < 0.02 to an existing primitive is replaced by that primitive, unless it removes a functional difference (e.g. a hover). Hover steps are set at the threshold (ΔE ≈ 0.02) to stay perceptible.
- Kept as their own mix despite ΔE < 0.02 (functional difference):
  - Traditional: `action-1-bg` (ΔE 0.017 to `moss-200`): unifying would make the first action match the filter surface.
  - Dark: `action-3-bg` (ΔE 0.011) and `action-4-bg` (ΔE 0.007) to `night-petrol-800`: unifying would make positional actions 3 and 4 identical.
- Unified into a primitive despite ΔE ≥ 0.02 (product decision; requirement text: "there is no functional requirement for an additional step"):
  - Traditional: `surface-input` → `cream-50` (ΔE 0.021), `surface-filter-control` → `moss-200` (ΔE 0.031), `nav-current` → `sage-400` (ΔE 0.030).
- These assignments are final. Nothing about unification is open.

## Semantic layer

- Naming convention: `--color-{group}-{role}-{state}`, in English.
- Groups: surface, text, border, action (primary + positional), nav (+ `nav-tabs-*`, `nav-button-*`), feedback (error only), focus, evaluation, badge.
- Positional actions: colors assigned by position (1st, 2nd, 3rd, optional 4th), not by action type. Each has bg, text, bg-hover, text-hover. Resting backgrounds are opaque mixes of the tint with the card surface (traditional: `cream-100`; dark: `night-petrol-900`). Traditional tints: 1 moss 40%, 2 oxblood 40%, 3 sage 20%, 4 petrol 35%.
- Focus: ring + offset (traditional: petrol-900 ring, cream-100 offset).
- Navigation: light surface (header, navbar, navlist, menu) vs dark surface (sidebar). Hover does not change the text color of the current item.
- `border-filter-separator` (1px filter divider) and `nav-hover-shadow` (color only; the component builds the shadow) are defined in both themes. `nav-tabs-current` stays a translucent `color-mix` (translucent by nature).
- Evaluation slider: tokens for start/end colors only; the gradient is built in the component.
- `text-paragraph` is removed: its legacy use merges into the `body` typographic role (`text-primary`).

## Dark theme

- Separate primitive palette with prefix `night-` (e.g. `--color-night-petrol-950`); the dark theme reassigns the semantic layer to it.
- Base: near-black tinted with petrol (H ≈ 217). Elevation is expressed by lightening: page 950 → card 900 → section 850 → section hover 800.
- Night numbering: dark zone (L < 0.40) ordered 950 → 750; lighter steps follow the traditional lightness rule.
- `score-*` primitives are shared by both themes (ratings at 30% opacity in dark, 45% in traditional).
- Dark hover patterns: primary action darkens on hover (keeps AA); positional actions go from a 20% opaque mix with `night-petrol-900` to a solid darker tone with light text.
- `[data-theme="dark"]` on the document root is the dark theme contract. The activation mechanism only sets or removes that attribute and is the architect's decision.
- `night-petrol-200` is kept but currently unused (its only consumer, `text-paragraph`, was removed).

## Accessibility constraints (observable, for spec.md)

- Body text and button text: contrast ≥ 4.5:1 against their background in both themes.
- Input borders, focus ring and other UI boundaries: ≥ 3:1 against adjacent colors (WCAG 1.4.11).
- No contrast exceptions. A pair below its threshold is fixed by changing a token value, keeping its hue. Lowering a text pair to 3:1 is not an option: no role that renders button, navigation or error text qualifies as large text under WCAG 1.4.3.
- Contrast is measured against the real rendered background: text on cream surfaces uses steps ≥ 700; text on tinted action backgrounds is checked against the mixed color. Translucent tokens are measured composited over the surface they actually render on.
- Decorative separators (`border-subtle`, `border-filter-separator`) are exempt from the 3:1 boundary rule; it applies to boundaries needed to identify a component or its state. A border is not state-identifying when the component's own fill already reaches ≥ 3:1 against the surrounding surface.
- The focus ring is visible on every interactive element in both themes (verified in the component change; see Verification scope).
- The contrast matrix of this change covers only the documented pairs. Tokens without a defined pairing (`text-inverse`, `text-input-icon`, `surface-checked`, `nav-icon`, `nav-underline`, `evaluation-bean-*`, `evaluation-slider-*`) are verified in the component change that defines where they render.
- Every documented pair passes with the designed values before the change is handed to Build. No contrast residual is left for Build or for a later decision.

## Verification scope

- This change has no components and renders nothing. Its verification is token-level: it reads the custom properties and `type-{role}` utilities in `globals.css`.
- Verified in this change: the contrast matrices of both themes; theme completeness (every semantic token defined in both themes); each role's family, weight, style, size per breakpoint, line height, tracking and color token; role metrics identical in both themes; the `control` role at 16px at the base breakpoint; `error` and `button` roles ≥ 14px.
- Not verifiable in this change, specified in the component change that renders them: focus ring visible on every interactive element; all rendered text using a role; no colored element outside the theme; no viewport zoom when a control is focused.
- spec.md contains only requirements this change can verify.

## Typography

### Primitives (tokens only, in `@theme`)
- Families: `--font-sans` (Nunito) and `--font-serif` (Lora), with fallbacks. The legacy names were inverted relative to their use; this fixes it.
- Loaded faces: Nunito 400, 400 italic, 600, 700; Lora 400 italic, 700, 700 italic.
- Weights: Tailwind defaults. Sizes and line heights: Tailwind default scale (no custom size tokens).
- Tracking: `--tracking-subheading: 0.1em`, `--tracking-eyebrow: 0.25em`, `--tracking-brand: 0.2em`.
- No primitives combine family and weight; roles combine them.

### Semantic layer: typographic roles
- Each role is an `@utility type-{role}` combining family, weight, style, size, line height, tracking and a fixed semantic color token. Theme switching comes from the color tokens.
- Mobile-first. Sizes change only at `md` and `lg`. Body and UI text keep one size across breakpoints; only display roles scale.
- The table is exact: do not add or remove properties (e.g. case transforms) that it does not list.

| Role | Family · weight · style | Size (base / md / lg) | Line height | Tracking | Color |
|---|---|---|---|---|---|
| heading | serif 700 | 2xl / 3xl / 4xl | tight | — | text-primary |
| card-heading | serif 700 | xl / 2xl / — | tight | — | text-primary |
| card-subtitle | serif 400 italic | xs | default | — | text-secondary |
| score | serif 700 italic, tabular-nums | 3xl | none | — | text-primary |
| body | sans 400 | base | relaxed | — | text-primary |
| body-accent | inherits family and size; italic | inherits | inherits | — | text-accent |
| subheading | sans 600 | base | default | subheading | text-accent |
| eyebrow | sans 400 uppercase | sm / base / lg | tight | eyebrow | text-accent |
| eyebrow-strong | sans 600 | sm / base / lg | tight | eyebrow | text-label |
| brand | sans 700 uppercase | base / — / lg | tight | brand | text-strong |
| label | sans 600 | base | tight | — | text-label |
| control | sans 400 | base / sm / — | default | — | text-strong |
| meta | sans 400 | xs | default | — | text-secondary |
| error | sans 400 | sm | default | — | feedback-error |
| navbar-item | sans 400 italic | base | default | — | nav-text |
| navlist-item | sans 400 | base | default | — | nav-text |
| sidebar-item | sans 400 | base | default | — | nav-text-dark |
| button | sans 600 | sm | default | — | none (component) |
| badge | sans 600 | sm | default | — | none (component) |

### Rules
- `button` and `badge` carry no color; the component applies the matching color token.
- States (hover weight, placeholder italic) belong to components, not to roles.
- Controls stay at 16px on mobile to prevent iOS focus zoom. Error and action text are never below 14px.
- Text roles are bound by the color contrast contract (≥ 4.5:1).
- The dropdown menu uses `navlist-item`.
- Roles are theme-agnostic: the dark theme changes only the color tokens they reference; family, size, weight and tracking are identical in both themes.

## Spacing

- Tailwind default scale (`--spacing: 0.25rem`); no spacing tokens. Spacing is each component's implementation.

## Open for the architect (resolve during propose, before handoff)

- Measure the full contrast matrix from `tokens.css`. For every pair below its threshold, present value options that keep the hue; Augusto chooses; the choice is recorded in design.md before tasks.md is written.
- Known pairs to measure on their real surfaces:
  - `nav-toggle-*`: the toggle's content is an icon, so it is non-text contrast (≥ 3:1, WCAG 1.4.11), not text contrast. Measure the icon against the pill, composited over the surface the toggle renders on; rename the token if its name implies text.
  - `nav-button-border`: first measure `nav-button-bg` against `nav-header`. If the fill reaches ≥ 3:1, the border is decorative and exempt; otherwise the border value must change.
  - Dark `nav-button` hover: use `action-primary-hover` as background and `action-primary-text` as text and border (same pattern as the dark primary action).
- Theme activation mechanism: may be deferred to a later change; `[data-theme="dark"]` stays the contract either way.

## Propose status

- Change: `add-theme-tokens` (capability `theming`)
- Date: 2026-09-30
- `openspec validate add-theme-tokens --strict`: valid
- Resolved during propose (decision):
  - Unification assignments: `surface-input`, `surface-filter-control` and `nav-current` unified into primitives (product decision: no functional requirement for an additional step); `action-1-bg`, `action-3-bg`, `action-4-bg` kept as their own mixes so positional actions stay distinguishable.
  - Deferred themeable details placed in the semantic layer: `border-filter-separator`, `nav-hover-shadow`.
  - `[data-theme="dark"]` promoted from provisional to contract; the activation mechanism is deferred.
  - Typography split fixed: primitives in `@theme`, roles as `type-{role}` utilities; spacing stays on Tailwind's default scale.
  - `nav-toggle-*` (measured 3.96): the toggle's content is an icon, so the pair is non-text contrast at 3:1 and passes; token renamed `nav-toggle-icon` (design.md Decision 14).
  - Dark `nav-button` hover (measured 3.80): follows the dark primary action pattern — `action-primary-hover` background with `action-primary-text` text and border (6.64; design.md Decision 14).
  - `nav-button-border` / `nav-header` (measured 2.49): the traditional `nav-button-bg` is darkened to `oxblood-900` (product pick over the off-scale `#7a1f20`); the fill identifies the button at 4.68 and the cream border becomes decorative (design.md Decision 14).
- Open (residuals, pending decisions, deferred items):
  - Theme activation mechanism (switcher, persistence, resolution): deferred to a later change; `[data-theme="dark"]` is the contract.
  - Success and warning feedback colors: deferred to the component change that needs them.
  - The nav toggle's render surface (`nav-surface` vs `nav-header`) is pinned in the component change; both bases are documented and pass 3:1.
  - Tokens without a defined pairing and the rendered-element requirements (focus ring on every interactive element, all rendered text using a role, no viewport zoom on focus, no colored element outside the theme) are specified in the component change that renders them.