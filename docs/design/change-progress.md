# Change progress

The board of tazavera-front's OpenSpec changes: only what is **not resolved**. What is closed (archived and on `develop`) leaves the board: its decisions are in `openspec/changes/archive/`, in each change's handoff, in the decisions log of `docs/design/general-context.md` and in this file's git history.

**Last update:** 2026-11-12 16:50 UTC — `restyle-taxonomy-badge-toggles` visual review passed after Round 2, verified and archived (`e87f0b53`), merged into `develop`; worktree removed, its branches deleted: it left the board. Today `update-vulnerable-dependencies`, R91 and R45 also merged and left the board. R1 `add-locale-e2e-test`: summary approved, propose integrated, artifact review with the design lead. Item 8 answered (decisions log 2026-11-12). Assignment loop running. Disabled test routines `trig_01XnGPPCQNjFiNZAsWNVXSNo` and `trig_01NebsWc2injnSM3vGFpUyNG` still exist (Product owner may delete them).
## Board

| Change | Capabilities | Branch / worktree | Phase | Status | Next phase | Assignee | Blocker | Last commit |
|---|---|---|---|---|---|---|---|---|
| `add-locale-e2e-test` (R1, `Change`) | testing | `feature/add-locale-e2e-test` / `tazavera-front-e2e` | Apply — stopped at 1.1 | Artifact review integrated (`7555960d`), handoff `8a9097c9`; apply session `cse_016LpndjJcR2k5t1AEtPJyeq` stopped at the baseline: `test:run` 213/1242 pass, `test:qa` 14 failures in 3 QA files present on the base (item 10); nothing installed or committed | Apply (cloud build), then the e2e run report to Product owner | Product owner | Item 10 | `8a9097c9` |
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
| 10 | QA suite red on `develop` since R91 (found by R1's apply baseline, 2026-11-12): 14 failing tests in `qa/src/widgets/app-header/ui/AppHeader.test.tsx` (7, "signed-out state"), `qa/src/pages/home/ui/HomeScreen.test.tsx` (5), `qa/src/pages/home/ui/HomeHero.test.tsx` (2), all `invariant expected app router to be mounted` from `useRouter()` in `src/shared/ui/RouteButton.tsx:35` (likely R91's Register button; fixtures without a router; unconfirmed) | How does R1 proceed? A (rec.): the baseline is the recorded counts with these 14 known failures, the end check requires the same 14 and no new one (architect adjusts tasks 1.1/4.1); the stale QA tests stay for you. B: you pass them to the build as an unplanned fix first, then R1 reruns green. C: R1 checks only the validation suite |
| 9 | R1 notes (design lead, architect): `testing` is missing from the capability lists of `openspec/config.yaml` and `docs/agents/workflow_sdd.md` §2; `AGENTS.md` → Testing ("two suites", "Playwright come later") will read stale after R1's archive | Update your files when it suits you? (non-blocking) |
| 7 | Auth (not R91): with the API down, a browser that holds the sign-in marker is sent to `/oauth/authorize?…prompt=none` on load and stays there, instead of showing the app signed out (`src/features/auth/model/session.ts:131-139`, seen 2026-11-06) | Backlog entry or drop it? |

## Contract coverage

Every operation of `contracts/openapi.yaml` is consumed and on `master`, except `listTheEvaluationsOfAUser` (out of scope, Product owner, 2026-10-06). R91 and R45 add no operations; R45 consumes `registerAUser` and `createALocation`, already covered.

## Row format

| Change | Capabilities | Branch / worktree | Phase | Status | Next phase | Assignee | Blocker | Last commit |
|---|---|---|---|---|---|---|---|---|

- **Assignee** is whoever has the next step. **Blocker** points to the handoff question (`Q<n>`) or is "—".
- Phases: Summary (draft, in review, approved) → Propose → Artifact review → Apply → Round N → Verify → Archive → Merge (`docs/agents/workflow_sdd.md` §3a and §3b).
- When a change is merged into `develop`, its row leaves the board.
