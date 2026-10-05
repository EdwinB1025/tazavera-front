# Draft — additions to `.claude/CLAUDE.md`

Value source of `design-summary.md` §2.2–2.4. Sections 1–8 of the current file stay word for word, except the two edits below. Sections 9–11 are appended. Product owner reviews and applies; the orchestrator never edits this file.

## Edits to existing sections

**§1, bullet "Folders"**, replace with:

> - Folders: `tazavera-front` is the main checkout; it is usually on `develop` but Product owner may move it to another branch. Each change gets its own worktree `tazavera-front-<short-name>` on `feature/<change-id>`. Before a step that needs `develop` (decisions log, board, merges), run `git worktree list`: if `develop` is not checked out anywhere, add a temporary worktree on it, do the step, and remove the worktree (`git worktree remove`, never `--force`).

**§3, "You never"**, replace "push, rebase, reset, amend or force anything" with:

> push except as section 10 allows; rebase, reset, amend or force anything

## 9. Assigning work

You own the progress board (`docs/change-progress.md` on `develop`) and assign the next step of every change. Start each session by reading, in this order:
1. the board;
2. `docs/general-context.md`;
3. the decisions log;
4. `docs/backlog.md`;
5. the handoff of each active change.

### Who does each phase

| Next phase | Assigned to |
|---|---|
| Summary to write | Design lead (section 11); Product owner approves and commits it |
| Explore, propose, artifact update, verify, archive | Architect (OpenCode), as in section 6 |
| Apply (planned tasks) | Build (OpenCode), one task per run |
| Unplanned fix or coverage | Build (OpenCode), workflow §4 template |
| Correction round, refactor change | Claude cloud (section 10) |
| Visual review after each task that renders UI, and before each archive | Design lead |
| Order of the next work | Design lead analyses; you decide within section 3; Product owner decides the rest |
| Merge | You, with Product owner's confirmation |

When the OpenCode provider stalls or has no balance, ask Product owner before moving the task to a cloud session.

### Dependencies (check before assigning)

1. **Layering:** `theming` → `base-controls` → `form-fields`, `feedback`, `content-structure` → `app-shell` → feature capabilities. A change that needs a shared piece of a lower capability waits until the change that owns it is merged, or the piece becomes its own change.
2. **Backlog:** an entry whose "Affects" names the change goes first, as its own refactor change in the owning capability.
3. **Contract:** only operations in `develop`'s `contracts/openapi.yaml`. The board's coverage table says which change consumes each one.
4. **Shared files:** before running two branches in parallel, simulate their merge with `git merge-tree --write-tree --name-only <a> <b>`. If they conflict, order them and write the expected resolution in both handoffs.
5. **Decisions log:** every entry whose "Affects" names the change goes into that change's prompts.
6. **One executor per branch:** never an OpenCode run and a cloud session on the same branch; never two architect runs in the same worktree.

### The board

- Update a change's row when its phase or its assignee changes, and when a session ends.
- Its commit follows open point 4.4 of `docs/design/define-agent-roles/design-summary.md`, once Product owner settles it.

## 10. Cloud sessions

Correction rounds and refactor changes run in Claude cloud sessions (Claude Code on the web). Planned applies stay with OpenCode. Source: https://code.claude.com/docs/en/claude-code-on-the-web.md.

**Environment:**
- `Default`, network Trusted, variable `NEXT_PUBLIC_API_URL=http://localhost:8000`.
- The setup script is empty: setup scripts run outside the repository. Every prompt starts with `npm ci` and `npx next typegen`.
- The cloud cannot reach this machine (API, mock, dev server).

**Push:** you may run `git push origin develop`, `git push origin feature/<change-id>` and `git fetch origin`. Never `--force`, never another branch, never `git remote` changes. Deleting a `claude/*` branch on GitHub is Product owner's.

**Cycle:**
1. Commit what the session needs (the round in `corrections.md` is Product owner's), then push `feature/<change-id>`.
2. Write the prompt. It gives:
   - the role (architect, then build, per `AGENTS.md`), or the design lead's role if open point 4.1 makes it available in the repository;
   - the base branch;
   - the scope (which round or which tasks);
   - the target branch `claude/<change-id>-<task>`, with "push only that branch, no force, no merge, no rebase, no pull request";
   - the checks that must pass;
   - "stop and write the question in your final message instead of guessing".
3. Product owner launches it: from the change's worktree with `claude --cloud '<prompt>'`, or from claude.ai/code on that branch. You cannot launch it: `--cloud` needs an interactive terminal.
4. When it ends, `git fetch origin` and review `feature/<change-id>..origin/claude/<branch>`:
   - commit format and order (test before implementation);
   - only the files allowed to that role;
   - checkboxes only, in `tasks.md`, for the build.
5. Re-run `npm run test:run`, `npm run lint` and `npx tsc --noEmit` in a temporary detached worktree (`npm ci` and `npx next typegen` first), and remove it after.
6. Have the design lead review what the cloud could not see, when the change renders UI.
7. Integrate with `git merge --ff-only origin/claude/<branch>` in the folder where `feature/<change-id>` is checked out (`git worktree list`). If it is not a fast-forward, stop and report. Then push `feature/<change-id>`.
8. Record the session in the handoff: the branch, the commits, your review, the checks, and the integration.

## 11. Design lead

The design lead is the subagent `.claude/agents/design-lead.md`. Invoke it with the Agent tool for:
- summaries to write;
- visual reviews;
- cloud prompts for correction rounds and refactors, and the review of their result;
- dependency analyses.

Give it:
- the change-id;
- the phase;
- the files to read;
- what you expect back.

It returns a report and never talks to Product owner. You relay its open questions to Product owner, or record them in the handoff under "Deferred to Product owner".

Its findings follow the workflow §4 table, like any other review:
- unplanned fixes and coverage go to the Build;
- changes to a decision go to Product owner as a correction.

Summaries it drafts stay uncommitted until Product owner commits them.

Never run it while an OpenCode run or a cloud session writes to the same branch. The design lead only reads code; its own writes go under `docs/design/<change-id>/` and to scratch files.
