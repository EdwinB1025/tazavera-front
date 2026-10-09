No derived API types are needed: the change only moves layout classes.

## 1. New offering panel fills the container (offering-management)

- [x] 1.1 Update `src/pages/new-offering/ui/NewOfferingForm.test.tsx` ("NewOfferingForm — section card panel (design.md D15)", helper `expectSectionCardPanel`) for the scenario "The form panel is a section card" (modified): the card keeps `w-full` and no longer has `md:max-w-160`; the form's parent element has the classes `w-full` and `md:max-w-160` and not `mx-auto`. Verify: the updated assertions fail on the current panel; the other tests of the file pass; `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 1.2 Implement design.md D1 in `src/pages/new-offering/ui/NewOfferingForm.tsx`. Protecting tests: `src/pages/new-offering/ui/NewOfferingForm.test.tsx`. Verify: `npx vitest related` on the changed file passes, the test of 1.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Location cards fill the container (offering-management)

- [x] 2.1 Implement design.md D1 in `src/features/location-management/ui/LocationForm.tsx` and `src/features/location-management/ui/LocationsPanelStates.tsx`. No test asserts these cards' classes; none is added. Protecting tests: `src/features/location-management/ui/LocationForm.test.tsx`, `src/features/location-management/ui/LocationsPanel.test.tsx`. Verify: `npx vitest related` on the changed files passes; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Full checks

- [x] 3.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every validation test passes (same count as on `origin/develop`); the QA suite fails only in files that also fail on `origin/develop`; no typecheck or lint errors; the build succeeds. Any QA test that fails on the old classes is reported to Product owner, not edited.
