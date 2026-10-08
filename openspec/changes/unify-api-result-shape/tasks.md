# Tasks

## 1. Move every module to the one result type

No task adds a test. Only the tests design.md D7 lists for a task change, and only in the result shape they mock or assert; if any other test fails, stop and report it. No file under `qa/` is edited.

- [x] 1.1 offering-catalog: add `src/shared/api/result.ts` with `ApiFailureKind` and `ApiResult` (design.md D1) and export both types from `src/shared/api/index.ts`; move `fetchCoffees`, `fetchTaxonomies`, `fetchOffering`, `fetchCoffeeshop`, `fetchCoffeeshops`, `fetchOfferings`, `fetchVerifiedOfferings`, `fetchEvaluations`, `fetchEvaluation` and the name searches to it with their consumers, including `OfferingReader` and `offeringFacetOptions` (design.md D2, D3); update the task-1 tests of design.md D7. Expected: `npx vitest related` over the changed files passes, `npx tsc --noEmit` and `npm run lint` report no errors, and no consumer of these functions catches a rejection of them or reads `status: "found"`.
- [ ] 1.2 evaluations: move the six `user-evaluations.ts` functions to `EvaluationCallResult<T> = ApiResult<T, "forbidden" | "not-found" | "conflict">` with their consumers (design.md D2); update the task-2 tests of design.md D7. Expected: `npx vitest related` over the changed files passes, typecheck and lint report no errors, and no consumer reads a numeric `status` of a result.
- [ ] 1.3 offering-management: move the `management.ts` and `locations.ts` functions to `ApiResult` with their consumers, make `fetchOwnLocations` module-private, move `OwnOfferingsResult` and `LocationsResult` to the model and drop `WriteOutcome` and `CreateOutcome` from the slice index (design.md D2, D3, D4, D5); update the task-3 test of design.md D7. Expected: `npx vitest related` over the changed files passes, typecheck and lint report no errors, and no file outside the two `api` modules reads a `Response`.
- [ ] 1.4 user-account: move `account.ts`, `register.ts` and `contacts.ts` to `ApiResult` with their consumers and make `fetchContact` and `createContact` module-private (design.md D2, D4). Expected: `npx vitest related` over the changed files passes with no test changed, typecheck and lint report no errors.

## 2. Full checks

- [ ] 2.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: the validation suite passes; every QA failure is either one that also fails on `origin/qa` or a stale QA copy of design.md D7 (listed in the final report); the typecheck and lint report no errors; and the build succeeds.
