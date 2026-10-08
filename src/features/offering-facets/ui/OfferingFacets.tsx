"use client";

import type { ReactNode } from "react";
import { clearFiltersHref, useFilterNavigation } from "@/shared/lib/filter-query";
import {
  Combobox,
  FacetCascade,
  FacetPanel,
  FacetRadioList,
  FacetTextField,
  ScoreRangeFacet,
  type ComboboxOption,
  type ComboboxTexts,
  type FacetOption,
} from "@/shared/ui";
import { usePathname, useSearchParams } from "next/navigation";
import { searchCoffees } from "../api/search-coffees";
import { searchRoasteries } from "../api/search-roasteries";
import { appliedOfferingFilters } from "../model/applied";
import type { OfferingFacetOptions } from "../model/options";
import {
  SCORE_MAX,
  SCORE_MIN,
  scoreRangeChanges,
  type OfferingFilterValues,
} from "../model/query";
import type { OfferingFilterTexts } from "../model/texts";

// ─── UI-specific types (declared before the component) ───

export type OfferingFacetsProps = {
  values: OfferingFilterValues;
  options: OfferingFacetOptions;
  texts: OfferingFilterTexts;
};

/** The sort keys "Clear all" keeps (design.md D5). */
export const OFFERING_SORT_KEYS = ["orderBy", "orderDirection"] as const;

function asOptions(values: string[] | null): FacetOption[] {
  return (values ?? []).map((value) => ({ value, label: value }));
}

function asComboboxValue(value: string | undefined): ComboboxOption | null {
  return value === undefined ? null : { value, label: value };
}

/**
 * The offering facet panel (design.md D7; spec "Offering facets in the
 * sidebar"): the eleven facets in the spec order inside the shared facet
 * panel, each writing its query key on commit. A facet whose options failed
 * renders disabled with "Options unavailable". Coffee and Roastery are the
 * same search-as-you-type combobox (search-coffee-facet design.md D4).
 */
export function OfferingFacets({ values, options, texts }: OfferingFacetsProps): ReactNode {
  const { navigate, navigateTo } = useFilterNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const applied = appliedOfferingFilters(values, { tasteNotes: options.tasteNotes, texts });
  const seeMoreTexts = { seeMore: texts.seeMore, seeLess: texts.seeLess };
  const comboboxTexts: ComboboxTexts = {
    searching: texts.searching,
    noMatches: texts.noOptionMatches,
    loadError: texts.searchFailed,
    optionCount: texts.optionCount,
  };
  const listed = new Set(
    (options.tasteNotes ?? []).flatMap((note) => [
      note.value,
      ...(note.children ?? []).map((child) => child.value),
    ]),
  );

  const radioFacet = (
    key: "originCountry" | "originRegion" | "process" | "variety",
    legend: string,
    list: string[] | null,
  ) => (
    <FacetRadioList
      legend={legend}
      options={asOptions(list)}
      value={values[key]}
      onChange={(value) => navigate({ [key]: value })}
      anyLabel={texts.any}
      texts={seeMoreTexts}
      help={list === null ? texts.optionsUnavailable : undefined}
      disabled={list === null}
    />
  );

  return (
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
            OFFERING_SORT_KEYS,
          ),
        )
      }
      texts={{ clearAll: texts.clearAll, removeFilter: texts.removeFilter }}
    >
      <div className="px-3">
        <Combobox
          label={texts.coffeeName}
          variant="inverse"
          search={searchCoffees}
          value={asComboboxValue(values.coffeeName)}
          onChange={(option) => navigate({ coffeeName: option?.value })}
          texts={comboboxTexts}
          maxLength={150}
          placeholder={texts.coffeeNamePlaceholder}
        />
      </div>
      <FacetRadioList
        legend={texts.verification}
        options={[
          { value: "1", label: texts.verified },
          { value: "0", label: texts.provisional },
        ]}
        value={values.verified}
        onChange={(value) => navigate({ verified: value })}
        anyLabel={texts.any}
        texts={seeMoreTexts}
      />
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
      <FacetCascade
        legend={texts.tasteNotes}
        options={options.tasteNotes ?? []}
        value={values.cataRef.filter((ref) => listed.has(ref))}
        onChange={(refs) => navigate({ cataRef: refs })}
        texts={{ ...seeMoreTexts, toggleChildren: texts.toggleChildren }}
        help={options.tasteNotes === null ? texts.optionsUnavailable : undefined}
        disabled={options.tasteNotes === null}
      />
      {radioFacet("originCountry", texts.originCountry, options.countries)}
      {radioFacet("originRegion", texts.originRegion, options.regions)}
      {radioFacet("process", texts.process, options.processes)}
      {radioFacet("variety", texts.variety, options.varieties)}
      <div className="px-3">
        <Combobox
          label={texts.producer}
          variant="inverse"
          options={asOptions(options.producers)}
          value={asComboboxValue(values.producer)}
          onChange={(option) => navigate({ producer: option?.value })}
          texts={comboboxTexts}
          maxLength={150}
          help={options.producers === null ? texts.optionsUnavailable : undefined}
          disabled={options.producers === null}
        />
      </div>
      <div className="px-3">
        <Combobox
          label={texts.roastery}
          variant="inverse"
          search={searchRoasteries}
          value={asComboboxValue(values.roasteryName)}
          onChange={(option) => navigate({ roasteryName: option?.value })}
          texts={comboboxTexts}
          maxLength={150}
        />
      </div>
      <FacetTextField
        label={texts.city}
        maxLength={90}
        help={texts.cityHelp}
        value={values.city ?? ""}
        onCommit={(value) => navigate({ city: value })}
      />
    </FacetPanel>
  );
}
