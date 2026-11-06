# Change progress

The board of tazavera-front's OpenSpec changes: only what is **not resolved**. What is closed (archived and on `develop`) leaves the board: its decisions are in `openspec/changes/archive/`, in each change's handoff, in the decisions log of `docs/design/general-context.md` and in this file's git history.

**Last update:** 2026-11-06 — Product owner answered R91 Q12 with A (handoff `659d45bf`). Cloud run 5 (`trig_01CkUU5opnwN1CXLrJHyNU3k`) done and integrated: every R91 task checked. Q13 answered B: Product owner runs the dev server (`http://localhost:3000`, worktree `tazavera-front-register-landing`). R91 visual review done (C3 closed for review, Q14 deferred); C3 cloud run integrated (`92ade7b7`); re-check passed; verify clean (`trig_01WSZAwRVnvM6Dxu23VMsd6z`, nothing committed). No routine scheduled, no executor running; assignment loop stopped (everything waits for Product owner). Product owner's dev server no longer needed. `npm run build` fails intermittently with Next.js's `SecurityFatalError` (16.4.0 flagged), passing on rerun: raises the priority of `update-vulnerable-dependencies`. Assignment loop running. No routine scheduled. The visual review needs a local dev server, which npm cannot start in this session. Watch: the assignment loop (`Monitor` denied in don't-ask mode). npm and OpenCode cannot run locally in don't-ask mode (`env -C …` denied): checks are taken from the cloud sessions. Disabled test routines `trig_01XnGPPCQNjFiNZAsWNVXSNo` and `trig_01NebsWc2injnSM3vGFpUyNG` still exist (Product owner may delete them).

## Board

| Change | Capabilities | Branch / worktree | Phase | Status | Next phase | Assignee | Blocker | Last commit |
|---|---|---|---|---|---|---|---|---|
| `add-register-landing` (R91, `Change`) | user-account, app-shell, landing | `feature/add-register-landing` / `tazavera-front-register-landing` | Apply | Every task done and integrated (`1625d909`; checks on the cloud session's counts: validation suite 1233/1233, `tsc` no errors, lint 0 errors, build succeeded). C1 and C2 closed for review; Q12 answered A (handoff) | Visual review done (signed out); C3 (both "Register" actions at `lg`) closed for review and applied (`92ade7b7`; validation suite 1233/1233, `tsc` 0, lint 0, build passed on rerun). Re-check after C3 passed (no finding). Verify clean (no CRITICAL, no WARNING, 4 wording suggestions). Next: Product owner's browser check and archive request, then archive and merge | Product owner | Browser check (signed in, with the API) and archive request (waiting list, item 8) | `da133638` |
| `require-first-location-on-registration` (R45, `Change`) | user-account, offering-management | — | Queued | Accepted (2026-10-29), option A, front only: after `POST /register` (with `token`) the coffee shop creates its first location with `POST /locations` | Summary — draft (design lead) | Orchestrator | Waits for R91 to reach `develop` (same registration screen) | — |
| `update-vulnerable-dependencies` (`Change`: touches security) | — (dependencies) | — | Summary — draft | New (Product owner, 2026-11-06): `npm ci` on `develop` reports 14 vulnerabilities (10 moderate, 3 high, 1 critical); `next dev` also flags Next.js 16.4.0 as affected, security upgrade to 16.4.5 (skipped in R91's worktree). ESLint stays on v9 | Summary — draft (design lead), from the `npm audit` output | Product owner | The `npm audit` output (npm denied in the orchestrator's session); then Product owner approves which packages and versions move. Merge after R91 | — |
| `add-locale-e2e-test` (R1, `Change`) | testing | — (summary on `develop`) | Summary — draft | Draft `a661d9a1` with 9 open points | Summary — approved (Product owner's commit) | Product owner | Block propose: **1** dependency `@playwright/test` (rec. A: exact version, Chromium only); **3** base branch (R74 is already on `develop`); **4** third suite and `testing` delta (rec. A) | `a661d9a1` |
| R90 (two origin cascades in the facets) | filtering | — | Backlog | Front part of two API backlog entries | — | Product owner | API changes first (municipality and roastery origin filters) | — |
| R83 (the API accepts any descriptor per axis) | — (API) | — | Backlog | Found by Product owner (2026-10-13) | — | Product owner | Take it or not? | — |

## Waiting for Product owner (no answer recorded)

| # | What | Exact question |
|:-:|---|---|
| 1 | Q7 list of R74's handoff (13 checks of R74 and visual review of R77–R82 and R81 in production) | Is it done? If so, it leaves the board |
| 2 | `claude/*` branches left unintegrated on purpose: `unify-bean-outline`, `r64-list-spacing-analysis`, `share-active-locale-refactor`, `test-reduction-plan`; and `add-register-landing-propose` (already integrated) | Do you delete them on GitHub? (yours) |
| 3 | API task (2026-10-11): the front's landing as the callback's return page | Done? The orchestrator acts only if the contract changes |
| 4 | Flaky test `EvaluationForm.test.tsx` (failed once and passed on retry, 2026-10-11) | Backlog entry or drop it? |
| 5 | `update-vulnerable-dependencies`: the `npm audit` output | Paste the output of `npm audit` run in `tazavera-front` (develop) so the design lead can draft the summary |
| 6 | R91 Q14: the es header wraps between 1024 and ~1149px with the `lg` fallback, and the header already overflows at 768px on `develop` in es and ca (simulated) | A. a new change after R91 for the header width (rec.); B. accept and drop; C. fold into R91 through a correction round? |
| 7 | Auth (not R91): with the API down, a browser that holds the sign-in marker is sent to `/oauth/authorize?…prompt=none` on load and stays there, instead of showing the app signed out (`src/features/auth/model/session.ts:131-139`, seen 2026-11-06) | Backlog entry or drop it? |
| 8 | R91 ready for archive: browser check with the API (signed-in header and user menu without "Register", no entry-page button when signed in, `/join` sending a signed-in visitor to `/es`), C1–C3 review, 4 verify suggestions (handoff) | Do you accept the change and ask for the archive? |

## Contract coverage

Every operation of `contracts/openapi.yaml` is consumed and on `master`, except `listTheEvaluationsOfAUser` (out of scope, Product owner, 2026-10-06). R91 and R45 add no operations; R45 consumes `registerAUser` and `createALocation`, already covered.

## Row format

| Change | Capabilities | Branch / worktree | Phase | Status | Next phase | Assignee | Blocker | Last commit |
|---|---|---|---|---|---|---|---|---|

- **Assignee** is whoever has the next step. **Blocker** points to the handoff question (`Q<n>`) or is "—".
- Phases: Summary (draft, in review, approved) → Propose → Artifact review → Apply → Round N → Verify → Archive → Merge (`docs/agents/workflow_sdd.md` §3a and §3b).
- When a change is merged into `develop`, its row leaves the board.
