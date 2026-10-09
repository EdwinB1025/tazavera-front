# Tasks

## 1. One colour for the bean's lines (form-fields)

- [x] 1.1 In `src/shared/ui/icons.ts`, `BeanMark` paints the bean path with `fill-evaluation-bean-mark-off stroke-evaluation-bean-mark-off` for both variants (`on` and `off`; the read-only half bean renders through the same variants). The disc classes (`fill-evaluation-bean-on` / `fill-evaluation-bean-off`) are unchanged. No validation test asserts the path's `-mark-on` class, so no test changes; no `qa/` test changes.

  Verify: `npx vitest related src/shared/ui/icons.ts --run`, `npx tsc --noEmit`, `npm run lint`. Expected: all pass.

## 2. Remove the unused mark-on token (theming)

- [ ] 2.1 In `src/app/styles/globals.css`, remove `--color-evaluation-bean-mark-on` from both themes; no other token value changes. In `src/app/styles/theme-tokens.test.ts`, in both matrices, replace the `{ fg: "evaluation-bean-mark-on", bg: "evaluation-bean-on", kind: "icon" }` registration with `{ fg: "evaluation-bean-mark-off", bg: "evaluation-bean-on", kind: "icon", exempt: true }`, its comment citing Product owner's decision (2026-10-09) that the contrast is sufficient as designed. No other registration changes.

  Verify: `npx vitest related src/app/styles/globals.css src/app/styles/theme-tokens.test.ts --run`, `npx tsc --noEmit`, `npm run lint`. Expected: all pass. Then the full checks, each on its own: `npm run test:run`, `npm run test:qa` (only failures that also fail on `origin/develop` are allowed, plus the stale QA copy `qa/src/shared/ui/icons.test.ts` variant "on"), `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: all pass.
