import type { ReactNode } from "react";
import type { OfferingDetail, TaxonomyNode } from "@/shared/api";
import { buildDescriptorRows } from "@/entities/taxonomy";
import { Card, CardContent, DescriptorChipGroup } from "@/shared/ui";
import { identifiedCounts } from "../lib/identified-counts";
import { ConsensusLegend } from "./ConsensusLegend";

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

// Each card: the heading and its content, 1rem apart.
const CONTENT_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

// A selection block: the card and its consensus legend beside it from `md`,
// 1.5rem apart, stacking 1rem apart below `md`; it spans both grid columns.
const SELECTION_BLOCK_CLASSES = [
  "flex",
  "flex-col",
  "gap-4",
  "md:flex-row",
  "md:gap-6",
  "lg:col-span-2",
].join(" ");

/**
 * Main tastes or Defects (design.md D13): the identified notes of one
 * `type` as a read-only selection over the category's descriptor rows, and
 * the consensus legend beside the card, in card order.
 */
export function SelectionBlock({
  offering,
  taxonomies,
  locale,
  category,
  heading,
  texts,
}: SelectionBlockProps): ReactNode {
  const rows = buildDescriptorRows(taxonomies, category, locale);
  const counts = identifiedCounts(offering.cataConcordance ?? [], category);
  return (
    <div className={SELECTION_BLOCK_CLASSES}>
      <Card layout="stacked" className="flex-1">
        <CardContent className={CONTENT_CLASSES}>
          <h2 className="type-subheading">{heading}</h2>
          <DescriptorChipGroup
            readOnly
            legend={heading}
            rows={rows}
            value={[...counts.keys()]}
            emptyText={texts.detailTasteEmpty}
          />
        </CardContent>
      </Card>
      <ConsensusLegend
        rows={rows}
        counts={counts}
        total={offering.evaluationCount ?? 0}
      />
    </div>
  );
}
