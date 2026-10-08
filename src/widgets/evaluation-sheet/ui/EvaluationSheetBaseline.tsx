import type { ReactNode } from "react";
import type { EvaluationItem, TaxonomyNode } from "@/shared/api";
import { fetchEvaluations } from "@/entities/evaluation";
import { fetchTaxonomies } from "@/entities/taxonomy";
import { Card, CardContent, RetryButton } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { EvaluationSheet } from "./EvaluationSheet";
import type { EvaluationSheetTexts } from "./EvaluationSheet";

// ─── UI-specific types (declared before the component) ───

export type EvaluationBaselineTexts = EvaluationSheetTexts & {
  emptyMessage: string;
  errorMessage: string;
  retryLabel: string;
};

export type EvaluationSheetBaselineProps = {
  locale: string;
  /** The offering whose baseline evaluation the panel shows. */
  offeringUlid: string;
  texts: EvaluationBaselineTexts;
};

type BaselineResult =
  | { state: "success"; evaluation: EvaluationItem; taxonomies: TaxonomyNode[] }
  | { state: "empty" }
  | { state: "error" };

const STATE_CLASSES = ["flex", "flex-col", "items-center", "gap-4", "text-center"].join(" ");
const SKELETON_GRID_CLASSES = ["grid", "grid-cols-1", "gap-6", "lg:grid-cols-2"].join(" ");
const BARS_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
const BAR_CLASSES = ["bg-surface-section", "rounded-field"].join(" ");
const SKELETON_CARD_KEYS = [0, 1] as const;

/** Two skeleton cards in the sheet grid: the sheet's loading state (summary §5.4). */
export function EvaluationSheetSkeleton(): ReactNode {
  return (
    <div aria-busy="true" className={SKELETON_GRID_CLASSES}>
      {SKELETON_CARD_KEYS.map((key) => (
        <Card key={key} layout="stacked" aria-hidden="true">
          <CardContent className={BARS_CLASSES}>
            <div className={cn(BAR_CLASSES, "h-6 w-1/3")} />
            <div className={cn(BAR_CLASSES, "h-4 w-full")} />
            <div className={cn(BAR_CLASSES, "h-4 w-2/3")} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * The offering detail's provisional panel as a thin async Server Component
 * (design.md D4, D8, D9): the newest `baseline` evaluation of the offering
 * and the taxonomies, in parallel. The first item renders as the sheet; an
 * empty page shows the empty message and any failure the error with Retry,
 * all inside the panel.
 */
export async function EvaluationSheetBaseline({
  locale,
  offeringUlid,
  texts,
}: EvaluationSheetBaselineProps): Promise<ReactNode> {
  let result: BaselineResult;
  try {
    const [page, taxonomies] = await Promise.all([
      fetchEvaluations({
        offeringId: offeringUlid,
        evaluationType: "baseline",
        orderBy: "created_at",
        orderDirection: "desc",
      }),
      fetchTaxonomies(),
    ]);
    const [evaluation] = page.data;
    result = evaluation
      ? { state: "success", evaluation, taxonomies: taxonomies.data }
      : { state: "empty" };
  } catch {
    result = { state: "error" };
  }

  if (result.state === "empty") {
    return <p className={cn("type-body", "text-center")}>{texts.emptyMessage}</p>;
  }
  if (result.state === "error") {
    return (
      <div className={STATE_CLASSES}>
        <p className="type-body">{texts.errorMessage}</p>
        <RetryButton label={texts.retryLabel} />
      </div>
    );
  }
  return (
    <EvaluationSheet
      evaluation={result.evaluation}
      taxonomies={result.taxonomies}
      locale={locale}
      texts={texts}
    />
  );
}
