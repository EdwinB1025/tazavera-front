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
#### Q6 — Artifacts defer to the design summary
- Question: design.md line 5 calls the summary "the design source of truth" (layout, spacing, tokens, texts "not restated here"), and tasks 1.2 and 3.2 send the build to the summary's §8 wording, so the artifacts are not self-contained. The framing came from the orchestrator's propose prompt. / Why deferred: carrying the values into design.md is an artifact change beyond §4. / Options: A. review message: design.md and tasks carry the settled values and point to design.md, the summary is only the propose input; B. leave as is. / Recommendation: A. / Blocks: apply.
#### Q7 — Unresolvable session on `/join`
- Question: the spec rules ask for error states; the landing has no scenario for a session that cannot be resolved (the shell renders it as anonymous). / Options: A. add one scenario (options shown, as anonymous) and its test; B. none. / Recommendation: A. / Blocks: no.
#### Q8 — Scenario names kept with new content
- Question: five scenarios ("Link groups", "Registration destinations", "Specialist registration destination", "Registration links", app-shell "Registration links named") keep names that no longer describe them (D9). / Options: A. accept; rename later by a hand edit of the main specs; B. another way. / Recommendation: A. / Blocks: no.

### Final checks
Not run (artifact-only change); `openspec validate add-register-landing --strict` valid after A1–A3.
