# Handoff — restyle-taxonomy-badge-toggles

## Session 2026-11-11 — Propose (step 6), cloud
Summary: summary approved by Product owner (`fd382852`); change-id `restyle-taxonomy-badge-toggles` (Product owner, 2026-11-11). Branch `feature/restyle-taxonomy-badge-toggles` created from `develop` at `8f003b57`, worktree `tazavera-front-badge-toggles`. Routine `trig_012KrrWeMAeL9yvvkznXXedn`, session `cse_016Lpndhci3niQk2Ff1XuBwg` (14:02–14:06 UTC), prompt by the design lead. Next: artifact review (step 7).

### Agent feedback
Architect `bf188fc8` `docs(landing): propose restyle-taxonomy-badge-toggles`: proposal.md; landing delta MODIFIED "Taxonomy badge trees on the offering card" (toggle last in its badge after a visible gap; one treatment: `surface-card` chip, glyph and 1px ring `text-strong`; glyph and boundary at least 3:1 in both themes; 16px box in a hit area of at least 24×24px; same badge height) with the new scenario "Toggle at the end of its badge"; design.md D1 colour (`bg-surface-card text-text-strong border-current`), D2 size and hit area (`size-4 rounded-check`, `relative before:absolute before:-inset-1`), D3 gap and end padding (`ml-1 -mr-1`), D4 test; tasks 1.1 (test), 1.2 (`TOGGLE_CLASSES`), 2.1 (checks); `## Propose status` in the summary. `openspec validate --strict` valid. No open question.

### Review and integration (orchestrator, §7 steps 4 and 7)
Commit format and footer correct; only the change folder and the summary's propose status changed. `git merge --ff-only origin/claude/restyle-taxonomy-badge-toggles-propose`: `8f003b57..bf188fc8`, pushed.

### Deferred to Product owner
#### ANSWERED 2026-11-12: both recommendations — (a) taxonomy tree badges only, (b) the toggle shrinks with the text (Product owner: "both recoomandation are appropiate")
- Q1 (2026-11-11, Product owner's question during propose): smaller badge text on mobile. Proposed as an artifact-review item: taxonomy tree badges at `--text-xs` (12px) below `md`, 14px from `md`; the toggle box shrinks to about 14px with it, hit area stays 24px. Open: (a) taxonomy badges only (rec.) or every badge (`type-badge` is shared); (b) shrink the toggle with the text (rec.) or keep 16px. Blocks the artifact review.

## Session 2026-11-12 — Artifact review (step 7)
Summary: Product owner answered Q1 with both recommendations. Artifact cleanup before the review (§4): proposal, landing delta, design.md and tasks.md read; no duplicate, broken reference or wording conflict found, nothing edited. Product owner's review message for the architect: Q1 (a) smaller badge text on mobile applies to the taxonomy tree badges only, `--text-xs` (12px) below `md` and 14px from `md`; (b) the toggle's visible box shrinks with the text below `md` (about 14px), its hit area stays 24 × 24px. Executor: cloud session (OpenCode cannot run in this session); the design lead writes the prompt (plan usage 0% / 0%). MVC reachable: not checked.

### Agent feedback
Design lead (cloud prompt, checked against §7 step 2): constraints verified on `f94f1105` and given to the architect as facts: `cn` does not merge; `color-guard.test.ts` reads any `text-xs` in `src/shared/ui/` as a colour and fails, and text sizes come from the `type-*` roles; the badge-geometry guard and three tests pin `BADGE_GEOMETRY_CLASSES`; design.md's Non-Goals exclude `Badge.tsx`, `TaxonomyTree.tsx` and `globals.css`, which the smaller text may need; below `md` a 14px box needs a 5px inset on each side to keep a 24px hit area (design lead's computation). No decisions-log entry names this change; no file overlap with R91 or `update-vulnerable-dependencies`. Open point 1: glyph size below `md`.

### Decisions taken
#### D1 — The glyph follows the badge text below `md`
- Context: Q1 (b) "the toggle shrinks with the text" does not say whether the `+`/`−` glyph shrinks. / Decision: the glyph follows the badge text, 12px below `md` and 14px from `md` up. / Why: the most direct reading of Product owner's answer; a 14px glyph is tight in a 14px box with a 1px ring; adds no token, scope or text (§3). / Result: cloud prompt §5.
#### D2 — OpenSpec CLI in the prompt
- Context: the draft prompt pinned `@fission-ai/openspec@1.13.2`; the cloud environment's setup installs 1.16.0, and earlier strict validations ran on it. / Decision: validate with the installed CLI, stop if missing. / Why: §7 environment; R91 C2. / Result: cloud prompt §8.
