# Tasks

## 1. Send the array filters of GET /offerings with brackets

- [x] 1.1 In `src/widgets/offering-list/api/offerings.test.ts`, add one test for the `filtering` scenario "Taste notes sent as an array": `fetchOfferings({ cataRef: ["01JREFA", "01JREFB"] })` requests exactly `{NEXT_PUBLIC_API_URL}/offerings?cataRef%5B%5D=01JREFA&cataRef%5B%5D=01JREFB` (design.md D2). Expected: the new test fails on the current code (it sends `cataRef=`); every other test passes. Commit `test(filtering): …`.
- [x] 1.2 In the same file, update the assertion of the existing test "requests {NEXT_PUBLIC_API_URL}/offerings with exactly the kept query, repeated keys repeated" (`offering-catalog` scenario "Contract names kept") from `cataRef=01JREFA&cataRef=01JREFB` to `cataRef%5B%5D=01JREFA&cataRef%5B%5D=01JREFB`, keeping the rest of the expected URL (`verified=1&…&orderBy=cupping_avg&page=3`). Expected: that test fails on the current code. Commit `test(offering-catalog): …`.
- [x] 1.3 In `src/widgets/offering-list/api/offerings.ts`, send each key of the set of design.md D1 as `<key>[]`, one pair per value, in `fetchOfferings`'s existing query building (design.md D1, D2). Verify: `npx vitest related src/widgets/offering-list/api/offerings.ts --run` passes (including the tests of 1.1 and 1.2), `npx tsc --noEmit` reports no errors and `npm run lint` reports no errors.

## 2. Full checks

- [x] 2.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: `npm run test:run` passes; `npm run test:qa` fails only in files that also fail on `origin/develop`, plus `qa/src/widgets/offering-list/api/offerings.test.ts` (stale copy of the updated assertion, reported); the typecheck and lint report no errors and the build succeeds.
