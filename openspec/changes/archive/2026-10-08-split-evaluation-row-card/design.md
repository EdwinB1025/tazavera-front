## Context

`src/widgets/evaluation-row/ui/EvaluationRowCard.tsx` renders the "My evaluations" row (`variant="specialist"`) and the public evaluations row (`variant="public"`) behind one flag, with a cyclomatic complexity of 37 (backlog R27). Its texts type marks `viewOfferingLabel` and `offeringUnavailableLabel` optional although the public row requires them, and the public row ignores the `actions` prop. Callers: `src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx` (specialist) and `src/pages/public-evaluations/ui/ListScreen.tsx` (public), plus the row slot of the public list tests.

## Goals / Non-Goals

**Goals:** one component per row variant, each with required texts in its own props type, sharing the common parts; the highest cyclomatic complexity of the widget at most 10; no change in behaviour, markup or requests.

**Non-Goals:** changing what either row renders, the evaluation lists, their requests or states; the stale QA copy of the row card test and its exclusion in `vitest.qa.config.mts`.

## Decisions

### D1. Shared parts

`src/widgets/evaluation-row/ui/EvaluationRowParts.tsx` (layer `widgets`, slice `evaluation-row`, segment `ui`) holds what both rows render the same way:

```ts
/** The texts both rows render. */
export type EvaluationRowSharedTexts = {
  closedOnLabel: string;
  coffeeshopCaption: string;
  roasterCaption: string;
  ratingExceptionalLabel: string;
  ratingExcellentLabel: string;
  ratingGoodLabel: string;
  ratingCommercialLabel: string;
  /** Shown in place of the offering when its `offeringId` is `null`. */
  offeringMissingLabel: string;
};
```

- the score row (score, `/100` scale and rating badge), rendered only when the evaluation's score has a rating tier, so that each row keeps its current aside: the specialist row renders `CardAside` only when the score row exists, the public row always renders `CardAside`;
- the coffeeshop and roaster captions block;
- the content and footer layout classes.

### D2. The "My evaluations" row

`src/widgets/evaluation-row/ui/SpecialistEvaluationRowCard.tsx`:

```ts
export type SpecialistEvaluationRowCardTexts = EvaluationRowSharedTexts & {
  openLabel: string;
  closedLabel: string;
  createdOnLabel: string;
};

export type SpecialistEvaluationRowCardProps = {
  evaluation: EvaluationItem;
  /** The row's offering, or `null` when it could not be read or was deleted. */
  offering: OfferingDetail | null;
  texts: SpecialistEvaluationRowCardTexts;
  /** The footer actions. */
  actions: ReactNode;
};
```

It renders exactly what the `specialist` variant renders today: the status badge, the `h3` heading (offering-missing text for a `null` `offeringId`, otherwise the coffee name), the created or closed date as ISO date in a `<time>`, the captions unless the `offeringId` is `null`, and `actions` in the footer. The unused `locale` prop is dropped.

### D3. The public row

`src/widgets/evaluation-row/ui/PublicEvaluationRowCard.tsx`:

```ts
export type PublicEvaluationRowCardTexts = EvaluationRowSharedTexts & {
  viewLabel: string;
  viewOfferingLabel: string;
  /** The heading when the offering read failed. */
  offeringUnavailableLabel: string;
};

export type PublicEvaluationRowCardProps = {
  evaluation: EvaluationItem;
  /** The row's offering, or `null` when it could not be read or was deleted. */
  offering: OfferingDetail | null;
  locale: string;
  texts: PublicEvaluationRowCardTexts;
};
```

It renders exactly what the `public` variant renders today: no badge, the `h2` heading (offering-missing, offering-unavailable or coffee name), the localized closed date line, the captions unless the offering is missing or unavailable, and the View and View offering route buttons with their hidden suffix. It takes no `actions`.

### D4. Public index and callers

`src/widgets/evaluation-row/index.ts` exports `SpecialistEvaluationRowCard`, `PublicEvaluationRowCard` and the types `SpecialistEvaluationRowCardTexts` and `PublicEvaluationRowCardTexts`; `EvaluationRowCard`, `EvaluationRowCardProps` and `EvaluationRowCardTexts` are removed (no caller imports the props types).

- `SpecialistEvaluationRow` renders `SpecialistEvaluationRowCard` with the same `actions`; its `EvaluationRowTexts` becomes `DeleteEvaluationTexts & SpecialistEvaluationRowCardTexts & { editLabel: string; viewLabel: string }` (`viewLabel` is used by its own View button).
- `ListScreen` renders `PublicEvaluationRowCard` in its row slot; `listTexts` in `src/pages/public-evaluations/ui/texts.ts` returns `EvaluationListTexts & PublicEvaluationRowCardTexts`, dropping the `openLabel`, `closedLabel` and `createdOnLabel` keys the public row never rendered.
- The row slot of `PublicEvaluationList.test.tsx` and `EvaluationListPresentation.test.tsx` (`src/` and `qa/`) renders `PublicEvaluationRowCard` without the `variant` prop. `src/widgets/evaluation-row/ui/EvaluationRowCard.test.tsx` keeps its name and location, renders `PublicEvaluationRowCard` without the `variant` prop and types its texts as `PublicEvaluationRowCardTexts`, dropping the three keys that type does not have. No assertion changes.

### D5. Stale QA copy

`qa/src/widgets/evaluation-row/ui/EvaluationRowCard.test.tsx` is already excluded from the QA run and stays unchanged; it imports the removed component, so it is added to the `exclude` list of `tsconfig.json`, as the other stale QA copies already are.

## Risks / Trade-offs

- The specialist and public rows both render the aside differently when there is no score; D1 keeps each one's current behaviour, and the protecting tests (`src/widgets/evaluation-row/ui/EvaluationRowCard.test.tsx`, `src/pages/evaluations-list/ui/EvaluationRowCard.test.tsx`, `EvaluationsList.test.tsx`, the public-evaluation-list tests) cover both rows.
