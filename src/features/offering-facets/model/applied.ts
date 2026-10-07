import type { FilterChanges } from "@/shared/lib/filter-query";
import type { AppliedFilter } from "@/shared/ui";
import type { TasteNoteOption } from "./options";
import { SCORE_MAX, SCORE_MIN, type OfferingFilterValues } from "./query";

/**
 * Applied offering filters (design.md D5): one entry per applied value, in
 * facet order, each with the changes that remove only it. The chips of the
 * panel and the count of the trigger read the same list; the sort is never
 * an entry.
 */

// ─── UI-specific types (design.md D11) ───

export type OfferingAppliedFilter = AppliedFilter & { remove: FilterChanges };

/** The `filters` texts the entries are named with. */
export type AppliedOfferingTexts = {
  coffeeName: string;
  verification: string;
  verified: string;
  provisional: string;
  averageScore: string;
  /** Holds `{min}` and `{max}`. */
  scoreRange: string;
  tasteNotes: string;
  originCountry: string;
  originRegion: string;
  process: string;
  variety: string;
  producer: string;
  roastery: string;
  city: string;
};

export type AppliedOfferingContext = {
  /** `null` = unavailable: no `cataRef` value is listed. */
  tasteNotes: TasteNoteOption[] | null;
  texts: AppliedOfferingTexts;
};

/** Every listed taste note (levels 0 and 1) by id. */
function tasteNoteLabels(tasteNotes: TasteNoteOption[] | null): Map<string, string> {
  const labels = new Map<string, string>();
  for (const note of tasteNotes ?? []) {
    labels.set(note.value, note.label);
    for (const child of note.children ?? []) labels.set(child.value, child.label);
  }
  return labels;
}

export function appliedOfferingFilters(
  values: OfferingFilterValues,
  { tasteNotes, texts }: AppliedOfferingContext,
): OfferingAppliedFilter[] {
  const list: OfferingAppliedFilter[] = [];
  const single = (key: keyof OfferingFilterValues, facet: string, value: string | undefined) => {
    if (value !== undefined) list.push({ id: key, facet, value, remove: { [key]: undefined } });
  };

  single("coffeeName", texts.coffeeName, values.coffeeName);
  single(
    "verified",
    texts.verification,
    values.verified === undefined
      ? undefined
      : values.verified === "1"
        ? texts.verified
        : texts.provisional,
  );
  if (values.cuppingAvgMin !== undefined || values.cuppingAvgMax !== undefined) {
    list.push({
      id: "cuppingAvg",
      facet: texts.averageScore,
      value: texts.scoreRange
        .replace("{min}", String(values.cuppingAvgMin ?? SCORE_MIN))
        .replace("{max}", String(values.cuppingAvgMax ?? SCORE_MAX)),
      remove: { cuppingAvgMin: undefined, cuppingAvgMax: undefined },
    });
  }
  const labels = tasteNoteLabels(tasteNotes);
  for (const ref of values.cataRef) {
    const label = labels.get(ref);
    if (label === undefined) continue;
    list.push({
      id: `cataRef:${ref}`,
      facet: texts.tasteNotes,
      value: label,
      remove: { cataRef: values.cataRef.filter((other) => other !== ref) },
    });
  }
  single("originCountry", texts.originCountry, values.originCountry);
  single("originRegion", texts.originRegion, values.originRegion);
  single("process", texts.process, values.process);
  single("variety", texts.variety, values.variety);
  single("producer", texts.producer, values.producer);
  single("roasteryName", texts.roastery, values.roasteryName);
  single("city", texts.city, values.city);
  return list;
}
