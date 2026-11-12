# Change progress

The board of tazavera-front's OpenSpec changes: only what is **not resolved**. What is closed (archived and on `develop`) leaves the board: its decisions are in `openspec/changes/archive/`, in each change's handoff, in the decisions log of `docs/design/general-context.md` and in this file's git history.

**Last update:** 2026-11-12 13:23 UTC — `update-vulnerable-dependencies` archived (`a5fe07a2`), merged into `develop` (`742d50e0`), worktree and branch removed: it left the board. R91 `add-register-landing` merged into `develop` (`d245f72c`; the cloud integration session `trig_01HZmqwfirahQfBe7VUKHeyJ` resolved the handoff conflict, checks on Next.js 16.4.6 all pass) and branch deleted: it left the board. Its worktree is unregistered but the folder `tazavera-front-register-landing` could not be deleted (files in use, likely Product owner's dev server): Product owner deletes it once the server stops. R45 unblocked: summary draft assigned to the design lead. Badge toggles: apply integrated (`878cd275`); next the design lead's visual review, waiting for Product owner's server on that worktree. Assignment loop running. Disabled test routines `trig_01XnGPPCQNjFiNZAsWNVXSNo` and `trig_01NebsWc2injnSM3vGFpUyNG` still exist (Product owner may delete them).
## Board

| Change | Capabilities | Branch / worktree | Phase | Status | Next phase | Assignee | Blocker | Last commit |
|---|---|---|---|---|---|---|---|---|
| `require-first-location-on-registration` (R45, `Change`) | user-account, offering-management | `feature/require-first-location-on-registration` / `tazavera-front-first-location` | Apply done | Summary approved on Product owner's delegation (`8a445e11`); propose and artifact review integrated; apply integrated (`788ec2b3`, handoff `ebdd2a9a`): validation 1241/1241, `tsc` 0, lint 0, build lists `/[locale]/manage/locations/first`; QA's 14 failures are R91's stale tests, same on the base | Visual review (design lead), then verify | Design lead | Product owner's local server for `tazavera-front-first-location` | `ebdd2a9a` |
| `restyle-taxonomy-badge-toggles` (`Change`) | landing (shared `TaxonomyTree`) | `feature/restyle-taxonomy-badge-toggles` / `tazavera-front-badge-toggles` | Round 1 | Apply integrated (`878cd275`). Product owner (2026-11-12): white toggle fill in the traditional theme, dark stays dark (summary Open 1 option D, `surface-textarea`); Round 1 written and committed by the orchestrator (`015100b1`). Cloud session architect then build `trig_016arwMT51TaxLgPNNRdgR9W` (15:07 UTC, target `claude/restyle-taxonomy-badge-toggles-round-1`; prompt by the design lead) | Visual review (design lead, 375 and 1280px, both themes), then verify | Cloud architect and build, then orchestrator | Visual review needs Product owner's local server for `tazavera-front-badge-toggles` | `015100b1` |
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
