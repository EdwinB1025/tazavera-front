<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Common rules (all agents)

## Roles and rule files

Every agent follows these Common rules plus the rule file of its own role, and ignores the files of every other role.

| Role | You are this role when | Rule file |
|---|---|---|
| Architect | You run `/opsx:explore`, `/opsx:propose`, `/opsx:update`, `/opsx:sync`, `/opsx:verify`, `/opsx:archive`, `openspec validate`, `openspec archive`, an artifact review or a correction round, or a prompt names you the architect | `docs/agents/architect.md` |
| Build | You run `/opsx:apply`, an unplanned fix or unplanned coverage, or a prompt names you the build | `docs/agents/build.md` |
| Orchestrator | Your session's entry file or prompt names you the orchestrator | `docs/agents/orchestrator.md` |
| Design lead | Your session's entry file or prompt names you the design lead | `docs/agents/design-lead.md` |

- **First step, always:** before any other action, read your role's rule file in full and do its start checklist. Never act on a role's work without having read its file in this session.
- If no command, entry file or prompt identifies your role, ask Product owner before doing anything.
- A prompt that gives you two roles in order (architect, then build) means: read each role's file before acting as that role, and follow only that file while in that role.
- The architect never implements: it does not create or edit code, tests or configuration. The build never runs `openspec validate`, `openspec archive` or any command that creates or changes OpenSpec artifacts.

## Working method

- At the start of every request, read the current state by command (tasks.md, `git status`, `git log`, `openspec status`); never rely on command outputs from earlier turns, because the other agent or Product owner may have changed them.
- Do not deliberate about tool mechanics or cosmetic details (whitespace, trailing newlines, how to batch commands): pick the plain option and move on.
- Edit and commit only inside the worktree this session started in. Read other worktrees or branches freely; prefer `git show <branch>:<path>` for committed content.

## Workflow

- `docs/agents/workflow_sdd.md` is the development process: spec-driven development with OpenSpec. Section 3a is the traditional workflow (type `Change`), section 3b the refactor workflow (type `Refactor (fast lane)`), section 4 the handling of findings.
- Every agent does the workflow steps of its role, in order, and never a step that belongs to another role. Each role file maps its steps.
- When a step cannot be applied as written, stop and ask instead of working around it.

## OpenSpec skills

- Each phase runs through its OpenSpec skill: `openspec-propose` (propose), `openspec-update-change` (artifact updates and correction rounds), `openspec-apply-change` (apply), `openspec-verify-change` (verify), `openspec-archive-change` (archive, which runs the sync), and `fsd-architecture` before designing or creating files under `app/` or `src/`.
- Where the `/opsx:*` commands or the skills are not installed (for example a Claude cloud session), read `.opencode/skills/<skill>/SKILL.md` in full and follow its steps.
- A role never follows another role's skills: the architect never `openspec-apply-change`; the build never the propose, update, sync, verify or archive skills.

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
- Inside a segment, import sibling files directly, never through the segment's own public index. Do not add files that only re-export another file.
- When a slice needs data or behaviour from another slice of the same layer, a slice of a higher layer composes both and passes it in.
- A slice's public index exports only what other slices import.

## Code structure

- Every API call goes through the project's shared request client. Never build an API URL by hand.
- Requests and the mapping of response statuses live in the slice's `api` segment, never in a UI component.
- Before writing a helper, hook or loader, search for an existing one and reuse it. When reuse would break a layer or slice rule, report the duplication in your final report as a backlog candidate instead of copying more than about 20 lines.
- Do not switch between two render trees with a boolean prop: write one component per variant and share their parts.
- Size limits: a component or function of at most 80 lines, a file of at most 300 lines, and a cyclomatic complexity of at most 15. The architect splits anything larger in design.md; the build reports in its final report any unit it cannot keep within the limits.

## API contract

- The API is documented with Scribe (OpenAPI 3.0.3). This project consumes the API and never modifies it.
- Never invent API fields, UI states or error formats. Everything must trace back to the OpenAPI spec or the specs of the current change.
- The API contract is `contracts/openapi.yaml`, a copy of the backend's Scribe spec. It is the only source of truth for API endpoints, fields and error formats.
- Never edit `contracts/openapi.yaml`. If it looks outdated or incomplete, stop and tell Product owner.
- API types were generated into `src/shared/api/schema.ts` with `npm run types:api`. Never edit that file by hand; regenerate it whenever `contracts/openapi.yaml` changes. Import API types only from `src/shared/api/`.

## Testing

- Unit and component tests use Vitest with React Testing Library.
- The repository holds two suites:
  - the validation suite (`npm run test:run`): the spec scenarios and the guard tests;
  - the QA suite (folder `qa/`, mirroring the paths of the code it tests): every other test. `npm run test:qa` runs both suites.
- When to run them:
  - after each task: only the tests related to the files the task changed (`npx vitest related <files> --run`), the typecheck and lint;
  - after the last task of a change: the validation suite, the typecheck, lint and `npm run build`. A refactor change also runs `npm run test:qa`. The build fixes any failure in its own `fix(<capability>)` commit before the change goes to verify.
- Async Server Components cannot be tested with Vitest; keep them thin and move logic into testable components or functions.
- jsdom has no CSS engine: component tests assert exact class names, including variant prefixes, and attributes. Visual correctness is covered by the guard tests and the build.
- End-to-end tests (Playwright) come later, as a pre-deployment suite.
- Tests in this repository verify only the spec scenarios (in `openspec/specs/` or the current change's spec), one test per scenario, plus the guard tests for project rules. Refactor changes add no tests: they keep the existing ones passing, moving or updating them only where the refactor moves the code they test.
- Each change writes only the tests its tasks name, plus the reproducing test of an unplanned fix and the unplanned coverage Product owner passes to the build. Do not add tests for cases, variants or details the task does not mention; if you think coverage is missing, list it in your final report instead of writing it.
- Each test asserts the scenario's observable result (role, accessible name, text, attribute, class name or call) with the fewest assertions that would fail if that behaviour broke. Do not repeat the same check for every locale or variant, do not use snapshots, and do not test internal helpers that a component test already covers.
- Tests outside this scope move to the QA suite only through Product owner's reduction plan. During a change, never delete or move an existing test, and never write or delete tests in the QA suite. The one exception: when a refactor moves code that a test imports, update that test's import or location, never its assertions.
- Do not add new guard tests. Each existing guard is one general test per rule that checks every item internally and lists the offending ones; a new token only registers its pair in the existing contrast matrix of `src/app/styles/theme-tokens.test.ts`.
- Never loosen production code (for example making a required type optional) to satisfy a QA test fixture: list the stale QA test in your final report instead.

## Project conventions (do not re-derive)

- Tailwind 4 utilities are generated from `@theme` variables: the utility name is the property prefix plus everything after the namespace (e.g. `--color-text-link` → `text-text-link`). Check generated names against globals.css, never guess them.
- Components use only semantic tokens (colors, radii and any future token family), never primitives, hex values or Tailwind default scales. The guard tests under `src/` enforce the allowed sets; if a guard fails, fix the code, not the guard, unless the change's design adds a token.
- Each external asset library has a single entry point in `src/shared`; import from that entry point only.
- Component behaviour (states, variants, accessibility patterns) is defined in the OpenSpec specs of its capability; read them instead of inferring it.

## Dependencies

- Do not add, remove or upgrade dependencies without explicit approval from Product owner.
- Keep ESLint on v9: the plugins in `eslint-config-next` do not support ESLint 10 yet.

## Review findings flow

Findings come from Product owner's review, from `/opsx:verify` or from the build's final report. Each one follows exactly one of two paths:

- Defect, or missing test coverage, for behaviour already stated in spec.md or design.md that changes no decision → Product owner passes it to the build, which handles it as an unplanned fix or unplanned coverage (see the build's rules). It does not go to corrections.md.
- Change to specified behaviour or to a design decision → Product owner reports it in `docs/design/<change-id>/corrections.md`, one section per review round (`## Round N`), as a numbered list, and commits that round himself before the architect processes it. The architect turns the round into artifact updates and new tasks in `tasks.md`; the build implements them only as tasks. No agent implements a correction directly from corrections.md.
- Refactor candidates reported by the build are kept in `docs/design/backlog.md`, one entry per candidate: what is duplicated, where, and why it would pay off. Product owner adds entries; the architect removes an entry only when archiving the change that resolves it.
- Reviews of the artifacts before /opsx:apply arrive as a message from Product owner. The architect applies them directly to the artifacts, records them in `## Propose status` and commits one `docs(<capability>): update artifacts for <change-id>`. `corrections.md` is used only for findings after the build has started.

## Refactor changes

- A refactor change keeps behaviour: what users see, the requests sent to the API and every requirement in `openspec/specs/` stay the same. It comes from a backlog entry with `Type: Refactor (fast lane)`; an entry with `Type: Change` follows the normal flow.
- The architect writes `Type: Refactor (fast lane)` as the first line of `proposal.md`. Every agent follows this section only for a change whose proposal has that exact line; any other change follows the normal flow.
- The backlog entry, and the review it cites, replace the design folder: there is no design summary, no explore and no artifact review. The architect proposes from the entry, writes the propose status as a final section of `proposal.md`, and the build applies right after the propose commit.
- The spec delta states the observable property the refactor establishes or keeps (for example, one entry point for a concern). It adds no behaviour.
- The change adds no tests. Existing tests keep their assertions; only the tests whose code moved get a new import or location.
- Before verify, the full checks of the Testing section run, the QA suite included. The change is archived once those checks pass and `/opsx:verify` reports no CRITICAL finding, without waiting for Product owner's request.
- If keeping behaviour turns out impossible, or the work needs a decision the backlog entry does not settle, stop and report it: it becomes a normal change.
- **Fast lane by Product owner's order.** When the backlog entry records that Product owner ordered it as fast lane and states its settled end state, the change follows this section even though it adds behaviour, texts, screens or tests: its spec deltas state the new requirements with their scenarios, it writes one test per new scenario, and existing tests keep their assertions. Everything else in this section applies unchanged; an end state the entry does not settle is still a stop.

## Git Flow and Commits

### Branches
- `master`: production. Only receives merges from `release/*` or `hotfix/*`. Only Product owner performs merges.
- `develop`: integration. Each completed OpenSpec change is integrated here.
- `feature/<change-id>`: one branch per OpenSpec change, created from `develop`; a refactor change's branch is created from `qa`.
- `qa`: integration of refactor changes. It takes in `develop` at the start of each refactoring round and is merged into `develop` when the round ends.
- `release/*` and `hotfix/*`: only created by Product owner.
- No agent creates, deletes, renames, or merges branches.

### Commit Format (Conventional Commits)
`<type>(<capability>): <description in imperative mood, lowercase, no period at the end>`

Mandatory footer: `Refs: <change-id>`

| Phase | Type and Example |
|---|---|
| Propose | `docs(<capability>): propose <change-id>` |
| Artifact Review | `docs(<capability>): update <artifact> for <change-id>` |
| Review round report (Product owner) | `docs(<capability>): report review round <N> for <change-id>` |
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
- AGENTS.md and the role files in `docs/agents/` are read-only for every agent: never edit, stage or commit them, even when the Next.js block above says to commit it. If `git status` shows them modified, leave them unstaged and mention it in the final report. The orchestrator's own rules state its exception.
- Stage one path per `git add` command; never list several paths in one command.
