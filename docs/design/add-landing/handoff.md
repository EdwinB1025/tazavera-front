# Handoff — add-landing — night of 2026-10-04

## Summary
Tasks done: 5/15 of the checkboxes in tasks.md (2.1 `1a3ec4f`, 2.2 `3939bcb`, 3.1 `a6975d7`, 3.2 `c6f0e2e`; plus unplanned fix F1 `c9a9f59`). Deferred: 1.1 (Q1), and everything that imports its types: 4.x, 5.x, 6.x, 7.x, 8.1 until answered. Stopped because: only tasks dependent on 1.1 remain. Along the way, one 2.2 run was killed for low memory, and a guard conflict (Q5) was resolved by F1 on your instruction.
MVC reachable: yes (read `resources/css/app.css`).

State left in the worktree: task 2.2 is half done and uncommitted. `src/shared/ui/Card.tsx` (new) and `src/shared/ui/index.ts` (modified) are on disk, with no commit and no checkbox for 2.2. The tests and checks for 2.2 have not been run. Re-run task 2.2 from the current tree and verify before trusting these files. `.opencode/agents/build.md` was already modified before tonight.

## Decisions taken
### D1 — Continue with independent tasks past the deferred 1.1
- Context: the build stopped on 1.1 with a question (see Q1).
- Decision: skip 1.1 and run 2.1 (Card). Card and Badge do not use the derived types.
- Why: brief section 6b step 3/4, continue only with tasks that do not depend on the deferral.
- Result: `1a3ec4f` (task 2.1).

### D2 — Class choices for the Card parts left to the build
- Context: task 2.1 delegates the separator and stacking classes to the build.
- Decision: accepted what the build chose. Separator on `CardAside`: `border-b border-border-subtle lg:border-b-0 lg:border-r`. Layout on the parts at `lg` only: `lg:float-left lg:w-1/4`, `lg:flow-root`, `lg:clear-both`. The card root keeps exactly the five settled classes.
- Why: the task text says these classes are chosen by the build and pinned by its tests.
- Result: `1a3ec4f`.

## Fixes and coverage sent to the Build

### F1 — Color guard skips border-width utilities (Q5 resolved on your instruction)
- Type: unplanned fix
- Message sent: Unplanned fix (fix(theming)) on `src/shared/ui/color-guard.test.ts`: skip only `border`, `border-{t|r|b|l|x|y|s|e}` and `border-{t|r|b|l|x|y|s|e}-{n}` (n numeric) under any variant prefix; every other `border-*` must still map to a color token. Cases: fail on `border-nope`, `border-l-nope`; pass on `border-l-4`, `border-b`, `lg:border-r`, `lg:border-b-0`, `border`, `border-border-accent`. Then task 2.2 in a second commit.
- Result: `c9a9f59` (fix), `3939bcb` (task 2.2 Card, checkbox checked). `npm run test:run` 31 files, 769 tests green.
- Note from the build, not decided: the older numeric-name skip (for `ring-2`) also exempts `border-2`/`border-4` without a side. Left as it was.

## Deferred to Augusto
### Q1 — Form of the two derived types in task 1.1 (design.md D2)
- Question: the type lines D2 defines (indexing `data` on `listOfferings` and `listOlfactoryTaxonomies` responses) make `npx tsc --noEmit` fail with TS2537, because `data` is optional in the generated schema. Which form should the two lines take? Build recommends `NonNullable<ListOfferingsResponse["data"]>[number]` and `NonNullable<ListTaxonomiesResponse["data"]>[number]`, which is tsc-clean with exit 0.
- Why deferred: it changes the source text design.md D2 defines, and the task says "exactly as defined there" (correction round).
- Options: (a) update D2 to the NonNullable form; (b) keep the literal text, which cannot pass typecheck; (c) another form, for example `extends (infer T)[] ? T : never`.
- Recommendation: (a). It keeps the meaning of D2's doc comment and does not edit generated types. Settle `OfferingsPageMeta` in the same answer, since `meta` is also optional (`meta?: …`) and tasks 5.x will hit the same TS2537.
- Blocks: 1.1, then 4.x, 5.x, 6.x, 7.x, 8.1 once they need the types.

### Q2 — `tsc` fails in a fresh worktree until `npx next typegen` has run
- Question: `LayoutProps` is not found until typegen has run. The build ran it. Should a `typegen` npm script or a note be added?
- Why deferred: it would add a script to `package.json`, which means a dependency or config change that is not mine to make. Brief section 5 already lists this as environment, not a finding.
- Options: (a) leave as is; (b) add a script.
- Recommendation: (a).
- Blocks: nothing.

### Q3 — Task 2.2 run killed for low memory
- Question: re-run task 2.2 when memory allows. Do not use my session to restart it automatically.
- Why deferred: Claude Code stopped the run and told me not to restart it on my own.
- Options: re-run task 2.2 first, then 3.1, 3.2.
- Recommendation: re-run 2.2, check that the half-written `Card.tsx` and `index.ts` pass `npm run test:run`, `npm run lint` and `npx tsc --noEmit`, then continue.
- Blocks: nothing now (2.2 was re-run and committed as `3939bcb`).

### Q4 — Known item to record
- `/callback` is excluded from `proxy.ts` and gets no Content-Security-Policy from it. `add-auth` owns that route. Nothing was done here.

### Q5 — RESOLVED by F1 (`c9a9f59`) — Color guard rejects border-width utilities in Card (task 2.2 blocked)
- Question (from the build): `src/shared/ui/color-guard.test.ts` treats every `border-*` utility as a color utility and skips only purely numeric names (`ring-2`). It flags Card.tsx's `border-l-4`, `border-b`, `lg:border-r`, `lg:border-b-0` as missing `--color-*` tokens. design.md D6 settles `border-l-4 border-border-accent` on the card root, and the committed 2.1 test pins the root className and the side column's `border-b`, `lg:border-r`, `lg:border-b-0`. AGENTS.md says fix the code, not the guard, so the settled instructions contradict each other.
- Why deferred: the only way to get 2.2 green as written is to amend a guard test (weakening a test), and the alternative reopens D6 and the 2.1 test (correction round). Both are outside what I may decide.
- Options: (1) amend `color-guard.test.ts` so it skips border-width utilities (`border`, `border-t|r|b|l[-<n>]`), matching its documented intent ("every color utility…"); (2) change the settled classes in D6 and the 2.1 assertions to a treatment the guard accepts; (3) another approach.
- Recommendation: (1). The guard's intent is colors, and the design's own classes are width utilities. It is a guard fix, so Augusto should make it or approve it. It needs a case that must still fail on an unknown color (for example `border-nope`) and pass on `border-l-4`.
- Blocks: 2.2, and 3.x in practice, because `npm run test:run` fails over the uncommitted `Card.tsx` on disk. 1.1 chain is blocked by Q1.

## Final checks
`npm run test:run` after `c6f0e2e`: Test Files 32 passed (32), Tests 787 passed (787). The build also reported `npm run lint` and `npx tsc --noEmit` exit 0.
