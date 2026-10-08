import type { ReactNode } from "react";
import { distinctCoffeeValues, fetchCoffees } from "@/shared/api";
import type { QueryRecord } from "@/shared/lib/filter-query";
import { fetchOffering } from "@/entities/offering";
import { EvaluationFacets, parseEvaluationFilters } from "@/features/evaluation-facets";
import type { EvaluationFacetsOptions } from "@/features/evaluation-facets";
import { AppSidebar } from "@/widgets/app-sidebar";
import { facetsTexts } from "./texts";

// ─── UI-specific types (declared before the component) ───

export type EvaluationsSidebarProps = {
  locale: string;
  /** The route's search params; the facets show their values. */
  searchParams: QueryRecord;
};

/**
 * The public list's slot screen (design.md D5, D7): a thin async
 * composition that reads the coffees (a failure disables only Process) and,
 * while `offeringId` is in the URL, the active offering (a failure reads the
 * fallback label), and renders the sidebar frame with no navigation and the
 * public facet panel.
 */
export async function EvaluationsSidebar({
  locale,
  searchParams,
}: EvaluationsSidebarProps): Promise<ReactNode> {
  const values = parseEvaluationFilters(searchParams, "public");
  const [processes, offering] = await Promise.all([
    fetchCoffees().then((coffees) =>
      coffees.ok ? distinctCoffeeValues(coffees.data, "process") : null,
    ),
    values.offeringId === undefined
      ? Promise.resolve(undefined)
      : fetchOffering(values.offeringId).then((read) =>
          read.ok
            ? {
                name: read.data.coffeeInventory?.coffee?.name ?? "",
                coffeeshop: read.data.location?.name ?? "",
              }
            : null,
        ),
  ]);
  const options: EvaluationFacetsOptions = { processes, offering };
  return (
    <AppSidebar>
      <EvaluationFacets set="public" values={values} options={options} texts={facetsTexts(locale)} />
    </AppSidebar>
  );
}
