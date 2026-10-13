"use client";

import type { ReactNode } from "react";
import type { CoffeeInventoryQuery } from "@/shared/api";
import type { FilterChanges } from "@/shared/lib/filter-query";
import { asOptions, FacetRadioList } from "@/shared/ui";
import type { InventoryFacetOptions } from "../model/options";
import type { InventoryFilterTexts } from "../model/texts";

type ListFacetProps = {
  legend: string;
  list: string[] | null;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  texts: InventoryFilterTexts;
};

/**
 * A single-choice facet over a list read; a failed read renders it disabled
 * with "Options unavailable" (select-inventory-origin-and-process design.md D3).
 */
function InventoryListFacet({ legend, list, value, onChange, texts }: ListFacetProps): ReactNode {
  return (
    <FacetRadioList
      legend={legend}
      options={asOptions(list)}
      value={value}
      onChange={onChange}
      anyLabel={texts.any}
      texts={{ seeMore: texts.seeMore, seeLess: texts.seeLess }}
      help={list === null ? texts.optionsUnavailable : undefined}
      disabled={list === null}
    />
  );
}

/** Region's list: the chosen country's regions, or every region with no country. */
function regionList(options: InventoryFacetOptions, country: string | undefined): string[] | null {
  if (options.regions === null) return null;
  if (!country) return options.regions;
  return options.regionsByCountry?.[country] ?? [];
}

/**
 * The changes of choosing a country: a chosen region outside the new
 * country's regions is removed; "Any" keeps the region (design.md D3).
 */
function countryChanges(
  country: string | undefined,
  region: string | undefined,
  options: InventoryFacetOptions,
): FilterChanges {
  const keepsRegion =
    !country || !region || (options.regionsByCountry?.[country] ?? []).includes(region);
  return keepsRegion ? { originCountry: country } : { originCountry: country, originRegion: undefined };
}

/** Country, Region and Process, in the spec order (design.md D3). */
export function InventoryOriginFacets({
  values,
  options,
  texts,
  navigate,
}: {
  values: CoffeeInventoryQuery;
  options: InventoryFacetOptions;
  texts: InventoryFilterTexts;
  navigate: (changes: FilterChanges) => void;
}): ReactNode {
  const country = values.originCountry ?? undefined;
  const region = values.originRegion ?? undefined;
  return (
    <>
      <InventoryListFacet
        legend={texts.originCountry}
        list={options.countries}
        value={country}
        onChange={(next) => navigate(countryChanges(next, region, options))}
        texts={texts}
      />
      <InventoryListFacet
        legend={texts.originRegion}
        list={regionList(options, country)}
        value={region}
        onChange={(next) => navigate({ originRegion: next })}
        texts={texts}
      />
      <InventoryListFacet
        legend={texts.process}
        list={options.processes}
        value={values.process ?? undefined}
        onChange={(next) => navigate({ process: next })}
        texts={texts}
      />
    </>
  );
}
