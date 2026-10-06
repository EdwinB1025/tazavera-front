# Tasks

## 1. Foundation: types

- [x] 1.1 Confirm this change introduces no derived or UI-specific type and never touches generated types: verify `git status --short` shows no entry under `src/shared/api/` (with `src/shared/api/schema.ts` untouched) and `npx tsc --noEmit` exits 0 without any type file added or modified

## 2. Badge geometry export slice

- [x] 2.1 Extend `src/shared/ui/Badge.test.tsx` with the case "exports the geometry every badge renders" (design.md D4): `BADGE_GEOMETRY_CLASSES.split(" ")` equals the file's existing `BASE` literal (`type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5`), and for each of the seven variants the first seven class tokens of the rendered badge equal `BADGE_GEOMETRY_CLASSES.split(" ")` — verifying `npm run test:run` runs the file, the new case fails because `Badge.tsx` does not export the constant yet, and every existing case keeps passing unchanged (in particular "renders the base classes first on every variant" and the exact class strings, taxonomy label, depth and contrast cases)
- [x] 2.2 In `src/shared/ui/Badge.tsx`, export `BADGE_GEOMETRY_CLASSES` as a string holding exactly `type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5` in that order, compose `Badge` from it as its base (then the variant classes, then `className`, as today) and remove the private `BASE_CLASSES` (design.md D1–D3), changing nothing else in the component — verifying the new case passes, every existing `Badge.test.tsx` case passes unchanged (the rendered element, class tokens and their order, inline styles, `data-taxonomy` and icons stay identical to `develop`), and `npm run lint` and `npx tsc --noEmit` exit 0

## 3. Segment entry slice

- [x] 3.1 Extend `src/shared/ui/index.test.tsx` with an import check (design.md D4): `BADGE_GEOMETRY_CLASSES` is importable from `@/shared/ui` and equals the `Badge.tsx` export — verifying `npm run test:run` runs the file, the new check fails because the segment entry does not export the constant yet, and "renders the badge exported from the segment" keeps passing
- [ ] 3.2 Re-export `BADGE_GEOMETRY_CLASSES` from `src/shared/ui/index.ts` beside `Badge` (design.md D1), verifying the new check passes, every segment-entry test passes and `npm run lint` and `npx tsc --noEmit` exit 0

## 4. Single-source verification slice

- [ ] 4.1 Write `src/shared/ui/badge-geometry-guard.test.ts` (design.md D4, the `radius-guard`/`color-guard` pattern) scanning the non-test `.ts` and `.tsx` files under `src/` (spec scenario "Second geometry definition detected"). It must FAIL naming the file on each of these cases: a file other than `src/shared/ui/Badge.tsx` holding all seven geometry tokens (`type-badge`, `rounded-field`, `inline-flex`, `items-center`, `gap-1`, `px-2`, `py-0.5`) as literal class names in one string, and the same seven tokens collected in a class array (each case verified with a temporary fixture outside `Badge.tsx` that the scan reports by file name). It must PASS on a fixture that imports `BADGE_GEOMETRY_CLASSES` and adds `border-2 border-muted`, on a fixture holding only some of the tokens (`inline-flex items-center gap-1`), and over the current code, where `src/shared/ui/Badge.tsx` is the only non-test `.ts`/`.tsx` file holding them (`globals.css` defines `@utility type-badge` and is outside the scan) — verifying `npm run test:run` runs the guard green over the current surface and it fails naming the fixture file for both violation shapes

## 5. Integration verification

- [ ] 5.1 Verify the complete change with `npm run test:run`, `npm run lint` and `npx tsc --noEmit`, verifying all three commands exit 0 and the suites that must keep passing are green and unchanged: `src/shared/ui/Badge.test.tsx`, `src/shared/ui/index.test.tsx`, `src/entities/offering/ui/OfferingCard.test.tsx`, `src/widgets/offering-list/ui/OfferingList.test.tsx`, `src/shared/ui/color-guard.test.ts`, `src/shared/ui/radius-guard.test.ts`, `src/shared/ui/focus-guard.test.ts`, `src/shared/ui/xss-guard.test.ts`, `src/shared/ui/client-boundary.test.ts` and `src/app/styles/theme-tokens.test.ts`
- [ ] 5.2 Confirm no visible change against the `develop` reference (design summary §10): the landing at `/es` (offerings section with rating, verification and taxonomy badges) captured at 375px and 1280px matches the same route as it renders on `develop`, and the rendered badge output is class- and style-identical to `develop` for every variant (the exact strings pinned by `Badge.test.tsx`)
