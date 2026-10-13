No derived API types are needed: the change reads no API field (design.md Context).

## 1. The hero's explore action opens the coffee shop directory (landing)

- [x] 1.1 In `src/pages/home/ui/ExploreButton.test.tsx`, replace the two tests of the old content of the scenario "Explore scrolls to the offerings" with one test of the scenario's new content (the scenario keeps its name "Explore scrolls to the offerings", see the propose status): rendering `<ExploreButton label={LABEL} locale="es" />`, the link named by the label has `href="/es/coffeeshops"`. Remove with them the `#offerings` target helper, its cleanup and the `next/navigation` mock and router fixtures; update the file's doc comment to the new scenario. No other test changes. Verify: the new test fails only because no link named by the label renders (and `npx tsc --noEmit` reports only the missing `locale` prop of `ExploreButton`); `npm run lint` reports no errors.
- [x] 1.2 Implement design.md D1 in `src/shared/ui/Button.tsx` and `src/shared/ui/index.ts`, in its own commit. Verify: `npx vitest related src/shared/ui/Button.tsx src/shared/ui/index.ts --run` passes with `Button`'s tests unchanged; `npx tsc --noEmit` reports only the errors task 1.1 expects; `npm run lint` reports no errors.
- [x] 1.3 Implement design.md D2 in `src/pages/home/ui/ExploreButton.tsx` and `src/pages/home/ui/HomeHero.tsx`. Verify: `npx vitest related src/pages/home/ui/ExploreButton.tsx src/pages/home/ui/HomeHero.tsx --run` passes, 1.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Full checks

- [x] 2.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: all pass, lint with 0 errors, except `qa/src/pages/home/ui/HomeHero.test.tsx` (line 80, `getByRole("button")`), which is expected to fail once the action is a link and is not edited in this change. If `npm run test:qa` fails only there, the change stops after the full checks, before verify and archive, and the failing test, its line and its message are reported. Any other failure is fixed in its own `fix(landing): …` commit, or reported when the fix would go beyond the end state.
