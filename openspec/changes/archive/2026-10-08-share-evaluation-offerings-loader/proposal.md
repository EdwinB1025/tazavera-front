Type: Refactor (fast lane)

## Why

The two evaluation lists ("My evaluations" and the public evaluations list) each join a page of evaluations with its offerings using their own copy of the same code: collect the distinct non-null `offeringId`s, read each offering once in parallel, and pair every evaluation with its offering or none. Any third evaluation list would copy it again (backlog entry R26, technical review §3.1 row R26).

## What Changes

- One shared loader in the `entities/evaluation` slice takes a page of evaluations and the offering reader, and returns each evaluation paired with its offering or `null`.
- The loader receives the offering reader as a parameter, so `entities/evaluation` does not import `entities/offering`; the page and the widget pass `fetchOffering` in.
- "My evaluations" (`src/pages/evaluations-list`) and the public evaluations list (`src/widgets/public-evaluation-list`) use the loader instead of their own copy. Each keeps its own handling around the join (error, empty and success states).
- No behaviour change: what users see, the requests sent to the API (the same reads, the same count, the same order of rows) and every requirement in `openspec/specs/` stay the same.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: adds the observable property that both evaluation lists read the offerings of a page the same way, one request per distinct non-null `offeringId`. No requirement's behaviour changes.

## Non-goals

- No change to the list requests, the error, empty or success states, or the offering-missing and offering-unavailable rows.
- No change to `fetchOffering` or the `entities/offering` slice.
- No new tests; the existing tests keep their assertions.
- No other duplication from the backlog is folded in.

## Impact

- New: `src/entities/evaluation/lib/offerings.ts`; `src/entities/evaluation/index.ts` exports the loader.
- Modified: `src/pages/evaluations-list/ui/EvaluationsList.tsx`, `src/widgets/public-evaluation-list/ui/PublicEvaluationList.tsx`.
- Tests whose `@/entities/evaluation` mock must also provide the loader: `EvaluationsList.test.tsx` and `PublicEvaluationList.test.tsx`, in `src/` and in `qa/` (import change only).

## Propose status

- Change-id: `share-evaluation-offerings-loader`
- Date: 2026-10-08
- `openspec validate share-evaluation-offerings-loader --strict`: valid
- Resolves backlog entry: R26
- Resolved: the loader lives in `src/entities/evaluation/lib/offerings.ts` and takes the offering reader as a parameter (design.md D1); only `loadEvaluationOfferings` is exported (D2); each caller keeps its own state mapping (D3).
- Open: nothing.
