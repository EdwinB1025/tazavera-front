import type { ReactNode } from "react";
import type { TaxonomyNode } from "@/shared/api";
import { EVALUATION_GROUPS } from "@/entities/evaluation";
import type {
  DescriptorBlockKey,
  DescriptorSelectionKey,
  EvaluationFormState,
} from "@/entities/evaluation";
import { buildChosenNoteTree } from "@/entities/taxonomy";
import { TaxonomyTree } from "@/shared/ui";
import type { TaxonomyTreeTexts } from "@/shared/ui";
import { SheetCard } from "./EvaluationSheetCards";

// ─── Fixed pieces (no interface text) ───

/** The taxonomy category each descriptor selection reads (design.md D8). */
const CATEGORY_BY_BLOCK: Record<DescriptorBlockKey, string> = {
  aromatics: "aromatics",
  main_tastes: "main_tastes",
  mouthfeel: "mouthfeel",
  defects: "defects",
};

const BLOCKS = EVALUATION_GROUPS.flatMap((group) => [
  ...(group.descriptive?.blocks ?? []),
  ...(group.affective?.blocks ?? []),
]);

const BLOCKS_CLASSES = ["grid", "grid-cols-1", "gap-6", "md:grid-cols-2"].join(" ");
const FIELDSET_CLASSES = ["m-0", "min-w-0", "border-0", "p-0"].join(" ");
const LEGEND_CLASSES = ["type-label", "mb-2"].join(" ");

/**
 * The Descriptors card (unify-taste-trees D4; spec "Read-only evaluation
 * presentation"): one block per descriptor selection, its chosen notes as the
 * collapsible taxonomy tree with no shares, or the empty text.
 */
export function DescriptorsCard({
  descriptors,
  taxonomies,
  locale,
  heading,
  emptyText,
  blockLabels,
  treeTexts,
}: {
  descriptors: EvaluationFormState["descriptors"];
  taxonomies: TaxonomyNode[];
  locale: string;
  heading: string;
  emptyText: string;
  blockLabels: Record<DescriptorSelectionKey, string>;
  treeTexts: TaxonomyTreeTexts;
}): ReactNode {
  return (
    <SheetCard heading={heading} wide>
      <div className={BLOCKS_CLASSES}>
        {BLOCKS.map((block) => {
          const notes = buildChosenNoteTree(
            taxonomies,
            CATEGORY_BY_BLOCK[block.key],
            descriptors[block.selection],
            locale,
          );
          return (
            <fieldset key={block.selection} className={FIELDSET_CLASSES}>
              <legend className={LEGEND_CLASSES}>{blockLabels[block.selection]}</legend>
              {notes.length > 0 ? (
                <TaxonomyTree notes={notes} texts={treeTexts} />
              ) : (
                <p className="type-body">{emptyText}</p>
              )}
            </fieldset>
          );
        })}
      </div>
    </SheetCard>
  );
}
