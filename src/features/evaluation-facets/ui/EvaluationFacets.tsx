"use client";

import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  clearFiltersHref,
  useFilterNavigation,
} from "@/shared/lib/filter-query";
import {
  FacetPanel,
  FacetRadioList,
  FacetTextField,
} from "@/shared/ui";
import {
  appliedEvaluationFilters,
  type AppliedEvaluationTexts,
} from "../model/applied";
import type { EvaluationFacetSet, EvaluationFilterValues } from "../model/query";
import {
  EvaluationOfferingFacet,
  EvaluationScoreFacet,
  EvaluationStatusFacet,
} from "./EvaluationFacetParts";

// ─── UI-specific types (declared before the component) ───

/** The `filters` texts the panel reads (design.md D7, D10). */
export type EvaluationFacetsTexts = AppliedEvaluationTexts & {
  title: string;
  clearAll: string;
  removeFilter: string;
  any: string;
  seeMore: string;
  seeLess: string;
  scoreMin: string;
  scoreMax: string;
  rangeFrom: string;
  rangeTo: string;
  cityHelp: string;
  optionsUnavailable: string;
};

export type EvaluationFacetsOptions = {
  /** `null` = unavailable: the Process facet renders disabled. */
  processes: string[] | null;
  /**
   * The public set's active offering; `null` when its read failed, so its
   * option and chip read `offeringFilterFallback`.
   */
  offering?: { name: string; coffeeshop: string } | null;
};

export type EvaluationFacetsProps = {
  /** `mine` (Status, Score, Process, City) by default; `public` (Offering, Score, Process, City). */
  set?: EvaluationFacetSet;
  values: EvaluationFilterValues;
  options: EvaluationFacetsOptions;
  texts: EvaluationFacetsTexts;
};

/** The sort keys "Clear all" keeps (design.md D5). */
export const EVALUATION_SORT_KEYS = ["orderBy", "orderDirection"] as const;

/**
 * The evaluation facet panel (design.md D7; spec "Evaluation facets in the
 * sidebar"): Status, Score, Process and City inside the shared facet panel
 * (the public set of add-public-evaluations D7: Offering, shown only while
 * `offeringId` is in the URL, instead of Status),
 * each writing its query key on commit. When the coffees failed, Process
 * renders disabled with "Options unavailable". The Offering, Status and
 * Score facets render from `EvaluationFacetParts`
 * (split-oversized-facets design.md D4).
 */
export function EvaluationFacets({
  set = "mine",
  values,
  options,
  texts,
}: EvaluationFacetsProps): ReactNode {
  const { navigate, navigateTo } = useFilterNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isPublic = set === "public";
  const applied = appliedEvaluationFilters(
    values,
    texts,
    options.offering?.name ?? null,
  );
  const seeMoreTexts = { seeMore: texts.seeMore, seeLess: texts.seeLess };
  const unavailable = options.processes === null;

  // Scroll anchoring opt-out: an applied chip added above the control that
  // changed would otherwise make the browser scroll the page by the chip's
  // height (spec "Evaluation filter state in the URL", keep the scroll
  // position; design.md D4).
  return (
    <div className="[overflow-anchor:none]">
      <FacetPanel
        title={texts.title}
        applied={applied}
        onRemove={(id) => {
          const entry = applied.find((filter) => filter.id === id);
          if (entry) navigate(entry.remove);
        }}
        onClearAll={() =>
          navigateTo(
            clearFiltersHref(
              pathname ?? "",
              new URLSearchParams(searchParams?.toString()),
              EVALUATION_SORT_KEYS,
            ),
          )
        }
        texts={{ clearAll: texts.clearAll, removeFilter: texts.removeFilter }}
      >
        {isPublic && values.offeringId !== undefined ? (
          <EvaluationOfferingFacet
            offeringId={values.offeringId}
            offering={options.offering}
            texts={texts}
            navigate={navigate}
          />
        ) : null}
        {isPublic ? null : (
          <EvaluationStatusFacet values={values} texts={texts} navigate={navigate} />
        )}
        <EvaluationScoreFacet values={values} texts={texts} navigate={navigate} />
        <FacetRadioList
          legend={texts.process}
          options={(options.processes ?? []).map((value) => ({
            value,
            label: value,
          }))}
          value={values.process}
          onChange={(value) => navigate({ process: value })}
          anyLabel={texts.any}
          texts={seeMoreTexts}
          help={unavailable ? texts.optionsUnavailable : undefined}
          disabled={unavailable}
        />
        <FacetTextField
          label={texts.city}
          maxLength={90}
          help={texts.cityHelp}
          value={values.city ?? ""}
          onCommit={(value) => navigate({ city: value })}
        />
      </FacetPanel>
    </div>
  );
}
