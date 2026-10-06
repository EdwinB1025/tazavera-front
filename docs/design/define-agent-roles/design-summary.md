# Design summary — define-agent-roles

- Change-id: `define-agent-roles`
- Kind: orchestration configuration, kept on `develop`. No OpenSpec capability, no spec delta, no application code. It does not go through `/opsx:propose`: Product owner reviews this summary and the two drafts beside it, then applies them himself (the orchestrator never edits its own rules).
- Depends on: `docs/change-progress.md`, `docs/general-context.md`, `docs/orchestrator-decisions.md`, `docs/backlog.md` on `develop`; the current `.claude/CLAUDE.md` (sections 1–8) and `.claude/workflow_sdd.md`.
- Value sources in this folder: `draft-claude-md.md` (text added to `.claude/CLAUDE.md`), `draft-design-lead.md` (the subagent definition).
- Visual reference: not applicable (no interface).

## 1. Goal

Two Claude agents with separate jobs, so that work assignment and design quality stop depending on one session doing both:

1. **Orchestrator.** The main Claude Code session. Keeps every rule of the current `.claude/CLAUDE.md` (sections 1–8). Adds one job: it **assigns** the next step of each change on the progress board to the right executor (OpenCode architect, OpenCode build, Claude cloud session, or the design lead), in an order that respects the dependencies across capabilities and features, the decisions log, the agent rules, the OpenSpec rules and the backlog.
2. **Design lead.** A Claude Code subagent (`.claude/agents/design-lead.md`) that the orchestrator invokes. Four duties: writes design summaries; reviews the rendered interface; plays the architect or build role in cloud sessions for correction rounds and refactors; analyses dependencies across capabilities and proposes an order.

## 2. Decisions

### 2.1 Form

- The orchestrator stays the main session with `.claude/CLAUDE.md`. The design lead is a subagent the orchestrator calls with the Agent tool. One point of control: only the orchestrator talks to Product owner, launches OpenCode, integrates branches and commits.
- The design lead never talks to Product owner directly. It returns a report to the orchestrator: what it produced, its findings, and its open questions. The orchestrator relays them or records them in the handoff.

### 2.2 What the orchestrator keeps unchanged

Sections 1–8 of `.claude/CLAUDE.md`, word for word, with only these edits:
- **§1 Folders:** `tazavera-front` is no longer always on `develop`. Before a step that needs `develop`, check `git worktree list`; if `develop` is not checked out anywhere, use a temporary worktree and remove it after (as done on 2026-10-06).
- **§3 "You never":** the push prohibition gets the exception defined in the new cloud section (§10 of the draft). The wording comes from Product owner's review, not from the orchestrator.
- **§6:** both OpenCode agents (architect and build) run on `xiaomi/mimo-v2.6-pro`. `scaleway/glm-5.2` is discarded (Product owner, 2026-10-06); `workflow_sdd.md` §1 is updated to match.

### 2.3 New in the orchestrator: assigning work (§9 of the draft)

Every session starts from the board (`docs/change-progress.md`), then reads the general context, the decisions log, the backlog and the handoff of each active change.

**Who does each phase:**

| Next phase | Assigned to | Notes |
|---|---|---|
| Summary (to write) | Design lead | Product owner approves and commits it |
| Explore, Propose, artifact update, Verify, Archive | Architect (OpenCode) | As today |
| Apply (planned tasks) | Build (OpenCode) | As today, one task per run |
| Unplanned fix or coverage | Build (OpenCode) | Workflow §4 template |
| Correction round, refactor change | Claude cloud | Product owner launches it; the orchestrator prepares the prompt, pushes, integrates |
| Visual review after each UI task and before archive | Design lead | Local only: needs the API, the mock and a browser |
| Ordering of the next work | Design lead (analysis) → orchestrator (decision within §3) | Product owner decides anything outside §3 |
| Merge | Orchestrator | Always with Product owner's confirmation |

**Fallbacks:**
- If the OpenCode provider stalls or has no balance, a task may move to a Claude cloud session with Product owner's approval.
- If a cloud session cannot run, the work goes back to OpenCode.

**Dependency rules** (applied before assigning anything):
1. **Layering.** `theming` → `base-controls` → `form-fields`, `feedback`, `content-structure` → `app-shell` → feature capabilities (`landing`, auth, evaluations, offerings, user account, filtering). A change that needs a shared piece from a lower capability waits for the change that owns it to merge. Otherwise, the shared piece is split out as its own change.
2. **Backlog.** A backlog entry whose "Affects" names the change is scheduled first, as its own refactor change. Its owner is the capability that owns the shared code.
3. **Contract.** Only operations present in `develop`'s `contracts/openapi.yaml`. The coverage table on the board says which change consumes each operation.
4. **Shared files.** Before assigning parallel work to two active branches, simulate their merge (`git merge-tree`). If they conflict on the same files, order them, and write the expected resolution in both handoffs, as Q-merge does for `add-auth`.
5. **Decisions log.** An entry whose "Affects" names the change is part of that change's prompt.
6. **One executor per branch at a time.** Never an OpenCode run and a cloud session on the same branch. Never two architect runs on the same worktree.

**The board:**
- The orchestrator updates the row of a change every time its phase or its assignee changes.
- The board lives on `develop`. Open point 4.4: who commits it.

### 2.4 New in the orchestrator: cloud sessions (§10 of the draft)

The hybrid workflow decided on 2026-10-06, as recorded in `docs/general-context.md` §4:
- OpenCode does the planned applies; Claude cloud does correction rounds and refactors.
- Product owner launches each session (`claude --cloud` needs an interactive terminal); the orchestrator writes the prompt.
- The cloud works on `claude/<change-id>-<task>` and pushes only that branch.
- The orchestrator fetches it, reviews it, re-runs the checks locally, integrates it with `--ff-only`, pushes the change's branch and records it in the handoff.
- The environment is `Default`, with an empty setup script; the prompt itself runs `npm ci` and `npx next typegen`.
- The push permission is limited to `develop`, `feature/*` and `fetch`, without force.

### 2.5 The design lead (draft-design-lead.md)

**Duties:**
1. **Design summaries.** Written in the workflow §3 format, in English, under `docs/design/<change-id>/`. They cover:
   - components, variants and states;
   - semantic tokens, with contrast measured by an executed script;
   - responsive behaviour;
   - page layout: container, spacing, grids, gaps (the lesson from `add-landing` round 3);
   - a visual reference: an MVC capture or mock-up;
   - every open point listed.

   They are drafts until Product owner commits them.
2. **Visual review.**
   - Captures at 375px and 1280px with DevTools device emulation. A plain headless window cannot go below about 500px.
   - Contrast measured by script, against the backgrounds as rendered.
   - The MVC translated to semantic tokens, never copying hex values.
   - Findings are classified by the workflow §4 table, and the design lead says which path each one takes.
3. **Cloud development.**
   - When the orchestrator assigns it a correction round or refactor, the design lead writes the cloud prompt in the architect or build role.
   - Once Product owner launches the session, it reviews the result and reports.
   - It does not launch sessions itself (it has no interactive terminal).
4. **Dependency analysis.** A report per request:
   - the changes in play;
   - their capability layers;
   - the shared files and the simulated merge conflicts;
   - the backlog and decisions-log entries involved;
   - the contract operations;
   - a proposed order with reasons.

**Limits:**
- It never decides. It never commits or pushes.
- It never edits code, `AGENTS.md`, `contracts/`, `openspec/` or agent permission files.
- It writes only design drafts under `docs/design/<change-id>/` and scratch files.
- It never edits `.claude/`.

### 2.6 Workflow document

`.claude/workflow_sdd.md` §1 "Actors and tools" gains two rows (orchestrator, design lead). The "Design assistant (Claude chat)" row stays for design work done in chat with Product owner. Product owner edits that file.

## 3. Files

| File | Change | Who applies it |
|---|---|---|
| `.claude/CLAUDE.md` | §1 and §3 edits of 2.2; new §9 (assigning work), §10 (cloud sessions), §11 (design lead) from `draft-claude-md.md` | Product owner |
| `.claude/agents/design-lead.md` | New, from `draft-design-lead.md` | Product owner |
| `.claude/workflow_sdd.md` | §1: two rows (orchestrator, design lead); Build model `xiaomi/mimo-v2.6-pro` instead of `scaleway/glm-5.2` | Product owner |
| `.claude/settings.local.json` | Permissions the new sections need: push scope (§10), `Edit` on `docs/change-progress.md` | Product owner |
| `docs/change-progress.md` | "Agent" column values: add "Design lead" to the agents legend | Orchestrator, once approved |

The copy script that propagates `.claude/` to the worktrees also has to copy `.claude/agents/`.

## 4. Open points (Product owner)

1. **Design lead in the cloud.** Cloud sessions read subagents from the repository's `.claude/agents/`, but `.claude/` is excluded from git (`.git/info/exclude`).
   - **(a)** Commit `.claude/agents/design-lead.md`: change the exclude to `.claude/*` with `!.claude/agents/`. Cloud sessions then get the design lead too.
   - **(b)** Keep it local: the orchestrator copies the relevant rules into each cloud prompt, as today.

   Recommendation: (a). The cloud prompts get shorter, and the design lead's rules stay versioned.
2. **Design lead model.**
   - Inherit the session's model, or
   - fix one model.

   Recommendation: inherit. Visual review and dependency analysis need the strongest model available.
3. **Summaries written by the design lead.** Today the orchestrator never commits `design-summary.md`.
   - Keep that rule: Product owner commits every summary.
   - Or allow a first-draft commit.

   Recommendation: keep it. The summary is the source of truth.
4. **Who commits the board.** `docs/change-progress.md` lives on `develop`, where Product owner commits. Options:
   - **(a)** the orchestrator commits it, with `docs: update change progress`;
   - **(b)** it stays uncommitted for Product owner, like the decisions log.

   Recommendation: (a). It changes after every phase, and waiting for a manual commit leaves it stale.
5. **Push scope.** The text of the exception in §3. Proposal in `draft-claude-md.md` §10: `develop`, `feature/<change-id>` and `fetch`; no force, no other branch, no remote changes. Deleting a merged `claude/*` branch on GitHub stays with Product owner.
6. ~~Build model~~ — settled 2026-10-06: `scaleway/glm-5.2` is discarded; the Build runs on `xiaomi/mimo-v2.6-pro`.
7. **Cloud fallback.** May the orchestrator move a stalled OpenCode task to the cloud with Product owner's approval each time, or only correction rounds and refactors?
