# Handoff — refactor-badge-geometry

## Session 2026-10-06 — worktree, explore and propose
Summary: worktree `tazavera-front-badge` created on `feature/refactor-badge-geometry` from `develop` (`ee913ca`), with `npm ci`, `.claude/` and `npx next typegen`; the restricted agent profiles come from `develop`. The architect ran the explore (OpenCode, through the orchestrator's node launcher). MVC reachable: not needed.

### Agent feedback (explore, condensed)
- Writable as given; cross-checks against `Badge.tsx`, `Badge.test.tsx`, `index.ts` and `index.test.tsx` pass. Scenario bodies are written by the propose in the existing "… detected" pattern (`app-shell` "Literal interface text detected", `base-controls` "Unnamed icon-only action detected").
- Wording slip: §4 item 3 should say "the only non-test `.ts`/`.tsx` file" (`globals.css` defines `@utility type-badge`).
- OpenSpec 1.13.2: a change with no spec delta fails validation unless `.openspec.yaml` sets `skip_specs: true`; with Open 1 a) the change carries an ADDED `feedback` delta and must not set it. Strict: requirement text at most 500 characters, at least one scenario each, no `## Purpose` in the delta.
- Questions: Q1 R6 missing from `docs/backlog.md`; Q2 confirm the code-level wording of the requirement.

### Decisions taken
#### D1 — Q1: R6 exists on `develop`
- Decision: R6 was added to `docs/backlog.md` on `develop` in `f0d2c87`, after this branch was created. Read it with `git show develop:docs/backlog.md`. The archive removes it once `develop` is merged into this branch.
#### D2 — Q2: keep the settled requirement, in the "… detected" pattern
- Decision: Open 1 a) stands. The requirement is written in observable terms where possible ("compact chips render with the badge's geometry"), with the verification scenario "Second geometry definition detected" in the existing pattern, and without the words "guard" or "§4".
- Why: the main specs already carry rules of this kind with verification scenarios; `config.yaml` rules.specs is met by keeping implementation names out.
#### D3 — Wording fix
- §4 item 3 reads "the only non-test `.ts`/`.tsx` file".
