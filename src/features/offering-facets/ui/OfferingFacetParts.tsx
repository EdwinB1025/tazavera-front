"use client";

import type { ComponentProps, ReactNode } from "react";
import type { FilterChanges } from "@/shared/lib/filter-query";
import {
  ComboboxLoader,
  FacetCascade,
  FacetRadioList,
  ScoreRangeFacet,
  type ComboboxOption,
  type FacetOption,
} from "@/shared/ui";
import type { OfferingFacetOptions, TasteNoteOption } from "../model/options";
import {
  SCORE_MAX,
  SCORE_MIN,
  scoreRangeChanges,
  type OfferingFilterValues,
} from "../model/query";
import type { OfferingFacetsProps } from "./OfferingFacets";

type OfferingFacetsTexts = OfferingFacetsProps["texts"];

type OfferingFacetProps = {
  values: OfferingFilterValues;
  texts: OfferingFacetsTexts;
  navigate: (changes: FilterChanges) => void;
};

export function asOptions(values: string[] | null): FacetOption[] {
  return (values ?? []).map((value) => ({ value, label: value }));
}

export function asComboboxValue(value: string | undefined): ComboboxOption | null {
  return value === undefined ? null : { value, label: value };
}

/** The comboboxes' texts, with their loading text (lazy-load-facet-controls design.md D3). */
export function comboboxTexts(texts: OfferingFacetsTexts) {
  return {
    searching: texts.searching,
    noMatches: texts.noOptionMatches,
    loadError: texts.searchFailed,
    optionCount: texts.optionCount,
    loading: texts.loading ?? "",
  };
}

/** Every taste-note ref the options list, level 0 and level 1. */
function listedTasteNotes(tasteNotes: TasteNoteOption[] | null): Set<string> {
  return new Set(
    (tasteNotes ?? []).flatMap((note) => [
      note.value,
      ...(note.children ?? []).map((child) => child.value),
    ]),
  );
}

function seeMoreTexts(texts: OfferingFacetsTexts) {
  return { seeMore: texts.seeMore, seeLess: texts.seeLess };
}

/** A facet combobox inside the panel's side padding (split-oversized-facets design.md D6). */
export function PaddedCombobox(props: ComponentProps<typeof ComboboxLoader>): ReactNode {
  return (
    <div className="px-3">
      <ComboboxLoader {...props} />
    </div>
  );
}

/**
 * A radio facet over a list read; a failed read renders it disabled with
 * "Options unavailable" (split-oversized-facets design.md D6).
 */
function OfferingListFacet({
  facet,
  legend,
  list,
  values,
  texts,
  navigate,
}: OfferingFacetProps & {
  facet: "originCountry" | "originRegion" | "process" | "variety";
  legend: string;
  list: string[] | null;
}): ReactNode {
  return (
    <FacetRadioList
      legend={legend}
      options={asOptions(list)}
      value={values[facet]}
      onChange={(value) => navigate({ [facet]: value })}
      anyLabel={texts.any}
      texts={seeMoreTexts(texts)}
      help={list === null ? texts.optionsUnavailable : undefined}
      disabled={list === null}
    />
  );
}

/** The Verification facet (split-oversized-facets design.md D6). */
export function OfferingVerificationFacet({ values, texts, navigate }: OfferingFacetProps): ReactNode {
  return (
    <FacetRadioList
      legend={texts.verification}
      options={[
        { value: "1", label: texts.verified },
        { value: "0", label: texts.provisional },
      ]}
      value={values.verified}
      onChange={(value) => navigate({ verified: value })}
      anyLabel={texts.any}
      texts={seeMoreTexts(texts)}
    />
  );
}

/** The Average score facet (split-oversized-facets design.md D6). */
export function OfferingScoreFacet({ values, texts, navigate }: OfferingFacetProps): ReactNode {
  return (
    <ScoreRangeFacet
      legend={texts.averageScore}
      min={SCORE_MIN}
      max={SCORE_MAX}
      value={[values.cuppingAvgMin ?? SCORE_MIN, values.cuppingAvgMax ?? SCORE_MAX]}
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

/**
 * Origin country, Origin region, Process and Variety, in the spec order
 * (split-oversized-facets design.md D6).
 */
export function OfferingListFacets({
  options,
  ...facet
}: OfferingFacetProps & { options: OfferingFacetOptions }): ReactNode {
  const { texts } = facet;
  return (
    <>
      <OfferingListFacet
        {...facet}
        facet="originCountry"
        legend={texts.originCountry}
        list={options.countries}
      />
      <OfferingListFacet
        {...facet}
        facet="originRegion"
        legend={texts.originRegion}
        list={options.regions}
      />
      <OfferingListFacet
        {...facet}
        facet="process"
        legend={texts.process}
        list={options.processes}
      />
      <OfferingListFacet
        {...facet}
        facet="variety"
        legend={texts.variety}
        list={options.varieties}
      />
    </>
  );
}

/**
 * The Taste notes cascade; refs the options do not list are not shown
 * (split-oversized-facets design.md D6).
 */
export function OfferingTasteNotesFacet({
  tasteNotes,
  values,
  texts,
  navigate,
}: OfferingFacetProps & { tasteNotes: TasteNoteOption[] | null }): ReactNode {
  const listed = listedTasteNotes(tasteNotes);
  return (
    <FacetCascade
      legend={texts.tasteNotes}
      options={tasteNotes ?? []}
      value={values.cataRef.filter((ref) => listed.has(ref))}
      onChange={(refs) => navigate({ cataRef: refs })}
      texts={seeMoreTexts(texts)}
      help={tasteNotes === null ? texts.optionsUnavailable : undefined}
      disabled={tasteNotes === null}
    />
  );
}
