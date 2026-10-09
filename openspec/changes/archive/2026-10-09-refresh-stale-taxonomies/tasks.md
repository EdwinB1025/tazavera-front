# Tasks

## 1. Refresh stale taxonomies on a missing reference

- [x] 1.1 Test: add `src/entities/taxonomy/api/taxonomies.test.ts` with three cases for `fetchTaxonomiesCovering(refs)` (stubbed `fetch`): every ref present in the cached read → one request, sent with `REFERENCE_READ_INIT`, and its result returned; a ref missing from the cached read → a second request to the same URL with `{ cache: "no-store" }`, and its result returned; the ref still missing after the fresh read → exactly two requests. Expected: the three cases fail because the function does not exist yet; nothing else fails.
- [x] 1.2 Entities: add `collectTaxonomyRefs(nodes)` in `src/entities/taxonomy/model/refs.ts` (every `ref` of the nodes and their `children`, recursively); in `src/entities/taxonomy/api/taxonomies.ts`, let `fetchTaxonomies` take an optional `init` defaulting to `REFERENCE_READ_INIT` and add `fetchTaxonomiesCovering(refs)`: the cached read; when it succeeds and lacks a ref, one `fetchTaxonomies({ cache: "no-store" })` whose result is returned when it succeeds (the cached result otherwise). Export both from the slice's index. Expected: the 1.1 tests pass; `npx vitest related` on the changed files passes, `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 1.3 Widgets: `Offerings.tsx` (the offerings' `cataConcordance`), `OfferingDetail.tsx` (the offering's `cataConcordance` and `sensoryTaxonomy`), `EvaluationSheetView.tsx` (the evaluation's `tastes`) and `EvaluationSheetBaseline.tsx` (the first baseline's `tastes`, read after the evaluations page) call `fetchTaxonomiesCovering` with `collectTaxonomyRefs` of the data they hold. Update the callers' tests only where their mocks of `@/entities/taxonomy` break, naming each in the commit body. Expected: `npx vitest related` on the changed files passes, `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Full checks

- [x] 2.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: the validation suite passes; the QA suite fails only in files that also fail on `origin/develop`; the typecheck and lint report no errors; the build succeeds.
