import type { EvaluationItem } from "@/shared/api";
import type { DescriptorSelectionKey } from "./groups";
import { emptyFormState, mapAffectiveAxes, mapDescriptiveAxes } from "./state";
import type { EvaluationFormState, RoastLevel } from "./state";

/**
 * `EvaluationItem` → form state (design.md D3, D7, D11). The read carries no
 * `descriptive.roastLevel`, so the caller passes the offering's. `tastes`
 * entries map back by their `type`; either axis of a pair restores the shared
 * selection, and a `type` outside the known values is dropped (design.md risk).
 */

const SELECTION_BY_TYPE: Record<string, DescriptorSelectionKey> = {
  fragrance: "fragranceAroma",
  aroma: "fragranceAroma",
  flavor: "flavorAftertaste",
  aftertaste: "flavorAftertaste",
  main_tastes: "mainTastes",
  mouthfeel: "mouthfeel",
  defects: "defects",
};

function openNote(note: string | null | undefined): string | null {
  return note ? note : null;
}

export function formStateFromEvaluation(
  item: EvaluationItem,
  roastLevel: RoastLevel | null,
): EvaluationFormState {
  const empty = emptyFormState(roastLevel);
  const descriptors = empty.descriptors;
  for (const taste of item.tastes ?? []) {
    const selection = taste.type ? SELECTION_BY_TYPE[taste.type] : undefined;
    if (selection && taste.ref && !descriptors[selection].includes(taste.ref)) {
      descriptors[selection].push(taste.ref);
    }
  }
  return {
    ...empty,
    extractionMethod: item.extractionMethod ? item.extractionMethod : null,
    descriptive: mapDescriptiveAxes((axis) => ({
      score: item.descriptive?.[axis]?.score ?? 0,
      note: openNote(item.descriptive?.[axis]?.note),
    })),
    affective: mapAffectiveAxes((axis) => ({
      score: item.affective?.[axis]?.score || null,
      note: openNote(item.affective?.[axis]?.note),
    })),
    descriptors,
    generalObservation: openNote(item.extrinsics?.generalObservation),
  };
}
