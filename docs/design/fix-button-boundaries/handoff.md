# Handoff — fix-button-boundaries

## Session 2026-10-06 — worktree, explore and propose
Summary: worktree `tazavera-front-buttons` created on `feature/fix-button-boundaries` from `develop` (`ee913ca`), with `npm ci`, `.claude/` and `npx next typegen`; the restricted agent profiles come from `develop`. The architect ran the explore (OpenCode, through the orchestrator's node launcher). MVC reachable: not needed.

### Agent feedback (explore, condensed)
- Tokens and code consistent: every target primitive exists; `transparent` has the `nav-avatar-border` precedent; no existing value changes; `Button.tsx` change is additive; `color-guard`, `radius-guard` and `focus-guard` need no edit. Pair counts verified (46 traditional with 2 exempt, 30 dark).
- A1: §5's "(the existing completeness test)" is wrong for `--color-action-primary-border` (a `transparent` value); it needs an explicit both-themes test.
- A2: with border-box sizing the border stays inside the fixed height; the width grows by 2px. The mock-up should show it.
- A3: §2 still reads "(width: Open 1)"; Open 1 is settled as 1px.
- §6's "must keep passing" list is incomplete: `index.test.tsx` and the transitive renderers (`AppShell`, `AppSidebar`, `HomeScreen`, `HomeHero`, `AboutContent` tests).
- Questions: Q1 spec delta for the border; Q2 how to cover the completeness of `--color-action-primary-border`.

### Decisions taken
#### D1 — Q1: amend the base-controls scenarios
- Decision: the change carries a `base-controls` delta that amends the scenarios "Primary action" and "Positional actions" to name the border ("background, label, border and hover colors resolve to …"). The transparent traditional `primary` border is left to the theming exemption clause.
- Why: the border becomes an observable, identifying element of five variants (AGENTS.md: change spec.md where observable behaviour changes, with the smallest wording change); OpenSpec also requires a delta for validation.
#### D2 — Q2: explicit both-themes test
- Decision: add a "defined in both themes" test for `--color-action-primary-border` mirroring the avatar block of `theme-tokens.test.ts`; the shared completeness filter is not changed. design.md states that the `action-primary` fill pairs double as the exemption gate.
- Why: follows the existing precedent in one file and leaves the shared guard's logic alone.
#### D3 — Wording and lists
- 1px written plainly (A3); the +2px width is noted and shown in the mock-up (A2); the "must keep passing" list is derived from the files that render `Button` directly or through Sidebar, AppHeader and the explore buttons, including the six the explore names.
- Open 2 (mock-up) is rendered by the design lead before the apply.

## 2026-10-06 — Product owner's review of the mock-up
- The mock-up (`docs/design/fix-button-boundaries/mockup/buttons-mockup.html`, published privately as https://claude.ai/artifact/6pbcqYrzPmVM8wcLmiK3re) was shown to Product owner with its three findings: border merging with the fill on the traditional hover of `action-1`/`action-3`; dark borders lighter than the label at rest; cream border on dark `primary`.
- ANSWERED 2026-10-06: Product owner approves every border as rendered ("el borde se ve genial, apruebo todos los bordes"). The apply is no longer blocked by the mock-up.
