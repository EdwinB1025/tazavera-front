# Design

## Context

- Source of exact values: `docs/design/add-theme-tokens/tokens.css` (colors) and `docs/design/add-theme-tokens/design-summary.md` (decisions, typography, spacing). Those two documents are the design source of truth; this document is the implementation contract and records the deltas decided here.
- `src/app/styles/globals.css` (FSD layer `app`) is still the Next.js boilerplate; this is where the token layers land (`@theme`, Tailwind CSS 4, no `tailwind.config`).
- `app/layout.tsx` already loads fonts with `next/font/google` (Geist boilerplate) and wires CSS variables on the document root — the established mechanism for font loading in this repo.
- No component exists yet to consume the tokens, no endpoint is consumed, and Vitest is the test tool. See proposal.md for motivation and scope.

## Goals / Non-Goals

**Goals:**
- One source of truth for color and typography, switchable between two complete themes behind a single contract.
- Every open token decision resolved. The three contrast residuals recorded during propose are decided and recorded here (Decision 14); no decision is left for Build.
- Automated, dependency-free verification of the contrast and role contracts for both themes.

**Non-Goals:**
- Component styling, utility conventions, or how components build gradients/shadows from token colors.
- Theme persistence or any client/server theme resolution logic.
- Dark elevation/shadow depth system beyond the single hover shadow color decided here.

## Decisions

1. **Three-layer token model: primitives -> semantic (no component layer).** Components use semantic tokens and typographic roles only; theme switching is just semantic reassignment. Alternative: components pick primitives per theme (rejected: couples every component to both themes).

2. **Token layers live in `@theme` in `src/app/styles/globals.css`; the dark semantic layer overrides the same custom properties under `[data-theme="dark"]` in `@layer base`.** Utilities compile to `var(--color-*)`, so overrides cascade everywhere. Alternative: parallel `@theme` blocks switched at build time (rejected: needs theme machinery that is out of scope).

3. **`[data-theme="dark"]` on the document root is the dark theme contract** (promoted from provisional). The future activation change only flips the attribute. Alternative `prefers-color-scheme` (rejected: explicit user choice must win) and per-utility `dark:` variants (rejected: couples components to themes).

4. **Opacity variants are defined inside semantic tokens with `color-mix(... transparent)`, never with `/NN` modifiers in components**, so translucency stays theme-aware. Opaque mixes use `color-mix` with a named surface token. Pattern shared with the evaluation slider: tokens carry colors, components build gradients/shadows.

5. **Unification-rule assignments (deltaE OKLab threshold 0.02), fully resolved.** Five assignments deviate from the rule on purpose; there is nothing left to decide on these:

   | Token | Assignment | deltaE | Reason |
   |---|---|---|---|
   | `surface-input` | unified -> `cream-50` | 0.021 | product decision (Augusto); requirement text: "there is no functional requirement for an additional step" |
   | `surface-filter-control` | unified -> `moss-200` | 0.031 | product decision (Augusto); same requirement text |
   | `nav-current` | unified -> `sage-400` | 0.030 | product decision (Augusto); same requirement text |
   | `action-1-bg` | kept as own mix (moss-400 40% over cream-100) | 0.017 to `moss-200` | unifying would make the first action match the filter surface |
   | `action-3-bg`, `action-4-bg` (dark) | kept as own mixes (20% over `night-petrol-900`) | 0.011 / 0.007 to `night-petrol-800` | unifying would make positional actions 3 and 4 identical |

   `nav-tabs-current` stays a nested translucent `color-mix` (translucent by nature). Sanity check of the rule itself: `surface-muted` -> `moss-200` measures deltaE 0.0000.

6. **Primitive layer notes.** Families by real hue (OKLCH): cream, sage, petrol, moss, chartreuse, oxblood, brown, score. Names avoid Tailwind default palettes (e.g. `olive` collides with Tailwind 4.2, so the family is `moss`). Scale: step number = OKLCH lightness target (50 ≈ 0.97, 100 ≈ 0.93, then ≈0.08 per step down to 950 ≈ 0.25); `cream` is the exception (the number only orders light -> dark; cream-300 is a hover step). New 700 steps generated in OKLCH at L 0.45: `petrol-700` (secondary text), `oxblood-700` (error), `moss-700` (recalculated; the legacy value sat at L 0.53). `brown-900` darkened to L 0.29 to meet text contrast on navigation surfaces. Hover steps sit at the perceptibility threshold (deltaE ≈ 0.02). `oxblood-600`, `chartreuse-300` and `night-petrol-200` are kept but currently unused. `score-*` are used only in rating badges and are shared by both themes (45% opacity in traditional, 30% in dark). White comes from Tailwind's `--color-white`.

7. **New tokens `border-filter-separator` and `nav-hover-shadow`.** `border-filter-separator` (1px filter divider): traditional `color-mix(in srgb, var(--color-petrol-900) 15%, transparent)`, dark `color-mix(in srgb, var(--color-night-sage-100) 15%, transparent)` — the dark hairline pattern shared with `border-subtle` and `nav-tabs-border`. Legacy exact value `rgba(15, 13, 11, 0.15)`; rendered over the filter surface `petrol-900` at 15% measures deltaE 0.0145 while `border-subtle` (sage-800 15%) measures 0.0330 (not unifiable, hence its own token). `nav-hover-shadow` is color only (`color-mix(in srgb, rgb(0 0 0) 18%, transparent)` in both themes, shared like `score-*`); the component builds `0 1px 3px` elevation or an inset shadow over it. Alternative: a full `--shadow-*` value (rejected: two different constructions share one color).

8. **Decorative hairlines are exempt from the 3:1 boundary rule; state-identifying boundaries are not.** The spec exempts separators that do not identify a component or its state. Classification: `border-subtle`, `border-filter-separator` and `nav-tabs-border` are decorative separators (exempt); `border-strong`, `border-muted`, `border-accent`, `nav-tabs-current-border` and `focus-ring` identify a component or its state (verified at >= 3:1). `nav-button-border(-hover)` is decorative in the traditional theme (after Decision 14 its fill reaches 4.68 >= 3:1 against the header, so the border is not state-identifying) and state-identifying in the dark theme (its fill reaches 2.55 only), where the border itself is verified at >= 3:1 against every adjacent color. This matches WCAG 2.2 SC 1.4.11 and the design summary.

9. **Contrast verification in Vitest with no new dependencies.** `src/app/styles/theme-tokens.test.ts` (FSD layer `app`) parses the custom properties in `globals.css`, resolves `var()` chains and the `color-mix(in srgb, ...)` forms used there, composites translucencies over their documented bases (Decision 10), and asserts the matrices in the Evidence section. Any syntax outside those two forms must fail the test loudly rather than mis-measure. Alternative: screenshot-based e2e checks (rejected: the Playwright suite is a later phase).

10. **Documented bases for translucent tokens.** A translucent token is measured composited over the surface it renders on. This table is the contract; the component change must extend the matrix if a control renders on a surface not listed here.

    | Translucent token | Composited over |
    |---|---|
    | `surface-filter-field-hover`, `surface-filter-option` | `surface-filter` |
    | `nav-toggle-bg` | `nav-surface` (light navbar); also measured over `nav-header` — both documented, the component change pins where the toggle renders (Decision 14) |
    | `nav-button-bg-hover` | `nav-button-bg` |
    | `nav-tabs-hover`, `nav-tabs-current` (nested mix) | `nav-tabs-surface` |
    | `evaluation-rating-*` | `surface-card` |
    | `border-subtle`, `border-filter-separator`, `nav-tabs-border` | adjacent surface (exempt from 3:1) |

11. **Typography: font primitives in `@theme`, roles as `@utility type-{role}` in the same file.** Fonts load via `next/font/google` in a new `src/app/fonts.ts` (Nunito -> `--font-nunito`, Lora -> `--font-lora`, subsets latin; faces: Nunito 400, 400 italic, 600, 700; Lora 400 italic, 700, 700 italic — the loader's weight x style grid also fetches Lora 400 normal, an accepted extra face). `@theme` maps `--font-sans: var(--font-nunito)` and `--font-serif: var(--font-lora)` with fallback stacks (the legacy font names were inverted relative to their use; this fixes it). Tracking primitives: `--tracking-subheading: 0.1em`, `--tracking-eyebrow: 0.25em`, `--tracking-brand: 0.2em`. Sizes and line heights use Tailwind's default scale (no custom size tokens). No primitive combines family and weight; roles combine them. Each role fixes family, weight, style, size, line height, tracking and one semantic color token; theme switching comes only from the color tokens. States (hover weight, placeholder italic) belong to components, not roles. `button` and `badge` carry no color; the component applies the matching color token. The dropdown menu uses `navlist-item`.

12. **Spacing: Tailwind default scale (`--spacing: 0.25rem`); no spacing tokens.** Spacing is each component's implementation.

13. **Files created or modified** (no routes, no widgets/features/entities/shared touched):

    | File | FSD layer | Change |
    |---|---|---|
    | `src/app/styles/globals.css` | app | modified: boilerplate replaced by primitive color layer, semantic color layer, dark block, font/tracking tokens and `type-{role}` utilities |
    | `src/app/fonts.ts` | app | created: Nunito/Lora loading via `next/font/google` and their CSS variables |
    | `app/layout.tsx` | app (root route file) | modified: font variables from `src/app/fonts.ts` replace the Geist boilerplate |
    | `src/app/styles/theme-tokens.test.ts` | app | created: contrast matrices, theme completeness and typographic role verification |

    API endpoints consumed: none. Generated types: none derived from `src/shared/api/schema.ts`. API error presentation: not applicable. Shared card field mapping: not applicable.

14. **Contrast residuals decided (2026-09-30; product decision by Augusto).** The three pairs that failed the first measurement are resolved and nothing is left for Build:

    | Residual | Decision | Verified result |
    |---|---|---|
    | `nav-toggle-text` / `nav-toggle-bg` (3.96 at the text threshold) | The toggle's content is an icon, so the pair is non-text contrast at 3:1 (WCAG 2.2 SC 1.4.11), and the token is renamed `nav-toggle-icon` (its old name implied text) | 3.96 over `nav-surface`, 4.79 over `nav-header`, 7.50 dark |
    | `nav-button-text-hover` / `nav-button-bg-hover` (dark 3.80) | The dark hover follows the dark primary action pattern: `nav-button-bg-hover` takes the `action-primary-hover` value (`night-oxblood-800`) and `nav-button-text-hover` / `nav-button-border-hover` take the `action-primary-text` value (`night-cream-100`). Values, not aliases: the semantic layer wires primitives only | 6.64 dark; 12.76 traditional over the new fill |
    | `nav-button-border` / `nav-header` (2.49) | No single opaque border color can reach 3:1 against both adjacent colors (only pure white reaches 3.02 against the header, and it loses the cream hue), so the traditional `nav-button-bg` is darkened to `oxblood-900` (chosen over the off-scale `#7a1f20`, which reaches 3.40): the fill identifies the button at 4.68 and the cream border becomes decorative and exempt | text 11.67; hover fill 5.12 with text 12.76; dark unchanged (border rows 5.38 / 13.69 / 6.64) |

    Rejected options: raising the toggle pill opacity (unnecessary at the icon threshold); a shadow treatment or an explicit 3:1 exception for `nav-button-border` (the design summary forbids contrast exceptions, and a shadow does not satisfy SC 1.4.11); changing `nav-header` (it would push `nav-text` / `nav-header` 4.77 below its threshold).

## Typographic roles (contract for `type-{role}`)

Sizes are base / md / lg; `—` means the role does not change at that breakpoint. Colors are semantic tokens.

| Role | Family · weight · style | Size | Line height | Tracking | Color |
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

Sizing rules: mobile-first; sizes change only at `md` and `lg`; body and UI text keep one size across breakpoints and only display roles scale. Controls stay at 16px on mobile to prevent iOS focus zoom; error and action text never drop below 14px. Role metrics are identical in both themes.

## Evidence: measured contrast matrices

Computed from `tokens.css` values with WCAG 2.2 relative luminance, translucencies composited per Decision 10. Text rows require >= 4.5:1, boundary rows >= 3:1 and icon rows >= 3:1 (non-text contrast). Rows marked `exempt (decorative)` are decorative in that theme per Decision 8 and are excluded from their threshold. Tokens without a defined pairing (`text-inverse`, `text-input-icon`, `surface-checked`, `nav-icon`, `nav-underline`, `evaluation-bean-*`, `evaluation-slider-*`) are excluded and verified in the component change that defines where they render.

| Pair | Kind | Traditional | Dark | Status |
|---|---|---|---|---|
| `text-primary` / `surface-page` | text | 6.41 | 14.28 | ok |
| `text-primary` / `surface-card` | text | 6.41 | 13.22 | ok |
| `text-primary` / `surface-section` | text | 5.72 | 11.97 | ok |
| `text-primary` / `surface-section-hover` | text | 5.37 | 10.52 | ok |
| `text-secondary` / `surface-page` | text | 6.05 | 8.57 | ok |
| `text-secondary` / `surface-section` | text | 5.39 | 7.18 | ok |
| `text-accent` / `surface-card` | text | 6.85 | 6.82 | ok |
| `text-label` / `surface-page` | text | 5.97 | 10.28 | ok |
| `text-strong` / `surface-form` | text | 12.24 | 14.75 | ok |
| `text-placeholder` / `surface-input` | text | 6.81 | 8.57 | ok |
| `text-link` / `surface-card` | text | 6.41 | 13.22 | ok |
| `text-link-hover` / `surface-card` | text | 11.53 | 14.75 | ok |
| `action-primary-text` / `action-primary` | text | 6.85 | 5.38 | ok |
| `action-primary-text` / `action-primary-hover` | text | 11.67 | 6.64 | ok |
| `action-1-text` / `action-1-bg` | text | 4.89 | 5.60 | ok |
| `action-2-text` / `action-2-bg` | text | 6.02 | 5.44 | ok |
| `action-3-text` / `action-3-bg` | text | 4.77 | 5.58 | ok |
| `action-4-text` / `action-4-bg` | text | 5.36 | 5.52 | ok |
| `action-1-text-hover` / `action-1-bg-hover` | text | 5.97 | 5.14 | ok |
| `action-2-text-hover` / `action-2-bg-hover` | text | 6.85 | 5.40 | ok |
| `action-3-text-hover` / `action-3-bg-hover` | text | 6.41 | 5.05 | ok |
| `action-4-text-hover` / `action-4-bg-hover` | text | 6.05 | 5.17 | ok |
| `nav-text` / `nav-header` | text | 4.77 | 12.27 | ok |
| `nav-text` / `nav-surface` | text | 6.32 | 11.22 | ok |
| `nav-text` / `nav-current` | text | 6.32 | 7.65 | ok |
| `nav-text-hover` / `nav-hover` | text | 4.63 | 4.68 | ok |
| `nav-text-dark` / `nav-surface-dark` | text | 6.41 | 12.27 | ok |
| `nav-text-dark` / `nav-current-dark` | text | 4.90 | 10.50 | ok |
| `nav-toggle-icon` / `nav-toggle-bg` (bases: `nav-surface` / `nav-header`) | icon | 3.96 / 4.79 | 7.50 | ok |
| `nav-button-text` / `nav-button-bg` | text | 11.67 | 5.38 | ok |
| `nav-button-text-hover` / `nav-button-bg-hover` | text | 12.76 | 6.64 | ok |
| `feedback-error` / `surface-page` | text | 6.75 | 6.13 | ok |
| `feedback-error` / `surface-card` | text | 6.75 | 5.67 | ok |
| `feedback-error` / `surface-form` | text | 7.16 | 5.67 | ok |
| `badge-verified-text` / `badge-verified-bg` | text | 4.72 | 9.48 | ok |
| `badge-provisional-text` / `badge-provisional-bg` | text | 4.75 | 10.52 | ok |
| `text-primary` / `evaluation-rating-exceptional` | text | 5.21 | 6.61 | ok |
| `text-primary` / `evaluation-rating-excellent` | text | 5.41 | 6.48 | ok |
| `text-primary` / `evaluation-rating-good` | text | 5.50 | 6.42 | ok |
| `text-primary` / `evaluation-rating-commercial` | text | 5.04 | 7.08 | ok |
| `border-strong` / `surface-page` | bound | 11.53 | 4.88 | ok |
| `border-strong` / `surface-card` | bound | 11.53 | 4.52 | ok |
| `border-strong` / `surface-form` | bound | 12.24 | 4.52 | ok |
| `border-muted` / `surface-textarea` | bound | 4.25 | 4.88 | ok |
| `border-accent` / `surface-card` | bound | 6.85 | 4.53 | ok |
| `focus-ring` / `surface-page` | bound | 11.53 | 14.28 | ok |
| `focus-ring` / `surface-card` | bound | 11.53 | 13.22 | ok |
| `focus-ring` / `surface-section` | bound | 10.28 | 11.97 | ok |
| `focus-ring` / `surface-form` | bound | 12.24 | 13.22 | ok |
| `focus-ring` / `surface-filter` | bound | 9.12 | 11.25 | ok |
| `focus-ring` / `nav-surface` | bound | 6.13 | 11.22 | ok |
| `focus-ring` / `focus-offset` | bound | 11.53 | 14.28 | ok |
| `nav-tabs-current-border` / `nav-tabs-current` | bound | 7.64 | 7.44 | ok |
| `nav-button-border` / `nav-button-bg` | bound | exempt (decorative) | 5.38 | ok |
| `nav-button-border` / `nav-header` | bound | exempt (decorative) | 13.69 | ok |
| `nav-button-border-hover` / `nav-button-bg-hover` | bound | exempt (decorative) | 6.64 | ok |
| `nav-button-border-hover` / `nav-header` | bound | exempt (decorative) | 13.69 | ok |

Tight but passing (traditional 4.5-5.0): `action-1-text`/`action-1-bg` 4.89, `action-3-text`/`action-3-bg` 4.77, `nav-text`/`nav-header` 4.77, `nav-text-hover`/`nav-hover` 4.63, `nav-text-dark`/`nav-current-dark` 4.90, `badge-verified-text`/`badge-verified-bg` 4.72, `badge-provisional-text`/`badge-provisional-bg` 4.75. Dark 4.5-5.0: `nav-text-hover`/`nav-hover` 4.68, `border-strong`/`surface-card` 4.52, `border-strong`/`surface-form` 4.52, `border-accent`/`surface-card` 4.53. These are sensitive to any future value nudge.

## Risks / Trade-offs

- [The header nav button's fill is visibly darker in the traditional theme (`oxblood-800` -> `oxblood-900`)] -> Product decision (Augusto), 2026-09-30 (Decision 14): chosen over the off-scale `#7a1f20` so the primitive scale stays intact; the button's text contrast improves from 6.85 to 11.67.
- [The dark `nav-button` fill identifies the button at 2.55 against the header, so in the dark theme the border carries the identification] -> Both border rows are verified at >= 3:1 (5.38 / 13.69 / 6.64). If a future change thins or removes that border, the dark fill must lighten to >= 3:1 first.
- [`nav-toggle` is measured over two documented bases (`nav-surface`, `nav-header`)] -> Both clear the 3:1 icon threshold (3.96 / 4.79); the component change pins where the toggle renders and the unused row is dropped.
- [A previously recorded 12-pair failing list measured against legacy surfaces is not reproducible from `tokens.css`] -> The matrices in this document were recomputed from the designed values and are the contract; the measured-list deltas live here.
- [Tight pairs sit 4.63-4.90] -> The harness re-runs the full matrix on every change; any value nudge lands in a test failure before it ships.
- [Test code needs a mini color engine] -> Restrict the parser to the two syntaxes used in `globals.css`; unknown syntax fails loudly. Adding dependencies requires explicit approval, so none are added.
- [Documented bases assume where controls render] -> Decision 10 table is the contract; the component change extends the matrix if a control renders on an unlisted surface.
- [`next/font/google` fetches font files at build time] -> Build environments need network access; self-hosted faces were rejected (adds font assets and a delivery decision the design does not cover).
- [Drift between `docs/design/` and this document] -> This document is the contract for values changed or added here; updating `docs/design/` stays with its owner.

## Migration Plan

Single-file style swap plus font wiring with no consumers yet: `globals.css` is replaced, `src/app/fonts.ts` is added, `app/layout.tsx` swaps Geist for the two font variables. Rollback is restoring the previous files. No data or API migration.
