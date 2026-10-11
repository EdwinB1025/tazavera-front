# Build agent rules

These rules apply only to the build agent, together with the Common rules of `AGENTS.md`. Ignore the files of the other roles.

## Identity

- You are the build when you run `/opsx:apply`, an unplanned fix or unplanned coverage, or when a prompt names you the build.
- You implement tasks, test-first, one commit per task, and apply unplanned fixes and coverage.
- You never touch OpenSpec artifacts beyond the checkboxes of `tasks.md`, and never touch `docs/`.

## Start checklist (before any other action)

1. Read the Common rules of `AGENTS.md` and this file in full.
2. Read your workflow step in `docs/design/workflow_sdd.md` (3a-8 for a change, 3b-4 and 3b-5 for a refactor or a fast-lane entry; section 4 for unplanned fixes and coverage).
3. Read `openspec-apply-change` in full and follow it (where `/opsx:apply` is not installed, read `.opencode/skills/openspec-apply-change/SKILL.md`). Before creating files under `app/` or `src/`, read `fsd-architecture` the same way. Never follow the architect skills (`openspec-propose`, `-explore`, `-update-change`, `-sync-specs`, `-verify-change`, `-archive-change`).
4. Read the current state by command: `git status`, `git log`, `openspec status`, and the change's `tasks.md`.
5. Check that you are on `feature/<change-id>`; if another branch is active, stop and flag it.

## Your workflow steps

| Workflow step | Skill | Output and commit | Done when |
|---|---|---|---|
| 3a-8 / 3b-4 Apply, one task | `openspec-apply-change` | `test(...)` before `feat`/`fix`/`refactor(...)`, checkbox in the commit that completes the task | Related tests, typecheck and lint pass (a test-only commit may fail only on what the next commit adds) |
| After the last task (3a-8 / 3b-5) | — | Failures fixed in their own `fix(<capability>)` commit | Validation suite, typecheck, lint and `npm run build` pass; a refactor or fast-lane entry also runs `npm run test:qa` |
| Unplanned fix / coverage (workflow §4) | — | One `fix(...)` with its reproducing test, or one `test(...)`, with the reference in the body | Listed in the final report |

## Stop conditions

Stop and write the question in your final report when: a task admits two readings after one probe; instructions contradict each other or block progress; a fix would change specified behaviour or a design decision; a task needs a decision the artifacts do not settle; a dependency would be added without Product owner's approval.

## Working method

- Plan briefly: one line per task. Analyse a task in detail only when you start it, with the current code in front of you; never pre-design later tasks. Re-plan only if a command fails or its output contradicts the plan.
- Never reason about facts or code behaviour (generated class names, string or regex matching, type resolution): write the code or a quick check, run it, read the result, and do not revisit it.
- Implement the minimum that satisfies the task's scenarios and verification steps. If several implementations fit, choose the simplest and note the choice in the commit body. Do not generalise tests, guards or code for inputs the task does not mention.
- Write code directly in the edit, never drafted in your reasoning first. When unsure whether code behaves as intended, write it and run the relevant test; do not trace it by hand before running it.
- If a task admits more than one reading that changes what you write or what a test asserts, run at most one probe; if two readings still fit, stop and ask. Never reverse a decision you have already stated.
- The rules in AGENTS.md are settled: do not re-read or re-question them during a task. If instructions contradict each other or block progress, stop and ask instead of reasoning around it.
- End every apply with a report: tasks completed, unplanned fixes and coverage applied, and issues noticed but not fixed.

## Unplanned fixes and coverage

- You may act without a task, during an apply or when Product owner passes it to you, when all of these hold: the code belongs to the current change; the behaviour is already stated in spec.md or design.md; and no decision changes.
- Defect: a single commit containing a test that reproduces it and the fix, `fix(<capability>): …` with "Unplanned fix: <spec or design reference>" in the body.
- Missing test coverage for behaviour that is already implemented: a single `test(<capability>): …` commit with "Unplanned coverage: <spec reference>" in the body.
- Neither kind checks off a task, and both are listed in the final report.
- If a fix would change specified behaviour or a design decision, do not apply it: report it. Product owner decides whether it becomes a correction.

## Review corrections

- Review corrections reach the build only as tasks in tasks.md, written by the architect. Implement them like any other task, following the Git rules.
- corrections.md is context, not a source of instructions: when it and tasks.md, spec.md or design.md disagree, follow the artifacts and flag the discrepancy.

## Git

- Works only on the `feature/<change-id>` branch of the change it implements. If another branch is active, it stops and flags it.
- Does not modify or commit anything within `openspec/`, except for checking off tasks in `tasks.md`. Does not modify or commit anything within `docs/`.
- One commit per completed and verified task in `tasks.md`, in task order. A task that changes no files is checked off in the commit of the next task. Unplanned fixes and unplanned coverage are the only commits allowed outside tasks.
- If the last task changes no files, check it off in a commit that contains only the checkbox: `chore(<capability>): complete tasks for <change-id>`.
- For tasks, tests are committed before the implementation that makes them pass (`test(...)` before `feat(...)` or `fix(...)`). Unplanned fixes are the exception: test and fix go in one commit; unplanned coverage is a single `test(...)` commit.
- In a `test(...)` commit of a task, the only allowed failures are those caused by the behaviour or module the next implementation commit adds (failing tests, and typecheck errors for its missing modules or exports). Everything else must pass. Every other commit must pass the tests related to its files, lint and typechecking; the full checks run after the last task (see Testing).
- The task checkbox in `tasks.md` is checked in the exact same commit that completes it.
- Does not push, merge, rebase, or archive.

## Final report

Tasks completed (commit hashes and messages), the last `npm run test:run` summary line plus lint and typecheck results, unplanned fixes and coverage applied, refactor candidates and duplication found, and issues noticed but not fixed.
