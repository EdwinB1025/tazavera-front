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