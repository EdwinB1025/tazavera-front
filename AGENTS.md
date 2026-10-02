<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent roles

- Your role is determined by the command you are running:
  - `/opsx:explore`, `/opsx:propose`, `/opsx:verify`, `openspec validate`,
    `openspec archive`, artifact reviews and correction rounds → you are the
    architect agent.
  - `/opsx:apply` and unplanned fixes → you are the build agent.
- Follow the Common rules plus the section for your role, and ignore the
  other role's section.
- The architect never implements: it does not create or edit code, tests or
  configuration. The build never runs `openspec validate`, `openspec archive`
  or any command that creates or changes OpenSpec artifacts.
- If no command identifies your role, ask Augusto before doing anything.

# Common rules (all agents)

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

## Review corrections flow

- Augusto reports review corrections in `docs/design/<change-id>/corrections.md`, one section per review round (`## Round N`), as a numbered list.
- The architect turns each round into artifact updates and new tasks in `tasks.md`. The build implements them only as tasks. No agent implements a correction directly from `corrections.md`.

## Git Flow and Commits

### Branches
- `master`: production. Only receives merges from `release/*` or `hotfix/*`. Only Augusto performs merges.
- `develop`: integration. Each completed OpenSpec change is integrated here.
- `feature/<change-id>`: one branch per OpenSpec change, created from `develop`.
- `release/*` and `hotfix/*`: only created by Augusto.
- No agent creates, deletes, renames, or merges branches.

### Commit Format (Conventional Commits)
`<type>(<capability>): <description in imperative mood, lowercase, no period at the end>`

Mandatory footer: `Refs: <change-id>`

| Phase | Type and Example |
|---|---|
| Propose | `docs(<capability>): propose <change-id>` |
| Artifact Review | `docs(<capability>): update <artifact> for <change-id>` |
| Review round | `docs(<capability>): apply review round <N> for <change-id>` |
| Types | `feat(<capability>): add types for <object>` |
| Tests | `test(<capability>): <what it verifies>` |
| Implementation | `feat` / `fix` / `refactor` `(<capability>): <what it does>` |
| Task completion | `chore(<capability>): complete tasks for <change-id>` |
| Archive | `chore(openspec): archive <change-id>` |

- `<capability>` is the affected OpenSpec capability (e.g., `base-controls`).
- The commit scope is the capability of the change being implemented, even when a task touches files owned by another capability.
- A commit touches only one capability. If a change affects multiple capabilities, one commit is made per capability.
- `git push`, `git merge`, `git rebase`, `git reset --hard`, `git commit --amend`, and `--force` are never used.
- Before each commit, `git status` is executed to verify that only files allowed for the agent are included.
- AGENTS.md is read-only for every agent: never edit, stage or commit it, even when the Next.js block above says to commit it. If `git status` shows it modified, leave it unstaged and mention it in the final report.

# Architect agent rules (only if you are the architect agent)

## Design context

- When running /opsx:explore or /opsx:propose, first read every file in `docs/design/<change-id>/` (design-summary.md, corrections.md if present, and any value sources they reference, such as tokens.css). These are the design source of truth: do not re-decide what they settle; resolve only what they list as open. If the folder is missing, or files contradict themselves or each other, stop and ask.
- Precedence inside the design folder: the latest round of corrections.md overrides earlier rounds, and corrections.md overrides design-summary.md. A difference that this precedence explains is not a contradiction.
- When /opsx:propose finishes, update `docs/design/<change-id>/design-summary.md` by writing or replacing only a final section `## Propose status`, with: the change-id, the date, the openspec validate result, what was resolved during propose (with its decision), and what remains open (residuals, pending decisions, deferred items). Never edit any other part of the file; if something above it is wrong or outdated, report it instead.

## Tasks

- Do not create a separate task for tests that pass immediately (tightened assertions, guards over code that is already correct); include them in the task of the change they belong to.

## Review corrections

- For each correction of the latest round in corrections.md: update spec.md and design.md where the correction changes specified behaviour or a design decision, then add the corrections to tasks.md as a new section of tasks, in list order, with the test-first order and verification steps of any other task.
- After processing a round, append a `### Status` subsection at the end of that round's section in corrections.md, with the date, the `openspec validate <change-id> --strict` result and, for each correction, the artifacts updated and the task numbers created. Append only: never edit or remove the corrections, earlier rounds or earlier Status subsections. If the same round is processed again, append a new `### Status` with its own date below the previous one.
- If a correction's expected end state (classes, attributes, behaviour) is not explicit, or it contradicts the spec, the design or another correction, stop and ask instead of inferring it.

## Verification

- Before archiving, runs `/opsx:verify <change-id>` and reports the result to
  Augusto. Does not archive while CRITICAL findings remain.
- CRITICAL and WARNING findings follow the review flow: a defect that restores
  specified behaviour is fixed by the build as an unplanned fix; anything that
  changes the spec or the design becomes a correction round.

## Git

- Works only on the `feature/<change-id>` branch of the proposed change. If another branch is active, it stops and flags it.
- Only commits files within `openspec/changes/<change-id>/`, plus the `## Propose status` section of `docs/design/<change-id>/design-summary.md` and the `### Status` sections of `docs/design/<change-id>/corrections.md`. It never commits code or configuration.
- One commit upon completing the propose phase - `docs(<capability>): propose <change-id>`.
- One commit for each artifact review requested by Augusto - `docs(<capability>): update <artifact> for <change-id>`.
- One commit per correction round - `docs(<capability>): apply review round <N> for <change-id>`.
- Does not commit if `openspec validate <change-id> --strict` fails.
- Runs `openspec archive <change-id> --yes` only when Augusto requests it and every task in `tasks.md` is checked. The archive commit contains only `openspec/specs/` and the archived change folder - `chore(openspec): archive <change-id>`.
- Only modifies `openspec/specs/` through `openspec archive`, never by hand.
- Does not push or merge.

# Build agent rules (only if you are the build agent)

## Working method

- Plan once: before editing, write a short numbered plan. Then execute it. Re-plan only if a command fails or its output contradicts the plan.
- Check facts by running a command (build and grep the CSS, run the test, run tsc), never by reasoning about them. Check each fact once, note the result, and do not revisit it.
- If an instruction allows several implementations, choose the simplest one that satisfies the stated scenarios and tests, and note the choice in the commit body. Do not compare more than two alternatives.
- If instructions contradict each other or block progress, stop and ask. Do not reason around a contradiction.
- You may fix a defect on your own, without a task, when all of these hold:
  the code belongs to the current change; the fix restores behaviour already
  stated in spec.md or design.md and changes no decision; and a test that
  reproduces the defect is added first. Commit it as `fix(<capability>): …`
  with "Unplanned fix: <spec or design reference>" in the body, and list it in
  the final report.
- If a fix would change specified behaviour or a design decision, do not apply
  it: report it at the end of the apply. Augusto decides whether it becomes a
  correction.

## Review corrections

- Review corrections reach the build only as tasks in tasks.md, written by the architect. Implement them like any other task, following the Git rules.
- corrections.md is context, not a source of instructions: when it and tasks.md, spec.md or design.md disagree, follow the artifacts and flag the discrepancy.

## Git

- Works only on the `feature/<change-id>` branch of the change it implements. If another branch is active, it stops and flags it.
- Does not modify or commit anything within `openspec/`, except for checking off tasks in `tasks.md`. Does not modify or commit anything within `docs/`.
- One commit per completed and verified task in `tasks.md`, in task order. A task that changes no files is checked off in the commit of the next task.
- If the last task changes no files, check it off in a commit that contains only the checkbox: `chore(<capability>): complete tasks for <change-id>`.
- Tests are committed before the implementation that makes them pass (`test(...)` before `feat(...)` or `fix(...)`).
- In a `test(...)` commit, the only allowed failures are those caused by the behaviour or module the next implementation commit adds (failing tests, and typecheck errors for its missing modules or exports). Everything else must pass. Every non-test commit must pass all tests, lint and typechecking.
- The task checkbox in `tasks.md` is checked in the exact same commit that completes it.
- Does not push, merge, rebase, or archive.
- Unplanned fixes (see Working method) are the only commits allowed outside
  tasks.md tasks. Each one is a single commit containing the reproducing test
  and the fix, separate from any task commit, and it never checks off a task.