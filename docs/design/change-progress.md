# Change progress

The board of tazavera-front's OpenSpec changes: only what is **not resolved**. What is closed (archived and on `develop`) leaves the board: its decisions are in `openspec/changes/archive/`, in each change's handoff, in the decisions log of `docs/design/general-context.md` and in this file's git history.

**Last update:** 2026-11-12 15:30 UTC — R45 `require-first-location-on-registration` verified, archived (`212f8eb8`) and merged into `develop` (`c1ff0618`) on Product owner's request, his visual review waived; branch deleted, worktree unregistered (its empty folder is held open by another process: Product owner deletes it): it left the board. Earlier today `update-vulnerable-dependencies` and R91 merged and left the board; the R91 folder was deleted. Badge toggles: Round 1 integrated (`dca644db`, handoff `6db24e55`); Product owner's archive request stands once the design lead's visual review passes; waiting for Product owner to start the server (the orchestrator cannot write `.env.local` or set env vars). Leftover orphan folder `tazavera-front-round` (points to the old `C:/Porjects` path; not deleted, contents unverifiable). Assignment loop running. Disabled test routines `trig_01XnGPPCQNjFiNZAsWNVXSNo` and `trig_01NebsWc2injnSM3vGFpUyNG` still exist (Product owner may delete them).
## Board

| Change | Capabilities | Branch / worktree | Phase | Status | Next phase | Assignee | Blocker | Last commit |
|---|---|---|---|---|---|---|---|---|
| `restyle-taxonomy-badge-toggles` (`Change`) | landing (shared `TaxonomyTree`) | `feature/restyle-taxonomy-badge-toggles` / `tazavera-front-badge-toggles` | Round 1 done | Apply and Round 1 integrated (`dca644db`, handoff `6db24e55`): white toggle fill in the traditional theme (`surface-textarea`), dark stays dark; Product owner's archive request stands once the visual review passes | Visual review (design lead), then verify and archive, merge | Product owner (start the server), then design lead | Product owner's local server for `tazavera-front-badge-toggles` | `6db24e55` |
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
| 8 | Rules: merges (2026-11-12) | The Common rules say "No agent … merges branches" and "`git merge` … never used", while `docs/agents/orchestrator.md` §6 step 7 and §9 make the orchestrator (and a cloud integration session acting for it) merge. Settle it in the rules? |
| 7 | Auth (not R91): with the API down, a browser that holds the sign-in marker is sent to `/oauth/authorize?…prompt=none` on load and stays there, instead of showing the app signed out (`src/features/auth/model/session.ts:131-139`, seen 2026-11-06) | Backlog entry or drop it? |

## Contract coverage

Every operation of `contracts/openapi.yaml` is consumed and on `master`, except `listTheEvaluationsOfAUser` (out of scope, Product owner, 2026-10-06). R91 and R45 add no operations; R45 consumes `registerAUser` and `createALocation`, already covered.

## Row format

| Change | Capabilities | Branch / worktree | Phase | Status | Next phase | Assignee | Blocker | Last commit |
|---|---|---|---|---|---|---|---|---|

- **Assignee** is whoever has the next step. **Blocker** points to the handoff question (`Q<n>`) or is "—".
- Phases: Summary (draft, in review, approved) → Propose → Artifact review → Apply → Round N → Verify → Archive → Merge (`docs/agents/workflow_sdd.md` §3a and §3b).
- When a change is merged into `develop`, its row leaves the board.
