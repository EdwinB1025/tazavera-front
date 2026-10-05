# Corrections — add-landing

## Round 1

Product owner, 2026-10-05. Resolves handoff Q1.

1. design.md D2, derived API types. The data and pagination fields of the generated responses are optional, so indexing them directly fails `npx tsc --noEmit` (TS2537). End state: every type D2 derives from an optional field wraps it in `NonNullable<…>` before indexing:
   - `NonNullable<ListOfferingsResponse["data"]>[number]`
   - `NonNullable<ListTaxonomiesResponse["data"]>[number]`
   - `OfferingsPageMeta`: the same `NonNullable<…>` form over its existing indexed access of `meta`.
   The meaning of D2's doc comments is unchanged; the generated schema is not edited.
   Existing tests affected: none.
   New test: none; task 1.1's verification `npx tsc --noEmit` must exit 0 (fails on the current literal text, passes on the new form).

### Status

2026-10-05. `openspec validate add-landing --strict` passes.

1. design.md D2, derived API types — artifacts updated: design.md D2 (the three derived types wrap their indexed access in `NonNullable<…>` before indexing, the doc comments' meanings unchanged and the generated schema untouched); spec.md unchanged, since no observable behaviour changes. Tasks created: tasks.md section 9, task 9.1 (one task carrying the end state and its `npx tsc --noEmit` verification; no test task, the round creating no test). Task 1.1 is still open and copies D2 exactly, so the end state also lands through it.