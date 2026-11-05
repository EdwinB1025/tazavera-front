# Change progress

The board of tazavera-front's OpenSpec changes: only what is **not resolved**. What is closed (archived and on `develop`) leaves the board: its decisions are in `openspec/changes/archive/`, in each change's handoff, in the decisions log of `docs/design/general-context.md` and in this file's git history.

**Last update:** 2026-11-05 — Session ended for a restart (Product owner). Next session, in order: (1) test cloud routine creation (`RemoteTrigger` `create` of a disabled, unscheduled test routine) with the corrected settings; (2) R91 next steps as in its row. Rule copies for `docs/agents/` (orchestrator, workflow, design lead) handed to Product owner; not yet applied. No scheduled routine, watch or active executor; the assignment loop died with the session.

## Board

| Change | Capabilities | Branch / worktree | Phase | Status | Next phase | Assignee | Blocker | Last commit |
|---|---|---|---|---|---|---|---|---|
| `add-register-landing` (R91, `Change`) | user-account, app-shell, landing | `feature/add-register-landing` / `tazavera-front-register-landing` | Artifact review | Propose integrated (`0c24bc4a`). Product owner: Q6 = A, Q7 = A, Q8 = A. Cleanup A1–A3 uncommitted in the worktree. Apply weight: long (three capabilities, ~15 tasks) → cloud | (1) design lead's review of the propose result; (2) review message to the architect (Q6–Q8) and duplicates check; (3) apply in the cloud | Orchestrator → design lead, architect | None from Product owner; creating cloud routines (`RemoteTrigger` `create`) not yet tested in `default` mode | `7a8d53cd` |
| `require-first-location-on-registration` (R45, `Change`) | user-account, offering-management | — | Queued | Accepted (2026-10-29), option A, front only: after `POST /register` (with `token`) the coffee shop creates its first location with `POST /locations` | Summary — draft (design lead) | Orchestrator | Waits for R91 to reach `develop` (same registration screen) | — |
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

## Contract coverage

Every operation of `contracts/openapi.yaml` is consumed and on `master`, except `listTheEvaluationsOfAUser` (out of scope, Product owner, 2026-10-06). R91 and R45 add no operations; R45 consumes `registerAUser` and `createALocation`, already covered.

## Row format

| Change | Capabilities | Branch / worktree | Phase | Status | Next phase | Assignee | Blocker | Last commit |
|---|---|---|---|---|---|---|---|---|

- **Assignee** is whoever has the next step. **Blocker** points to the handoff question (`Q<n>`) or is "—".
- Phases: Summary (draft, in review, approved) → Propose → Artifact review → Apply → Round N → Verify → Archive → Merge (`docs/agents/workflow_sdd.md` §3a and §3b).
- When a change is merged into `develop`, its row leaves the board.
