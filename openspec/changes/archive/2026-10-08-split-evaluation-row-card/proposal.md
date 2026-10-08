Type: Refactor (fast lane)

## Why

The evaluation row card of `src/widgets/evaluation-row` renders two different rows behind a `variant` flag: the "My evaluations" row (status badge, `h3`, ISO date, the specialist's actions) and the public row (no badge, `h2`, localized closed date, View and View offering). One component holds both render trees, so it has a cyclomatic complexity of 37, the highest in the code; its texts type makes optional the labels the public row requires, and the public row ignores the `actions` it accepts (backlog entry R27, technical review §3.1 row R27). AGENTS.md: "Do not switch between two render trees with a boolean prop: write one component per variant and share their parts."

## What Changes

- The widget gets one component per row variant: one for the "My evaluations" row and one for the public row, each with its own props type in which every text it renders is required, and only the specialist row takes footer actions.
- The parts both rows share (the score row with its rating badge, the coffeeshop and roaster captions, the layout classes) move to one shared file of the widget, used by both components.
- The single flag-driven component is removed; the widget's public index exports only the two components and the two texts types its callers import.
- The callers use their variant's component: "My evaluations" (`src/pages/evaluations-list`) the specialist row, the public evaluations list (`src/pages/public-evaluations`) the public row.
- No behaviour change: what users see (markup, classes, accessible names, texts), the requests sent to the API and every requirement in `openspec/specs/` stay the same. Target: the highest cyclomatic complexity of the widget goes from 37 to at most 10.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: adds the observable property that each evaluation-row variant is rendered by its own row, with no element of the other variant. No requirement's behaviour changes.

## Non-goals

- No change to the rows' markup, classes, texts, accessible names, routes or actions.
- No change to the evaluation lists, their requests or their states.
- No new tests; the existing tests keep their assertions.
- No change to the stale QA copy of the row card test or to its exclusion in `vitest.qa.config.mts`.
- No other duplication from the backlog is folded in.

## Impact

- New: `src/widgets/evaluation-row/ui/EvaluationRowParts.tsx`, `src/widgets/evaluation-row/ui/SpecialistEvaluationRowCard.tsx`, `src/widgets/evaluation-row/ui/PublicEvaluationRowCard.tsx`.
- Removed: `src/widgets/evaluation-row/ui/EvaluationRowCard.tsx`.
- Modified: `src/widgets/evaluation-row/index.ts`, `src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx`, `src/pages/public-evaluations/ui/ListScreen.tsx`, `src/pages/public-evaluations/ui/texts.ts`, `tsconfig.json` (design.md D5).
- Tests whose imported or rendered component changes (no assertion changes): `src/widgets/evaluation-row/ui/EvaluationRowCard.test.tsx`, and `PublicEvaluationList.test.tsx` and `EvaluationListPresentation.test.tsx` of `src/widgets/public-evaluation-list/ui/`, in `src/` and in `qa/`.

## Propose status

- Change-id: `split-evaluation-row-card`
- Date: 2026-10-08
- `openspec validate split-evaluation-row-card --strict`: valid
- Resolves backlog entry: R27
- Resolved: shared parts in `EvaluationRowParts.tsx` (design.md D1); one component per variant with its own required texts, only the specialist row taking `actions` (D2, D3); the public index exports the two components and their texts types (D4); the stale QA copy of the row card test is added to the `tsconfig.json` excludes, like the other stale QA copies (D5).
- Open: nothing.
