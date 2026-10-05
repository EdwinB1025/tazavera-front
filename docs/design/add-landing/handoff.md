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
### Q1 — ANSWERED 2026-10-05 (answer in corrections.md round 1) — Form of the two derived types in task 1.1 (design.md D2)
- Question: the type lines D2 defines (indexing `data` on `listOfferings` and `listOlfactoryTaxonomies` responses) make `npx tsc --noEmit` fail with TS2537, because `data` is optional in the generated schema. Which form should the two lines take? Build recommends `NonNullable<ListOfferingsResponse["data"]>[number]` and `NonNullable<ListTaxonomiesResponse["data"]>[number]`, which is tsc-clean with exit 0.
- Why deferred: it changes the source text design.md D2 defines, and the task says "exactly as defined there" (correction round).
- Options: (a) update D2 to the NonNullable form; (b) keep the literal text, which cannot pass typecheck; (c) another form, for example `extends (infer T)[] ? T : never`.
- Recommendation: (a). It keeps the meaning of D2's doc comment and does not edit generated types. Settle `OfferingsPageMeta` in the same answer, since `meta` is also optional (`meta?: …`) and tasks 5.x will hit the same TS2537.
- Blocks: 1.1, then 4.x, 5.x, 6.x, 7.x, 8.1 once they need the types.

### Q2 — ANSWERED 2026-10-05: (a) leave as is — `tsc` fails in a fresh worktree until `npx next typegen` has run
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

## Session 2026-10-05 — correction round 1, then apply
Summary: precondition checked (`44faa59` "report review round 1 for add-landing" is in the log). Nothing ran. Stopped because: `docs/design/add-landing/corrections.md` is empty (0 bytes) in `44faa59` and on disk, so there is no `## Round 1` for the architect to process. The architect and the build were not started. MVC reachable: not checked.

### Deferred to Product owner
#### Q6 — corrections.md round 1 is empty
- Question: commit `44faa59` adds `corrections.md` with no content. Please write `## Round 1` (presumably including the Q1 answer: the form of the derived types and of `OfferingsPageMeta` in design.md D2) and commit it.
- Why deferred: corrections are written only by Product owner; the architect cannot process an empty round.
- Options: (a) write round 1 and commit it, then rerun this task; (b) if Q1 needs no correction, say so and the apply can start from 1.1 as is.
- Recommendation: (a). Task 1.1 cannot pass `npx tsc --noEmit` with D2's current text (Q1).
- Blocks: the whole session (round 1 processing and the apply loop).

### Final checks
Not run: no agent ran and no code changed.

## Session 2026-10-05 (continued) — correction round 1, then apply
Summary: Product owner told me to run the architect with the round 1 text on disk. The text was then committed as `1ca87d1`. The architect committed `553aabc` "docs(landing): apply review round 1 for add-landing" with `openspec validate add-landing --strict` valid. It updated design.md D2 to the NonNullable form and added task 9.1, which is a no-op once 1.1 runs. spec.md is unchanged. Build task 1.1 was committed as `55f0f5d` "feat(landing): add types for offerings and taxonomies". The build reported `npx tsc --noEmit` exit 0 and no commit after `bff523c` touching the contract or the schema. Stopped because: after 1.1 a `git merge develop` was started in this worktree (not by me or an agent). It is left unfinished, with conflicts in `contracts/openapi.yaml` and `src/shared/api/schema.ts` from develop's `a2de7cb chore(api): update contract and generated types`, and `AGENTS.md` is staged. MVC reachable: not checked.

### Agent feedback
- Architect: task 9.1 overlaps 1.1. It is kept because the rules require a task per correction, and it is checked off as "changes no files" when its turn comes.
- Build (1.1): the commit scope is `landing`, while earlier tasks used `content-structure` and `feedback`. The build asks whether to keep `landing` for the remaining tasks.

### Deferred to Product owner
#### Q7 — ANSWERED 2026-10-05: the merge was run by mistake and undone, the branch is at 55f0f5d, the bff523c check holds, no correction round, do not merge develop — Unfinished merge of develop in the worktree
- Question: finish the merge (resolve the contract and schema conflicts) or abort it? A contract change after `bff523c` also invalidates the 1.1 and 8.1 check "not modified by any commit after `bff523c`", and it is an API or contract change.
- Why deferred: I never resolve conflicts or touch the contract. Aborting would undo your action.
- Blocks: the apply loop (4.1 onward).

#### Q8 — ANSWERED 2026-10-05: from 4.1 on use the affected capability, leave 55f0f5d as is — Commit scope for the remaining tasks
- Question: should the build keep `feat(landing)` (the change's scope) or use the affected capability (`content-structure`, `feedback`, …)?
- Recommendation: the affected capability per task, matching tasks 2.x and 3.x. But AGENTS.md says "the capability of the change being implemented", so either reading fits. Your call.

### Final checks
`npm run test:run` after `55f0f5d`, before the merge was noticed: Test Files 32 passed (32), Tests 787 passed (787).

### Decisions taken
#### D3 — Commit scope for tasks 4.x to 7.x
- Context: my apply prompt, written after Q8, said "the affected capability … not landing". The 4.1 build then held its test commit and asked which capability `src/entities/offering/**` belongs to (landing, feedback or offering-catalog).
- Decision: the scope is the capability in the task's tasks.md section header. Sections 4 to 7 are "(landing)", so `landing`. "Not landing" was my wording error, not part of your Q8 answer. 2.x and 3.x used their headers' `content-structure` and `feedback`.
- Why: Q8 ("as 2.x and 3.x do"). Every scenario 4.1 cites is in `specs/landing/spec.md`. The change has no spec delta for offering-catalog.
- Result: the build prompt was corrected. The 4.1 test files written in the held run were left on disk for the next run to commit.

### Apply progress
- 4.1: `7171692 test(landing): verify the offering card field mapping and the rating tiers`. The first run held the commit over the scope question (D3). The second run committed it and extended the View-link case to all three `Session` fixtures. Its two test files fail only on the modules 4.2 adds. Lint is 0, and tsc reports only TS2307 for `@/entities/offering`.
- 4.2: the run was killed by Claude Code for low system memory. Per the stop notice I did not restart it. The log ends right after the skill loaded. No files were written, and the tree shows only handoff.md modified.

#### Q9 — Restart the apply loop at 4.2
- Question: restart when memory allows. Claude Code says not to restart it on its own.
- Blocks: 4.2 and everything after it. Remaining tasks: 4.2, 5.1, 5.2, 6.1, 6.2, 6.3, 7.1, 7.2, 8.1, 9.1.

### Final checks
`npm run test:run` after `7171692`: 2 files fail as allowed (the 4.1 tests, which need 4.2), 32 files and 787 tests pass.

### Correction to the entry above (2026-10-05 15:30)
The 4.2 run was not killed. Only my wrapper shell was stopped. opencode kept running, wrote `src/entities/offering/{index.ts,lib/rating.ts,ui/OfferingCard.tsx}`, and stopped at 14:46 with a question. Q9 is superseded by F2 below.

### Fixes and coverage sent to the Build
#### F2 — 4.1 texts case requires the provisional label on a verified card
- Type: unplanned fix (spec feedback "Verification status badge", landing offering card requirement, design.md D11).
- Message sent: in `OfferingCard.test.tsx`, change only the case "renders every label and caption from the texts props". Render a verified card and a provisional card (specialist session). Every TEXTS value except `provisionalLabel` must be on the verified card, and `provisionalLabel` on the provisional card. The case must fail if any value is never rendered. Commit `fix(landing): …` with the test file only, then task 4.2 from the files on disk.
- Result: `567828a` (fix) and `5decbce` (task 4.2, checkbox checked). `npm run test:run`: 34 files, 811 tests pass. Lint and tsc exit 0 (reported by the build).

### Decisions taken
#### D4 — Rating badge label is the score value
- Context: the build noted that the artifacts fix the rating badge's variant but not its visible text, and the D11 catalog has no rating label. It chose `cuppingAvg` as the label.
- Decision: accepted as a free detail. No catalog key, token or behaviour is added.
- Why: design.md D4 and D8 leave the text open, and a tier word would add catalog keys (scope).
- Result: told to the build in the F2 message. Check it in the browser before archiving: the score then appears twice, as `type-score` and as the chip.

### Apply progress (16:10)
- 5.1: `329de9d test(landing): verify the offering list fetches, taxonomy resolution and states`. 5 files fail as allowed, the rest pass.
- 5.2: `070a4a9 feat(landing): implement the verified offerings list`. The build's free choices: `page: number`; empty is `items.length === 0`; the pagination normalises the optional `meta.current_page` and `meta.last_page` with `?? 1` and `?? currentPage`.
- Claude Code stopped the loop's shell for low memory a second time, during 5.2. The opencode run finished on its own. Per the stop notice I did not restart the loop.
- Remaining: 6.1, 6.2, 6.3, 7.1, 7.2, 8.1, 9.1.

### Final checks
`npm run test:run` after `070a4a9`: Test Files 39 passed (39), Tests 835 passed (835).

## Session 2026-10-05 (evening) — apply from 6.2
Summary: no OpenCode process was running at the start (PID 36640 was gone); after that, Product owner dropped the process check. One build run for task 6.2 ran and ended with exit 1 on `Error: Insufficient account balance` (model provider) before any commit. Stopped because: every further agent run would fail the same way. MVC reachable: not checked.

### Agent feedback (6.2, unfinished run)
- Copied `docs/design/add-landing/coffee-beans.png` to `public/images/coffee-beans.png` (untracked). I checked with `cmp` that the files are identical.
- The shell denied `python`, `identify` and similar tools, so it could not read the PNG's intrinsic size. Instead it added a case "Intrinsic photograph size (design.md D12)" to `src/pages/home/ui/HomeHero.test.tsx`. The case reads width and height from the PNG IHDR header and asserts them on the rendered image. This is based on D12 ("intrinsic width and height"). It is not part of 6.1's test list.
- It rewrote `src/pages/home/ui/HomeScreen.test.tsx` for the filled screen. The build says the old "empty main area" case asserts what D13 changes.
- It wrote no implementation files, ran no tests and made no commit. 6.2 is still unchecked.

### Notes
- `.opencode/agents/` shows no modification in `git status`, because Product owner committed the restricted overnight profiles in `1ca87d1`. The profile on disk is the restricted one (`OVERNIGHT VERSION` header), so I ran the build.
- The decisions log did not exist at `tazavera-front/docs/orchestrator-decisions.md`. I created it with its heading only, per CLAUDE.md §8. It is left uncommitted on `develop` for Product owner.
- D4 (score shown in both `type-score` and the rating chip) was left unchanged, pending Product owner's browser check.

### Deferred to Product owner
#### Q10 — Model provider account has no balance
- Question: top up the `xiaomi/mimo-v2.6-pro` provider account (or name another model), then rerun the loop from 6.2.
- Why deferred: it is outside the project and outside my authority.
- State left in the worktree: modified `src/pages/home/ui/HomeHero.test.tsx` and `src/pages/home/ui/HomeScreen.test.tsx`, plus untracked `public/images/coffee-beans.png`. The next 6.2 run should continue from these files and verify them. I did not revert them, since I do not edit code.
- Blocks: 6.2, 6.3, 7.1, 7.2, 8.1, 9.1.

### Final checks
`npm run test:run` was not run: no task commit was made, and the tree holds an unfinished 6.2. The last green run was after `070a4a9` (39 files, 835 tests).
