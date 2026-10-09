import type { EvaluationItem, TaxonomyNode } from "@/shared/api";
import type { DescriptorSelectionKey } from "./groups";
import { EXTRINSIC_FIELDS, emptyFormState, mapAffectiveAxes, mapDescriptiveAxes } from "./state";
import type { EvaluationFormState, RoastLevel } from "./state";

/**
 * `EvaluationItem` → form state (design.md D3, D7, D11). The read carries no
 * `descriptive.roastLevel`, so the caller passes the offering's. `tastes`
 * entries map back by their `type`; either axis of a pair restores the shared
 * selection, and a `type` outside the known values is dropped (design.md risk).
 * Given the taxonomy tree, a chosen node also brings every ancestor, before it
 * (cascade-evaluation-descriptors D7).
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

/** `ulid` → its ancestors' `ulid`s, root first, of every node of the tree. */
function ancestorsByRef(
  nodes: TaxonomyNode[],
  path: string[] = [],
  result = new Map<string, string[]>(),
): Map<string, string[]> {
  for (const node of nodes) {
    const ref = node.ulid ?? "";
    result.set(ref, path);
    ancestorsByRef((node.children ?? []) as TaxonomyNode[], [...path, ref], result);
  }
  return result;
}

export function formStateFromEvaluation(
  item: EvaluationItem,
  roastLevel: RoastLevel | null,
  taxonomies: TaxonomyNode[] = [],
): EvaluationFormState {
  const empty = emptyFormState(roastLevel);
  const descriptors = empty.descriptors;
  const ancestors = ancestorsByRef(taxonomies);
  for (const taste of item.tastes ?? []) {
    const selection = taste.type ? SELECTION_BY_TYPE[taste.type] : undefined;
    if (!selection || !taste.ref) continue;
    for (const ref of [...(ancestors.get(taste.ref) ?? []), taste.ref]) {
      if (!descriptors[selection].includes(ref)) descriptors[selection].push(ref);
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
    extrinsics: Object.fromEntries(
      EXTRINSIC_FIELDS.map((field) => [field, openNote(item.extrinsics?.[field])]),
    ) as EvaluationFormState["extrinsics"],
    generalObservation: openNote(item.extrinsics?.generalObservation),
  };
}
