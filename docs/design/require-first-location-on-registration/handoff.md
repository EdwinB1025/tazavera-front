# Handoff — require-first-location-on-registration

## Session 2026-11-12 — Summary, branch, propose (step 6) and artifact review (step 7)
Summary: R91 merged into `develop` (`d245f72c`) unblocked R45. Product owner delegated R45's approvals to the orchestrator (2026-11-11). The design lead drafted the summary; the orchestrator approved it on that delegation with every open point at the design lead's recommendation (`8a445e11`) and corrected the stale backlog row and "Affects" line (`c8de3136`). Branch `feature/require-first-location-on-registration` from `develop` at `c8de3136`, worktree `tazavera-front-first-location` (no `npm install`: npm cannot run in this session; `.env.local` not copied). Propose: routine `trig_01BZ7EQkzPSREENwWYDeKk4B`, session `cse_016LpndhtXJQdUbFHx1bqzoa` (14:07–14:14 UTC), prompt by the design lead. Artifact review: done by the orchestrator on the delegation, no change. Next: apply (cloud). MVC reachable: no (outside the readable directories).

### Agent feedback
Design lead (summary): the step reuses `LocationForm`, `submitLocation`, `SessionGate`, `SignedOutPrompt`, `LoadingStatus` and `ManageLocationsScreen`'s frame; no new token, contrast pair, component or dependency; two or three new texts (es/en/ca). Risk: the step's navigation must win over `useAnonymousOnly`'s replace. Reuse: `LocationsPanel`'s submit handling shared, not copied. No visual reference yet (needs the local server).

Architect `916ee6f` `docs(user-account): propose …` and `6ad7e78` `docs(offering-management): propose …`: user-account MODIFIED "Registration routes" (exception for the coffeeshop route's own registration; five scenarios keep their names, "A signed-in visitor is taken to the entry page" gets new content) and "Registration result" (new scenario "A coffeeshop signed in by the registration"); offering-management ADDED "First location step", "First location step session gate" and "First location step form" (split to stay under the 500-character strict limit). Design D1 (`useAnonymousOnly` takes an optional destination; `RegisterClient` marks "registered here" before `signInWithRegistration`), D2 (`NewLocationForm` in `features/location-management`, used by `LocationsPanel` and the step; the geocoding cache stays with the caller), D3 (the step lives in the `manage-locations` page slice), D5 (texts helper), D7 (no `@sidebar` file: the catch-all renders), D8 (no QA fixture goes stale). Tasks 1.1, 2.1–2.5, 3.1–3.2, 4.1. `openspec validate --strict` valid.

### Review and integration (orchestrator, §7 steps 4 and 7)
Commit format and footers correct; only the change folder and the summary's `## Propose status` changed. `git merge --ff-only origin/claude/require-first-location-on-registration-propose`: `c8de3136..6ad7e78f`.

### Artifact fixes
(none) — §4 cleanup before the review: no duplicate scenario, task or test; no broken reference; one test per new or changed scenario.

### Decisions taken
#### D1 — Artifact review on the delegation
- Context: step 7 needs Product owner's review message. / Decision: no review message; the artifacts carry the approved summary's answers and the design lead's two points (D1, D2). / Why: Product owner delegated R45's approvals to the orchestrator (2026-11-11). / Result: apply next.
#### D2 — Apply goes to the cloud
- Context: §9 apply weight. / Decision: cloud session. / Why: two capabilities and nine tasks (long scope), and OpenCode cannot run in this session. / Result: apply prompt by the design lead.
