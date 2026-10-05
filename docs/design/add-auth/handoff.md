# Handoff — add-auth — night of 2026-10-04

## Summary
Tasks done: 6/14 (1.1 in the dry run; 2.1, 2.2, 2.2b, 2.3 and 3.1 in this session). The task count went from 13 to 14 because the architect added 2.2b after Q1. Skipped: none. Stopped because: task 3.2 is blocked by a design question (Q3), and every remaining task (4.x to 7.1) depends on 3.2, so no independent task remains.
MVC reachable: yes (`resources/css/app.css` read, once the MVC folder was added as a working directory). No visual question came up.
One run of 3.1 was killed by the system for low memory (not a task failure) and was rerun; it left two scratch files at the repo root (see Notes).

## Decisions taken
### D1 — Token response shape sent to the Build for 2.3
- Context: after 2.2 the Build reported that `oauth4webapi` requires `token_type`, while design.md D5 listed only `access_token`, `refresh_token` and `expires_in`.
- Decision: told the Build to keep D5's shape and to report and stop if the library could not be used that way.
- Why: D5 and the tests were settled artifacts; I may not change them.
- Result: the Build reported the blocker (Q1). No commit.

### D2 — Q1 resolved by Augusto (2026-10-05): add `token_type`
- Context: Augusto's answer to Q1: amend D5 (and D8 where it describes the token body) to include `token_type: "Bearer"`, keep `oauth4webapi`, no manual parsing, update the 2.2 fixtures, continue from 2.3.
- Decision: ran the architect to apply it. D5 and D7 (`TokenGrant`) gained `token_type`; D8 states no token body and was left unchanged; spec.md and proposal.md state no body and were left unchanged. New task 2.2b updates the fixtures and the `TokenGrant` type. The architect also reworded the `TokenGrant` field lists in 1.1 and 2.2 (checkboxes untouched).
- Why: Augusto's explicit decision, via the artifact-update path.
- Result: `892e407` (architect), `b681b41` (task 2.2b), `93609e9` (task 2.3).
- Note: the architect did not add an entry to `## Propose status` in design-summary.md, because its commit was limited to `openspec/changes/add-auth/`. Add it if you want the record there.

## Fixes and coverage sent to the Build
None.

## Deferred to Augusto
### Q2 — `/callback` has no Content-Security-Policy
- `/callback` is excluded from `proxy.ts`, so `proxy.ts` sets no CSP on it; `add-auth` owns that route.
- Why deferred: security. Blocks: nothing tonight.

### Q3 — `code_challenge` is asynchronous in the library, but the committed 3.1 tests need it synchronously
- Question (Build's report, condensed): `src/features/auth/api/authorize.test.ts` calls `signIn(route)` and then asserts, with no `await`, that `location.assign` was called once with `code_challenge` = base64url(SHA-256(verifier)). Design D1 types `signIn(returnRoute?): void`. Design D8 assigns the challenge to `oauth4webapi`'s `calculatePKCECodeChallenge`, which returns `Promise<string>` over `crypto.subtle.digest` (`index.d.ts:1185`, `index.js:353`). The Build's check confirmed the assertion fails (0 openings) with an awaited challenge, and the codebase has no synchronous SHA-256.
- Why deferred: correction round (changes D8 or settled test assertions) on PKCE, which is part of the auth flow.
- Options:
  1. Keep the tests and D1. Compute `code_challenge` with a small in-house synchronous SHA-256 in `src/features/auth`. The library keeps the grants, response validation and PKCE verification. This amends D8's split.
  2. Keep D8. Amend the three `signIn` assertions in `authorize.test.ts` to await the challenge, so navigation happens one microtask later. D1's `void` return still holds.
  3. Other.
- Recommendation: option 2. Writing your own hash inside the auth flow is the kind of code D8 wanted to avoid. The spec fixes no timing, and `signIn` still returns `void`. Option 1 is acceptable only if you want synchronous navigation.
- Blocks: 3.2 and through it 4.1 to 7.1.

### Q4 — Client bundle may break `npm run build` (found by the Build, not yet confirmed)
- `CallbackScreen` is `"use client"` (D4), but D6 loads the catalog through `src/shared/lib/i18n/messages.ts`, which reads `node:fs`. A client module importing it could fail the build. `test:run`, `lint` and `tsc` would not show it; task 7.1 would.
- Why deferred: design-level conflict between D4 and D6.
- Recommendation: settle with Q3, before 7.1.

### Q5 — Import path for `completeCallback`
- D4 has the callback screen run the outcome "through `src/features/auth`", but the public API in D1 and D9 lists only `useSession`, `signIn`, `signOut` and `requestProfileWrite`. Without a change, the screen would deep-import `@/features/auth/api/authorize`, against the FSD public-API rule.
- Why deferred: a design decision (the public API). Options: export `completeCallback` from the index, or accept the deep import.
- Recommendation: export `completeCallback` from `src/features/auth/index.ts` in the correction round.

## Notes
- `probe-impl.ts` and `probe.test.ts` are untracked scratch files at the repo root, left by the killed run. The Build cannot delete them and I may not. Please delete them. They are not staged anywhere and the test run ignores them.
- `.opencode/agents/build.md` is modified and was left alone. This file is not committed.
- `npm audit` reports 5 high-severity vulnerabilities; npm warns about 3 pending install-script approvals. Both were there before tonight.
- Cosmetic: the header comment and one test title in `tokens.test.ts` still list three token fields.

## Final checks
`npm run test:run`: Test Files 3 failed | 33 passed | 1 skipped (37); Tests 772 passed | 1 skipped (773). The 3 failed files are the 3.1 tests (`flow.test.ts`, `authorize.test.ts`, `CallbackScreen.test.tsx`), which fail on the modules 3.2 would add, as the workflow allows for a test-only commit. Commits tonight: `9e1e49e` (2.1), `e2f05ed` (2.2), `892e407` (architect), `b681b41` (2.2b), `93609e9` (2.3), `7c92f67` (3.1).
