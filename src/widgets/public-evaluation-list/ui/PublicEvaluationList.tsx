import type { ReactNode } from "react";
import { fetchEvaluations, loadEvaluationOfferings } from "@/entities/evaluation";
import type { EvaluationsQuery } from "@/entities/evaluation";
import { fetchOffering } from "@/entities/offering";
import { EvaluationListPresentation } from "./EvaluationListPresentation";
import type {
  EvaluationListResult,
  EvaluationListTexts,
  PublicEvaluationRow,
} from "./EvaluationListPresentation";

// ─── UI-specific types (declared before the component) ───

export type PublicEvaluationListProps = {
  locale: string;
  /** The request query, fixed keys included (design.md D4). */
  query: EvaluationsQuery;
  /** The URL's search params, kept by the pagination. */
  searchParams: Record<string, string | string[] | undefined>;
  /** Whether a facet is applied. */
  filtered: boolean;
  texts: EvaluationListTexts;
  /** Renders one row: the row card, composed by the host page (FSD slot). */
  renderRow: (row: PublicEvaluationRow) => ReactNode;
};

/**
 * The public evaluations block as a thin async Server Component (design.md
 * D1, D4, D6): the list read, then one offering read per distinct non-null
 * `offeringId` in parallel. A not-found or failed offering leaves its rows
 * without an offering (offering unavailable); a `null` `offeringId` is never
 * requested (offering missing). Every branch is delegated to the presentation.
 */
export async function PublicEvaluationList({
  locale,
  query,
  searchParams,
  filtered,
  texts,
  renderRow,
}: PublicEvaluationListProps): Promise<ReactNode> {
  let result: EvaluationListResult;
  try {
    const page = await fetchEvaluations(query);
    const rows = await loadEvaluationOfferings(page.data, fetchOffering);
    result =
      page.data.length === 0 ? { state: "empty" } : { state: "success", rows, meta: page.meta };
  } catch {
    result = { state: "error" };
  }

  return (
    <EvaluationListPresentation
      result={result}
      filtered={filtered}
      locale={locale}
      query={searchParams}
      texts={texts}
      renderRow={renderRow}
    />
  );
}
