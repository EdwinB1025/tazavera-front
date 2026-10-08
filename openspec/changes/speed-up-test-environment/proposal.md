Type: Refactor (fast lane)

# Proposal

## Why

Creating a jsdom environment for every test file takes about half of each suite's run (183 environments, 52% of the 149 s validation suite; 337 environments, 56% of the 268 s QA suite), so every change's checks are slow (backlog R29, technical review §3.1 row R29). Vitest's own hint is to create the environment once per worker with the `vmThreads` pool, which keeps per-file isolation.

## What Changes

- Run the test files in the `vmThreads` pool, so jsdom is created once per worker while each file keeps its own module graph and globals.
- Keep in the default `forks` pool the test files that fail inside the VM context today (they redefine `window.location`, use `crypto.subtle` or load `proxy.ts`), so no test file changes.
- Only `vitest.config.mts` changes; `vitest.qa.config.mts` inherits the pool set-up from it. No test file, script or dependency changes.
- No behaviour change: both suites run the same test files and tests, with the same results.

## Capabilities

### New Capabilities

- `testing`: the two test suites (validation and QA) and the property that the test environment set-up keeps the same tests and results. No capability owns the test configuration today; backlog R29 names `testing` as the owner.

### Modified Capabilities

None.

## Impact

- Files: `vitest.config.mts`.
- Dependencies: none added, removed or upgraded.
- Protecting checks: both suites (same file and test counts as on `origin/qa`, all passing, the QA suite run twice), typecheck, lint and `npm run build`.

## Non-goals

- Editing any test file, including the interaction style of `EvaluationForm.test.tsx` (R15); test edits that would help further are reported as follow-ups.
- Sharing one environment across files (`isolate: false`).
- Changing the test timeout, the number of workers or any dependency.

## Propose status

- Change-id: `speed-up-test-environment`
- Date: 2026-10-08
- `openspec validate speed-up-test-environment --strict`: valid
- Resolves backlog entry: R29 (Speed up the test environment). R15 (slow `EvaluationForm` tests under load) is affected but not resolved: its slowest case takes the same 2.2–2.7 s alone in both pools (design.md, Risks).
- Capability: `testing`, new. No main spec describes the two suites today, so no existing capability owns the test configuration; backlog R29 names `testing`, and the spec delta adds one requirement there.
- Resolved: `vmThreads` for every file except seven VM-incompatible files that stay in `forks`, through two inline projects in `vitest.config.mts` (design.md D1); `isolate: false` and `pool: 'threads'` rejected by measurement. Baseline: validation 183 files / 999 tests in 148.82 s; QA 337 / 1781 in 267.65 s.
- Open: whether Product owner accepts a forks file list that a new VM-incompatible test file must join (design.md, Risks); the follow-up test edits that would let those seven files run in `vmThreads` and would reduce R15.
