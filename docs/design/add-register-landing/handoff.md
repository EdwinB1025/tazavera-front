# Handoff — add-register-landing

## Session 2026-10-21 — Summary (draft)
Summary: Product owner asked (2026-10-21) for a "Register" button shown only to anonymous visitors, a registration landing that explains registering as a specialist or as a coffee shop, and the removal of the registration links from the initial landing pages; the landing and the button are only for unauthenticated users. Put on the board as `Type: Change` (traditional workflow 3a, step 1) and in the backlog as R91; the design lead drafted the summary (step 2). Stopped because: the summary waits for Product owner's answers and approval (steps 3–4). MVC reachable: yes (read only; it has no registration chooser).

### Agent feedback
Design lead (draft, uncommitted until this commit): landing under the register slice with a heading block and two `Card layout="stacked"` option cards (one column, two from 768px, 1.5rem gap), each with a `RouteButton` `action-1` to its form; header `RouteButton` `nav-button` before "Sign in", anonymous only; links and six `landing` catalog keys per locale removed; new keys `shell.register` and eight `account.registerLanding*`; no new token, dependency or contract operation. Could not run Bash or PowerShell: contrast not re-measured (every pair already registered in the theme matrix), header widths at 375/768 px are estimates, no captures. MVC found under `C:/Programing/Full Stack/Sprint5/tazavera-app`.

### Decisions taken
#### D1 — The landing's session gate is the existing register* rule
- Context: the request says the landing and the button are only for unauthenticated users. / Decision: the landing reuses the gate of the register forms (loading status while the session resolves; an authenticated user is sent to `/{locale}` by client-side navigation). / Why: decisions log 2026-10-06 "rutas protegidas sin sesión: mensaje con botón" (last sentence) and user-account "Registration routes"; `RegisterClient.tsx:43-51`. / Result: summary §4; the design lead's open point "do the forms also redirect" closed (they already do).

#### D2 — WITHDRAWN 2026-10-29: orchestrator's misreading (removing the About us links was never asked). Product owner then answered summary Open 4: the entry-page hero's two registration links become one link to About us, and About us's two registration links become one link to `/join`
#### D2 — Links removed from both the entry page and About us (summary Open 4 = A)
- Context: the request says "the links in the initial landing pages"; both pages hold the two registration links. / Decision: remove both groups. / Why: the request as written (plural). / Result: summary Open 4 stays listed with A; no edit to the summary.

#### D3 — Specialist card first (summary Open 6 = A)
- Context: card order. / Decision: specialist, then coffee shop. / Why: order of the request ("register as specialist or register as coffeeshop"). / Result: summary Open 6 stays listed with A.

### Closed for review
(none)

### Artifact fixes
(none — no artifacts yet)

### Fixes and coverage sent to the Build
(none)

### Deferred to Product owner
#### ANSWERED 2026-10-21: B, new route `/join` (Product owner: "new route as /join"); the forms stay at `/register` and `/register/coffeeshop`
#### Q1 — Route of the landing (summary Open 1)
- Question: where does the landing live? / Why deferred: changes routes and the user-account spec paths. / Options: A. `/{locale}/register` becomes the landing and the specialist form moves to `/{locale}/register/specialist`; B. a new route (e.g. `/{locale}/join`), forms unchanged. / Recommendation: A — symmetric URLs, the landing stays under the existing register* redirect rule, nothing in the auth flow holds the route (verified by the design lead). / Blocks: propose.

#### ANSWERED 2026-10-21: new option — "in small screen the button is part of the landing above the first body" (Product owner). Orchestrator's reading, sent to the design lead and to be confirmed by Product owner: below 768 px the header shows no Register button; the entry page shows a Register button above its first section (the hero), for anonymous sessions only; from 768 px the header button stays. The navigation-menu entry and the `UserPlus` icon (Open 5) fall away
#### Q2 — The header button on small screens (summary Open 2)
- Question: the signed-out header has no room at 375 px for a second button. / Why deferred: visible behaviour. / Options: A. button from 768 px; below it, a "Register" entry in the existing navigation menu (anonymous only); B. icon-only button below 768 px (likely overflows); C. shorter labels; D. one account menu (new component). / Recommendation: A, measured at 768 px in the visual review (from 1024 px if it overflows there). / Blocks: propose.

#### ANSWERED 2026-11-05: recommendation accepted (Product owner approved the summary with its defaults, `c6ac3ddf`)
#### Q3 — Defaults to confirm (summary Open 3, 5, 7–10)
- Question: confirm or change the recommended defaults: button before "Sign in" with the `nav-button` style; new `UserPlus` icon for the menu entry (new icon export, no dependency: needs your yes under "nothing new in the design"); one shared gate piece in the register slice; no "Already have an account?" line; the proposed es/en/ca texts (§8); the forms' Cancel keeps going to the entry page. / Why deferred: wording and one new icon. / Recommendation: accept all. / Blocks: no.

### Final checks
Not run: no code yet.

## Session 2026-10-21 — Summary (answers, step 4)
Summary: Product owner answered Q1 (`/join`) and Q2 (button on the entry page below 768 px). Relayed to the design lead to update the draft; `/join` sits outside the register* redirect rule, so the landing gets the same gate by the request itself ("only accessible when the user is not authenticated"). Stopped because: waiting for Product owner's approval (commit of the summary with `Status: approved`). MVC reachable: yes.

### Agent feedback
Design lead (draft updated, committed by the orchestrator as a draft): `/join` routed from `app/[locale]/join/page.tsx` to a `RegisterLandingScreen` inside the `src/pages/register` slice, so the gate shared with `RegisterClient` stays slice-local (FSD: a page slice cannot import another); header "Register" from 768 px only (`hidden md:inline-flex` wrapper); below 768 px a `HomeRegisterButton` client island (`RouteButton action-1`, base size) above the hero, anonymous only, with 1.5rem to the hero; new text `landing.heroRegisterAction`; navigation-menu entry and `UserPlus` icon dropped; if the header overflows at 768 px, both breakpoints move to 1024 px together. New Open 11 (confirm the reading; non-blocking). No point blocks propose. Unverified: contrast script and captures at 375/768/1280 (no shell in the subagent).

### Deferred to Product owner
#### ANSWERED 2026-11-05: A, confirmed (Product owner approved the summary with its defaults, `c6ac3ddf`)
#### Q4 — Confirm the reading of the Q2 answer (summary Open 11)
- Question: below 768 px the "Register" button appears on the entry page only (other pages show just "Sign in"), and it is not rendered while the session resolves, so it pushes the hero down ~4rem once an anonymous session resolves. / Options: A. confirm; B. reserve the space while resolving (signed-in users see a blank 4rem); C. another reading. / Recommendation: A. / Blocks: no.

## Session 2026-10-29 — Summary (new answer, step 4)
Summary: Product owner asked (2026-10-29), within R91, to replace the hero's registration links with one link to About us. Relayed to the design lead, who updated the draft (committed by the orchestrator as a draft). Product owner also confirmed R45 stays a separate change, queued after R91. Stopped because: waiting for Product owner's approval (commit of the summary with `Status: approved`). MVC reachable: not checked this session.

### Agent feedback
Design lead (draft updated): hero actions block keeps the explore button and adds one text `Link` to `/{locale}/about` 1rem below it, for every visitor, no `nav` landmark; new key `landing.heroAboutLabel` (Sobre nosotros / About us / Sobre nosaltres) rather than reusing `shell.aboutUs` (each screen reads its own catalog area; `heroRegisterAction` precedent); `HomeHeroTexts` gains `aboutLabel`. Found: app-shell "Named navigation landmarks" names the registration landmarks (added to the delta); validation-test list completed; QA fixture `qa/src/pages/home/ui/HomeHero.test.tsx` goes stale. New Open 12 (non-blocking). Unverified: no shell (git, captures, contrast script).

### Deferred to Product owner
#### ANSWERED 2026-11-05: A, text links (Product owner approved the summary with its defaults, `c6ac3ddf`)
#### Q5 — Hero About us link and About us `/join` link: text links or buttons (summary Open 12; both links together since 2026-10-29)
- Question: base-controls "Navigation controls by position" (decisions log 2026-10-09) makes every navigation control outside a page header's first line an action button; a text link in the hero is an exception (the registration links carry the same tension today). / Options: A. text link, the landing delta states the exception; B. `RouteButton` (e.g. `action-3` like the explore button); C. another reading or label. / Recommendation: A. / Blocks: no.

## Session 2026-11-05 — Propose (step 6), cloud
Summary: Propose launched as a one-off scheduled cloud run: routine `trig_01DGEQDsPoc6k69Y6M3BYNFT`, run at 2026-11-05 09:15 UTC, environment `Default`, model `claude-opus-5-5`, architect only, base `origin/feature/add-register-landing` (`f1b6dc50`), target `claude/add-register-landing-propose`. The prompt was written by the orchestrator (the design lead subagent file `.claude/agents/design-lead.md` is not present in this session, so the design lead could not run; section 7, step 2); the design lead reviews the result before the artifact review. Plan usage at launch: 5 h 3%, 7 d 1%. Stopped because: waiting for the cloud session. MVC reachable: not checked.

### Decisions taken
#### D4 — Summary status line read as approved
- Context: the summary's first line reads `Status: draft — approved`, not exactly `Status: approved`. / Decision: treat it as approved and say so in the prompt. / Why: Product owner's commit `c6ac3ddf` "add-register-landing approved", with Q3–Q5 answered by it. / Result: propose prompt.

### Agent feedback
Cloud session `cse_016LpndhXN5DNjrfr14AY4TM` (09:15–09:26 UTC, success). Commits `2f330712` docs(user-account), `a5f6166f` docs(app-shell), `0c24bc4a` docs(landing), one per capability; `openspec validate --strict` valid; skills openspec-propose and fsd-architecture followed. Architect settled: gate as a slice-local hook (Open 7 = A, D2); landing in `src/pages/register` (D1); entry-page button renders its own `md:hidden` wrapper (D5); new key `landing.aboutRegisterLabel` (D7); new text props required, stale QA fixtures listed (D8). Open from the architect: 768 px header width unmeasured (visual review); five scenarios keep their names with new content because the validator refuses a MODIFIED block that drops a scenario (D9).

### Review and integration (orchestrator, §7 steps 4 and 7)
Commit format and footer correct; only `openspec/changes/add-register-landing/` touched; skills named in the run log. `feature/add-register-landing` fast-forwarded to `0c24bc4a` in the new worktree `tazavera-front-register-landing` and pushed. Worktree setup (§6 step 1): `npm install` done; `.env.local` and the restricted OpenCode profile not copied (sources not named yet). No npm checks run: the change touches artifacts only.

### Artifact fixes
#### A1 — Test file name in the proposal
- Phase: before review / Conflict: proposal Impact named `RegisterLandingClient.test.tsx`; task 1.1 creates `RegisterLandingScreen.test.tsx` / Fix: proposal now names `RegisterLandingScreen.test.tsx` / Result: uncommitted (enters the architect's update commit).
#### A2 — `# Tasks` title
- Phase: before review / Conflict: tasks.md lacked the template's `# Tasks` heading / Fix: added / Result: uncommitted.
#### A3 — README task in its own group
- Phase: before review / Conflict: the tasks instruction requires each group to land its own documentation and keeps the final group for integration checks; the README `/join` row was task 5.1 / Fix: moved to task 1.5; full checks renumbered 5.1 (no reference to the old numbers) / Result: uncommitted; `openspec validate --strict` valid.

### Deferred to Product owner
#### ANSWERED 2026-11-05: A (Product owner: "Q6-A")
#### Q6 — Artifacts defer to the design summary
- Question: design.md line 5 calls the summary "the design source of truth" (layout, spacing, tokens, texts "not restated here"), and tasks 1.2 and 3.2 send the build to the summary's §8 wording, so the artifacts are not self-contained. The framing came from the orchestrator's propose prompt. / Why deferred: carrying the values into design.md is an artifact change beyond §4. / Options: A. review message: design.md and tasks carry the settled values and point to design.md, the summary is only the propose input; B. leave as is. / Recommendation: A. / Blocks: apply.
#### ANSWERED 2026-11-05: A (Product owner, after the functional explanation: when the session cannot be resolved, `/join` shows the two options as for an anonymous visitor, with no error; one scenario and its test)
#### Q7 — Unresolvable session on `/join`
- Question: the spec rules ask for error states; the landing has no scenario for a session that cannot be resolved (the shell renders it as anonymous). / Options: A. add one scenario (options shown, as anonymous) and its test; B. none. / Recommendation: A. / Blocks: no.
#### ANSWERED 2026-11-05: A (Product owner: "Q8-A")
#### Q8 — Scenario names kept with new content
- Question: five scenarios ("Link groups", "Registration destinations", "Specialist registration destination", "Registration links", app-shell "Registration links named") keep names that no longer describe them (D9). / Options: A. accept; rename later by a hand edit of the main specs; B. another way. / Recommendation: A. / Blocks: no.

### Final checks
Not run (artifact-only change); `openspec validate add-register-landing --strict` valid after A1–A3.

## Session 2026-11-05 — Artifact review (step 7), answers
Summary: Product owner answered Q6 = A, Q7 = A, Q8 = A ("I agree with the artifacts" otherwise). Cloud routine creation still denied in this session (`RemoteTrigger` `create`, also after Product owner's permission change; `list` and `get` work); Product owner restarts the session. Stopped because: session restart. MVC reachable: not checked.

### Next steps (next session)
1. The design lead reviews the propose result (section 7, step 2: the orchestrator wrote the prompt), launched as a general agent with `.claude/agents/design-lead.md` when the subagent is not registered.
2. Send Product owner's review message to the architect as given: his answers Q6 = A, Q7 = A, Q8 = A, with the A1–A3 cleanup already in the worktree; check the `docs(<capability>): update artifacts for add-register-landing` commit, then the duplicates check (section 4).
3. Classify the apply (three capabilities, about 15 tasks: long scope → cloud, section 9) and launch it.

## Session 2026-11-05 (afternoon) — Artifact review (step 7), design lead review
Summary: Start checklist done; assignment loop running. Cloud routine creation tested in `default` mode: works (disabled test routine `trig_01XnGPPCQNjFiNZAsWNVXSNo`, never scheduled; the server attached the account connectors Claude_Docs and Claude_Code_Remote). The design lead (run as a general agent, `.claude/agents/design-lead.md` still missing) reviewed the propose result. Stopped because: the architect's update run cannot start: the worktree's `.opencode/agents/` holds no restricted profile (section 6) and no source is named (Q9). MVC reachable: not checked.

### Agent feedback
Design lead: propose result fit for the artifact review; cloud commits need no fix; A1–A3 correct; deltas keep every untouched sentence and scenario; code facts the tasks rely on hold; every colour pair already in the guard matrix. Findings: (1) the 768px header may overflow (hand estimate ~138px over, not measured); the "correction round" deferral in D4, Risks and the proposal is the wrong path since summary §9 settles the fallback; (2) Q7's test duplicates the anonymous test unless it drives the real session (precedent `src/app/shell/AppShell.test.tsx:221`); (3) Q6 = A still to carry: design.md line 5, tasks 1.2 and 3.2 (summary §8 wording); (4) `h-full`/`flex-1` in D3 repeat what `Card layout="stacked"` applies; (5) no action; (6) `docs/agents/orchestrator.md` modified in the worktree, not the orchestrator's: must stay out of the architect's commit. Unverified: 768px width, run log, contrast by script.

### Decisions taken
#### D5 — Q7's test drives the real session
- Context: design lead's open point 1 (finding 2). / Decision: the Q7 scenario's test drives an unresolvable session as `src/app/shell/AppShell.test.tsx:221` does, so it is a distinct test from the anonymous one. / Why: Product owner's Q7 = A asks for "one scenario and its test"; the precedent exists; adds no scope (section 3, answer an agent's question). / Result: included in the review message to the architect.
#### D6 — 768px measurement at the visual review
- Context: finding 1. / Decision: no capture before the update commit; the header is measured in the visual review after the header task, and an overflow applies summary §9's fallback (both breakpoints to `lg`) without a correction round. / Why: summary §9 settles the fallback; the wording fix A4 makes the artifacts say so. / Result: A4.

### Artifact fixes
#### A4 — Overflow fallback path
- Phase: before review / Conflict: design.md D4 and Risks, tasks 5.x visual review line and proposal "Out of scope" sent the 768px fallback "through a correction round"; summary §9 settles it and `corrections.md` is only for findings after the build has started / Fix: "per summary §9" (D4: "summary §9, the settled fallback") / Result: uncommitted; `openspec validate --strict` valid.
#### A5 — Classes the stacked card already applies
- Phase: before review / Conflict: D3 `RegisterOption` added `className="h-full"` on `Card` and `className="flex-1"` on `CardContent`, already applied by `STACKED_CARD_CLASSES` / `STACKED_CONTENT_CLASSES` (`src/shared/ui/Card.tsx:59,63`) / Fix: removed, with a note that the stacked layout applies them; nothing visible changes / Result: uncommitted; `openspec validate --strict` valid.

### Deferred to Product owner
#### Q9 — Executor for the architect's update run
#### ANSWERED 2026-11-05: the committed `.opencode/agents/` profile is the restricted (`--auto`) one; run the architect locally (Product owner: "yes")
- Question: section 6 requires the restricted OpenCode profile in the worktree's `.opencode/agents/` before the first run, from a source the task prompt names; none is there and none is named. The cloud alternative cannot see the uncommitted A1–A5, and section 5 lets the orchestrator commit artifact fixes only during the apply. / Options: A. name the profile source (and `.env.local`): the OpenCode architect runs locally with A1–A5 uncommitted, as section 4 says; B. authorise committing A1–A5 now so the update runs in a cloud session. / Recommendation: A (the rules as written; OpenCode does not use the plan). / Blocks: the artifact update, then the apply.

## Session 2026-11-05 (afternoon) — Artifact review (step 7), architect update
Summary: OpenCode architect (`xiaomi/mimo-v2.6-pro`, `--auto`, committed profile) applied Product owner's review message (Q6 = A, Q7 = A, Q8 = A) with D5 and A1–A5; exit 0. `.env.local` not copied (denied by the session's settings; not needed by the architect). The stale `docs/agents/orchestrator.md` draft in the worktree was discarded (`develop` holds the applied rules). Stopped because: completed. MVC reachable: not checked.

### Agent feedback
Architect: commit `8b7dd162` `docs(user-account): update artifacts for add-register-landing` (design.md, proposal.md, tasks.md, user-account spec delta). Q6: design.md self-contained, D7 carries the es/en/ca wording of the new keys; tasks 1.2 and 3.2 point to D7. Q7: one new scenario "The landing shows its options when the session cannot be resolved"; task 1.1 gains a fifth test driving a real unresolvable session (D5). Q8: names kept; rename after the archive by a hand edit of the main specs (Product owner's action). `openspec validate --strict` valid. Open: the 768px header width (visual review; summary §9 fallback).

### Review (orchestrator, section 6 step 4 and section 4)
Commit format and footer correct; only `openspec/changes/add-register-landing/` touched; tree clean. Duplicates check across spec deltas, design and tasks: none found (the hero's two destination scenarios share one test by Q8 = A, not a duplicate).

### Next
Apply weight: long (three capabilities, 15 tasks) → cloud session (section 9). Design lead writes the cloud prompt (section 7 step 2).

## Session 2026-11-05 (late afternoon) — Apply (step 8), launch attempt
Summary: Start checklist done. On Product owner's request ("proceed with apply"), the design lead (run as a general agent) wrote the cloud prompt for the build (base `9fa5886d`, target `claude/add-register-landing-apply`, every unchecked task, skills openspec-apply-change and fsd-architecture). `RemoteTrigger` `create` was denied (don't-ask mode); `claude --cloud` through Bash, tried at Product owner's prompting, was also denied. Product owner adds a PreToolUse hook approving `RemoteTrigger` and restarts the session. Stopped because: session restart. MVC reachable: not checked.

### Agent feedback
Design lead: prompt checked against §7 step 2. Open points, none blocking: (1) the apply skill needs the `openspec` CLI, not in `package.json`; the propose cloud session had it, so no install line was added (the stop rule covers it); (2) `AGENTS.md` says no push while §7 needs the session to push its target branch (earlier sessions did); (3) the 768px header overflow stays with the visual review after integration; (4) `proposal.md` "Out of scope" (line 38) still says the `lg` move comes "as a later correction" (wording only; A4 fixed design.md and tasks.md); (5) the rule files on the feature branch differ from `develop` only in the records table of `workflow_sdd.md`.

### Next
Next session: check the hook with a disabled test routine; have the prompt rewritten with the branch's current head as base (this commit moves it past `9fa5886d`); launch the apply as a one-off scheduled run and watch it (§7).

## Session 2026-11-05 (evening) — Apply (step 8), cloud launch
Summary: Start checklist done; assignment loop running. The PreToolUse hook works: `RemoteTrigger` `create` succeeded (disabled test routine `trig_01NebsWc2injnSM3vGFpUyNG`). The design lead (general agent) rewrote the build prompt on base `81b1d975`; checked against §7 step 2. Apply launched as a one-off scheduled cloud run: routine `trig_01RXWWDgLqMaXn4Tv1ocqPgh`, run at 2026-11-05 18:24 UTC, environment `Default`, model `claude-opus-5-5`, build only, target `claude/add-register-landing-apply`, tasks 1.1–5.1. The server attached the account connectors Claude_Docs and Claude_Code_Remote. Background watch (`Monitor`) denied in don't-ask mode: the assignment loop is the watch (§7). Plan usage at launch: 5 h 8%, 7 d 3%. Stopped because: waiting for the cloud session. MVC reachable: not checked.

### Agent feedback
Design lead (prompt): open points, none blocking: (1) `openspec` CLI not in `package.json` (the prompt makes a missing CLI a stop); (2) `AGENTS.md` forbids `git push` while §7 needs the session to push its target branch (prompt follows §7, as before); (3) the rule files on the feature branch differ from `develop` (`orchestrator.md`, `design-lead.md`, `workflow_sdd.md`; not `AGENTS.md` or `build.md`); (4) `proposal.md` line 38 still says the `lg` move comes "as a later correction" (wording; not fixed now: §4 forbids editing an artifact while a Build run is in progress); (5) 768px header width stays with the visual review.

First run, session `cse_016Lpndfr5uMg21DGuUxVYjs` (18:24–18:26 UTC): stopped before task 1.1, no `openspec` CLI in the cloud (Q11). Nothing committed or pushed.

### Deferred to Product owner
#### ANSWERED 2026-11-05: Product owner added `npm install -g @fission-ai/openspec@1.16.0` to the `Default` environment's setup script; the same routine was rescheduled (18:44 UTC)
#### Q11 — The cloud apply needs the `openspec` CLI
- Question: the apply skill calls `openspec status` / `openspec instructions apply`; the CLI is not in `package.json` nor in the cloud image (the propose session installed it globally on its own). / Options: 1. setup line in the prompt; 2. go on without the CLI; 3. install it in the environment's setup script; 4. local OpenCode build. / Recommendation: 1. / Blocks: apply.

## Session 2026-11-05 (evening) — Apply (step 8), cloud run 2 and integration
Summary: Session `cse_016LpndiM3V2aGT6tkbRZmj4` (18:44–18:55 UTC, success): setup script ran, `openspec` CLI present, skills openspec-apply-change and fsd-architecture read. Tasks 1.1–2.2 done (7 of 15), pushed to `claude/add-register-landing-apply`. Stopped at task 2.3 with a question (C1). Stopped because: C1 needs an artifact update before the build continues. MVC reachable: not checked.

### Agent feedback
Build: commits `6bae12e1` test (landing and its session gate; file added to the forks pool of `vitest.config.mts`, test infrastructure: it drives the real session with `crypto.subtle`), `b8b4642a` feat (landing texts), `902b389b` refactor (`useAnonymousOnly`), `bd8a856e` feat (landing at `/join`; `RegisterOptionProps.href` typed `` `/${string}` `` as `RegisterForm`'s `cancelHref`), `32cd443d` docs (README `/join` row), `c68421f5` test (header Register action), `a6b24853` feat (`shell.register`). Task 2.3: implemented as D4 says, `AppShell.test.tsx` "Session unresolvable renders as anonymous with no error message and no retry affordance" fails (expects 3 buttons besides the navigation-menu control; jsdom counts the CSS-hidden Register button, 4); task 2.1 says "No other assertion changes" and 2.3's Verify requires that test to pass. Options A (expect 4) / B (also exclude the button named `texts.register`, keep 3); recommends B. 2.3 code not committed.

### Review and integration (orchestrator, §7 steps 4–8)
Commit format, footers and test-first order correct; files all allowed to the build (`vitest.config.mts`, `README.md` included); `tasks.md` checkboxes only. Checks not re-run locally: npm is denied in this session (`env -C … npm ci`); integrated on the session's per-task results (related tests, `npx tsc --noEmit`, lint 0 errors, 1 warning); the full checks run after the last task (task 5.1) and before `qa`/`develop` merges. `git merge --ff-only origin/claude/add-register-landing-apply`: `81b1d975..a6b24853`, `feature/add-register-landing` pushed.

### Closed for review
#### C1 — The unresolvable-session test counts the CSS-hidden Register button
- Point: `src/app/shell/AppShell.test.tsx` (last assertion of "Session unresolvable renders as anonymous with no error message and no retry affordance") expects exactly 3 buttons besides the navigation-menu control; D4's Register button sits in the DOM behind `hidden md:inline-flex` and jsdom has no CSS, so the anonymous header has 4. Task 2.1 ("No other assertion changes") and 2.3's Verify contradict D4 and the app-shell "Signed-out header" delta (verified in the test file on `a6b24853`). / Options: A. expect 4; B. also leave out the button named `texts.register`, keep 3. / Choice: B. / Why: two settled artifacts contradict; B keeps the test's intent (another button would be a retry affordance) and every settled decision, changes one assertion only, adds no scope, changes nothing users see, touches no security; it is the build's recommendation and A changes no less (§3). / Result: artifact update by the architect (tasks 2.1/2.3 name this assertion change), then the build continues with 2.3–5.1, in one cloud session.
