# Tasks

No test-writing task: this is a refactor (fast lane). The protecting tests keep their assertions. In every task, "related tests" means `npx vitest related <changed files> --run` (validation suite) and `npx vitest related <changed files> --run --config vitest.qa.config.mts` (QA suite). Each task moves code unchanged, as design.md D1–D4, and makes the panel render the new parts in place of the moved blocks.

## 1. Contact section

- [x] 1.1 In `src/features/user-account/`: add `readPrimaryContact` and `submitContact` to `api/contacts.ts`, `EMPTY_CONTACT_VALUES`, `CONTACT_FIELD_ORDER` and `isEmptyContact` to `model/contact-checks.ts`; create `model/use-contact-form.ts`, `ui/ContactForm.tsx` and `ui/ContactSectionStates.tsx`; reduce `ui/ContactSection.tsx` to its types, read state, focus and composition (design.md D2). `ContactSectionProps` and the keys of `ContactSectionTexts` do not change. Protecting tests: `ContactSection.test.tsx` in `src/features/user-account/ui/` and `qa/src/features/user-account/ui/`, plus `model/contact-checks.test.ts`. Verify: the related tests pass with no test file changed; `npx tsc --noEmit` reports 0 errors; `npm run lint` reports 0 errors and no size or complexity warning for the changed and new files. Commit `refactor(user-account): split the contact section`.

## 2. My offerings panel

- [x] 2.1 In `src/pages/manage-offerings/ui/`: create `SkeletonGrid.tsx`, `OwnOfferingsGrid.tsx`, `OwnOfferingsBody.tsx` and `OwnOfferingsList.tsx`, moving the code out of `ManageOfferingsPanel.tsx`, which keeps `ManageOfferingsTexts` (same keys), `ManageOfferingsPanelProps` and `ManageOfferingsPanel` (design.md D3). Protecting tests: `ManageOfferingsPanel.test.tsx` in `src/pages/manage-offerings/ui/` and `qa/src/pages/manage-offerings/ui/`. Verify: the related tests pass with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors and no size or complexity warning for the changed and new files. Commit `refactor(offering-management): split the my offerings panel`.

## 3. Locations panel

- [x] 3.1 In `src/features/location-management/`: add `readOwnLocations` to `api/locations.ts`; create `model/use-own-locations.ts`, `ui/LocationsPanelStates.tsx` and `ui/LocationList.tsx`; reduce `ui/LocationsPanel.tsx` to its types, form state, focus and composition (design.md D4). `LocationsPanelProps` and the keys of `LocationsPanelTexts` do not change. Protecting tests: `src/features/location-management/ui/LocationsPanel.test.tsx`. Verify: the related tests pass with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors and no size or complexity warning for the changed and new files. Commit `refactor(offering-management): split the locations panel`.

## 4. Full checks

- [ ] 4.1 Run, each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: every one exits 0 with no test added, removed or changed; `npm run lint` reports no size or complexity warning for any file of design.md, Files; `git diff origin/qa --stat -- src qa` lists only the files of design.md, Files. This task changes no files: check it off in a commit containing only the checkbox, `chore(offering-management): complete tasks for split-account-and-management-panels`.
