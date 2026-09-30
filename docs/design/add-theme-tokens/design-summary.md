# Design summary — Change 1: color tokens and themes (capability `ui`)

Source of exact values: `tokens.css` (same folder). This summary records the decisions and rules behind it. Written in English because OpenSpec artifacts are in English.

## Scope

- In scope: color tokens (primitive + semantic layers) for two themes: traditional (default) and dark.
- Out of scope (decided with the architect): typography, spacing, theme activation mechanism, success and warning feedback colors.

## Token architecture

- Three-layer model: primitives → semantic → (no component layer for now).
- Components use semantic tokens only, never primitives.
- Tokens live in `@theme` inside `src/app/styles/globals.css` (Tailwind CSS 4, no tailwind.config).
- Opacity variants are defined inside semantic tokens with `color-mix(... transparent)`, never as primitives and never with the `/NN` modifier in components.
- There is no default border color: every border takes its color explicitly from a token.

## Primitive layer — traditional theme

- Families by real hue (OKLCH): cream, sage, petrol, moss, chartreuse, oxblood, brown, score.
- Names avoid Tailwind default palettes (e.g. `olive` collides with Tailwind 4.2, so the family is `moss`).
- Scale: step number = OKLCH lightness target (50 ≈ 0.97, 100 ≈ 0.93, then ≈0.08 per step down to 950 ≈ 0.25).
- Exception: in `cream` the number only orders light → dark (cream-300 is a hover step).
- Unification rule: an opaque mix with ΔE OKLab < 0.02 to an existing primitive is replaced by that primitive, unless it removes a functional difference (e.g. a hover). Hover steps are set at the threshold (ΔE ≈ 0.02) to stay perceptible.
- `oxblood-600` is the error color. `score-*` are used only in rating badges.
- `moss-700` and `chartreuse-300` are kept but currently unused.
- White comes from Tailwind's `--color-white`.

## Semantic layer

- Naming convention: `--color-{group}-{role}-{state}`, in English.
- Groups: surface, text, border, action (primary + positional), nav (+ `nav-tabs-*`, `nav-button-*`), feedback (error only), focus, evaluation, badge.
- Positional actions: colors are assigned by position (1st, 2nd, 3rd, optional 4th), not by action type. Each has bg, text, bg-hover, text-hover. Traditional: 1 moss, 2 oxblood, 3 sage, 4 petrol.
- Focus: ring + offset (traditional: petrol-900 ring, cream-100 offset).
- Navigation: light surface (header, navbar, navlist, menu) vs dark surface (sidebar). Hover does not change the text color of the current item.
- Evaluation slider: tokens for start/end colors only; the gradient is built in the component.

## Dark theme

- Separate primitive palette with prefix `night-` (e.g. `--color-night-petrol-950`); the dark theme reassigns the semantic layer to it.
- Base: near-black tinted with petrol (H ≈ 217). Elevation is expressed by lightening: page 950 → card 900 → section 850 → section hover 800.
- Night numbering: dark zone (L < 0.40) ordered 950 → 750; lighter steps follow the traditional lightness rule.
- `score-*` primitives are shared by both themes (ratings at 30% opacity in dark, 45% in traditional).
- Dark hover patterns: primary action darkens on hover (keeps AA); positional actions go from 20% tint to a solid darker tone with light text.
- The dark block in `tokens.css` uses `[data-theme="dark"]` as a PROVISIONAL selector. The activation mechanism is the architect's decision.

## Accessibility constraints (observable, for spec.md)

- Body text and button text: contrast ≥ 4.5:1 against their background in both themes.
- Input borders, focus ring and other UI boundaries: ≥ 3:1 against adjacent colors (WCAG 1.4.11).
- The focus ring is visible on every interactive element in both themes.

## Still open (not blocking this change)

- Opaque mixes kept as `color-mix`: `surface-input`, `surface-filter-control`, `nav-current` (traditional), `nav-tabs-current` (translucent by nature).
- Filter-bar separator and navlist hover shadow: deferred to the components change.