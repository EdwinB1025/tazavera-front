# Tasks

## 1. Foundation: types

- [x] 1.1 Confirm this change defines no derived type and touches no generated type: `git status --short` shows nothing under `src/shared/api/` and `npx tsc --noEmit` exits 0 (checked off with task 2.1)

## 2. Coffee shop card action (R54, offering-catalog)

- [x] 2.1 In `src/entities/coffeeshop/ui/CoffeeshopCard.test.tsx`, take the fixture `viewLabel` from the es coffee shop catalog and assert the action named "Ver ofertas" in "Card content" and "View link" (destination still `/es/coffeeshops/01SHOP`); in `src/widgets/coffeeshop-list/ui/CoffeeshopList.test.tsx` set the fixture `viewLabel` to "Ver ofertas" — verifying the card tests fail only because the catalog still reads "Ver"
- [ ] 2.2 Set `viewLabel` in `messages/es/coffeeshops.json` to "Ver ofertas", `messages/en/coffeeshops.json` to "View offerings" and `messages/ca/coffeeshops.json` to "Veure ofertes" (design.md D1) — verifying `npx vitest related` over the changed files passes, and lint and typecheck exit 0

## 3. Bean mark background (R55, form-fields)

- [ ] 3.1 In `src/shared/ui/BeanScale.test.tsx` add the case for scenario "The mark's background stays inside the bean": each bean's `svg rect` has `x="4.05" y="4.35" width="15.6" height="15.6" rx="7.8"` and `transform` `translate(12 12) scale(1.33) translate(-12 -12)`, and precedes the path; in both matrices of `src/app/styles/theme-tokens.test.ts` register, kind `icon`, `evaluation-bean-on`/`surface-card`, `evaluation-bean-on`/`surface-form`, `evaluation-bean-mark-off`/`surface-card`, `evaluation-bean-mark-off`/`surface-form` (design.md D3) — verifying the new bean case fails on the current full-viewBox disc, the contrast pairs pass, and every existing case passes
- [ ] 3.2 In `src/shared/ui/icons.ts` draw the `BeanMark` background as design.md D2 states and update its comments — verifying the new case and every existing `BeanScale.test.tsx` case pass (the read-only partial bean included), and lint and typecheck exit 0

## 4. Integration verification

- [ ] 4.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`, each exiting 0 (report any QA test asserting the old label or geometry)
