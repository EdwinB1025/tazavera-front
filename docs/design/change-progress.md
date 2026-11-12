# Change progress

The board of tazavera-front's OpenSpec changes: only what is **not resolved**. What is closed (archived and on `develop`) leaves the board: its decisions are in `openspec/changes/archive/`, in each change's handoff, in the decisions log of `docs/design/general-context.md` and in this file's git history.

**Last update:** 2026-11-12 13:23 UTC — `update-vulnerable-dependencies` archived (`a5fe07a2`), merged into `develop` (`742d50e0`), worktree and branch removed: it left the board. R91: verify clean twice; archive run 3 launched (`trig_01BahVjRYhbDaYsKV6UTdxkZ`, 13:27 UTC, target `claude/add-register-landing-archive`; orchestrator's C5 accepts one new long-text warning in app-shell "Signed-out header"), then merge (takes `develop` in, with the dependency upgrade: Product owner runs `npm run test:run` in the worktree) and worktree removal. Badge toggles: apply integrated (`878cd275`); next the design lead's visual review, waiting for Product owner's server on that worktree. Assignment loop running. Disabled test routines `trig_01XnGPPCQNjFiNZAsWNVXSNo` and `trig_01NebsWc2injnSM3vGFpUyNG` still exist (Product owner may delete them).
## Board

| Change | Capabilities | Branch / worktree | Phase | Status | Next phase | Assignee | Blocker | Last commit |
|---|---|---|---|---|---|---|---|---|
| `add-register-landing` (R91, `Change`) | user-account, app-shell, landing | `feature/add-register-landing` / `tazavera-front-register-landing` | Archive | Rounds 1–2 integrated; re-check after Round 2 passed; Product owner approved the look (Register stays `action-1`) and asked for the archive; verify clean twice (2026-11-12). Archive run 3 `trig_01BahVjRYhbDaYsKV6UTdxkZ` (C4 and C5 closed for review) | Merge into `develop` (takes the dependency upgrade in), worktree removal | Cloud architect, then orchestrator; Product owner runs `npm run test:run` after `develop` is merged in | — | `dffca6f4` |
| `require-first-location-on-registration` (R45, `Change`) | user-account, offering-management | — | Queued | Accepted (2026-10-29), option A, front only: after `POST /register` (with `token`) the coffee shop creates its first location with `POST /locations` | Summary — draft (design lead) | Orchestrator (approvals delegated by Product owner, 2026-11-11) | Starts in the assignment loop once R91 is approved and on `develop` (same registration screen) | — |
| `restyle-taxonomy-badge-toggles` (`Change`) | landing (shared `TaxonomyTree`) | `feature/restyle-taxonomy-badge-toggles` / `tazavera-front-badge-toggles` | Apply done | Propose, artifact review (Q1: taxonomy badges 12px below `md`, toggle shrinks with the text) and apply integrated; validation 1225/1225, `tsc` 0, lint 0, build passed on rerun | Visual review (design lead, 375 and 1280px, both themes), then verify | Design lead | Product owner's local server for `tazavera-front-badge-toggles` | `878cd275` |
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
| 6 | R91 Q14: the es header wraps between 1024 and ~1149px with the `lg` fallback, and the header already overflows at 768px on `develop` in es and ca (simulated) | A. a new change after R91 for the header width (rec.); B. accept and drop; C. fold into R91 through a correction round? |
| 7 | Auth (not R91): with the API down, a browser that holds the sign-in marker is sent to `/oauth/authorize?…prompt=none` on load and stays there, instead of showing the app signed out (`src/features/auth/model/session.ts:131-139`, seen 2026-11-06) | Backlog entry or drop it? |

## Contract coverage

Every operation of `contracts/openapi.yaml` is consumed and on `master`, except `listTheEvaluationsOfAUser` (out of scope, Product owner, 2026-10-06). R91 and R45 add no operations; R45 consumes `registerAUser` and `createALocation`, already covered.

## Row format

| Change | Capabilities | Branch / worktree | Phase | Status | Next phase | Assignee | Blocker | Last commit |
|---|---|---|---|---|---|---|---|---|

- **Assignee** is whoever has the next step. **Blocker** points to the handoff question (`Q<n>`) or is "—".
- Phases: Summary (draft, in review, approved) → Propose → Artifact review → Apply → Round N → Verify → Archive → Merge (`docs/agents/workflow_sdd.md` §3a and §3b).
- When a change is merged into `develop`, its row leaves the board.
