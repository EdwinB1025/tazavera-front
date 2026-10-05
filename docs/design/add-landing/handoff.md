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

## Session 2026-10-05 (evening, resumed) — apply 6.2
Summary: after the provider balance was restored (Q10), task 6.2 was rerun. The build implemented 6.2 on top of the files the earlier run left behind, then held the commit because verification fails outside the change's files. Stopped because: of Q11 below. Everything later depends on 6.2's catalogs and screen. MVC reachable: not checked.

### Agent feedback (6.2)
- Written, uncommitted: `src/pages/home/ui/HomeHero.tsx`, `src/pages/home/ui/ExploreButton.tsx`, `src/pages/home/ui/HomeScreen.tsx` (modified), `app/[locale]/page.tsx` (modified), `messages/{es,en,ca}/landing.json`, `public/images/coffee-beans.png`, plus the earlier run's `HomeHero.test.tsx` (D12 intrinsic-size case) and `HomeScreen.test.tsx` (rewritten).
- Build's results: the slice tests pass (11/11), the message-catalog guard is green over `landing`, `npm run lint` exits 0. `npx tsc --noEmit` exits 2, failing only on `src/app/shell/AppShell.test.tsx` (2× TS2741, `<HomeScreen />` without `locale`, lines 67 and 157). `npm run test:run` passes 40 of 41 files and 838 of 847 tests; the 9 failures are all in `src/app/shell/AppShell.test.tsx`.
- `AppShell.test.tsx` (capability `app-shell`, owned by `add-app-shell`) renders `<AppShell><HomeScreen /></AppShell>` and asserts `main.textContent === ""` (scenario "Root of a supported locale") and `getAllByRole("button")` length 1. D13 fills that main area, so both assertions stop holding.
- The rating badge label was not touched (D4).

### Deferred to Product owner
#### Q11 — 6.2 conflicts with the app-shell main spec and its test
- Question: `openspec/specs/app-shell/spec.md`, scenario "Root of a supported locale", says "THEN the shell renders with an **empty main area** instead of reporting the page as not found". `add-landing` fills that area (proposal "fills the shell's empty main area", design.md D13), but its proposal lists "Modified Capabilities: None" and the change has no `app-shell` delta. Also, no task names the `AppShell.test.tsx` updates that AGENTS.md requires ("When a task changes behaviour that existing tests assert, it names those tests").
- Why deferred: resolving it means adding a MODIFIED `app-shell` requirement to the change (a spec change in another capability) and a task that edits a shared component's test. That is a correction round, outside §4. It cannot be an unplanned fix either, because the test asserts a main-spec scenario that is still in force.
- Options: (1) correction round. The architect adds an `app-shell` MODIFIED delta for "Root of a supported locale" (for example "THEN the shell renders the entry page in its main area instead of reporting the page as not found") and a task before 6.2's commit naming the `AppShell.test.tsx` updates: pass `locale` to `HomeScreen`, restate the empty-main-area case for the filled main area, and scope the single-button assertion to the header's Sign-in control. (2) Treat it as an unplanned fix on `AppShell.test.tsx` with no spec delta. That leaves the main spec contradicting the code after archive. (3) Fold the test edits into 6.2's commit. That breaks the one-capability-per-commit rule.
- Recommendation: (1). It is the only option that keeps `openspec/specs/app-shell` true after archive. The build also notes that `HomeScreen` now loads the catalog and wraps an async server component, so the shell test may need a plain child instead of `HomeScreen`. The architect should state that in the task.
- Blocks: 6.2's commit, then 6.3, 7.1, 7.2, 8.1 and 9.1 (all build on 6.2's catalogs and screen). The 6.2 files stay uncommitted in the tree for the next run.

### Final checks
`npm run test:run` (build's run on the uncommitted 6.2 tree): 40 of 41 files, 838 of 847 tests pass; the only failures are in `src/app/shell/AppShell.test.tsx`. Last committed green state: `070a4a9` (39 files, 835 tests).

## Session 2026-10-05 (night) — correction round 2, then apply to the end
Summary: Product owner chose option 1 for Q11 and told me to apply it without stopping. I wrote `## Round 2` in `corrections.md` from that option. The architect processed it in `1580306` "docs(landing): apply review round 2 for add-landing" (`openspec validate add-landing --strict` valid). That commit adds an `app-shell` MODIFIED delta for "Root of a supported locale", lists `app-shell` under Modified Capabilities, adds `AppShell.test.tsx` to D13 and adds task 10.1, placed before section 6. The build loop then ran 10.1, 6.2, 6.3, 7.1, 7.2, 8.1 and 9.1. Claude Code killed the loop's wrapper shell for low memory during 9.1. The 9.1 opencode run finished on its own, and I waited for it without restarting anything. Stopped because: completed, all 17 tasks are checked. Verify and archive were not run (not asked). MVC reachable: not checked.

### Q11 — ANSWERED 2026-10-05: option 1 (correction round 2), applied in `1580306` and `7e449b2`

### Apply progress
- 10.1: `7e449b2 test(app-shell): restate the main-area case on the placeholder child`. Both `<HomeScreen />` renders are now a placeholder `<p>`. The main-area case asserts that main holds exactly that child; a probe showed it fails without the child. The single-button case is unchanged.
- 6.2: `2779d16 feat(landing): implement the entry hero and fill the home screen`. The build confirmed the copied PNG is byte-identical.
- 6.3: `d7c2c74 feat(landing): replace the create-next-app metadata with the localized page metadata`.
- 7.1: `3b56c96 test(landing): verify the about sections, evaluation cards, links and closing action`. Only its 2 files fail, as allowed.
- 7.2: `e069679 feat(landing): implement the about screen with its five sections and the closing action`.
- 8.1: `e59c432 chore(landing): complete tasks for add-landing`, checkbox only. The build reports `npm run test:run`, `npm run lint`, `npx tsc --noEmit` and `npm run build` all exit 0, with every check in the task text met.
- 9.1: `3e776c5 chore(landing): complete tasks for add-landing`, checkbox only. 1.1 had already applied the round 1 form.

### Decisions taken
#### D5 — Commit scope for sections 8 and 9
- Context: the headers of sections 8 and 9 name no capability, so the D3 rule gives nothing. The build used `landing` for both.
- Decision: accepted.
- Why: AGENTS.md ("the capability of the change being implemented"), and the precedent `55f0f5d` you accepted in Q8.
- Result: `e59c432`, `3e776c5`.

#### D6 — Free details the build chose, accepted
- 6.3: the catalog key is `metaDescription`. The "no create-next-app text remains" case asserts `app/layout.tsx`'s source text, while the title and description cases assert the `generateMetadata` output. The test mocks `next/headers` and `@/app/fonts`.
- 7.1/7.2: the about tests import through `@/pages/about`, the slice entry, following the 4.1 pattern. `AboutContentTexts` has 12 flat keys. The about registration and closing labels have their own `about*` keys, although their wording matches the hero's.
- Why: each is left open by the artifacts and adds no scope, token or mechanism.

### For Product owner's review before the archive
- Browser checks (prompt item 4, not run): captures at 375px and 1280px of `/es` and `/es/about`; D4 (the score shown both as `type-score` and as the rating chip).
- About heading copy (build's wording, as the summary leaves it to the developer): `El café, ` / `contado` / ` como es` (accent `contado`), with en `Coffee, told as it is` and ca `El cafè, explicat com és`. It can be changed in review as copy.
- `2779d16` also carries two test changes from the earlier 6.2 run that 6.2's text does not name. `HomeScreen.test.tsx` was rewritten for the filled screen, replacing its old empty-main-area case. `HomeHero.test.tsx` gained an "Intrinsic photograph size (design.md D12)" case. Both match D12 and D13; the build offered to split the D12 case out as unplanned coverage if you prefer.
- Stale wording: tasks.md section 9's intro still says "Task 1.1 is still open". I left it, because 9.1 is checked and the text changes nothing.
- The build noted `src/shared/ui/Logo.tsx`'s inline `style={{ fill: url(#…) }}`. It is a paint reference, outside this change, and does not break D7.

### Final checks
My own `npm run test:run` after `3e776c5`: Test Files 44 passed (44), Tests 858 passed (858). The loop's post-8.1 test run failed only with vitest workers dying on start (exit 3221225794) under memory pressure. This was environment, not a test failure; the rerun above is green.

## Session 2026-10-05 (night, continued) — browser check, round 3, done by the orchestrator
Summary: Product owner's browser check (1280px, mock data) found the pages without margins, spacing or card gaps. I had not looked at the rendered page before; tests in jsdom cannot see layout, and the artifacts never settled layout. Product owner chose a card grid with the score on top, and sent the header items to `refine-app-header`. I wrote round 3 (10 items). Product owner then told me to stop the agents and follow the process myself, so I did the architect's and the build's work for round 3 under AGENTS.md's rules. Stopped because: completed. Verify and archive were not run. MVC reachable: yes (`layouts/offerings/index.blade.php`: `mx-[5%]`, `gap-2` list).

### Environment for the check (not committed)
- API: `php artisan serve` on `http://localhost:8000` (`FRONT_URL` was already `http://localhost:3000`). The database holds no offerings (`total: 0`).
- Mock: `scratchpad/mock-api.mjs` on port 8001 serves 6 fake verified offerings on `/offerings` (scores 92.50, 89.99, 87.25, 82.00, 78.75 and none; null region/process/variety cases) and proxies `/taxonomies` to the real API.
- `.env.local` (git-ignored) currently holds `NEXT_PUBLIC_API_URL=http://localhost:8001`. Point it back to `:8000` when the mock is no longer needed.
- Captures: headless Chrome. A plain 375px window is clipped by Chrome's minimum window width, so the 375px captures use device emulation over the DevTools protocol (`scratchpad/capture.mjs`).

### Commits
- `61bf20c` docs: apply review round 3 (specs `landing`, `content-structure`, `feedback`; design.md D14; tasks 11–13).
- `d86807e` docs: fix artifacts (task 11.1). The full-height column applies to the stacked layout only, because the default layout's `lg` floats do not work inside flex.
- 11.1 `05dc703` / 11.2 `dc7ff21`: `Card` `layout="stacked"` through a context, so `Card.tsx` becomes `"use client"`, like `Button`.
- 12.1 `7026dd8` / 12.2 `f0c904f`: badge inline row with padding. This also fixes the verified/provisional icon rendering above the label (planned as an unplanned fix; folded into round 3 item 9).
- 13.1 `0ee724d` / `4cae388` docs (task 13.2: rows and pagination spacing found in the browser, and the rescoped "Rows by level" case) / 13.2 `03129d7` / 13.3 `6f9ba86`.

### Decisions taken
#### D7 — Shared grid constant
- `OFFERING_GRID_CLASSES` lives in `src/widgets/offering-list/lib/grid.ts` and is exported from the widget. The list and the home screen's skeleton fallback use it, so both lay out alike.
#### D8 — Duplicated section/container classes (backlog candidate)
- `HomeScreen.tsx` and `AboutContent.tsx` each hold `SECTION_CLASSES` and `CONTAINER_CLASSES`, because FSD forbids imports between `pages` slices. Candidate for `docs/backlog.md`: a shared section primitive in `src/shared/ui`. It will pay off on the next public page.

### Deferred to Product owner
#### Q17 — D4 still open
- The score still shows twice on each card: as the large number and as the rating chip. It is visible in the captures. Your call.
#### Q15, Q16 — sent to `refine-app-header`'s handoff, uncommitted there
- Header primary nav spacing and treatment, and the white area below short pages.

### Final checks
`npm run test:run`: Test Files 44 passed (44), Tests 879 passed (879). `npm run lint` exit 0, `npx tsc --noEmit` exit 0, `npm run build` exit 0 (my runs after `03129d7`).

## Session 2026-10-05 (late) — verify and archive, done by the orchestrator
Summary: Product owner confirmed the browser check, accepted the two extra test changes in `2779d16`, and asked to archive now. I closed the round 4 verify coverage, re-ran the verify checks myself and archived. Stopped because: completed. MVC reachable: not needed.

### Decisions taken
#### D9 — Extra tests in `2779d16` accepted
- `HomeHero.test.tsx` "Intrinsic photograph size (design.md D12)" and the `HomeScreen.test.tsx` rewrite for the filled screen (D13) stay as committed; no split. Product owner's answer.
#### D10 — Round 4 verify coverage
- Rating pairs: already registered in both matrices of `theme-tokens.test.ts` (composited over `surface-card`); no change.
- Taxonomy pairs: `1b4817a` adds a sweep over a 6-step sRGB cube, levels 0–2, both card surfaces, asserting every chosen label ≥ 4.5:1 on the blended background. A probe with a wrong threshold (0.5) fails it.
#### D11 — Q17 (score shown twice, D4)
- Product owner asked to archive with the cards as checked in the browser, so the current presentation is kept; reopen as a new change if wanted.

### Verify (my run)
- Tasks: 0 open. `openspec validate add-landing --strict`: valid. `npm run test:run`: Test Files 44 passed (44), Tests 884 passed (884). `npm run lint` exit 0, `npx tsc --noEmit` exit 0, `npm run build` exit 0. Contract: only `bff523c` (Product owner's contract update, cleared in Q7). No CRITICAL; no open WARNING.

### For Product owner
- Backlog candidate from D8 (shared section/container primitive) is still not in `docs/backlog.md`.
- `.env.local` still points `NEXT_PUBLIC_API_URL` at the mock on `:8001`.
- At merge: `refine-app-header` (already in `develop`) also edited `AppShell.test.tsx`; expect an overlap there.
