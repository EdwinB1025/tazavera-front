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
## Round 2

Product owner, 2026-10-05. Resolves handoff Q11 (option 1).

1. The entry page fills the shell's main area, which the `app-shell` main spec still describes as empty. End state: the change carries an `app-shell` MODIFIED delta for the requirement holding the scenario "Root of a supported locale", whose THEN becomes: the shell renders the entry page in its main area instead of reporting the page as not found. The rest of that requirement is unchanged. proposal.md lists `app-shell` under Modified Capabilities, and design.md D13 lists `src/app/shell/AppShell.test.tsx` among the modified files.
   Existing tests affected: `src/app/shell/AppShell.test.tsx`.
   - The two renders of `<HomeScreen />` (the shared `renderShell` helper and the sidebar label case for es, en and ca) render a plain placeholder child instead. `HomeScreen` now loads the `landing` catalog and wraps an async server component, and the shell tests must not depend on the home screen.
   - The case "renders the shell with an empty main area (spec: Root of a supported locale)" is restated: the banner renders and the main area renders exactly the child it was given, the placeholder. It must fail if the main area does not hold the child.
   - The single-button assertion in "Session unresolvable renders as anonymous with no error message and no retry affordance" stays as is: with the placeholder child, the only button is still the header's Sign in.
   - No other assertion in the file is removed or weakened.
   Order: this test update must be committed before task 6.2's commit, because 6.2's verification (`npm run test:run`, `npx tsc --noEmit`) fails on the current `AppShell.test.tsx`. Its commit scope is `app-shell`.

### Status

2026-10-05. `openspec validate add-landing --strict` passes.

1. The `app-shell` MODIFIED delta and the named test update — artifacts updated: new `specs/app-shell/spec.md` (requirement "Locale routing" modified: the scenario "Root of a supported locale" has THEN "the shell renders the entry page in its main area instead of reporting the page as not found"; the rest of the requirement unchanged), proposal.md Modified Capabilities (lists `app-shell` with that modification), design.md D13 (`src/app/shell/AppShell.test.tsx` among the modified files). Tasks created: tasks.md section 10, task 10.1 — the `src/app/shell/AppShell.test.tsx` update (plain placeholder child in both former `<HomeScreen />` renders, the main-area case restated to the child the main area holds and failing if it does not hold it, the single-button assertion unchanged, no other assertion removed or weakened), placed before task 6.2 in list order with commit scope `app-shell` and the `npm run test:run`, `npm run lint`, `npx tsc --noEmit` verification. No test comes first and no implementation task follows: the round changes no implementation.
