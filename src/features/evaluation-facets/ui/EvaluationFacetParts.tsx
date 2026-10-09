"use client";

import type { ReactNode } from "react";
import type { FilterChanges } from "@/shared/lib/filter-query";
import { FacetRadioList, ScoreRangeFacet } from "@/shared/ui";
import {
  SCORE_MAX,
  SCORE_MIN,
  scoreRangeChanges,
  type EvaluationFilterValues,
} from "../model/query";
import type { EvaluationFacetsOptions, EvaluationFacetsTexts } from "./EvaluationFacets";

type EvaluationFacetProps = {
  values: EvaluationFilterValues;
  texts: EvaluationFacetsTexts;
  navigate: (changes: FilterChanges) => void;
};

function seeMoreTexts(texts: EvaluationFacetsTexts) {
  return { seeMore: texts.seeMore, seeLess: texts.seeLess };
}

/**
 * The public set's Offering facet, for the `offeringId` in the URL
 * (add-public-evaluations D7; split-oversized-facets design.md D4).
 */
export function EvaluationOfferingFacet({
  offeringId,
  offering,
  texts,
  navigate,
}: Omit<EvaluationFacetProps, "values"> & {
  offeringId: string;
  offering: EvaluationFacetsOptions["offering"];
}): ReactNode {
  const offeringLabel = offering
    ? `${offering.name} · ${offering.coffeeshop}`
    : (texts.offeringFilterFallback ?? "");
  return (
    <FacetRadioList
      legend={texts.offering ?? ""}
      options={[{ value: offeringId, label: offeringLabel }]}
      value={offeringId}
      onChange={(value) => navigate({ offeringId: value })}
      anyLabel={texts.any}
      texts={seeMoreTexts(texts)}
    />
  );
}

/** The "mine" set's Status facet (split-oversized-facets design.md D4). */
export function EvaluationStatusFacet({ values, texts, navigate }: EvaluationFacetProps): ReactNode {
  return (
    <FacetRadioList
      legend={texts.status}
      options={[
        { value: "open", label: texts.statusOpen },
        { value: "closed", label: texts.statusClosed },
      ]}
      value={values.status}
      onChange={(value) => navigate({ status: value })}
      anyLabel={texts.any}
      texts={seeMoreTexts(texts)}
    />
  );
}

/** The Score facet (split-oversized-facets design.md D4). */
export function EvaluationScoreFacet({ values, texts, navigate }: EvaluationFacetProps): ReactNode {
  return (
    <ScoreRangeFacet
      legend={texts.score}
      min={SCORE_MIN}
      max={SCORE_MAX}
      value={[values.scoreMin ?? SCORE_MIN, values.scoreMax ?? SCORE_MAX]}
      onCommit={(range) => navigate(scoreRangeChanges(range))}
      texts={{
        minThumb: texts.scoreMin,
        maxThumb: texts.scoreMax,
        from: texts.rangeFrom,
        to: texts.rangeTo,
      }}
    />
  );
}
