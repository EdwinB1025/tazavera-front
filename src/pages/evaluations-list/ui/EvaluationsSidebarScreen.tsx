import type { ReactNode } from "react";
import { distinctCoffeeValues, fetchCoffees } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
import { SidebarSeparator } from "@/shared/ui";
import {
  EvaluationFacets,
  parseEvaluationFilters,
  type EvaluationFacetsTexts,
} from "@/features/evaluation-facets";
import { AppSidebar } from "@/widgets/app-sidebar";

// ─── UI-specific types (declared before the component) ───

export type EvaluationsSidebarScreenProps = {
  locale: string;
  /** The route's search params; the facets show their values. */
  searchParams: QueryRecord;
};

const TEXT_KEYS = [
  "title",
  "clearAll",
  "removeFilter",
  "any",
  "seeMore",
  "seeLess",
  "status",
  "statusOpen",
  "statusClosed",
  "score",
  "scoreMin",
  "scoreMax",
  "scoreRange",
  "rangeFrom",
  "rangeTo",
  "process",
  "city",
  "cityHelp",
  "optionsUnavailable",
] as const satisfies readonly (keyof EvaluationFacetsTexts)[];

/**
 * The evaluations list's slot screen (design.md D7): a thin async
 * composition that reads the `filters` texts and the coffees once, so a
 * failed read disables only Process, and renders the sidebar frame with the
 * management entries, a separator and the evaluation facet panel.
 */
export async function EvaluationsSidebarScreen({
  locale,
  searchParams,
}: EvaluationsSidebarScreenProps): Promise<ReactNode> {
  const catalog = getMessages("filters", locale);
  const texts = Object.fromEntries(
    TEXT_KEYS.map((key) => [key, catalog[key] ?? ""]),
  ) as EvaluationFacetsTexts;
  const processes = await fetchCoffees().then(
    (coffees) => distinctCoffeeValues(coffees, "process"),
    () => null,
  );
  return (
    <AppSidebar>
      <SidebarSeparator />
      <EvaluationFacets
        values={parseEvaluationFilters(searchParams)}
        options={{ processes }}
        texts={texts}
      />
    </AppSidebar>
  );
}
