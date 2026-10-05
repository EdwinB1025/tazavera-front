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
### Q2 — ANSWERED 2026-10-05: CSP on `/callback` allowing only its own scripts and the API origin in `connect-src` (corrections.md round 1, item 7)
#### Q2 (original) — `/callback` has no Content-Security-Policy
- `/callback` is excluded from `proxy.ts`, so `proxy.ts` sets no CSP on it; `add-auth` owns that route.
- Why deferred: security. Blocks: nothing tonight.

### Q3 — ANSWERED 2026-10-05: option 2, keep D8 and await the challenge in the three `signIn` assertions (corrections.md round 1, item 1)
#### Q3 (original) — `code_challenge` is asynchronous in the library, but the committed 3.1 tests need it synchronously
- Question (Build's report, condensed): `src/features/auth/api/authorize.test.ts` calls `signIn(route)` and then asserts, with no `await`, that `location.assign` was called once with `code_challenge` = base64url(SHA-256(verifier)). Design D1 types `signIn(returnRoute?): void`. Design D8 assigns the challenge to `oauth4webapi`'s `calculatePKCECodeChallenge`, which returns `Promise<string>` over `crypto.subtle.digest` (`index.d.ts:1185`, `index.js:353`). The Build's check confirmed the assertion fails (0 openings) with an awaited challenge, and the codebase has no synchronous SHA-256.
- Why deferred: correction round (changes D8 or settled test assertions) on PKCE, which is part of the auth flow.
- Options:
  1. Keep the tests and D1. Compute `code_challenge` with a small in-house synchronous SHA-256 in `src/features/auth`. The library keeps the grants, response validation and PKCE verification. This amends D8's split.
  2. Keep D8. Amend the three `signIn` assertions in `authorize.test.ts` to await the challenge, so navigation happens one microtask later. D1's `void` return still holds.
  3. Other.
- Recommendation: option 2. Writing your own hash inside the auth flow is the kind of code D8 wanted to avoid. The spec fixes no timing, and `signIn` still returns `void`. Option 1 is acceptable only if you want synchronous navigation.
- Blocks: 3.2 and through it 4.1 to 7.1.

### Q4 — ANSWERED 2026-10-05: `/callback` renders no text; the D6 status region and the `auth` catalogs are removed (corrections.md round 1, item 5)
#### Q4 (original) — Client bundle may break `npm run build` (found by the Build, not yet confirmed)
- `CallbackScreen` is `"use client"` (D4), but D6 loads the catalog through `src/shared/lib/i18n/messages.ts`, which reads `node:fs`. A client module importing it could fail the build. `test:run`, `lint` and `tsc` would not show it; task 7.1 would.
- Why deferred: design-level conflict between D4 and D6.
- Recommendation: settle with Q3, before 7.1.

### Q5 — ANSWERED 2026-10-05: export it from `src/features/auth/index.ts`; `src/pages/callback` imports only from `@/features/auth` (corrections.md round 1, item 6)
#### Q5 (original) — Import path for `completeCallback`
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

## Session 2026-10-05 — correction round 1
Summary: precondition met (`9009729 docs(auth): report review round 1 for add-auth`). Ran the architect once to process round 1. Stopped because: round stop condition (b) triggered: the CSP/COOP mechanism for corrections 7 and 8 requires changing `proxy.ts` (owned by `app-shell`). Per the round and the task prompt, nothing was committed. MVC reachable: not needed.

### Agent feedback
- `openspec validate add-auth --strict`: `Change 'add-auth' is valid` (the architect's run, and my own re-run after it).
- Edited, **uncommitted**: `openspec/changes/add-auth/specs/auth/spec.md`, `openspec/changes/add-auth/design.md` (D1, D3, D4, D6 rewritten, D8, D9, new D10 popup flow, new D11 header mechanism marked open, Risks, Open Questions), `openspec/changes/add-auth/tasks.md` (new section 8: tasks 8.1–8.13), `docs/design/add-auth/corrections.md` (`### Status` dated 2026-10-05 appended to Round 1).
- Corrections 1–6 and 9 → tasks 8.1–8.12 (test-first pairs). 8.13 = real-browser check by Product owner before archive, which also confirms the API sends no `COOP: same-origin`.
- Corrections 7 and 8 → spec requirements "Content-Security-Policy on the callback" and "Cross-Origin-Opener-Policy" plus design D11, **no tasks**.
- Architect's mechanism for 7/8 (D11): extend `add-app-shell`'s D9 per-request nonce in `proxy.ts` to `/callback`, and add `Cross-Origin-Opener-Policy: same-origin-allow-popups` to every other response the proxy handles. Its reasoning: Next 16 documents the nonce path only through the proxy, and `next.config` `headers()` would need `'unsafe-inline'`, which breaks "only the page's own scripts". `docs/backlog.md` R2 and R3 sit on the same seam and stay out of this change.
- Noted, not fixed: `proposal.md` "What Changes" still describes the redirect flow; `design-summary.md` §3 is superseded by corrections (left as is because corrections take precedence).

### Decisions taken
#### D3 — Stop condition (a) checked statically, not live
- Context: the round says to stop if the API's `/oauth/authorize` or `/login` sends `Cross-Origin-Opener-Policy: same-origin`.
- Decision: I searched `../tazavera-api` (app, config, routes, public, vendor) and found no `Cross-Origin-Opener-Policy` string. `curl` to `http://localhost:8000/login` and `/oauth/authorize` failed with exit 7 because the API is not running. I told the architect to record this as a risk instead of stopping.
- Why: read-only evidence; Laravel sends no COOP by default. A live check stays with Product owner (task 8.13).
- Result: risk in design.md, confirmed in task 8.13.

### Fixes and coverage sent to the Build
None. The apply was not run, as the task prompt asked.

### Deferred to Product owner
#### Q6 — May `add-auth` change `proxy.ts` / `proxy.test.ts` for corrections 7 and 8? (round stop condition)
- Question: D11 needs `proxy.ts` (owned by `app-shell`) to issue the nonce CSP on `/callback`, with the API origin in `connect-src`, and to send COOP `same-origin-allow-popups` on every other document. `/callback` stays outside the locale redirect.
- Why deferred: the round says to stop and ask; it is a security mechanism shared across capabilities.
- Options: 1. allow `add-auth` to change them in its own tasks (commit scope `auth`, as AGENTS.md allows for files owned by another capability); 2. a separate `app-shell` change delivers the headers first, and `add-auth` waits for it; 3. another mechanism.
- Recommendation: option 1. Only the popup flow needs the headers, and doing them separately would hold back the real-browser check (8.13). Option 2 is cleaner if you want `proxy.ts` changes to stay with `app-shell`.
- Blocks: the round 1 commit and the tasks for corrections 7 and 8. The architect must be rerun to add them, then commit `docs(auth): apply review round 1 for add-auth`.

#### Q7 — Spec placement of correction 8 (COOP)
- Question: the architect put "Cross-Origin-Opener-Policy" (front-wide) in `specs/auth/spec.md`, because `proposal.md` says "Modified Capabilities: None". Should it move to a `specs/app-shell/spec.md` delta, with `proposal.md` updated?
- Why deferred: it changes the change's capability scope.
- Recommendation: settle it together with Q6. If option 2 of Q6, it goes with the `app-shell` change. If option 1, move it to an `app-shell` delta, because `app-shell` already owns the front's CSP requirement.
- Blocks: the same commit as Q6.

#### Q8 — Superseded unchecked tasks 3.2, 6.1 and 7.1
- Question: these tasks still describe the earlier design (the D6 status region and `auth` catalogs, navigation and `sessionStorage` assertions, `auth` catalog texts). The new section 8 comes after them, so 3.2 cannot pass as written. Should the architect rewrite or reorder 3.2, 6.1 and 7.1 in this round, or should the Build run section 8 first?
- Why deferred: it decides the order and content of the tasks.
- Recommendation: rewrite 3.2, 6.1 and 7.1 in place in the same round commit, as in the `add-app-shell` C1 precedent, so no unchecked task contradicts design.md. Reordering alone would leave 7.1 checking catalog texts that no longer exist.
- Blocks: the apply. 3.2 is the next unchecked task.

### Final checks
`npm run test:run` was not run (nothing implemented in this session). `openspec validate add-auth --strict`: valid (my re-run). `git log -1`: still `d682750 docs(auth): commiting hadoff`. No round commit (stop condition (b)).
Working tree: the four architect files above are uncommitted; `.opencode/agents/build.md` is modified; `probe-impl.ts` and `probe.test.ts` are still untracked (please delete).
