# Tasks

## 1. Fit the signed-out header at 375px (app-shell)

- [x] 1.1 Tests first. In `src/widgets/app-header/ui/AppHeader.test.tsx`, add one test "fits a small viewport (spec: Header fits a small viewport)" in the signed-out block, rendering the header with a `leading` control. It asserts:
  - the language selector keeps its accessible name, and the element holding the locale code `ES` inside its trigger carries `sr-only md:not-sr-only`;
  - the left group carries `gap-2` and `md:gap-4`;
  - the theme toggle carries `shrink-0` and `size-10`.

  Update existing assertions only where the classes they check change:
  - `AppHeader.test.tsx`, "groups the logotype and the primary navigation on the left": drop `expect(left.className).not.toContain("md:")`; keep `not.toContain("hidden")`.
  - `ThemeToggle.test.tsx`, "Switch presentation": the exact class list gains `shrink-0` after `size-10`.

  Expected: the new and updated tests fail only on the missing classes; every other test passes.
- [x] 1.2 Implement:
  - `LanguageSelect.tsx`: wrap the uppercased locale code in a `<span className="sr-only md:not-sr-only">`; the globe, chevron, trigger classes and `aria-label` are unchanged.
  - `AppHeader.tsx`: the left group classes become `flex items-center gap-2 md:gap-4`.
  - `ThemeToggle.tsx`: add `shrink-0` after `size-10`.

  Verify: `npx vitest related <changed files> --run` passes, `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 1.3 Full checks, each on its own: `npm run test:run`, `npm run test:qa` (only failures that also fail on `origin/develop` are allowed), `npx tsc --noEmit`, `npm run lint`, `npm run build`. On a production build (`npx next start -p 3123`) at 375px signed out, es/ca/en, on offerings, coffee shops and coffee-shop detail: `document.documentElement.scrollWidth` ≤ 375, the theme toggle 40px wide and "Sign in" fully visible. Expected: all pass.
