## Context

`src/pages/evaluations-list/ui/EvaluationsList.tsx` (`loadPage`) and `src/widgets/public-evaluation-list/ui/PublicEvaluationList.tsx` each hold the same offering join for a page of evaluations (backlog R26). Both collect the distinct non-null `offeringId`s, call `fetchOffering` once per id in parallel, and pair each evaluation with its offering, or `null` when the id is `null` or the read is not `found`.

## Goals / Non-Goals

**Goals:** one loader for the join, used by both lists, with no change in behaviour or requests.

**Non-Goals:** changing the list reads, the states around the join, `fetchOffering`, or the `entities/offering` slice.

## Decisions

### D1. The loader and where it lives

`src/entities/evaluation/lib/offerings.ts` (layer `entities`, slice `evaluation`, segment `lib`) exports:

```ts
import type { EvaluationItem, OfferingDetail } from "@/shared/api";

/** The offering read the loader calls: `fetchOffering` of `entities/offering`. */
export type OfferingReader = (
  ulid: string,
) => Promise<{ status: "found"; offering: OfferingDetail } | { status: string }>;

export type EvaluationWithOffering = {
  evaluation: EvaluationItem;
  offering: OfferingDetail | null;
};

export function loadEvaluationOfferings(
  evaluations: EvaluationItem[],
  readOffering: OfferingReader,
): Promise<EvaluationWithOffering[]>;
```

It reads each distinct non-null `offeringId` once, all in parallel, and returns one entry per evaluation in the input order, with the offering when the read is `found` and `null` otherwise (a `null` `offeringId` is never requested). The reader type is structural so that `fetchOffering` fits it without `entities/evaluation` importing `entities/offering`. The build may narrow or rename the reader's result type if `fetchOffering`'s declared result does not fit as written, provided no import from `entities/offering` is added.

### D2. Public API

`src/entities/evaluation/index.ts` exports `loadEvaluationOfferings` only. The row types stay local to each caller, which already declares a structurally identical row type (`ListRow`, `PublicEvaluationRow`); the loader's result is assignable to both.

### D3. What each caller keeps

- `EvaluationsList` (client): `loadPage` still calls `listMyEvaluations`, maps `ok: false` to the error state, and builds the success state from the loader's rows and the page meta. It passes `fetchOffering` in.
- `PublicEvaluationList` (async Server Component): still calls `fetchEvaluations` inside the `try`, maps a throw (from the list read or the join) to the error state and an empty page to the empty state, and builds the success state from the loader's rows and the page meta. It passes `fetchOffering` in.

### D4. Tests

No test is added or changed in its assertions. The `vi.mock("@/entities/evaluation", …)` factories of `EvaluationsList.test.tsx` and `PublicEvaluationList.test.tsx` (in `src/` and `qa/`) replace the whole module, so each also provides the real `loadEvaluationOfferings` (an import change).

## Risks / Trade-offs

- A mock factory that misses the loader makes the caller's tests fail at render; the tasks name the four files to update.
