import type { ReactNode } from "react";
import type { OfferingDetail, TaxonomyNode } from "@/shared/api";
import { buildConsensusNoteTree, buildTaxonomyLookup } from "@/entities/taxonomy";
import { Card, CardContent, TaxonomyTree } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type SelectionBlockTexts = {
  detailTasteEmpty: string;
};

export type SelectionBlockProps = {
  offering: OfferingDetail;
  /** The taxonomy tree of `GET /taxonomies`. */
  taxonomies: TaxonomyNode[];
  locale: string;
  /** The taxonomy category: "main_tastes" or "defects". */
  category: string;
  heading: string;
  texts: SelectionBlockTexts;
};

// ─── Fixed pieces (no interface text) ───

// Each card: the heading and its content, 1rem apart; it spans both grid
// columns (nest-consensus-notes D4).
const CONTENT_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

/**
 * Main tastes or Defects (design.md D13; nest-consensus-notes D3, D4): the
 * concordance's notes of one `type` as their resolved tree, each note's
 * `name n/total` share inline after its badge, or the empty text.
 */
export function SelectionBlock({
  offering,
  taxonomies,
  locale,
  category,
  heading,
  texts,
}: SelectionBlockProps): ReactNode {
  const notes = buildConsensusNoteTree(
    (offering.cataConcordance ?? []).filter((node) => node.type === category),
    buildTaxonomyLookup(taxonomies, locale),
  );
  return (
    <Card layout="stacked" className="lg:col-span-2">
      <CardContent className={CONTENT_CLASSES}>
        <h2 className="type-subheading">{heading}</h2>
        {notes.length > 0 ? (
          <TaxonomyTree notes={notes} total={offering.evaluationCount ?? 0} />
        ) : (
          <p className="type-body">{texts.detailTasteEmpty}</p>
        )}
      </CardContent>
    </Card>
  );
}
