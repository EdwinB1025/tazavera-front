# Design

## Context

`vitest.config.mts` (validation suite) runs every file in Vitest 5.0.2's default `forks` pool with `environment: 'jsdom'`; `vitest.qa.config.mts` spreads its `test` block and only replaces `exclude`. Measured baseline on `origin/qa` (4 CPUs, each run on its own):

| Suite | Files | Tests | Duration | jsdom set-ups |
|---|---|---|---|---|
| `npm run test:run` | 183 | 999 | 148.82 s (environment 52%) | 183, 212.28 s |
| `npm run test:qa` | 337 | 1781 | 267.65 s (environment 56%) | 337, 405.76 s |

Probes on the same machine (configuration only, reverted afterwards):

- `pool: 'vmThreads'` for every file: 44.31 s, but 7 validation files fail (11 in the QA suite, counting the `qa/` copies) with `Cannot redefine property: location`, `Cannot read properties of undefined (reading 'digest')` (`crypto.subtle`) and, for `proxy.test.ts`, `The argument 'filename' must be a file URL ...`.
- `isolate: false` with the default pool: 139 failed tests (mocks and module state leak between files). Rejected.
- `pool: 'threads'`: 156.11 s, no gain. Rejected.
- `vmThreads` for every file except those 7, which stay in `forks` (two inline projects): validation 183 / 999 passed in 47.90 s, QA 337 / 1781 passed in 71.52 s.

## Goals / Non-Goals

**Goals:** both suites keep the same files, tests and results, with per-file isolation, and run in at most 120 s each.

**Non-Goals:** test file edits, `isolate: false`, timeout or worker changes, dependency changes (see proposal).

## Decisions

### D1. `vmThreads` with a `forks` project for the VM-incompatible files

`vitest.config.mts` declares two inline projects under `test.projects`, both with `extends: true` so they inherit the plugins, `resolve`, `environment` and the root `exclude`:

- `vm`: `pool: 'vmThreads'`, excluding the forks file list;
- `forks`: the default pool, including only the forks file list.

The forks file list is one constant in `vitest.config.mts` with patterns that match both the `src/` and the `qa/` copies: `proxy.test.ts`, `**/src/app/shell/AppShell.test.tsx`, `**/src/features/auth/api/authorize.test.ts`, `**/src/features/auth/model/session.test.ts`, `**/src/pages/callback/ui/CallbackScreen.test.tsx`, `**/src/pages/register/ui/RegisterClient.test.tsx`, `**/src/shared/ui/SignedOutPrompt.test.tsx`. A comment above it states why these files stay in `forks`.

`vitest.qa.config.mts` does not change: it spreads `baseConfig.test`, so it inherits `projects`, and its root `exclude` (the five stale QA files) is merged into both projects by `extends: true`.

Sources read in `node_modules/vitest` (5.0.2): `dist/chunks/plugin.d.*.d.ts` documents `pool` ("Supports 'threads', 'forks', 'vmThreads', 'vmForks'", default `'forks'`), `isolate` (default `true`) and `vmMemoryLimit` (memory limit before a VM worker is recycled); `dist/chunks/config.d.*.d.ts` warns that the `vmThreads` and `vmForks` pools set up worker fixtures once per test file. The run summary of the baseline itself recommends "create it once per worker with pool: 'vmThreads' (keeps per-file isolation) or isolate: false".

Alternatives: `vmThreads` for every file (fails 7 files unless their tests change); `isolate: false` (leaks); `pool: 'threads'` (no gain); a setup file to patch `location` and `crypto.subtle` in the VM context (a new test file, out of scope).

## Risks / Trade-offs

- A new test file that redefines `window.location`, uses `crypto.subtle` or loads `proxy.ts` will fail in the `vm` project with one of the errors above; the fix is to add it to the forks file list. The comment above the list names the symptoms.
- `vmThreads` can grow worker memory (Vitest's `vmMemoryLimit` recycles workers); not observed in the probes, left at its default.
- R15: the slowest `EvaluationForm.test.tsx` case still takes about 2.2–2.7 s alone in both pools; the shorter suite lowers the time under load but does not by itself remove the 5000 ms timeout risk.
