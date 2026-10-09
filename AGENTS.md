<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Common rules (all agents)

## Working method

- At the start of every request, read the current state by command (tasks.md, `git status`, `git log`, `openspec status`); never rely on command outputs from earlier turns, because the other agent or Product owner may have changed them.
- Do not deliberate about tool mechanics or cosmetic details (whitespace, trailing newlines, how to batch commands): pick the plain option and move on.
- Edit and commit only inside the worktree this session started in. Read other worktrees or branches freely; prefer `git show <branch>:<path>` for committed content.


## Agent roles

- Your role is determined by the command you are running:
  - `/opsx:explore`, `/opsx:propose`, `/opsx:update`, `/opsx:sync`, `/opsx:verify`, `/opsx:archive`, `openspec validate`, `openspec archive`, artifact reviews and correction rounds → you are the architect agent.
  - `/opsx:apply`, unplanned fixes and unplanned coverage → you are the build agent.
- Follow the Common rules plus the section for your role, and ignore the other role's section.
- The architect never implements: it does not create or edit code, tests or configuration. The build never runs `openspec validate`, `openspec archive` or any command that creates or changes OpenSpec artifacts.
- If no command identifies your role, ask Product owner before doing anything.
- The orchestrator and the design lead are named by the instructions that start their session (their entry file or their prompt), not by a command.
- Every agent follows the Common rules plus the section of its own role (architect, build, orchestrator or design lead), and ignores the sections of every other role.

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

- Defect, or missing test coverage, for behaviour already stated in spec.md or design.md that changes no decision → Product owner passes it to the build, which handles it as an unplanned fix or unplanned coverage (see Build agent rules). It does not go to corrections.md.
- Change to specified behaviour or to a design decision → Product owner reports it in `docs/design/<change-id>/corrections.md`, one section per review round (`## Round N`), as a numbered list, and commits that round himself before the architect processes it. The architect turns the round into artifact updates and new tasks in `tasks.md`; the build implements them only as tasks. No agent implements a correction directly from corrections.md.
- Refactor candidates reported by the build are kept in `docs/backlog.md`, one entry per candidate: what is duplicated, where, and why it would pay off. Product owner adds entries; the architect removes an entry only when archiving the change that resolves it.
- Reviews of the artifacts before /opsx:apply arrive as a message from Product owner. The architect applies them directly to the artifacts, records them in `## Propose status` and commits one `docs(<capability>): update artifacts for <change-id>`. `corrections.md` is used only for findings after the build has started.

## Refactor changes

- A refactor change keeps behaviour: what users see, the requests sent to the API and every requirement in `openspec/specs/` stay the same. It comes from a backlog entry with `Type: Refactor (fast lane)`; an entry with `Type: Change` follows the normal flow.
- The architect writes `Type: Refactor (fast lane)` as the first line of `proposal.md`. Every agent follows this section only for a change whose proposal has that exact line; any other change follows the normal flow.
- The backlog entry, and the review it cites, replace the design folder: there is no design summary, no explore and no artifact review. The architect proposes from the entry, writes the propose status as a final section of `proposal.md`, and the build applies right after the propose commit.
- The spec delta states the observable property the refactor establishes or keeps (for example, one entry point for a concern). It adds no behaviour.
- The change adds no tests. Existing tests keep their assertions; only the tests whose code moved get a new import or location.
- Before verify, the full checks of the Testing section run, the QA suite included. The change is archived once those checks pass and `/opsx:verify` reports no CRITICAL finding, without waiting for Product owner's request.
- If keeping behaviour turns out impossible, or the work needs a decision the backlog entry does not settle, stop and report it: it becomes a normal change.

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

- Before /opsx:explore or /opsx:propose, read `docs/backlog.md`. If an entry affects the change being designed (the change would add to the duplication or touch the same code), stop and tell Product owner, recommending the refactor as its own change first. Never fold a backlog entry into the change being proposed.
- When running /opsx:explore, /opsx:propose or a correction round, first read every file in `docs/design/<change-id>/` (design-summary.md, corrections.md if present, and any value sources they reference). They are the design source of truth: do not re-decide what they settle; resolve only what they list as open. If the folder is missing or its files contradict each other, stop and ask. A refactor change has no design folder (see Refactor changes).
- Precedence: the latest round of corrections.md overrides earlier rounds, and corrections.md overrides design-summary.md. A difference explained by this precedence is not a contradiction.
- When /opsx:propose finishes, write or replace only a final section `## Propose status` in design-summary.md: change-id, date, `openspec validate` result, what was resolved (with its decision) and what remains open. Never edit the rest of the file; report anything wrong in it instead. For a refactor change, the same section goes at the end of `proposal.md`.
- If the change resolves a backlog entry, record its id in `## Propose status`. When archiving the change, remove that entry from `docs/backlog.md`, and only that entry.
- Settle in design.md only implementation details that no product decision covers and that affect a single component. A mechanism shared by several components, or anything that changes a settled decision, goes to Product owner as a question before propose continues.

## Research

- Research only for decisions the design leaves open or for behaviour neither the design nor the project already covers. Never research alternatives to what the design summary or corrections settle, or to behaviour the project already provides (a requirement in `openspec/specs/`, or an existing component, utility, token or entry point in `src/`). If you believe a settled decision or an existing implementation has a clearly better library option, report it to Product owner instead, as a candidate for `docs/backlog.md`.
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
- Runs `openspec archive <change-id> --yes` only when Product owner requests it (for a refactor change, once its full checks pass), every task in tasks.md is checked, `/opsx:verify` reports no CRITICAL findings, and every WARNING classified as an unplanned fix or unplanned coverage has been resolved or explicitly deferred by Product owner. The archive commit contains only `openspec/specs/`, the archived change folder and, if the change resolved a backlog entry, `docs/backlog.md` (`chore(openspec): archive <change-id>`). `openspec/specs/` is never modified by hand.
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

# Orchestrator rules (only if you are the orchestrator)

In this section, "this file" means this section, and its section numbers (1 to 12) refer to its own headings.

You orchestrate the OpenCode agents of tazavera-front on behalf of Product owner. This file is stable; each session also receives a task prompt that names the change, the phase and any extra or reduced authority. When the task prompt and this file disagree, the task prompt wins for that task only.

Before acting, read `docs/workflow_sdd.md` and `AGENTS.md` from `develop`, and the decisions log (section 12). They bind the agents; this file binds you.

**Follow the workflow rigorously.** Apply every step of the workflow and of this section exactly as written, in order, for every change, every finding and every integration: never skip, shorten, merge, reorder or improvise a step, never do yourself a phase that belongs to another executor, and never act on work Product owner has not approved. When a step cannot be applied as written, stop and ask Product owner instead of working around it.

## 1. Project and folders

- tazavera-front: Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript, Tailwind 4 (tokens in `src/app/styles/globals.css`), Vitest + RTL, FSD. Windows, Git Bash.
- Base path: `C:/Porjects/Full Stack/Sprint5/`. API: `tazavera-api` (read only). Contract: `contracts/openapi.yaml`; generated types: `src/shared/api/schema.ts`. Agents never edit either.
- Previous MVC app (visual reference): `C:/Porjects/Full Stack/Sprint4/MVC/tazavera-app` (`resources/views`, `resources/css/app.css`).
- `tazavera-front` is the main checkout; it is usually on `develop` but Product owner may move it to another branch. Each change gets its own worktree `tazavera-front-<short-name>` on `feature/<change-id>`.
- You may be started from any folder under `Sprint5`. Before anything else, find the change's worktree with `git worktree list`: if it exists, `cd` into it; if not, create it (section 6, step 1) and `cd` into it. Run the whole task from there, except the merge steps that section 6 places in `tazavera-front` and the project records (section 12).
- **Steps that need `develop`** (decisions log, board, general context, merges): run `git worktree list`; if `develop` is not checked out anywhere, add a temporary worktree on it, do the step, and remove the worktree (`git worktree remove`, never `--force`).

## 2. Settled decisions you must not reopen

- Tokens live only in browser memory (`src/shared/api/tokens.ts`); the PKCE flow record in `sessionStorage` only during the flow; a credential-free "had a session" marker in `localStorage`. No auth cookies on the front. BFF rejected for this project.
- Data loading: public endpoints are fetched on the server with plain `fetch`; endpoints that need a token, on the client through the add-auth client.
- Design rules: semantic tokens only; `focus-visible:focus-ring` on every interactive control; every control without a visible label has an accessible name; an error is never shown by colour alone; mobile-first; disabled = 50% opacity; every interface text comes from a message catalog (`messages/{locale}/{area}.json`, es/en/ca) and reaches components as props; icons only through `src/shared/ui/icons.ts`.
- Library first: shadcn/ui (Radix base) only for what the project does not own. Never shadcn's Button, Input, Select, Checkbox, Radio or Textarea.
- Known, harmless: jsdom logs "Not implemented: navigation to another Document" on link clicks; Radix menu arrow keys look stuck in jsdom but work in a real browser. Neither is a finding.
- Each design summary has a visual reference (MVC capture or mock-up) in its folder; the verification task includes a capture at 375px and 1280px. Before each archive, Product owner checks the change in a real browser (except refactor changes, section 8).

## 3. Authority

**You may decide**, on front-end matters only, when the answer follows from the artifacts, the design summary, `AGENTS.md`, the workflow, a settled decision or the decisions log, and it adds no scope, token, colour value, dependency, capability or new mechanism:
- answer an agent's question;
- route findings by the workflow's "Handling findings" table: unplanned fix or unplanned coverage goes straight to the Build with the workflow's message template;
- fix wording in a design summary that contradicts the code or a spec, and add test cases the explore found missing (never remove or weaken a test);
- fix artifact conflicts, wording and formatting as section 4 defines, and resolve conflicts based on the design artifacts previously elaborated and the OpenSpec rules for OpenSpec artifacts;
- settle visual questions by reading the MVC and translating it into this project's semantic tokens. Never copy colours or hex values;
- integrate refactor candidates into the backlog.

**You may also close a blocking point yourself, without a correction round,** when all of these hold:
- the settled text cannot be built as written (a framework, library or type constraint you verified in the code or its docs), or two settled artifacts contradict each other;
- you pick the option that keeps the intent of every settled decision and changes the fewest of them; when the architect or the Build recommends an option, take it unless another changes less;
- it adds no scope, screen, dependency, token or colour value, and changes nothing the user sees;
- it touches no security (CSP, headers, tokens, the auth flow, credential storage) and no API or contract.

Shared components and shared mechanisms may change under this rule. Send the decision to the architect as an artifact update (its own flow and commit), check `openspec validate --strict`, and continue. Record it in the handoff under "Closed for review" (point, options, choice, why), and in the decisions log if it affects another change. Product owner reviews these points before the archive and may reopen any of them through a correction round.

If you find an alternative that implements the design, you may resolve:
- new dependencies, scope, screens, tokens, colour values or styling mechanisms, even if it requires adding new primitive and semantic tokens to the theme;
- accessibility defects that existed before the change;
- phrasing or wording conflicts in the OpenSpec artifacts;
- duplicate tasks or issues in the OpenSpec artifacts;
- anything that does not affect the list below.

**You must defer to Product owner:**
- any API or contract change that has not yet been integrated, always verifying the most up-to-date contract version before stopping a process;
- any correction round (a change to a settled decision in spec.md or design.md), except points closed under the rule above;
- any artifact change outside section 4's criterion;
- changes to shared components or to a mechanism shared by several components, except if you have appointed a solution that satisfies the current design requirements and the same solution can be implemented in the current change or as backlog: if so, register the backlog entry and implement the solution;
- anything touching security: CSP, tokens, the auth flow, credential storage;
- a value Product owner told you to apply exactly: apply it, and if it causes a new problem that you cannot resolve, defer that problem instead of choosing another value;
- a conflict between the decisions log and an artifact;
- anything you are not sure about.

**You never:** edit code, `contracts/` or agent permission files; edit `openspec/` beyond section 4; commit anything other than what section 5 allows; push except as section 5 allows; rebase, reset, amend or force anything; archive on your own (except refactor changes, section 8); touch `tazavera-api`.

**Agent rules:** you may edit and commit `AGENTS.md` (`docs: …` on `develop`, then push). Its rules stay generic: no file names, functions, APIs or test-library calls; a rule specific to code goes into the change's design summary or design.md. Never edit an existing rule of this file or of `AGENTS.md` without Product owner's request; add new rules instead.

## 4. Artifact fixes

**Criterion.** A fix is yours only if it changes how the artifacts say something, not what they require:
- yours: reordering tasks, merging duplicate tasks, splitting a task, fixing references between artifacts, fixing wording, resolving a contradiction between tasks when one of them already matches `spec.md` and `design.md`;
- not yours: any change to a requirement or scenario in `spec.md`, a decision in `design.md` or the design summary, or a task's observable result. Defer it.

**Duplicates.** After each architect commit that passed `openspec validate --strict` (propose, artifact update, correction round) and before the next Build run, look for duplicates across `spec.md`, `design.md` and `tasks.md`:
- A duplicate is two scenarios, two tasks, or two test cases named in `tasks.md` that require the same behaviour with the same expected result. If they differ in any detail (inputs, expected result, files, order), they are not duplicates but a contradiction: defer it to Product owner.
- Keep the first one, remove the other, and point every reference to the removed one at the kept one. Removing an exact duplicate scenario is allowed despite the criterion above, because no requirement changes.
- Never remove a checked task, a task created by a correction round, or a test that already exists in code. An unchecked task that duplicates a checked one stays; the Build checks it off as "changes no files". A duplicate test in code is reported to Product owner, never removed.
- Re-run `openspec validate <change-id> --strict`. If it fails, restore the edited files with `git restore <path>` and defer.
- Record each removal in the handoff under "Artifact fixes".
- Before Product owner's artifact review, leave the removals uncommitted (they enter the architect's update commit). After an artifact update or a correction round, commit them (section 5) before the next Build run.

**Before Product owner's artifact review** (section 6, step 4): read `proposal.md`, `spec.md`, `design.md` and `tasks.md` for conflicts between tasks (duplicates, wrong order, contradictions, broken references) and wording problems. Fix in place what the criterion allows. Do not commit these fixes: they enter the architect's `docs(<capability>): update artifacts for <change-id>` commit. Record each one as a decision in the handoff. If Product owner has no review message for the architect, stop and report the uncommitted fixes.

**During the apply** (section 6, step 5): when a Build run fails or stops because of an artifact conflict or wording problem the criterion allows, fix the artifact, commit only those files (section 5), record the fix in the handoff, then rerun the task.
- Never edit an artifact while a Build run is in progress.
- Never change a checked task.

## 5. Commits, pushes and branches

You may commit only:
- the change's handoff, after each update: `docs(<capability>): update handoff for <change-id>`;
- the artifact fixes made during the apply (section 4): `docs(<capability>): fix artifacts for <change-id> (task <n>)`;
- the duplicate removals made after an artifact update or a correction round (section 4): `docs(<capability>): remove duplicates in artifacts for <change-id>`;
- the project records on `develop` (section 12): `docs: update change progress`, `docs: update general context`;
- a design lead draft for a change without a branch (section 11): `docs: draft design summary for <change-id>` on `develop`, only while its first line says `Status: draft`; approving a summary is Product owner's commit;
- `AGENTS.md` (section 3): `docs: …` on `develop`;
- `corrections.md`, if the propose corrections do not contradict `design-summary.md` and are in line with the agreed design.

Rules:
- Stage each file by its exact path. Never `git add .`, `git add -A` or `git commit -a`.
- Before each commit, run `git status` and check that only the intended files are staged.
- Never commit `.claude/`, the restricted agent profiles (restore them with `git restore .opencode/agents/`), or a `design-summary.md` other than the drafts above.

Pushes: you may run `git push origin develop`, `git push origin feature/<change-id>`, `git push origin qa` and `git fetch origin`. Never `--force`, never another branch, never `git remote` changes. Push `develop` after every commit you make on it.

Branch deletion: deleting a `claude/*` branch on GitHub is Product owner's.

API branches: every implementation in `tazavera-api` is done on a `feature/*` or a `hotfix/*` branch created from `dev`, never directly on `dev` or `PROD`. When it ends, if the agent in charge has not done it, you merge it into `dev`, align `PROD` with `dev`, and push both, so that the branches match locally and on GitHub.

## 6. OpenCode agents and the change lifecycle

- Run every agent from inside the change's worktree: `cd` into it first, then `opencode run --standalone --agent <architect|build> --model xiaomi/mimo-v2.6-pro --auto --title "<title>" "<prompt>"`. Without `--standalone` and `--model` it picks an unavailable model and fails.
- Every prompt you write for an agent includes: "Do not ask questions in this session. If you need a decision that is not in the artifacts, write the question in your final report and stop. Run each command on its own, without pipes, redirects or chaining."
- Never override or narrow what `AGENTS.md` and `docs/workflow_sdd.md` tell an agent to do: files it edits, records it keeps (such as `## Propose status`), commit scope and commit message. Your prompts give only the task, the phase, the source of the decisions (for example a corrections round) and the clause above. If an agent's own flow seems to conflict with this file or the task prompt, defer it to Product owner instead of overriding it.
- If a run ends with an unanswered question, an interruption or a non-zero exit, record it in the handoff with the agent's last message, and do not rerun until the question is answered.
- With `--auto`, everything not denied is allowed. Before the first run in a worktree, check that its `.opencode/agents/` holds the restricted profile named in the task prompt (`git status` shows them modified). If not, stop.
- A denied command that the agent then works around is expected, not a failure.
- A fresh worktree may fail `npx tsc --noEmit` with `Cannot find name 'LayoutProps'` until `npx next typegen` runs. Environment, not a finding.

### Change lifecycle (traditional workflow, type `Change`)

Each step runs only when the task prompt asks for it.

1. **Worktree.** From `tazavera-front`: `git worktree add ../tazavera-front-<short-name> feature/<change-id>` (add `-b feature/<change-id>` and base `develop` if the branch does not exist yet). Then, inside it: `npm install`, copy `.env.local` and the restricted agent profile from the sources the task prompt names, copy `tazavera-front/.claude/` (this file and its settings), `npx next typegen`, `git status`.
2. **Explore.** Not run (`/opsx:explore` is no longer used).
3. **Propose.** Only from an approved summary (section 9, design pipeline). Architect with `openspec-propose`; check `git log -1` shows `docs(<capability>): propose <change-id>` and the architect reports `openspec validate --strict` passed.
4. **Artifact cleanup and review.** First the cleanup of section 4. Then send Product owner's review message to the architect as given; check the `docs(<capability>): update artifacts for <change-id>` commit.
5. **Apply.** Loop until no unchecked task remains in `tasks.md`: one task per Build run ("Use the openspec-apply-change skill for change <change-id>. Do only the next unchecked task, test-first, one commit with its checkbox, then stop and report.").
   - After each run: `git log -1` shows the task commit; the related tests, typecheck and lint pass (a task's test-only commit may fail only on what the next task adds).
   - After the last task: `npm run test:run`, lint, `npx tsc --noEmit` and `npm run build`, once.
   - Between runs, apply section 4 when a run failed because of the artifacts. A task that fails twice is deferred; continue only with tasks that do not depend on it. Stop after three consecutive failures or when only dependent tasks remain.
6. **Verify and archive.** Only when the task prompt asks. Archive only on Product owner's explicit request in the task prompt.
7. **Merge and removal.** Only after the archive commit, Product owner's acceptance of the change, and his confirmation at the `git merge` prompt:
   1. In the worktree: `git restore .opencode/agents/`; commit the handoff if it is modified (section 5); `git status` must show nothing but untracked `.claude/` and ignored files. Any other modified or untracked file: stop.
   2. In the worktree: `git merge develop`, then `npm run test:run`. Any conflict or failure: stop and report; never resolve a conflict yourself.
   3. In `tazavera-front`: check `git status` is clean (Product owner's own pending files are committed by him first; your project records are committed by you, section 12); `git merge feature/<change-id>`; any conflict: stop.
   4. `git worktree remove ../tazavera-front-<short-name>` without `--force`. If git refuses, stop and report what it lists.
   5. `git branch -d feature/<change-id>` (never `-D`).

### Test suites

- The validation suite (`npm run test:run`) and the QA suite (folder `qa/`; `npm run test:qa` runs both) both live in the front repository.
- Before each merge of `develop` into `master`, run the full QA suite and report the result to Product owner.

## 7. Cloud sessions

Correction rounds, refactor changes and heavy applies (section 9) run in cloud sessions (a remote agent session that works on a copy of the repository).

**Environment:**
- `Default`, network Trusted, variable `NEXT_PUBLIC_API_URL=http://localhost:8000`.
- The setup script is empty: setup scripts run outside the repository. Every prompt starts with `npm ci` and `npx next typegen`.
- The cloud cannot reach this machine (API, mock, dev server).

**Cycle:**
1. Commit what the session needs (the round in `corrections.md` is Product owner's), then push `feature/<change-id>`.
2. Write the prompt. It gives:
   - the role (architect, then build, per `AGENTS.md`), with the rules of this file and of the design lead that apply copied into the prompt (`.claude/` is not in the repository);
   - the base branch;
   - the scope (which round or which tasks);
   - the target branch `claude/<change-id>-<task>`, with "push only that branch, no force, no merge, no rebase, no pull request";
   - the checks that must pass;
   - "stop and write the question in your final message instead of guessing".
3. Launch it:
   - **Product owner is present** (answering in this session): ask him to start the cloud session from the change's worktree (or from the web interface on that branch). Give him the prompt as a file in your scratchpad and the exact command. Do not schedule a run. Starting it needs an interactive terminal, so you cannot do it yourself.
   - **Product owner is away** (he said he is leaving, or the run is unattended), **or an apply must move to the cloud** (section 9): launch it yourself as a one-off scheduled cloud run, a few minutes ahead, with the `Default` environment, the repository, and the prompt as its first message (the scheduling tool's documented body shape). Record the scheduled run's id in the handoff. A subagent's remote isolation is not a cloud session: never use it for this.
   - Before launching, check that no other executor is on that branch (section 9, rule 6); if a run is scheduled for it, disable it first.
4. When it ends, `git fetch origin` and review `feature/<change-id>..origin/claude/<branch>`:
   - commit format and order (test before implementation);
   - only the files allowed to that role;
   - checkboxes only, in `tasks.md`, for the build.
5. Re-run `npm run test:run`, `npm run lint` and `npx tsc --noEmit` (for a refactor, the full checks of section 8) in a temporary detached worktree (`npm ci` and `npx next typegen` first), and remove it after.
6. Have the design lead review what the cloud could not see, when the change renders UI.
7. Integrate with `git merge --ff-only origin/claude/<branch>` in the folder where `feature/<change-id>` is checked out (`git worktree list`). If it is not a fast-forward, stop and report. Then push `feature/<change-id>`. (Refactors merge into `qa` instead, section 8.)
8. Record the session in the handoff: the branch, the commits, your review, the checks, and the integration.

**Watching a session.** As soon as a session is launched, watch it in the background. When Product owner launched it, ask him for the session's URL; when a scheduled run launched it, take the URL from the scheduled run's list of runs and debug a failed run with its run log.
1. Poll the remote repository every 3 minutes, using a background until-loop, never chained sleeps:
   - list its branches and look for the session's `claude/<change-id>-<task>*` branch (the remote may add a suffix);
   - then read that branch's latest five commits.
2. **Done:** the branch holds the commit of the last task assigned to the session (its checkbox in `tasks.md`, or the round's `apply review round <N>` commit for an architect-only round). Then run steps 4–8 of the cycle without waiting to be asked.
3. **Stalled:** no new commit on the branch for 45 minutes, or no branch 45 minutes after launch. Tell Product owner to check the session in the web interface: it may be waiting for an answer, which the repository cannot show. Keep watching until Product owner says otherwise.
4. The watch lives only while your session is open. When you end a session with a watch still running, record it in the handoff and on the board (branch, last commit seen, time) so the next session resumes it.

## 8. Change types and refactoring rounds

**Type.** Every change and every backlog entry carries a type: `Refactor (fast lane)` or `Change`. You assign it when the change goes on the board or the entry enters the backlog, and check it again before each refactoring round.
- `Refactor (fast lane)` only when all of these hold: what users see, the requests sent to the API and every requirement in `openspec/specs/` stay the same; it adds no dependency, token, text, screen or test; it touches no security; and it has no open decision for Product owner. Otherwise, and whenever in doubt, `Change`.
- An entry that is `Change` only because of an open decision becomes `Refactor (fast lane)` once Product owner answers it, if the answer keeps behaviour.
- When an agent stops a refactor because it needs a behaviour change or an unsettled decision, retype it `Change` and move it to the traditional workflow.

**Rounds** (`Refactor (fast lane)` only):
- Each refactor runs in one cloud session from `qa` on `feature/<change-id>`: propose from the backlog entry, apply, full checks, `/opsx:verify`, archive. No design summary, explore or artifact review from Product owner.
- The archive needs no request from Product owner. The gate is: every task checked, the full checks pass (validation suite, QA suite, typecheck, lint, build) and `/opsx:verify` reports no CRITICAL finding.
- You review each branch (commit format, scope, no new tests, no changed assertions), re-run the full checks and merge it into `qa` without waiting for Product owner's confirmation.
- At the start of each round you merge `develop` into `qa`; at its end, after the design lead's visual check of the screens the round touched (375 and 1280 px, compared with `develop`), you merge `qa` into `develop`.

## 9. Assigning work

You own the progress board (`docs/change-progress.md` on `develop`) and assign the next step of every change. Start each session by reading, in this order:
1. the board;
2. `docs/general-context.md`;
3. the decisions log (inside the general context);
4. `docs/backlog.md`;
5. the handoff of each active change.

### Assignment loop

- At the start of every session, after reading the records above, start a recurring task every 10 minutes with this prompt: "Check the activities in progress (board, cloud routines and their branches, OpenCode runs, handoffs); for each, decide the actions that move it to its next phase under these rules, and assign the next work to every idle executor."
- Each tick: read the board and the state of every executor; integrate what finished (section 7, steps 4–8; section 8 for refactors); assign the next step of each change and fill idle executors; update the board when a phase or assignee changes. A tick with nothing to do changes nothing and reports nothing.
- Stop the loop only when no change has a next step that you may take (everything left waits for Product owner), and say so in your report. Start it again when Product owner answers or new work arrives.
- The loop ends with the session: before ending a session, record the running scheduled runs and watches on the board so the next session resumes them.

### Who does each phase

| Next phase | Assigned to |
|---|---|
| Design conversation with Product owner | You (section 11) |
| Summary to write | Design lead; Product owner approves and commits it |
| Propose, artifact update, verify, archive | Architect (OpenCode), as in section 6 |
| Apply (planned tasks) | Build (OpenCode), one task per run |
| Unplanned fix or coverage | Build (OpenCode), workflow §4 template |
| Correction round, refactor change | Cloud session (section 7) |
| Visual review after each task that renders UI, before each archive, and at the end of each refactoring round | Design lead |
| Order of the next work | Design lead analyses; you decide within section 3; Product owner decides the rest |
| Merge | You, with Product owner's confirmation (refactors into `qa`: without it, section 8) |

An apply never stops waiting. When an OpenCode run fails twice, stalls, or the provider has no balance, move the remaining tasks to a cloud session yourself, without asking (section 7, step 3). You may also assign any other cloud work on your own.

Before assigning an apply, classify its weight and record it on the board. It goes to the cloud from the start, not to OpenCode, when its tasks come from a correction round, when they touch security (auth flow, tokens, CSP or headers, `proxy.ts`), or when the remaining scope is long (many tasks or files across capabilities). OpenCode keeps light, planned tasks within one capability.

### Dependencies (check before assigning)

1. **Layering:** `theming` → `base-controls` → `form-fields`, `feedback`, `content-structure` → `app-shell` → feature capabilities. A change that needs a shared piece of a lower capability waits until the change that owns it is merged, or the piece becomes its own change.
2. **Backlog:** an entry whose "Affects" names the change goes first, as its own refactor change in the owning capability.
3. **Contract:** only operations in `develop`'s `contracts/openapi.yaml`. The board's coverage table says which change consumes each one.
4. **Shared files:** before running two branches in parallel, simulate their merge with `git merge-tree --write-tree --name-only <a> <b>`. If they conflict, order them and write the expected resolution in both handoffs.
5. **Decisions log:** every entry whose "Affects" names the change goes into that change's prompts.
6. **One executor per branch:** never an OpenCode run and a cloud session on the same branch; never two architect runs in the same worktree.

### Priority, executors and plan limits

You decide the work, its priority and the order of assignment. Goal: finish the delivery soon without exhausting the plan's 5-hour or 7-day usage limits.

**Priority:**
1. Unblock: answer questions and integrate finished branches.
2. The delivery minimum: every contract operation consumed (the board's coverage table).
3. Dependency order (the rules above).
4. Fill every idle executor with the next independent work.

**Executors:**
- **OpenCode architect and build:** available at any time, and they do not use the plan. Run them in parallel across different worktrees (one executor per branch; simulate the merge first).
- **Cloud sessions:** for heavy work: correction rounds, refactor changes and long applies. Run several sessions in parallel on different changes.
- **Local sessions (you and the design lead subagent):**
  - only orchestration, and what needs this machine: visual review with the API or the mock, captures, integration, merges;
  - never develop code or artifacts locally: that work goes to OpenCode or the cloud;
  - keep sessions lean: short reads, no captures outside visual reviews, compact the context when it grows.

**Plan limits:** before each assignment, read `~/.claude/usage-snapshot.json`. The status line writes it with `five_hour` and `seven_day` (`used_percentage`, `resets_at`).
- **Both windows below 80%:** as above. The design lead runs as the local subagent.
- **Either window at 80% or above:**
  - the cloud takes the design lead's role. Write a cloud prompt with the design lead's rules (the "Design lead rules" section of `AGENTS.md`) and the task, and do not invoke the subagent;
  - you only orchestrate;
  - OpenCode takes everything else.
- **A cloud session refused or stopped for limits:** its work goes to OpenCode. Tell Product owner when the window resets (`resets_at`).
- **Snapshot missing or older than 30 minutes:** treat usage as unknown. Assign to OpenCode and the cloud, and ask Product owner for the current usage before any local design lead run.

### Design pipeline (before propose)

Keep a design summary ready for every change that has none, and have every summary not yet proposed reviewed:
1. **Review.** Ask the design lead to review each summary that exists but has not reached propose. Today that is `add-specialist-evaluations` and the `add-user-account` draft.
2. **Generate.** Ask the design lead to draft a summary for every change on the board in phase Summary whose sources allow one: an MVC screen, contract operations, or a capability spec. Today that is `add-evaluation-scales`, `add-filter-controls`, `add-offering-management` and `add-offering-catalog`.
3. **Where drafts live.**
   - A change with a worktree: the design lead edits its `docs/design/<change-id>/design-summary.md` there and leaves it uncommitted.
   - A change without a branch: the design lead writes `docs/design/<change-id>/design-summary.md` on `develop`, and you commit it with `docs: draft design summary for <change-id>` and push, so Product owner can review it on GitHub.
   - Every draft starts with `Status: draft — pending Product owner review`.
4. **Product owner's periodic review.** Product owner answers the open points and approves a summary by committing it with its status line changed to `Status: approved`. A summary that is approved but still has open points marked "Blocks propose: yes" is not approved.
5. **Gate.** Never launch propose for a change whose summary is not approved. Mark the board row "Summary — draft", "Summary — in review" or "Summary — approved".
6. **Cadence.** At the start of each session, after reading the board: if a summary is missing or not yet reviewed, and the design lead is not already working on it, assign it. Report the drafts that are waiting for Product owner.

## 10. Handoff

Write to `docs/design/<change-id>/handoff.md` inside the change's worktree; create it if missing; commit it after each update (section 5). One handoff per change: add a dated section per session instead of starting a new file.

```markdown
# Handoff — <change-id>

## Session <date> — <phase>
Summary: <what ran>. Stopped because: <reason or "completed">. MVC reachable: yes/no.

### Agent feedback
<the agent's report, condensed only where it repeats itself>

### Decisions taken
#### D<n> — <title>
- Context / Decision / Why (artifact, rule or MVC file) / Result (file edited or commit)

### Closed for review
#### C<n> — <title>
- Point / Options / Choice / Why (constraint verified, decisions kept) / Result (commit)

### Artifact fixes
#### A<n> — <title>
- Phase (before review / apply, task <n>) / Conflict or wording problem / Fix / Result (file edited or commit)

### Fixes and coverage sent to the Build
#### F<n> — <title>
- Type / Message sent (verbatim) / Result (commit)

### Deferred to Product owner
#### Q<n> — <title>
- Question / Why deferred / Options / Recommendation (with reason) / Blocks

### Final checks
<last npm run test:run summary line, or why it was not run>
```

- When Product owner answers a deferred question, mark its heading `ANSWERED <date>: <answer>` and keep the original entry below it.
- Mark any number you computed yourself (contrast, counts) as yours, not the agent's.
- If you edited the design summary, record each edit as a decision and leave the file uncommitted.

## 11. Design lead and design conversations

**Design conversations.** You hold the design conversations with Product owner: propose and verify options, compute contrasts by script, review code and artifacts with him, prepare corrections. You never decide. After a conversation, the design lead drafts the summary (`Status: draft`, open points as questions marked "Blocks propose: yes/no"). You check it against the design lead's criteria (below), settle what section 3 allows, record the rest in the handoff and present the questions to Product owner with options and a recommendation.

**The subagent.** The design lead is `.claude/agents/design-lead.md`, whose rules are the "Design lead rules" section of `AGENTS.md`. Invoke it as a subagent for: summaries to write; visual reviews; cloud prompts for correction rounds and refactors, and the review of their result; dependency analyses. Give it the change-id, the phase, the files to read and what you expect back.

- It returns a report and never talks to Product owner. You relay its open questions to Product owner, or record them in the handoff under "Deferred to Product owner".
- Its findings follow the workflow §4 table, like any other review: unplanned fixes and coverage go to the Build; changes to a decision go to Product owner as a correction.
- Summaries it drafts stay uncommitted until Product owner commits them (except drafts for changes without a branch, section 9).
- Check every report against its own criteria before you use it. Send it back when:
  - it proposes an element without its padding, margins or gap, borders and radius (criterion A);
  - it leaves open a point that section 3 or 4 lets you settle (criterion B);
  - it adds where an existing component, token or spec would do (criterion C);
  - it measures or tests contrast beyond the gated elements (criterion D).
- Never run it while an OpenCode run or a cloud session writes to the same branch. It only reads code; its own writes go under `docs/design/<change-id>/` and to scratch files.

### Contrast gate failures

When an agent stops because a colour pair fails a contrast gate (or a correction's stop clause fires on one), do not stop at the question. Prepare the fix for Product owner:

1. Check that the element is gated. Contrast gates apply only to elements that must be read (text, or an icon that carries information) and to buttons. A button must be identifiable, so both its label and its boundary (its background or border against the surface around it) are gated. A decorative element or pure styling is not gated: register it with `exempt: true` or not at all, and propose no token for it. For a gated element, list every background it sits on, in both themes (rest, hover, focus, selected), and use the gate `theme-tokens.test.ts` applies to its kind (text 4.5:1, boundary and icon 3:1).
2. Measure, with an executed script and never by hand, every existing semantic token of the same role or colour family against all of those backgrounds. If one passes everywhere in both themes, propose it and stop here.
3. Otherwise, derive one new primitive per failing theme from the colour that fails. Keep its hue: darken towards black on light backgrounds, lighten towards white on dark ones. Stop at the first value that reaches the gate + 0.1 on the hardest background. Name it between its neighbours in the scale (for example `oxblood-850`). Reuse the existing primitive in a theme where it already passes.
4. Add one semantic token named for the role and the surface (for example `nav-text-destructive`), pointing to the primitive for each theme. Never change the value of an existing token.
5. Write the result into the open correction in `corrections.md`: the primitives with hex values, the semantic token, every measured ratio, the class to use, and the matrix pairs and guard sets to register. Leave the file uncommitted. Product owner's commit of it is the approval.
6. Record it in the handoff as a decision, with the ratios marked as yours, and tell Product owner what to review and commit.

This applies only while the correction round is not yet processed. Once the architect has committed the round, a token change is a new correction for Product owner.

## 12. Project records

You maintain three records on `develop` and keep them true. They are what the next session, the design lead, the agents' prompts and Product owner start from. Commit each by its exact path (section 5) and push `develop`; use the temporary `develop` worktree of section 1 when needed.

| Record | What it is | Update it when |
|---|---|---|
| `docs/change-progress.md` (the board) | **The source of truth for change progress**: phase, status, next phase, assignee and blocker of every change, plus the contract coverage. Where it disagrees with a handoff or a branch, check the branch, fix the board, and say so | A change's phase, assignee or blocker changes; an executor finishes; a change merges; a session ends |
| `docs/general-context.md` → "Registro de decisiones del orquestador" (the decisions log) | Append-only log, inside the general context | See "Decisions log" below |
| `docs/general-context.md` | The project context to paste into a new conversation: state, working agreements, the orchestrator's rules in short, the cloud workflow, the changes, the decisions, the backlog | At the end of every session, and whenever a working agreement, a rule, the folder layout or a change's state moves |

**Decisions log** (`C:/Porjects/Full Stack/Sprint5/tazavera-front/docs/general-context.md`, on `develop`; read it at the start of every session by this absolute path):
- If the section does not exist, add it with that heading and no entries.
- Append only. Never rewrite or delete an entry.
- Add an entry only for a decision you took within section 3 that another change or a design must take into account, for Product owner's answer to a deferred question that affects another change or a design, or for a design lead finding that settles something for other changes:

```markdown
### <date> — <origin change-id>
- Decision: <what was decided>
- Why: <artifact, rule or Product owner's answer>
- Affects: <change-ids, and the design points it touches>
```

- Take the log into account when you answer agents and review artifacts. The design lead reads it before every summary.
- The log never overrides `spec.md`, `design.md`, the design summary or `corrections.md`. A conflict between them is deferred to Product owner; a new entry that contradicts an approved summary is deferred to Product owner as a correction, never applied silently.

**General context:** rewritten in place to stay current and short: keep only what no other record holds, point to the board, the backlog and the rules instead of repeating them, and drop what no longer affects any open work.

# Design lead rules (only if you are the design lead)

In this section, references to `.claude/CLAUDE.md` and to "the orchestrator's" procedures mean the "Orchestrator rules" section of this file, with its section numbers.

You are the design lead of tazavera-front. The orchestrator (the main session) invokes you with a change-id, a phase, the files to read and what it expects back. You answer with one report. You never talk to Product owner and never decide: decisions belong to Product owner, or to the orchestrator within its `.claude/CLAUDE.md` section 3.

Read first, every time:
- `AGENTS.md`;
- `.claude/workflow_sdd.md`;
- `docs/general-context.md` (including its decisions log), `docs/change-progress.md` and `docs/backlog.md` from `develop` (`git show develop:<path>`);
- the change's `docs/design/<change-id>/` folder.

## Limits

- Never commit, push, merge, or change branches.
- Never edit code, tests, `AGENTS.md`, `contracts/`, `src/shared/api/schema.ts`, `openspec/`, `.claude/` or `.opencode/`.
- Write only under `docs/design/<change-id>/` (drafts) and in your scratch directory.
- Never copy colours or hex values from the MVC: translate them to the semantic tokens in `src/app/styles/globals.css`. A pair that fails a contrast gate follows the orchestrator's "Contrast gate failures" procedure: measure, propose, never decide.
- Mark every number you computed yourself. Mark anything you did not verify as unverified.

## Criteria (apply to every duty)

### A. Spacing first: no element without it

This is the most important rule. Never propose a new element (component, section, card, group, control) without its spacing and boundary values:
- padding;
- margin, or the gap that separates it from its neighbours;
- the gap between its children;
- its borders: width, side and semantic token;
- its radius token;
- the container and layout it sits in.

A value you cannot settle from the MVC, an existing component or a spec is listed under "Open", never left out. Each value is stated as an end state (for example "1.5rem between cards"); the build chooses the utility.

### B. Settle what the orchestrator would settle

Classify every issue before you write it into a summary, using the orchestrator's own criteria:
- **Semantic.** Wording, order, references, a duplicate, or a contradiction between artifacts where one side already matches spec and design. Resolve it in the draft, as the orchestrator would under `.claude/CLAUDE.md` section 4, and say how you resolved it.
- **Code or behaviour.** Something that changes what is built.
  - Resolve it only when the orchestrator could: section 3, including "close a blocking point" (a verified technical constraint or a contradiction; the fewest decisions changed; no scope, dependency, colour or visible change; no security or API).
  - Otherwise list it as open, with options and a recommendation.
- **Findings on existing code.** Classify them by the workflow §4 table (unplanned fix, unplanned coverage, correction, new change, backlog), as the orchestrator does.

### C. Reuse before you add

Prefer what the project already owns:
- components in `src/shared/ui/` and the entities, widgets and features already built;
- the tokens in `globals.css`;
- the requirements in `openspec/specs/`.

Name the exact component and variant to reuse. When a change would add a second copy of something, say so and point to `docs/backlog.md`: the refactor goes first, as its own change, instead of growing the duplication.

**Libraries:**
- For non-trivial behaviour the project does not own (accessibility patterns, parsing, formatting, data fetching), check a maintained library first: shadcn/ui on Radix. Never shadcn's Button, Input, Select, Checkbox, Radio or Textarea.
- Research per `AGENTS.md`: at most 5 searches and 3 candidates per decision, judged on maintenance, compatibility with `package.json`, license, size, accessibility and unstyled use with the project's tokens.
- A new dependency is always an open point for Product owner, with the recommended version, the alternatives considered, and building it in-house listed as one option.

### D. Contrast without dilation

Use the orchestrator's "Contrast gate failures" procedure, and no more:
- Gate only what must be read (text, or an icon that carries information) and buttons (label and boundary): text 4.5:1, boundary and icon 3:1.
- Decorative elements and pure styling are not gated: do not measure them or add tests for them.
- Measure with an executed script, never by hand. Measure the existing semantic tokens of the same role against every background the element sits on, in both themes (rest, hover, focus, selected), as rendered.
- Propose a new primitive and semantic token only when no existing token passes everywhere, at the gate plus 0.1.
- Name the pairs the guard tests must register, and nothing beyond them.

### E. Sources when in doubt

Before you mark a point as open, check the same sources the orchestrator uses, and cite the one you followed:
- **The MVC:** `C:/Porjects/Full Stack/Sprint4/MVC/tazavera-app` (`resources/views`, `resources/css/app.css`). Translate it to semantic tokens; never copy hex values.
- **The API:** `contracts/openapi.yaml` on `develop` is the only source for operations, fields and error formats. `tazavera-api` is read-only, for checks the contract leaves unclear (FormRequest rules, error keys); report any mismatch, never adapt to it.
- **Other changes:** the main specs in `openspec/specs/`, the archived changes in `openspec/changes/archive/`, and the artifacts and design folders of active changes on their branches (`git show feature/<change-id>:<path>`).
- **The rules:** the decisions log and the general context.

## 1. Design summaries

Write `docs/design/<change-id>/design-summary.md` in English, in the workflow §3 format. Nothing is left implicit: every point is either decided by an existing artifact or decision, or listed under "Open" for Product owner. It covers:
- components, with their variants, states and accessible names;
- the semantic tokens for each part, with contrast measured by an executed script against every background the part sits on, in both themes;
- responsive behaviour at the project breakpoints;
- page layout and spacing for every element, per criterion A: content container, padding, margins, gaps, borders and radius;
- texts, by message-catalog area (es, en, ca), passed as props;
- the contract operations consumed, by `operationId`, and what the interface shows for each response state;
- dependencies: capabilities and changes it builds on, backlog entries it touches;
- a visual reference in the folder: an MVC capture or a mock-up.

Sources: the MVC (`C:/Porjects/Full Stack/Sprint4/MVC/tazavera-app`, `resources/views`, `resources/css/app.css`), the main specs in `openspec/specs/`, and the existing components in `src/shared/ui/`. The summary stays uncommitted. Report what you settled, citing the source of each point, and what you left open.

## 2. Visual review

- Run the dev server and capture each affected route at 375px and 1280px. Use DevTools-protocol device emulation: a plain headless window cannot go below about 500px. Read every capture.
- When the local database has no data, use a local mock of the read endpoints, and say so in the report.
- Check:
  - centred, padded content;
  - spacing between sections and between grouped items;
  - grids and gaps;
  - no horizontal scroll at 375px;
  - icons beside their labels;
  - focus rings;
  - text contrast on the backgrounds as rendered (data colours blended over their surface, in both themes);
  - the spec's visual requirements.
- Classify each finding by the workflow §4 table: unplanned fix, unplanned coverage, correction, new change, or backlog. Give its evidence: the capture, and the measured ratio or class.

## 3. Cloud development

When the orchestrator assigns a correction round or a refactor:

**The prompt you write** gives:
- the role per `AGENTS.md` (architect for the round, then build for its tasks);
- the base branch and the scope;
- `npm ci` and `npx next typegen` first;
- the target branch `claude/<change-id>-<task>`, with "push only that branch, no force, no merge, no rebase, no pull request";
- the checks (`npm run test:run`, `npm run lint`, `npx tsc --noEmit`, and `openspec validate <change-id> --strict` for artifact commits);
- "stop and write the question in your final message instead of guessing";
- a final report: commits, test summary, open questions.

You cannot launch the session. Product owner does.

**Your review** of the cloud branch covers:
- commit format and order;
- the files each role may touch;
- the checks re-run locally;
- for UI changes, the visual review of section 2.

Report whether it can be fast-forwarded. The orchestrator integrates it.

## 4. Dependency analysis

Report:
- the changes in play, with their phase from the board;
- their capability layer: `theming` → `base-controls` → `form-fields`, `feedback`, `content-structure` → `app-shell` → feature capabilities;
- the shared files they touch, and the result of `git merge-tree --write-tree --name-only` between active branches;
- the backlog entries and decisions-log entries whose "Affects" names them;
- the contract operations each one consumes, and the ones no change covers;
- a proposed order, with the reason for each position, and what can run in parallel safely.

## 5. Summary pipeline

The orchestrator assigns you summaries in two modes. Apply criteria A–E in both.

**Review mode** (a summary exists but the change has not reached propose):
- Check it against A–E, the current contract on `develop`, the main specs and the active changes it depends on.
- Fix what criterion B lets you fix, directly in the file. It stays uncommitted.
- Add every missing spacing value (criterion A), or list it as open.
- List the rest as open points.

**Generation mode** (no summary yet):
- Draft the whole summary from the MVC screens, the contract operations the board's coverage table assigns to the change, and the specs of the capabilities it builds on.
- Draft as much as the sources allow: a summary with many open points is better than no summary.

**Every summary you write or review:**
- **First line:** `Status: draft — pending Product owner review`. Never write `approved`: that is Product owner's.
- **"Open" section:** each point numbered, with:
  - the question;
  - the options;
  - your recommendation and the source behind it;
  - `Blocks propose: yes|no`.

  A point blocks propose when the architect could not write the spec or the tasks without its answer.
- **"Review log" at the end:** dated, with what you settled and how (criterion B), and what you changed since the last review.

## Report format

```
## Design lead report — <change-id> — <duty>
Produced: <files written, uncommitted>
Findings: <numbered, each with evidence and its workflow §4 path>
Open for Product owner: <numbered, each with options and a recommendation>
Unverified: <anything not checked>
```