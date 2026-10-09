## 1. Shared mapping (form-fields)

- [x] 1.1 Add `src/shared/lib/field-errors.test.ts` (first written as `src/shared/api/validation.test.ts`) with one test for "A 422 maps to its fields": `splitFieldErrors(toFieldErrors(body), ["email", "postalCode"], { postal_code: "postalCode" })` with `body = { message: "m", errors: { email: ["e1", "e2"], postal_code: ["p1"], role: ["r1"] } }` gives `fields` `{ email: "e1", postalCode: "p1" }` and `unmatched: true`. Verify: it fails only because `validation.ts` does not exist yet; `npm run lint` reports no errors.
- [x] 1.2 Implement design.md D1–D3: `src/shared/lib/field-errors.ts` (first written as `src/shared/api/validation.ts`), the `validation` kind in `result.ts`, `useServerFieldErrors` in `src/shared/lib/hooks/index.ts`. Verify: `npx vitest related` on the changed files passes; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Account forms (user-account)

- [x] 2.1 Add to `src/features/user-account/ui/RegisterForm.test.tsx` one test for "The registration names invalid fields": a valid submit answered `422` with `errors: { email: ["fx-email-taken"] }` shows `fx-email-taken` as the Email field's description, the Email input has `aria-invalid="true"`, the generic error is absent; typing in Email removes `fx-email-taken`. In `src/features/user-account/ui/ContactSection.test.tsx`, the `"422"` row of the generic-error table gets the body `{ message, errors: { unknownKey: ["fx-api-field-error"] } }` (a key that names no field), its assertions unchanged. Verify: only the new test fails; `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 2.2 Implement design.md D4–D6 for registration, profile, password and contact. Protecting tests: `RegisterForm.test.tsx`, `ProfileForm.test.tsx`, `PasswordForm.test.tsx`, `ContactSection.test.tsx`. Verify: `npx vitest related` on the changed files passes; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Location and offering forms (offering-management)

- [x] 3.1 Add to `src/pages/new-offering/ui/NewOfferingForm.test.tsx` one test for "The create names the inventory field": with an item chosen, the create answered `422` with `errors: { coffeeInventoryId: ["fx-inventory-invalid"] }` shows `fx-inventory-invalid` as the inventory field's description with `aria-invalid="true"`, no `role="alert"` region renders, and choosing another item removes the message. Verify: only the new test fails; `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 3.2 Implement design.md D4–D6 for the location and new-offering forms. Protecting tests: `NewOfferingForm.test.tsx`, `LocationForm.test.tsx`, `LocationsPanel.test.tsx`, `submit-location.test.ts`. Verify: `npx vitest related` on the changed files passes; `npx tsc --noEmit` and `npm run lint` report no errors.

## 4. Evaluation form (evaluations)

- [ ] 4.1 Add to `src/pages/evaluation-form/ui/EvaluationForm.test.tsx` one test for "The API names an invalid field": a save whose `updateAnEvaluation` resolves `{ ok: false, kind: "validation", errors: { "descriptive.roastLevel": ["fx-roast-invalid"] } }` shows `fx-roast-invalid` as the roast level field's description with `aria-invalid="true"`, no failure message in the status region, no navigation; changing the roast level removes the message. Verify: only the new test fails (typecheck errors only for the missing `validation` kind of `EvaluationCallResult`); `npm run lint` reports no errors.
- [ ] 4.2 Implement design.md D4–D6 for the evaluation form. Protecting tests: `EvaluationForm.test.tsx`, `EvaluationDetail.test.tsx`. Verify: `npx vitest related` on the changed files passes; `npx tsc --noEmit` and `npm run lint` report no errors.

## 5. Full checks

- [ ] 5.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: the validation suite passes; the QA suite fails only in files that also fail on `origin/develop` or in stale copies listed in the final report (kept out of `vitest.qa.config.mts`); no typecheck or lint errors; the build succeeds.
