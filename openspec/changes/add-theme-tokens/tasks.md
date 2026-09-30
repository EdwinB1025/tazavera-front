# Tasks

## 1. Derived types

- [ ] 1.1 Confirm the change derives no types from `src/shared/api/schema.ts` and verify with `git status` that `src/shared/api/` is untouched

## 2. Traditional theme slice (tests first)

- [ ] 2.1 Write the test harness in `src/app/styles/theme-tokens.test.ts` (custom property parsing, `var()` and `color-mix(in srgb, ...)` resolution with loud failure on unknown syntax, documented-base compositing per design.md Decision 10, WCAG ratios, the decorative-separator exemption of Decision 8 and the excluded-pair list of the Evidence section) with the traditional pair matrix from design.md, and verify `npm run test:run` runs the new suite red because `globals.css` defines no tokens yet
- [ ] 2.2 Add the primitive layer and the traditional semantic layer to `src/app/styles/globals.css` per `docs/design/add-theme-tokens/tokens.css` and design.md (five unification assignments per Decision 5, `border-filter-separator` and `nav-hover-shadow` included, inline group comments), and verify `npm run test:run` shows every traditional pair marked ok in design.md as green and only Residual 1 and Residual 3 red

## 3. Dark theme slice (tests first)

- [ ] 3.1 Add the dark pair matrix and the theme-completeness check (every semantic token defined in both themes) to `src/app/styles/theme-tokens.test.ts`, and verify `npm run test:run` runs them red because no dark block exists yet
- [ ] 3.2 Add the `night-*` primitives and the dark semantic block under `[data-theme="dark"]` to `src/app/styles/globals.css` per `docs/design/add-theme-tokens/tokens.css` and design.md, and verify `npm run test:run` reports every dark pair marked ok in design.md as green (only Residual 2 red) and the completeness check passing

## 4. Typography slice (tests first)

- [ ] 4.1 Add typographic role verification to `src/app/styles/theme-tokens.test.ts` (role table from design.md: family, weight, style, size, line height, tracking and semantic color binding per role; metric invariance across themes; sizing rules: control 16px on mobile, error and action text >= 14px), and verify `npm run test:run` runs it red because no font tokens or roles exist yet
- [ ] 4.2 Create `src/app/fonts.ts` with Nunito and Lora via `next/font/google` (documented faces and variables), wire `app/layout.tsx` to them, and add `--font-sans`, `--font-serif` and the tracking tokens to `src/app/styles/globals.css` per design.md Decision 11, and verify `npm run test:run` passes the font wiring checks and `npx tsc --noEmit` passes
- [ ] 4.3 Add the `type-{role}` utilities to `src/app/styles/globals.css` per the design.md role table (colors from semantic tokens only, no role changes under the dark selector), and verify `npm run test:run` reports every role check green in both themes

## 5. Residual contrast decisions (product owner)

- [ ] 5.1 Record the product owner's decision for each residual pair (Residual 1 `nav-toggle-text`/`nav-toggle-bg`, Residual 2 `nav-button-text-hover`/`nav-button-bg-hover`, Residual 3 `nav-button-border`/`nav-header`) in design.md, and verify each residual names exactly one chosen option from its option list
- [ ] 5.2 Apply the decisions (token value changes keeping the hue, or explicit exceptions with the >= 3:1 floor added to `specs/theming/spec.md`), and verify `npm run test:run` reports the full matrices green in both themes and `openspec validate add-theme-tokens --strict` passes

## 6. Integration checks

- [ ] 6.1 Verify `npm run test:run`, `npm run lint` and `npx tsc --noEmit` all pass together on the finished change
