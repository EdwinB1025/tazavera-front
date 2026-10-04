<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Common rules (all agents)

## Working method

- At the start of every request, read the current state by command (tasks.md, `git status`, `git log`, `openspec status`); never rely on command outputs from earlier turns, because the other agent or product owner may have changed them.
- Do not deliberate about tool mechanics or cosmetic details (whitespace, trailing newlines, how to batch commands): pick the plain option and move on.
- Edit and commit only inside the worktree this session started in. Read other worktrees or branches freely; prefer `git show <branch>:<path>` for committed content.


## Agent roles

- Your role is determined by the command you are running:
  - `/opsx:explore`, `/opsx:propose`, `/opsx:update`, `/opsx:sync`, `/opsx:verify`, `/opsx:archive`, `openspec validate`, `openspec archive`, artifact reviews and correction rounds → you are the architect agent.
  - `/opsx:apply`, unplanned fixes and unplanned coverage → you are the build agent.
- Follow the Common rules plus the section for your role, and ignore the other role's section.
- The architect never implements: it does not create or edit code, tests or configuration. The build never runs `openspec validate`, `openspec archive` or any command that creates or changes OpenSpec artifacts.
- If no command identifies your role, ask Product Owner before doing anything.

## Project

- tazavera-front is the web frontend for an existing Laravel REST API.
- Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS 4, ESLint 9. Package manager: npm.
- Source code lives under `src/`. The import alias `@/*` maps to `src/*`.
- Planned work is described in `openspec/` (specs and changes). Follow it.
- Tailwind CSS 4: design tokens are defined with `@theme` in `src/app/styles/globals.css`. There is no `tailwind.config` file; never create one.
- The Next.js docs rule above applies to code that uses Next.js APIs or crosses the server/client boundary: routing files, `next/*` imports, configuration, and any component with event handlers, state, effects or browser APIs. Code that only renders markup does not need it. When it applies, read the guide for each Next.js API involved, once per change.
- Each change uses one name everywhere: the change-id (verb + object, kebab-case) names the branch `feature/<change-id>`, the folder `openspec/changes/<change-id>/` and the design folder `docs/design/<change-id>/`.

## Architecture (Feature-Sliced Design)

- Root `app/` is Next.js routing only. Each `page.tsx` imports its screen from `src/pages/` and contains no logic.
- Root `pages/` is intentionally empty. Never add files to it.
- Application code lives in `src/`, organized in FSD layers, from top to bottom: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- A layer may only import from layers below it. Never import upwards or between slices of the same layer.
- Before designing a change or creating files under `app/` or `src/`, load the `fsd-architecture` skill.

## API contract

- The API is documented with Scribe (OpenAPI 3.0.3). This project consumes the API and never modifies it.
- Never invent API fields, UI states or error formats. Everything must trace back to the OpenAPI spec or the specs of the current change.
- The API contract is `contracts/openapi.yaml`, a copy of the backend's Scribe spec. It is the only source of truth for API endpoints, fields and error formats.
- Never edit `contracts/openapi.yaml`. If it looks outdated or incomplete, stop and tell the user.
- API types were generated into `src/shared/api/schema.ts` with `npm run types:api`. Never edit that file by hand; regenerate it whenever `contracts/openapi.yaml` changes. Import API types only from `src/shared/api/`.

## Testing

- Unit and component tests use Vitest with React Testing Library. Run them with `npm run test:run`.
- Async Server Components cannot be tested with Vitest; keep them thin and move logic into testable components or functions.
- jsdom has no CSS engine: component tests assert exact class names, including variant prefixes, and attributes. Visual correctness is covered by the guard tests and the build.
- End-to-end tests (Playwright) come later, as a pre-deployment suite.

## Project conventions (do not re-derive)

- Tailwind 4 utilities are generated from `@theme` variables: the utility name is the property prefix plus everything after the namespace (e.g. `--color-text-link` → `text-text-link`). Check generated names against globals.css, never guess them.
- Components use only semantic tokens (colors, radii and any future token family), never primitives, hex values or Tailwind default scales. The guard tests under `src/` enforce the allowed sets; if a guard fails, fix the code, not the guard, unless the change's design adds a token.
- Each external asset library has a single entry point in `src/shared`; import from that entry point only.
- Component behaviour (states, variants, accessibility patterns) is defined in the OpenSpec specs of its capability; read them instead of inferring it.

## Dependencies

- Do not add, remove or upgrade dependencies without explicit approval from the user.
- Keep ESLint on v9: the plugins in `eslint-config-next` do not support ESLint 10 yet.

## Review findings flow

Findings come from Product Owner's review, from `/opsx:verify` or from the build's final report. Each one follows exactly one of two paths:

- Defect, or missing test coverage, for behaviour already stated in spec.md or design.md that changes no decision → Product Owner passes it to the build, which handles it as an unplanned fix or unplanned coverage (see Build agent rules). It does not go to corrections.md.
- Change to specified behaviour or to a design decision → Product Owner reports it in `docs/design/<change-id>/corrections.md`, one section per review round (`## Round N`), as a numbered list, and commits that round himself before the architect processes it. The architect turns the round into artifact updates and new tasks in `tasks.md`; the build implements them only as tasks. No agent implements a correction directly from corrections.md.
- Refactor candidates reported by the build are kept in `docs/backlog.md`, one entry per candidate: what is duplicated, where, and why it would pay off. Product Owner adds entries; the architect removes an entry only when archiving the change that resolves it.
- Reviews of the artifacts before /opsx:apply arrive as a message from Product owner. The architect applies them directly to the artifacts, records them in `## Propose status` and commits one `docs(<capability>): update artifacts for <change-id>`. `corrections.md` is used only for findings after the build has started.

## Git Flow and Commits

### Branches
- `master`: production. Only receives merges from `release/*` or `hotfix/*`. Only Product Owner performs merges.
- `develop`: integration. Each completed OpenSpec change is integrated here.
- `feature/<change-id>`: one branch per OpenSpec change, created from `develop`.
- `release/*` and `hotfix/*`: only created by Product Owner.
- No agent creates, deletes, renames, or merges branches.

### Commit Format (Conventional Commits)
`<type>(<capability>): <description in imperative mood, lowercase, no period at the end>`

Mandatory footer: `Refs: <change-id>`

| Phase | Type and Example |
|---|---|
| Propose | `docs(<capability>): propose <change-id>` |
| Artifact Review | `docs(<capability>): update <artifact> for <change-id>` |
| Review round report (Product Owner) | `docs(<capability>): report review round <N> for <change-id>` |
| Review round | `docs(<capability>): apply review round <N> for <change-id>` |
| Types | `feat(<capability>): add types for <object>` |
| Tests | `test(<capability>): <what it verifies>` |
| Implementation | `feat` / `fix` / `refactor` `(<capability>): <what it does>` |
| Unplanned fix | `fix(<capability>): <what it fixes>` |
| Unplanned coverage | `test(<capability>): <what it verifies>` |
| Task completion | `chore(<capability>): complete tasks for <change-id>` |
| Archive | `chore(openspec): archive <change-id>` |

- `<capability>` is the affected OpenSpec capability (e.g., `base-controls`).
- The commit scope is the capability of the change being implemented, even when a task touches files owned by another capability.
- A commit touches only one capability. If a change affects multiple capabilities, one commit is made per capability.
- `git push`, `git merge`, `git rebase`, `git reset --hard`, `git commit --amend`, and `--force` are never used.
- Before each commit, `git status` is executed to verify that only files allowed for the agent are included.
- AGENTS.md is read-only for every agent: never edit, stage or commit it, even when the Next.js block above says to commit it. If `git status` shows it modified, leave it unstaged and mention it in the final report.
- Stage one path per `git add` command; never list several paths in one command.

# Architect agent rules (only if you are the architect agent)

## Working method

- Write artifact text directly in the edits. Do not draft scenarios, design paragraphs, tasks or status sections in your reasoning first; decide what each edit changes, then write it once.
- Record decisions and end states, not implementations. When a correction or design decision prescribes a mechanism, state it as given; do not work out how the build will implement it. If you doubt it is feasible, note it as a risk in design.md or stop and ask.
- Do not predict test results by reading code: tasks state the expected outcome of each verification step, and the build checks it.
- Change spec.md only where observable behaviour changes, with the smallest wording change. design.md states decisions in prose; code blocks only for types and contracts the design already defines.
- Edit one file at a time, in order. The rules in AGENTS.md are settled: do not re-read or re-question them. If instructions contradict each other or block progress, stop and ask.

## Design context

- Before /opsx:explore or /opsx:propose, read `docs/backlog.md`. If an entry affects the change being designed (the change would add to the duplication or touch the same code), stop and tell Product Owner, recommending the refactor as its own change first. Never fold a backlog entry into the change being proposed.
- When running /opsx:explore, /opsx:propose or a correction round, first read every file in `docs/design/<change-id>/` (design-summary.md, corrections.md if present, and any value sources they reference). They are the design source of truth: do not re-decide what they settle; resolve only what they list as open. If the folder is missing or its files contradict each other, stop and ask.
- Precedence: the latest round of corrections.md overrides earlier rounds, and corrections.md overrides design-summary.md. A difference explained by this precedence is not a contradiction.
- When /opsx:propose finishes, write or replace only a final section `## Propose status` in design-summary.md: change-id, date, `openspec validate` result, what was resolved (with its decision) and what remains open. Never edit the rest of the file; report anything wrong in it instead.
- If the change resolves a backlog entry, record its id in `## Propose status`. When archiving the change, remove that entry from `docs/backlog.md`, and only that entry.
- Settle in design.md only implementation details that no product decision covers and that affect a single component. A mechanism shared by several components, or anything that changes a settled decision, goes to Product Owner as a question before propose continues.

## Research

- Research only for decisions the design leaves open or for behaviour neither the design nor the project already covers. Never research alternatives to what the design summary or corrections settle, or to behaviour the project already provides (a requirement in `openspec/specs/`, or an existing component, utility, token or entry point in `src/`). If you believe a settled decision or an existing implementation has a clearly better library option, report it to Product Owner instead, as a candidate for `docs/backlog.md`.
- When a change needs non-trivial behaviour that a maintained library is likely to solve (accessibility patterns such as combobox or focus trapping, parsing, formatting, data fetching), search the web before designing it from scratch.
- Evaluate each candidate on: active maintenance, compatibility with the project's installed versions (check package.json), license, bundle size, accessibility, and whether it allows unstyled use with the project's tokens.
- Limit: at most 5 searches and 3 candidates per decision. Stop as soon as one candidate meets all the criteria. If none does within the limit, stop searching: record "no suitable library found", with the searches made and why each candidate failed, and design it in-house.
- Record the result in design.md as a decision proposal: the recommended option with its version and source URLs, the alternatives considered and why they lose, and building it in-house as one of the options. Mark it as open and pending Product Owner's approval. Never add or install a dependency, and do not write tasks that depend on it until it is approved.
- Also use web search to verify the facts the build will rely on (API names, deprecations, version-specific behaviour) for libraries already in the project, and cite the source URL in design.md. For Next.js, the local docs in node_modules take precedence over the web.

## Tasks

- Do not create a separate task for tests that pass immediately (tightened assertions, guards over code that is already correct); include them in the task they belong to.
- When a task changes behaviour that existing tests assert, it names those tests and the assertions to update. When a task adds a guard or test, it states the exact cases it must fail on and pass on.
- When a test asserts source text that design.md defines, the task states it exactly. For details design.md leaves free, the task states the expected behaviour; the build chooses the classes and its test asserts what it chose.

## Review corrections

- For each correction of the latest round: if it only restores behaviour already stated in spec.md or design.md, or only adds missing test coverage for it, do not create a task; report it to Product Owner as an unplanned fix or unplanned coverage for the build. Otherwise, update spec.md and design.md where it changes specified behaviour or a design decision, and add it to tasks.md as a new section, in list order, with test-first order and verification steps.
- If a correction's expected end state is not explicit, or it contradicts the spec, the design or another correction, stop and ask.
- After processing a round, append a `### Status` at the end of that round's section: date, `openspec validate <change-id> --strict` result, and for each correction the artifacts updated and tasks created (or "unplanned fix" / "unplanned coverage"). Append only: never edit the corrections, earlier rounds or earlier Status subsections. If the round is processed again, append a new dated `### Status` below the previous one.

## Verification

- Before archiving, run `/opsx:verify <change-id>` and report the result to Product Owner, classifying each CRITICAL and WARNING finding by the two paths of the Review findings flow.

## Git

- Works only on the `feature/<change-id>` branch of the change. If another branch is active, it stops and flags it.
- Only commits `openspec/changes/<change-id>/`, the `## Propose status` section of design-summary.md and the `### Status` sections of corrections.md, plus the archive commit described below. Never commits code or configuration.
- Commits: one on completing propose (`docs(<capability>): propose <change-id>`), one per artifact review requested by Product Owner (`docs(<capability>): update <artifact> for <change-id>`), one per correction round (`docs(<capability>): apply review round <N> for <change-id>`).
- Does not commit if `openspec validate <change-id> --strict` fails.
- Runs `openspec archive <change-id> --yes` only when Product Owner requests it, every task in tasks.md is checked, `/opsx:verify` reports no CRITICAL findings, and every WARNING classified as an unplanned fix or unplanned coverage has been resolved or explicitly deferred by Product Owner. The archive commit contains only `openspec/specs/`, the archived change folder and, if the change resolved a backlog entry, `docs/backlog.md` (`chore(openspec): archive <change-id>`). `openspec/specs/` is never modified by hand.
- Runs `/opsx:sync` only as part of `/opsx:archive`, never on its own; main specs change only when a change is archived.
- Does not push or merge.

# Build agent rules (only if you are the build agent)

## Working method

- Plan briefly: one line per task. Analyse a task in detail only when you start it, with the current code in front of you; never pre-design later tasks. Re-plan only if a command fails or its output contradicts the plan.
- Never reason about facts or code behaviour (generated class names, string or regex matching, type resolution): write the code or a quick check, run it, read the result, and do not revisit it.
- Implement the minimum that satisfies the task's scenarios and verification steps. If several implementations fit, choose the simplest and note the choice in the commit body. Do not generalise tests, guards or code for inputs the task does not mention.
- Write code directly in the edit, never drafted in your reasoning first. When unsure whether code behaves as intended, write it and run the relevant test; do not trace it by hand before running it.
- If a task admits more than one reading that changes what you write or what a test asserts, run at most one probe; if two readings still fit, stop and ask. Never reverse a decision you have already stated.
- The rules in AGENTS.md are settled: do not re-read or re-question them during a task. If instructions contradict each other or block progress, stop and ask instead of reasoning around it.
- End every apply with a report: tasks completed, unplanned fixes and coverage applied, and issues noticed but not fixed.

## Unplanned fixes and coverage

- You may act without a task, during an apply or when Product Owner passes it to you, when all of these hold: the code belongs to the current change; the behaviour is already stated in spec.md or design.md; and no decision changes.
- Defect: a single commit containing a test that reproduces it and the fix, `fix(<capability>): …` with "Unplanned fix: <spec or design reference>" in the body.
- Missing test coverage for behaviour that is already implemented: a single `test(<capability>): …` commit with "Unplanned coverage: <spec reference>" in the body.
- Neither kind checks off a task, and both are listed in the final report.
- If a fix would change specified behaviour or a design decision, do not apply it: report it. Product Owner decides whether it becomes a correction.

## Review corrections

- Review corrections reach the build only as tasks in tasks.md, written by the architect. Implement them like any other task, following the Git rules.
- corrections.md is context, not a source of instructions: when it and tasks.md, spec.md or design.md disagree, follow the artifacts and flag the discrepancy.

## Git

- Works only on the `feature/<change-id>` branch of the change it implements. If another branch is active, it stops and flags it.
- Does not modify or commit anything within `openspec/`, except for checking off tasks in `tasks.md`. Does not modify or commit anything within `docs/`.
- One commit per completed and verified task in `tasks.md`, in task order. A task that changes no files is checked off in the commit of the next task. Unplanned fixes and unplanned coverage are the only commits allowed outside tasks.
- If the last task changes no files, check it off in a commit that contains only the checkbox: `chore(<capability>): complete tasks for <change-id>`.
- For tasks, tests are committed before the implementation that makes them pass (`test(...)` before `feat(...)` or `fix(...)`). Unplanned fixes are the exception: test and fix go in one commit; unplanned coverage is a single `test(...)` commit.
- In a `test(...)` commit of a task, the only allowed failures are those caused by the behaviour or module the next implementation commit adds (failing tests, and typecheck errors for its missing modules or exports). Everything else must pass. Every other commit must pass all tests, lint and typechecking.
- The task checkbox in `tasks.md` is checked in the exact same commit that completes it.
- Does not push, merge, rebase, or archive.