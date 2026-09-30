# Proposal

## Why

Tazavera's web frontend has no design-token system: `src/app/styles/globals.css` is still the Next.js boilerplate, so every screen built later would hard-code colors and type, drift from the designed identity and ship without accessibility guarantees. The token system — two application themes (traditional default and dark), the color primitive and semantic layers, and the typographic roles — is already designed in `docs/design/add-theme-tokens/` (`design-summary.md` and `tokens.css`); this change turns that design into the theming contract the application will build on.

## What Changes

- Add the primitive color layer in `src/app/styles/globals.css` (`@theme`): the traditional families (cream, sage, petrol, moss, chartreuse, oxblood, brown), the rating-only `score-*` family shared by both themes, and the `night-*` families used by the dark theme.
- Add the semantic color layer for the traditional theme under the `--color-{group}-{role}-{state}` convention: surface, text, border, action (primary and positional 1-4), navigation (including tab and button variants), feedback (error), focus, evaluation and badge groups.
- Add the dark theme: every semantic token reassigned to the `night-*` palette under the dark theme selector. `[data-theme="dark"]` on the document root is promoted from provisional selector to contract; the activation mechanism itself stays out of scope.
- Add the typography layer: font primitives (`--font-sans` Nunito, `--font-serif` Lora, with fallbacks; tracking tokens) loaded through `next/font/google`, and the typographic roles as `type-{role}` utilities combining family, weight, style, size, line height, tracking and a semantic color token. Roles are theme-identical in every metric but color.
- Record the spacing decision: Tailwind's default scale is used; no spacing tokens are created.
- Resolve and record the open token decisions the design left to this change:
  - The five unification-rule assignments: `surface-input`, `surface-filter-control` and `nav-current` unified into primitives despite deltaE >= 0.02 by product decision (requirement text: "there is no functional requirement for an additional step"), plus `action-1-bg` (traditional) and `action-3-bg` / `action-4-bg` (dark) kept as their own mixes so positional actions stay distinguishable. `nav-tabs-current` stays a translucent `color-mix`.
  - The two themeable details deferred to the components change get their home in the semantic layer: the filter-bar separator (`border-filter-separator`) and the nav item hover shadow color (`nav-hover-shadow`).
- Add automated verification of the token contract with Vitest and no new dependencies: WCAG contrast matrices for both themes (text and button text >= 4.5:1; UI boundaries and focus indicators >= 3:1), theme completeness (every semantic role defined in both themes), and typography role checks. The matrices are computed from the designed values: three residual pairs (in `design.md`) fail and await the product owner's decision per pair — adjust the value keeping the hue, or record an explicit exception.

## Capabilities

### New Capabilities

- `theming`: the design-token system — color (primitive and semantic token layers), the two application themes (traditional default, dark) with their accessibility constraints, and the typographic roles with their theme-invariant metrics. Seeds the spec file for the capability declared in project context.

### Modified Capabilities

None.

## Out of Scope (Non-Goals)

- Theme activation mechanism (switcher UI, persistence, server/client theme resolution). A later change only has to flip `data-theme` on the document root.
- Success and warning feedback colors (only error feedback exists today).
- Building or migrating components to consume the tokens and roles. Upcoming changes (filter bar, navigation, shared card) consume semantic tokens and typographic roles only; gradients, shadows and component states (hover weight, placeholder italic) are built in components from token colors.
- Custom spacing tokens or custom font-size scales (Tailwind defaults are used).
- Anything API-related: this change consumes no endpoint and derives no types.

## Impact

- `src/app/styles/globals.css` (FSD layer `app`): the boilerplate is replaced by the primitive color layer, the semantic color layer, the dark theme block, the font tokens and the `type-{role}` utilities. This is the only styling source the change touches.
- `src/app/fonts.ts` (FSD layer `app`, created): Nunito and Lora face loading via `next/font/google` with the documented faces and CSS variables.
- `app/layout.tsx` (root `app`, modified): uses the font variables from `src/app/fonts.ts` instead of the Geist boilerplate.
- `src/app/styles/tokens.test.ts` (FSD layer `app`, created): contrast, completeness and role verification with Vitest. No new dependencies: the color math is computed inside test code.
- No routes, API calls, generated types or dependencies change. `src/shared/api/schema.ts` is untouched.
- Three residual contrast pairs (measured list in `design.md`) need a product owner decision each before the full matrix can go green; every other documented pair passes with the designed values in both themes.
