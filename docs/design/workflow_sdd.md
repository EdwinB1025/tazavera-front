# tazavera-front — Development workflow (OpenSpec + OpenCode)

How changes move from design to merge in this project, who does what, and which files and rules govern each step. The binding rules live in `AGENTS.md` and the agent permission files; this document explains how they fit together.

There are two workflows, chosen by the change's type (section 3):
- the **traditional workflow** (section 3a) for `Type: change`: new functionality, behaviour changes, corrections and any work that needs a decision from Product owner;
- the **refactor workflow** (section 3b, the fast lane) for `Type: refactor`: changes that keep behaviour (`AGENTS.md` → Refactor changes).

## 1. Actors and tools

| Actor | Model / tool | Role |
|---|---|---|
| Product owner | — | Designs the system with the orchestrator, decides, reviews, writes corrections, commits review rounds and configuration, approves merges into `develop` and merges into `master`. |
| Orchestrator | Claude Code (main session) | Holds the design conversations with Product owner: proposes and verifies design options, computes contrasts, reviews code and artifacts, prepares corrections; never decides. Runs both workflows on Product owner's behalf: types each change, assigns its next phase, launches and watches the executors, reviews and integrates their work, and keeps the project records (board, backlog, decisions log, handoffs, the generic rules of `AGENTS.md`). Its role per step is in sections 3a and 3b. Rules: `docs/agents/orchestrator.md`. |
| Design lead | Claude Code subagent (`.claude/agents/design-lead.md`) | Design and visual quality in both workflows: prepares the design summary after the design conversation, visual reviews, cloud prompts and the review of their results, dependency analyses. Its role per step is in sections 3a and 3b. Reports to the orchestrator; never decides. Rules: `docs/agents/design-lead.md`. |
| Architect agent | OpenCode (`xiaomi/mimo-v2.6-pro`) or a Claude cloud session | Writes and maintains OpenSpec artifacts (proposal, specs, design, tasks), researches libraries, validates, verifies and archives. Never implements. Rules: `docs/agents/architect.md`. |
| Build agent | OpenCode (`xiaomi/mimo-v2.6-pro`) or a Claude cloud session | Implements tasks, test-first, one commit per task. Applies unplanned fixes and coverage. Never touches OpenSpec artifacts beyond task checkboxes. Rules: `docs/agents/build.md`. |

OpenSpec runs with the **core profile plus `verify`**: `/opsx:explore` (installed, not used in the workflow), `/opsx:propose`, `/opsx:update`, `/opsx:sync`, `/opsx:apply`, `/opsx:verify`, `/opsx:archive`. Delivery is `both` (skills `openspec-*` and commands `/opsx-*`). Each command file in `.opencode/commands/` declares the agent that runs it.

## 2. Repository layout for the workflow

| Path | Owner | Content |
|---|---|---|
| `AGENTS.md` | Product owner; the orchestrator keeps its generic rules current | Common rules for every agent and the table of role files. Read-only for agents. Generic rules only: code-specific rules go to the design summary or design.md. |
| `docs/agents/<role>.md` | Product owner; the orchestrator keeps its generic rules current | One rule file per role (architect, build, orchestrator, design lead): start checklist, the workflow steps it owns, authority, stop conditions, report. Read-only for agents. |
| `docs/design/workflow_sdd.md` | Product owner; the orchestrator keeps it current | This document: the development process. |
| `.opencode/agents/*.md` | Product owner | Model and permissions per agent. |
| `openspec/config.yaml` | Product owner | Project context and the list of capabilities. |
| `openspec/specs/<capability>/spec.md` | Architect, via archive only | Main specs: what the app does today. |
| `openspec/changes/<change-id>/` | Architect (build: checkboxes) | Proposal, delta specs, design, tasks of an open change. |
| `docs/design/<change-id>/design-summary.md` | Design lead drafts, Product owner approves (architect: `## Propose status`) | Design decisions taken in chat. Source of truth for the architect. Traditional workflow only. |
| `docs/design/<change-id>/corrections.md` | Product owner (architect: `### Status`) | Review rounds that change spec or design. |
| `docs/design/<change-id>/handoff.md` | Orchestrator | Sessions, decisions, points closed for review, deferred questions of a change. |
| `docs/design/backlog.md` | Product owner and orchestrator (architect: removes resolved entries on archive) | Refactor candidates in priority order. Source of the refactor workflow. |
| `docs/design/change-progress.md` | Orchestrator | The board: phase, assignee and blocker of every change. |
| `docs/design/general-context.md` | Orchestrator | Project context and the decisions log. |
| `contracts/openapi.yaml` | Product owner | API contract, copied from the backend. Never edited by agents. |
| `qa/` | Product owner (through reduction plans) | The QA suite (section 3c). |

One name everywhere: the change-id (verb + object, kebab-case) names the branch `feature/<change-id>`, the change folder and the design folder.

### Branches

| Branch | Content |
|---|---|
| `master` | Production. Product owner merges into it after testing `develop` (UAT). |
| `develop` | Integration of traditional changes; receives `qa` at the end of each refactoring round. |
| `qa` | Integration of refactor changes. Takes in `develop` at the start of each round. |
| `feature/<change-id>` | One per change: from `develop` (traditional) or from `qa` (refactor). |

### Capabilities

`theming`, `base-controls`, `form-fields`, `filtering`, `feedback`, `content-structure`, `app-shell`, `auth`, `landing`, `user-account`, `offering-catalog`, `offering-management`, `evaluations`. Each change belongs to one capability; the commit scope is always the capability of the change.

## 3. Change type: which workflow

Every change and every backlog entry carries a type. The orchestrator assigns it when the change goes on the board or the entry enters the backlog, and checks it again before each refactoring round.

| Type | When | Workflow |
|---|---|---|
| `refactor` | All of these hold: what users see, the requests sent to the API and every requirement in `openspec/specs/` stay the same; it adds no dependency, token, text, screen or test; it touches no security (CSP, headers, tokens, the auth flow, credential storage); and it has no open decision for Product owner | Refactor workflow (3b), the fast lane |
| `change` | Any of the above fails: new functionality, a behaviour or design change, a dependency, security, new texts or spec wording, new tests, or an open decision | Traditional workflow (3a) |
| `refactor` by Product owner's order | Product owner orders the entry "fast lane" (every AUT correction included) and its backlog entry settles the end state, even when it adds behaviour, texts, screens or tests | Refactor workflow (3b), with one test per new scenario (`AGENTS.md` → Refactor changes) |

- When in doubt, the type is `change`.
- An entry typed `change` only because of an open decision becomes `refactor` once Product owner answers it, if the answer keeps behaviour; otherwise it stays `change`.
- The type is recorded on the board, in the backlog entry (`Type:`) and, for a refactor, on the first line of the proposal (`Type: Refactor (fast lane)`). A fast lane by Product owner's order is recorded in the backlog entry with its date.
- An agent that finds a refactor needs a behaviour change or an unsettled decision stops; the orchestrator retypes it `change` and it continues in the traditional workflow.

## 3a. Traditional workflow

```
Design in chat ─► summary draft (design lead) ─► handoff to Product owner ─► approved summary ─► branch ─► /opsx:propose ─► review artifacts
      ▲                       ▲                            │                                                                     │
      │                       └──── answers to questions ──┘                                                                     ▼
   merge ◄── archive ◄── /opsx:verify ◄── visual review ◄── review code ◄── /opsx:apply ◄────────────────────────────────────────┘
                              │                 │
                              └── findings ─────┴─► unplanned fix / coverage  (build)
                                                └─► correction round          (architect → build)
```

| # | Step | Who does it | Orchestrator | Design lead |
|:-:|---|---|---|---|
| 1 | **Design conversation.** Decisions taken by Product owner with the orchestrator: components, variants, states, tokens with computed contrast, responsive behaviour. | Product owner, orchestrator | Proposes and verifies options and contrasts; puts the change on the board as `Type: change`, phase Summary, and assigns the draft to the design lead | — |
| 2 | **Summary draft** in `docs/design/<change-id>/design-summary.md` (English), first line `Status: draft — pending Product owner review`. Every open point is either settled or listed as a question, marked "Blocks propose: yes/no". | Design lead | Checks the draft against the design lead's criteria and sends it back when it fails them; settles the open points its rules allow and records each as a decision | Prepares the draft from the chat conversation, the visual reference (MVC capture or mock-up), the contract operations, the capability specs, the decisions log and the backlog |
| 3 | **Handoff to Product owner.** The draft and its questions, with options and a recommendation for each. | Orchestrator | Commits the draft (on `develop` for a change without a branch), records the questions in the handoff under "Deferred to Product owner" and presents them to Product owner | — |
| 4 | **Answers and approval.** Product owner answers the questions; the summary is updated until no point blocks propose; Product owner approves it by committing it with `Status: approved`. | Product owner | Relays the answers to the design lead; marks each answered question in the handoff; never launches propose before approval | Updates the draft with the answers |
| 5 | **Branch** `feature/<change-id>` from `develop`. | Orchestrator | Creates the worktree, installs, copies the agent profile; checks the dependency order and simulates merges with parallel branches | Analyses dependencies across capabilities when asked |
| 6 | **Propose.** `/opsx:propose`: reads the design folder and the backlog, researches only open decisions, writes the artifacts, `openspec validate --strict`, `## Propose status`, commit `docs(<capability>): propose <change-id>`. | Architect | Launches it; checks the commit and the validation; removes duplicates across spec, design and tasks | — |
| 7 | **Artifact review.** Each review is one commit `docs(<capability>): update <artifact> for <change-id>`. | Product owner, architect | Fixes wording, order and references (not requirements) before the review; sends Product owner's review message to the architect | — |
| 8 | **Apply.** `/opsx:apply`: one commit per task, tests first, checkbox in the same commit, related tests after each task, full checks after the last (section 3c), final report. | Build | Classifies the weight (OpenCode for light tasks, cloud for corrections, security or long scope); runs one task per run; moves a stalled apply to the cloud; fixes artifact conflicts; closes blocking points its rules allow and records them under "Closed for review" | Visual review after each task that renders UI |
| 9 | **Code review.** Findings are classified (section 4). | Product owner, orchestrator | Reviews the code with Product owner; routes unplanned fixes and coverage to the build; prepares corrections for Product owner | Reports findings by the same paths |
| 10 | **Verify.** `/opsx:verify <change-id>`. No archive while CRITICAL findings remain or unplanned-fix warnings are unresolved and not deferred. | Architect | Launches it and reports the result to Product owner, classifying each finding | Visual review before the archive (375 and 1280 px) |
| 11 | **Archive** on Product owner's request: delta specs into `openspec/specs/`, resolved backlog entry removed, commit `chore(openspec): archive <change-id>`. | Architect | Launches it only on Product owner's request, after Product owner has checked the change in a real browser and reviewed the points closed for review | — |
| 12 | **Merge** into `develop`. | Orchestrator, with Product owner's confirmation | Merges, removes the worktree and the branch, updates the board | — |
| 13 | **Release.** Product owner tests `develop` and merges it into `master`. | Product owner | Runs the full QA suite before the merge into `master` and reports | — |

Explore (`/opsx:explore`) is not part of the workflow: the design lead's draft and Product owner's answers take its place.

Every `/opsx:*` step runs its OpenSpec skill. Where the commands are not installed (a Claude cloud session), the agent reads `.opencode/skills/<skill>/SKILL.md` and follows it (`AGENTS.md` → OpenSpec skills); the cloud prompt names each skill file.

## 3b. Refactor workflow

Refactor changes keep behaviour: what users see, the requests sent to the API and every requirement in `openspec/specs/` stay the same. They come from backlog entries typed `refactor` (section 3) and run in rounds on the `qa` branch, while `develop` is in UAT on `master`. A fast lane by Product owner's order follows the same steps; it may add behaviour, with one test per new scenario.

Each change of a round runs in one cloud session that the orchestrator launches as a scheduled run. The session reads `AGENTS.md`, the role file of each role it plays (architect, then build) and this section, and follows each phase's skill file.

```
develop ──► qa ──► feature/<change-id> (cloud: propose ─► apply ─► full checks ─► verify ─► archive) ──► qa
                                                                                                         │
master ◄── Product owner tests develop ◄── qa into develop ◄── visual check of the round ◄────────────────┘
```

| # | Step | Who does it | Orchestrator | Design lead |
|:-:|---|---|---|---|
| 1 | **Round plan.** The next backlog entries typed `refactor`, by the backlog's priority order and dependencies. | Orchestrator | Checks each entry's type again; decides the round and which changes run in parallel (merge simulation); updates the board | Groups the entries and analyses their dependencies |
| 2 | **Start.** `develop` is merged into `qa`. | Orchestrator | Merges and pushes `qa` | — |
| 3 | **Propose** from the backlog entry and the review it cites (`openspec-propose`): `Type: Refactor (fast lane)` on the proposal's first line, a spec delta that states the property kept or established (or, for a fast lane by order, the new requirements with their scenarios), propose status at the end of `proposal.md`. No design summary, explore or artifact review. | Architect (cloud) | Launches the cloud session on `feature/<change-id>` from `qa` as a scheduled run and watches it (routine runs and branch; the assignment loop when no background watch can run). Writes the prompt when the design lead cannot run (plan usage unknown or at 80% or more) | Writes the cloud prompt: roles and their role files, the workflow steps, the skill file of each phase, base and target branch, checks |
| 4 | **Apply** (`openspec-apply-change`). One commit per task; related tests, typecheck and lint after each task. No new tests (a fast lane by order: one test per new scenario); existing tests keep their assertions. | Build (same cloud session) | Watches the session; a session that stalls is relaunched | — |
| 5 | **Full checks.** Validation suite, QA suite, typecheck, lint, build; failures fixed in their own commit. | Build | — | — |
| 6 | **Verify and archive** (`openspec-verify-change`, `openspec-archive-change`). Verify with no CRITICAL, then the archive without waiting for Product owner. | Architect (same cloud session) | — | — |
| 7 | **Integration** into `qa`. | Orchestrator | Reviews the branch (commit format, scope, no new tests or one per new scenario for a fast lane by order, no changed assertions, each phase's skill in the run log), re-runs the full checks (or, when npm cannot run locally, takes the session's counts and records it in the handoff), merges into `qa` by fast-forward, writes the handoff | Reviews the result for behaviour drift against the backlog entry |
| 8 | **Round end.** `qa` is merged into `develop`. | Orchestrator | When the full checks were not re-run locally, runs them on `qa` in a read-only cloud session with a merge simulation; then merges and pushes `develop`; updates the board and the backlog | Visual check of the screens the round touched (375 and 1280 px), compared with `develop` |
| 9 | **Release.** Product owner tests `develop` and merges it into `master`. | Product owner | Runs the full QA suite before the merge into `master` and reports | — |

If a refactor turns out to need a behaviour change or a decision its backlog entry does not settle, the agent stops, the orchestrator retypes it `change` and it moves to the traditional workflow.

## 3c. Test suites

| Suite | Content | Runs |
|---|---|---|
| Validation (`npm run test:run`) | One test per spec scenario, plus the guard tests | Only the related tests after each task (`npx vitest related <files> --run`); the whole suite after the last task of every change |
| QA (`qa/`; `npm run test:qa` runs both) | Every other test: per-locale and per-variant repeats, internal helpers, edge and error paths beyond the scenarios | After the last task of every refactor change, and before each merge of `develop` into `master` |

- After the last task, every change also runs the typecheck, lint and `npm run build`.
- A QA test whose code a refactor moves gets a new import or location, never new assertions.
- A QA test that fails after a specified behaviour change is updated; any other failure is a regression.

## 4. Handling findings

Every finding from a review, from verify or from the build's report follows exactly one path.

| Finding | Path |
|---|---|
| Defect in behaviour already stated in spec/design, change not merged | **Unplanned fix** — straight to the build |
| Missing test for behaviour already specified and implemented | **Unplanned coverage** — straight to the build |
| Change to specified behaviour or to a design decision | **Correction round** — `corrections.md` → architect → tasks → build |
| New functionality | **New change** — traditional workflow |
| Defect in code already merged | **New change** |
| Refactor without behaviour change (duplication across files, shared styles or helpers, size or complexity over the limits) | **Backlog** → refactor workflow |

Quick test: if after the fix spec.md or design.md would need editing to stay true, it is not an unplanned fix.

### Unplanned fix and coverage

- Fix: one commit `fix(<capability>): …` with the reproducing test and the fix; body `Unplanned fix: <spec or design reference>`.
- Coverage: one commit `test(<capability>): …`; body `Unplanned coverage: <spec reference>`.
- Neither checks off a task; both appear in the build's final report.

Message template for the build:

```
Unplanned fix and coverage for <change-id> (branch feature/<change-id>).
Do not touch openspec/ or docs/.

Unplanned fix (fix(<capability>)):
1. <file>: <defect>. End state: <exact behaviour/classes/attributes>.
   Reproducing test: <file>, fails on <case>, passes on <case>.

Unplanned coverage (test(<capability>)):
2. <scenario>: <what the test asserts>.

Run the related tests, npm run lint and npx tsc --noEmit after each commit, and the full checks after the last one.
```

### Refactor candidates

The build refactors on its own only inside the files of its current task, as part of that task's commit. Anything wider (duplication across files, a new shared helper, utility or constant, a unit over the size limits it cannot keep) is reported as a refactor candidate in its final report.

1. Product owner or the orchestrator adds the candidates worth keeping to `docs/design/backlog.md`, in its priority order: what is duplicated, where, why it would pay off, owning capability, proposed change, open decisions, status.
2. Before each propose, the architect reads the backlog. If the change would add to a duplication or touch the same code, it stops and recommends the refactor as its own change first. It never folds a backlog entry into the change being proposed.
3. The orchestrator types each entry (section 3). A `refactor` entry goes to the next refactoring round (section 3b); a `change` entry goes to the traditional workflow (section 3a), after Product owner answers its open decision if it has one.
4. When that change is archived, the architect removes the entry from the backlog in the archive commit.

Entry format of `docs/design/backlog.md`:

```markdown
## R<n> — <title>

- **Duplicated:** <code or classes>
- **Where today:** <files>
- **Why it pays off now:** <upcoming change that would add copies>
- **Owning capability:** <capability>
- **Proposed change:** <change-id>
- **Open decision (Product owner):** <options, if any>
- **Type:** refactor | change
- **Status:** proposed | accepted | deferred
- **Affects:** <changes that should wait for it or reference it>
```

### Correction round

1. Product owner appends a round to `corrections.md` and commits it: `docs(<capability>): report review round <N> for <change-id>`.
2. The orchestrator launches the round in a cloud session; the design lead writes its prompt and reviews its result.
3. The architect updates spec/design where behaviour or a decision changes, appends the corrections to `tasks.md` as a new section, appends a dated `### Status`, validates and commits `docs(<capability>): apply review round <N> for <change-id>`.
4. The build implements the new tasks with `/opsx:apply`.

Format of `corrections.md`:

```markdown
# Corrections — <change-id>

## Round 1

1. <component/file>: <what is wrong>. End state: <exact classes, attributes or behaviour>.
   Existing tests affected: <test and assertion to update, or "none">.
   New test: fails on <case>, passes on <case>.

### Status
(appended by the architect)
```

Each correction must state its end state; the architect stops and asks when it is not explicit.

## 5. Commit conventions

`<type>(<capability>): <imperative, lowercase, no period>` + footer `Refs: <change-id>`.

| Phase | Who | Commit |
|---|---|---|
| Propose | Architect | `docs(<capability>): propose <change-id>` |
| Artifact review | Architect | `docs(<capability>): update <artifact> for <change-id>` |
| Review round report | Product owner | `docs(<capability>): report review round <N> for <change-id>` |
| Review round | Architect | `docs(<capability>): apply review round <N> for <change-id>` |
| Types | Build | `feat(<capability>): add types for <object>` |
| Test (task) | Build | `test(<capability>): <what it verifies>` |
| Implementation | Build | `feat` / `fix` / `refactor` `(<capability>): <what it does>` |
| Unplanned fix | Build | `fix(<capability>): <what it fixes>` |
| Unplanned coverage | Build | `test(<capability>): <what it verifies>` |
| Last task without files | Build | `chore(<capability>): complete tasks for <change-id>` |
| Archive | Architect | `chore(openspec): archive <change-id>` (includes `docs/design/backlog.md` when the change resolves an entry) |
| Handoff | Orchestrator | `docs(<capability>): update handoff for <change-id>` |
| Board, general context | Orchestrator | `docs: update change progress`, `docs: update general context` |

A task's `test(...)` commit may fail only on the behaviour or module the next commit adds; every other commit passes the tests related to its files, lint and typecheck. The full checks run once after the last task (section 3c). No agent pushes, merges, rebases, amends, resets or force-anything; the orchestrator pushes and merges as its rules allow.

## 6. Enforcement: rules vs permissions

`AGENTS.md` and the role files in `docs/agents/` say what each agent must do; the permission files in `.opencode/agents/` block what it must never do, regardless of its reasoning. Rules are evaluated in order and the last matching rule wins.

| | Architect | Build |
|---|---|---|
| Edit | Only `openspec/changes/` (not `archive/`), `design-summary.md`, `corrections.md`, `docs/design/backlog.md` | Everything except `openspec/` (bar `tasks.md`), `docs/`, `AGENTS.md`, `contracts/`, `schema.ts`; `package*.json` asks |
| OpenSpec CLI | All; `archive` asks | Read-only: `status`, `instructions`, `list`, `show` |
| Skills | `openspec-apply*` denied | `openspec-propose/explore/update/sync/verify/archive*` denied |
| Shell | Unlisted commands ask; checks (`test`, `lint`, `build`, `tsc`) allowed | Unlisted commands ask; `npm run`, `tsc`, `vitest`, `node -e` allowed; installs ask |
| Git | Stage only its own files; no bulk staging | No staging of `openspec/` (bar `tasks.md`), `docs/`, `AGENTS.md`; no bulk staging |
| Both | No push, merge, rebase, reset, checkout, switch, amend, `--no-verify` | |

Every OpenSpec shell rule exists twice, for `openspec …` and `npx openspec …`, because the agents call the CLI through `npx`.

Role identification: agent files cannot carry a prompt (the body replaces OpenCode's built-in prompt), so each agent deduces its role from the command it runs (`AGENTS.md` → Roles and rule files) and reads its role file in `docs/agents/`, and each command file binds its agent. A cloud session receives its role in the orchestrator's prompt, which names the role file and the skill files to follow.

## 7. Conventions agents must not re-derive

- Tailwind 4 utility names come from the token name after the namespace: `--color-text-link` → `text-text-link`.
- Components use only semantic tokens (colors and radii); guard tests enforce it.
- Icons come only from `src/shared/ui/icons.ts`.
- jsdom has no CSS: tests assert exact class names with variant prefixes; visual correctness relies on guards, the build and the design lead's visual reviews.
- Components with event handlers, state, effects or browser APIs need `"use client"`.
- Dependencies are added only with Product owner's approval; the architect may propose libraries in design.md after bounded research (5 searches, 3 candidates per decision).

## 8. Keeping agents efficient

Rules added after observing token-heavy reasoning:

- Build: one-line plan per task, detailed analysis only when starting a task, never trace code by hand (run a quick check instead), implement the minimum, refactor only inside the current task's files, run only the related tests per task, never re-question settled rules.
- Architect: write artifact text directly in the edits, record end states not implementations, do not predict test results, minimal spec wording.
- Reviews and corrections state exact end states, affected existing tests, and the pass/fail cases of new tests. Most wasted reasoning in past runs came from instructions without them.

## 9. Rule improvements, in order of adoption

How the rules evolved: first by reading the reasoning threads of the architect and the build to find where they wasted effort or went wrong, then from what Product owner and the orchestrator ran into while delivering. Dates come from the `AGENTS.md` history; "—" marks an orchestrator-side rule whose exact date is not in the repository.

| # | Date | Improvement | What triggered it | Where it lives |
|:-:|---|---|---|---|
| 1 | 2026-09-29 | Feature-Sliced Design: layers, imports only downwards, `app/` for routing only | Project structure | `AGENTS.md` → Architecture |
| 2 | 2026-09-28/30 | The contract is the only source of truth; generated types are never edited | Agents inventing fields and error formats | `AGENTS.md` → API contract |
| 3 | 2026-10-01 | Split into common rules and one section per role; design summary as the architect's source of truth, with `## Propose status` | Agents mixing roles; the architect re-deciding settled design | `AGENTS.md` → Roles and rule files; `docs/agents/architect.md` → Design context |
| 4 | 2026-10-02 | Build working method from its reasoning threads: plan once, check facts by running commands instead of reasoning, the simplest implementation, at most two alternatives, stop on contradictions | Build threads that traced code by hand and compared many options | `docs/agents/build.md` → Working method |
| 5 | 2026-10-02 | Correction flow: rounds in `corrections.md`, the architect turns them into tasks, the build implements only tasks | Corrections implemented straight from review messages | `AGENTS.md` → Review findings flow |
| 6 | 2026-10-02 | Architect working method from its reasoning threads: write artifact text directly in the edit, record end states not implementations, do not predict test results, smallest spec wording | Architect threads that drafted every section twice and designed the build's code | `docs/agents/architect.md` → Working method |
| 7 | 2026-10-02 | Unplanned fix and unplanned coverage as the two paths for findings that change no decision; the backlog for refactor candidates | Small defects forced into full correction rounds | `AGENTS.md` → Review findings flow; section 4 |
| 8 | 2026-10-02 | Bounded research (5 searches, 3 candidates) and no research against settled decisions or existing code | Long library searches for things already decided or built | `docs/agents/architect.md` → Research |
| 9 | 2026-10-02 | Read the current state by command at the start of every request; no deliberation on tool mechanics or cosmetics; one path per `git add`; write code directly in the edit; one probe for ambiguous tasks, never reverse a stated decision | Threads that relied on stale outputs, debated whitespace or batching, and flip-flopped | `AGENTS.md` → Working method; `docs/agents/build.md` → Working method |
| 10 | 2026-10-02 | Tasks state the exact source text a test asserts only when design.md defines it; otherwise the expected behaviour | Tests asserting paraphrases; tasks over-prescribing classes | `docs/agents/architect.md` → Tasks |
| 11 | 2026-10-04 | One worktree per change; agents edit only in the worktree they started in | Two agents working in parallel on one checkout | `AGENTS.md` → Working method |
| 12 | — | Orchestrator (Claude Code) runs the agents: one task per Build run, handoff per change, artifact clean-up and duplicate removal before each Build run, points closed for review | Product owner relaying every message by hand | `docs/agents/orchestrator.md` §4–7 |
| 13 | — | Design lead subagent: summaries, visual reviews with captures at 375 and 1280 px, cloud prompts; visual check after each UI task | jsdom cannot see layout; visual defects found late | `docs/agents/design-lead.md`; section 3a |
| 14 | — | Contrast gate procedure: only readable elements and buttons are gated; a failing pair gets a same-hue primitive and a semantic token, measured by script | Agents stopping on contrast questions, or gating decorative elements | `docs/agents/orchestrator.md` §11 |
| 15 | — | Board, general context and append-only decisions log on `develop` | Decisions lost between sessions and changes | `docs/agents/orchestrator.md` §12 |
| 16 | 2026-10-06 | Heavy work (correction rounds, security, long applies) goes to Claude cloud from the start; a stalled or failed OpenCode run moves to the cloud without waiting | OpenCode outages and stalled runs | `docs/agents/orchestrator.md` §7, §9 |
| 17 | 2026-10-07 | Orchestrator autonomy: it closes blocking points that keep every settled decision, and resolves merge conflicts with recorded resolutions | Work stopped overnight waiting for answers | `docs/agents/orchestrator.md` §3 |
| 18 | 2026-10-08 | Tests verify only spec scenarios, one test per scenario, plus guards; refactors add no tests; the rest moves to the QA suite through the reduction plan | 2,246 test cases, too many to manage | `AGENTS.md` → Testing |
| 19 | 2026-10-08 | No new guard tests: one general test per rule that lists every offender | Guards multiplying per token and per component | `AGENTS.md` → Testing |
| 20 | 2026-10-08 | SOLID and code-structure rules from the technical review: imports inside a segment, same-layer composition, public index scope, shared request client, requests in the `api` segment, reuse before copying, one component per variant, size and complexity limits. Generic only; code specifics go to the summary or design.md | ISO/IEC 25010 review: duplication, cycles, layer violations, oversized units | `AGENTS.md` → Architecture, Code structure |
| 21 | 2026-10-08 | Code-structure rules also checked by ESLint built-in rules, as warnings first (R39) | Rules that only review enforces | `docs/design/backlog.md` R39 |
| 22 | 2026-10-08 | Two test suites; related tests after each task, full checks (validation suite, typecheck, lint, build) after the last task; the QA suite for refactors and before each release | Full suite run after every task; QA suite unreachable from the cloud | `AGENTS.md` → Testing; section 3c |
| 23 | 2026-10-08 | Change type (`refactor` / `change`) decides the workflow; the refactor fast lane on `qa` without design summary or artifact review; archive on passing checks | Refactors with a clear goal waiting on design steps they do not need | `AGENTS.md` → Refactor changes; sections 3 and 3b |
| 24 | 2026-10-08 | Explore removed from the workflow; the design lead drafts the summary and the orchestrator hands it to Product owner with questions; the orchestrator holds the design conversations | The workflow as actually practised | Sections 1 and 3a |
| 25 | 2026-10-11 | One rule file per role in `docs/agents/` (start checklist, workflow steps owned, authority, stop conditions, report); `AGENTS.md` keeps only the common rules; every phase follows its OpenSpec skill file, also in cloud sessions; fast lane by Product owner's order may add behaviour with one test per new scenario; the orchestrator launches every cloud session | A cloud session that skipped the skills; an orchestrator that skipped its start reading and the design lead's steps | `AGENTS.md` → Roles and rule files, Workflow, OpenSpec skills, Refactor changes; `docs/agents/` |
| 26 | 2026-10-11 | The communication artifacts (board, general context with the decisions log, backlog, this workflow) live in `docs/design/`, next to each change's design folder | One place for everything agents and Product owner exchange | Section 2 |

## 10. Known limits

- Permissions work per file, not per section: the architect's limit to `## Propose status`, `### Status` and to removing only the resolved backlog entry relies on `AGENTS.md`.
- `/opsx:verify` is model judgement, not a deterministic test: it complements review, guards and the test suites.
- `openspec update` may regenerate command files; check that each `/opsx-*` command keeps its `agent` field after updating OpenSpec.
- `openspec validate --strict` requires a spec delta, so a refactor must state something observable it keeps or establishes; if a refactor has nothing to state, decide case by case.
- Running only the related tests per task can let a commit break an unrelated test; the full checks after the last task catch it before verify.
- A Claude cloud session has no `/opsx:*` commands and no `.claude/`: it gets its rules from `AGENTS.md`, `docs/agents/` and this document, and its skills from `.opencode/skills/`, all named in its prompt. It cannot reach this machine, so visual checks with the local API stay with the local design lead.
- `.claude/` is protected while the orchestrator runs in don't-ask mode: its entry files are updated by Product owner.
