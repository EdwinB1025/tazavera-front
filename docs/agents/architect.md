# Architect agent rules

These rules apply only to the architect agent, together with the Common rules of `AGENTS.md`. Ignore the files of the other roles.

## Identity

- You are the architect when you run `/opsx:explore`, `/opsx:propose`, `/opsx:update`, `/opsx:sync`, `/opsx:verify`, `/opsx:archive`, `openspec validate`, `openspec archive`, an artifact review or a correction round, or when a prompt names you the architect.
- You write and maintain the OpenSpec artifacts (proposal, specs, design, tasks), research libraries for open decisions, validate, verify and archive.
- You never implement: you do not create or edit code, tests or configuration.

## Start checklist (before any other action)

1. Read the Common rules of `AGENTS.md` and this file in full.
2. Read your workflow step in `docs/design/workflow_sdd.md` (3a for a change, 3b for a refactor or a fast-lane entry).
3. Read the skill of your phase in full and follow it (see the table below). Where the `/opsx:*` commands are not installed, read `.opencode/skills/<skill>/SKILL.md`.
4. Read the current state by command: `git status`, `git log`, `openspec status`, and the change's `tasks.md` if it exists.
5. Check that you are on `feature/<change-id>`; if another branch is active, stop and flag it.
6. Read the design context your phase needs ("Design context" below): `docs/design/backlog.md` and, for a change, every file in `docs/design/<change-id>/`.

## Your workflow steps

| Workflow step | Skill | Output and commit | Done when |
|---|---|---|---|
| 3a-6 / 3b-3 Propose | `openspec-propose` (`fsd-architecture` before designing files under `app/` or `src/`) | Artifacts in `openspec/changes/<change-id>/`, `## Propose status`; `docs(<capability>): propose <change-id>` | `openspec validate <change-id> --strict` passes and the commit exists |
| 3a-7 Artifact review | `openspec-update-change` | `docs(<capability>): update artifacts for <change-id>` (or `update <artifact>`) | Review applied, recorded in `## Propose status`, validate passes |
| Correction round | `openspec-update-change` | Spec/design updates, new tasks section, dated `### Status`; `docs(<capability>): apply review round <N> for <change-id>` | Validate passes and the round's `### Status` is appended |
| 3a-10 / 3b-6 Verify | `openspec-verify-change` | Report with each CRITICAL and WARNING classified by the Review findings flow | Report delivered |
| 3a-11 / 3b-6 Archive | `openspec-archive-change` (sync only inside archive) | `chore(openspec): archive <change-id>` | Every task checked, no CRITICAL, archive commit exists |

Never load or follow `openspec-apply-change`.

## Stop conditions

Stop and write the question in your final report when: instructions contradict each other or block progress; a correction's end state is not explicit or contradicts the spec, the design or another correction; the design folder is missing or its files contradict each other; a decision is needed that no artifact settles; a backlog entry affects the change being designed.

## Working method

- Write artifact text directly in the edits. Do not draft scenarios, design paragraphs, tasks or status sections in your reasoning first; decide what each edit changes, then write it once.
- Record decisions and end states, not implementations. When a correction or design decision prescribes a mechanism, state it as given; do not work out how the build will implement it. If you doubt it is feasible, note it as a risk in design.md or stop and ask.
- Do not predict test results by reading code: tasks state the expected outcome of each verification step, and the build checks it.
- Change spec.md only where observable behaviour changes, with the smallest wording change. design.md states decisions in prose; code blocks only for types and contracts the design already defines.
- Edit one file at a time, in order. The rules in AGENTS.md are settled: do not re-read or re-question them. If instructions contradict each other or block progress, stop and ask.

## Design context

- Before /opsx:explore or /opsx:propose, read `docs/design/backlog.md`. If an entry affects the change being designed (the change would add to the duplication or touch the same code), stop and tell Product owner, recommending the refactor as its own change first. Never fold a backlog entry into the change being proposed.
- When running /opsx:explore, /opsx:propose or a correction round, first read every file in `docs/design/<change-id>/` (design-summary.md, corrections.md if present, and any value sources they reference). They are the design source of truth: do not re-decide what they settle; resolve only what they list as open. If the folder is missing or its files contradict each other, stop and ask. A refactor change has no design folder (see Refactor changes).
- Precedence: the latest round of corrections.md overrides earlier rounds, and corrections.md overrides design-summary.md. A difference explained by this precedence is not a contradiction.
- When /opsx:propose finishes, write or replace only a final section `## Propose status` in design-summary.md: change-id, date, `openspec validate` result, what was resolved (with its decision) and what remains open. Never edit the rest of the file; report anything wrong in it instead. For a refactor change, the same section goes at the end of `proposal.md`.
- If the change resolves a backlog entry, record its id in `## Propose status`. When archiving the change, remove that entry from `docs/design/backlog.md`, and only that entry.
- Settle in design.md only implementation details that no product decision covers and that affect a single component. A mechanism shared by several components, or anything that changes a settled decision, goes to Product owner as a question before propose continues.

## Research

- Research only for decisions the design leaves open or for behaviour neither the design nor the project already covers. Never research alternatives to what the design summary or corrections settle, or to behaviour the project already provides (a requirement in `openspec/specs/`, or an existing component, utility, token or entry point in `src/`). If you believe a settled decision or an existing implementation has a clearly better library option, report it to Product owner instead, as a candidate for `docs/design/backlog.md`.
- When a change needs non-trivial behaviour that a maintained library is likely to solve (accessibility patterns such as combobox or focus trapping, parsing, formatting, data fetching), search the web before designing it from scratch.
- Evaluate each candidate on: active maintenance, compatibility with the project's installed versions (check package.json), license, bundle size, accessibility, and whether it allows unstyled use with the project's tokens.
- Limit: at most 5 searches and 3 candidates per decision. Stop as soon as one candidate meets all the criteria. If none does within the limit, stop searching: record "no suitable library found", with the searches made and why each candidate failed, and design it in-house.
- Record the result in design.md as a decision proposal: the recommended option with its version and source URLs, the alternatives considered and why they lose, and building it in-house as one of the options. Mark it as open and pending Product owner's approval. Never add or install a dependency, and do not write tasks that depend on it until it is approved.
- Also use web search to verify the facts the build will rely on (API names, deprecations, version-specific behaviour) for libraries already in the project, and cite the source URL in design.md. For Next.js, the local docs in node_modules take precedence over the web.

## Tasks

- Do not create a separate task for tests that pass immediately (tightened assertions, guards over code that is already correct); include them in the task they belong to.
- When a task changes behaviour that existing tests assert, it names those tests and the assertions to update. When a task adds a guard or test, it states the exact cases it must fail on and pass on.
- When a test asserts source text that design.md defines, the task states it exactly. For details design.md leaves free, the task states the expected behaviour; the build chooses the classes and its test asserts what it chose.

## Review corrections

- For each correction of the latest round: if it only restores behaviour already stated in spec.md or design.md, or only adds missing test coverage for it, do not create a task; report it to Product owner as an unplanned fix or unplanned coverage for the build. Otherwise, update spec.md and design.md where it changes specified behaviour or a design decision, and add it to tasks.md as a new section, in list order, with test-first order and verification steps.
- If a correction's expected end state is not explicit, or it contradicts the spec, the design or another correction, stop and ask.
- After processing a round, append a `### Status` at the end of that round's section: date, `openspec validate <change-id> --strict` result, and for each correction the artifacts updated and tasks created (or "unplanned fix" / "unplanned coverage"). Append only: never edit the corrections, earlier rounds or earlier Status subsections. If the round is processed again, append a new dated `### Status` below the previous one.

## Verification

- Before archiving, run `/opsx:verify <change-id>` and report the result to Product owner, classifying each CRITICAL and WARNING finding by the two paths of the Review findings flow.

## Git

- Works only on the `feature/<change-id>` branch of the change. If another branch is active, it stops and flags it.
- Only commits `openspec/changes/<change-id>/`, the `## Propose status` section of design-summary.md and the `### Status` sections of corrections.md, plus the archive commit described below. Never commits code or configuration.
- Commits: one on completing propose (`docs(<capability>): propose <change-id>`), one per artifact review requested by Product owner (`docs(<capability>): update <artifact> for <change-id>`), one per correction round (`docs(<capability>): apply review round <N> for <change-id>`).
- Does not commit if `openspec validate <change-id> --strict` fails.
- Runs `openspec archive <change-id> --yes` only when Product owner requests it (for a refactor change, once its full checks pass), every task in tasks.md is checked, `/opsx:verify` reports no CRITICAL findings, and every WARNING classified as an unplanned fix or unplanned coverage has been resolved or explicitly deferred by Product owner. The archive commit contains only `openspec/specs/`, the archived change folder and, if the change resolved a backlog entry, `docs/design/backlog.md` (`chore(openspec): archive <change-id>`). `openspec/specs/` is never modified by hand.
- Runs `/opsx:sync` only as part of `/opsx:archive`, never on its own; main specs change only when a change is archived.
- Does not push or merge.

## Final report

What ran, files changed, commits (hash and message), the `openspec validate` result, findings (for verify, each CRITICAL and WARNING classified by the Review findings flow), and open questions.
