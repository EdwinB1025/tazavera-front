# Handoff — add-sidebar-slot

## Session 2026-10-06 (night) — apply end, verify, archive, merge
Summary:
- The apply was done in the cloud up to `128dd36`.
- Task 6.3 found that `npm run build` fails on Next.js 16.3.6: the optional catch-all `@sidebar/[[...rest]]` cannot coexist with `app/[locale]/page.tsx`.
- The orchestrator closed it (C1) and the architect updated D2 (`d831e93`). The work was finished by the OpenCode build and the local build: 6.2a in `fb94d88` and `c531bf8`, 6.3 and 7.1 in `7e87e6b`.
- Verify by the OpenCode architect, coverage W2 from the cloud (`e5a9298`), archive by the local architect (`3124e65`), develop merged into the branch with 1223 tests.

Stopped because: completed, merged into develop. MVC reachable: not needed.

### Agent feedback
- 6.3 (local build):
  - build passes;
  - `/es` and `/es/about` return 200, `/es/nope` returns 404, and `/es/offerings` returns 404 as expected (D9);
  - no `app-sidebar` element on either page;
  - at 1280px on `/es/about` the header has no re-open control.
  - Screenshot in the orchestrator's scratchpad (`sidebarslot-1280-about.png`).
- Verify: 0 CRITICAL.
  - W1: scenario "Sidebar follows in-app navigation" has no test.
  - W2: scenario "Unknown route stays not found" has no test.
  - S1: the full-screen width of the overlay is not asserted.

### Closed for review
#### C1 — Route of the sidebar slot (D2)
- Point: the build fails with "You cannot define a route with the same specificity as an optional catch-all route" (`@sidebar/[[...rest]]` next to `app/[locale]/page.tsx`).
- Options: (a) `@sidebar/page.tsx` for the locale root plus the required catch-all `@sidebar/[...rest]/page.tsx`; (b) another route mechanism.
- Choice: (a).
- Why: it keeps D2's intent (the default sidebar screen on every path, root included), changes nothing the user sees, and is the smallest change. The constraint was verified by the build and in the Next.js docs.
- Result: `d831e93` (design.md D2, Files, Risks and proposal; task 6.2a), `c531bf8`.
#### C2 — W1 deferred
- Point: no route with a sidebar is reachable on this branch (the management routes belong to other changes, and `/offerings` returns 404 until catalog), so the soft-navigation swap cannot be checked yet.
- Choice: defer it to the browser review of the first change that hosts a sidebar route (add-specialist-evaluations or add-offering-management), and to the Playwright suite.
- Why: overnight mandate; the behaviour is implemented, only its check is missing.

### Fixes and coverage sent to the Build
#### F1 — W2, unplanned coverage
- Result: `e5a9298 test(app-shell): assert locale default route triggers not found` (cloud, `claude/add-sidebar-slot-coverage`), integrated by fast-forward.

### Final checks
`npm run test:run` (orchestrator, after merging develop): 65 files, 1223 tests passed.
