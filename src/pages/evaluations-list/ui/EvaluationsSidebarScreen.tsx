import type { ReactNode } from "react";
import { distinctCoffeeValues, fetchCoffees } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
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
 * management entries, the evaluation facet panel nested under the current one.
 */
export async function EvaluationsSidebarScreen({
  locale,
  searchParams,
}: EvaluationsSidebarScreenProps): Promise<ReactNode> {
  const catalog = getMessages("filters", locale);
  const texts = Object.fromEntries(
    TEXT_KEYS.map((key) => [key, catalog[key] ?? ""]),
  ) as EvaluationFacetsTexts;
  const coffees = await fetchCoffees();
  const processes = coffees.ok ? distinctCoffeeValues(coffees.data, "process") : null;
  // The sub-section nests under the "My evaluations" entry (collapse-sidebar-filters).
  return (
    <AppSidebar
      subsection={{
        title: texts.title,
        content: (
          <EvaluationFacets
            values={parseEvaluationFilters(searchParams)}
            options={{ processes }}
            texts={texts}
          />
        ),
      }}
    />
  );
}
