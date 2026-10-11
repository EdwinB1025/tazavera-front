No derived API types are needed: the change reads no new API field (design.md Context).

## 1. Coffee shop detail back controls read "Back" (offering-catalog)

- [x] 1.1 Test in `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.test.tsx` for "Back label in each locale": for each of `es`, `en` and `ca`, build the texts with `coffeeshopDetailTexts` from that locale's `coffeeshops`, `contact` and `landing` catalogs, render `CoffeeshopDetailContent` in the success state with that `locale`, and assert a link named exactly "Volver" / "Back" / "Tornar" with `href` `/{locale}/coffeeshops` and a button with the same exact name. In the same commit, by Product owner's decision of 2026-10-11 (option A), change only the label string "Volver a cafeterías" to "Volver" in these existing tests, each the test of a scenario this change modifies; no other assertion, query, structure or test name changes:
  - `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.test.tsx` "shows the back link, three placeholder bars and two skeleton cards while loading (spec: Loading)" (line 60) → "Loading"
  - `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.test.tsx` "links back to the directory of the locale (spec: Back link)" (line 110) → "Back link"
  - same file, "Back link at the end" (lines 117 and 118) → "Back link at the end"
  - same file, "renders the title and the line above the back button, with no retry action and no tab (spec: Unknown coffee shop)" (line 185) → "Unknown coffee shop"
  - same file, "renders the back link, the error and the retry action, and no tab (spec: Unknown coffee shop or failure)" (line 196) → "Unknown coffee shop or failure"

  Verify: the new test and the five edited tests fail only because the controls still read the old label; the rest of both files passes; `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 1.2 Implement design.md D1: set `backToDirectory` to "Volver" in `messages/es/coffeeshops.json`, "Back" in `messages/en/coffeeshops.json` and "Tornar" in `messages/ca/coffeeshops.json`. No file under `src/` changes. Verify: `npx vitest related` on the changed files and the two test files passes, 1.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Full checks

- [ ] 2.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: all pass, except failures that come only from QA tests made stale on purpose (a QA test asserting "Volver a cafeterías", "Back to coffee shops" or "Torna a les cafeteries", such as `qa/src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.test.tsx`); those are left untouched and listed in the final report with the reason. Any other failure is fixed in its own `fix(offering-catalog): …` commit.
