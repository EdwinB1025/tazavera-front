import type { ReactNode } from "react";
import type { OfferingDetail, TaxonomyNode } from "@/shared/api";
import {
  assignWheelGroups,
  buildFlavorWheelNodes,
  buildTaxonomyLookup,
} from "@/entities/taxonomy";
import { Card, CardContent, FlavorWheel } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type CataCardTexts = {
  detailCataHeading: string;
  detailTasteEmpty: string;
  wheelLabel: string;
  wheelHint: string;
  /** `{count} de {total} evaluadores`: a wheel note's accessible count. */
  wheelCount: string;
  wheelNotesToggle: string;
  /** The wheel's general group legend name and the aromatics group (D19). */
  wheelGroupsLabel: string;
  wheelGroupAromatics: string;
  attrMouthfeel: string;
};

export type CataCardProps = {
  offering: OfferingDetail;
  /** The taxonomy tree of `GET /taxonomies`. */
  taxonomies: TaxonomyNode[];
  locale: string;
  texts: CataCardTexts;
};

// ─── Fixed pieces (no interface text) ───

// Each card: the heading and its content, 1rem apart.
const CONTENT_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

// A card spanning both grid columns from `lg`.
const WIDE_CARD_CLASSES = "lg:col-span-2";

/**
 * The CATA wheel (design.md D14, D19): one `FlavorWheel` fed the
 * `aromatics` group of `cataConcordance`, its roots grouped into aromatics
 * and mouthfeel; an empty concordance shows the empty text instead.
 */
export function CataCard({
  offering,
  taxonomies,
  locale,
  texts,
}: CataCardProps): ReactNode {
  const total = offering.evaluationCount ?? 0;
  const lookup = buildTaxonomyLookup(taxonomies, locale);
  const wheelTexts = {
    label: texts.wheelLabel,
    hint: texts.wheelHint,
    emptyMessage: texts.detailTasteEmpty,
    notesToggle: texts.wheelNotesToggle,
    groupsLabel: texts.wheelGroupsLabel,
  };
  const wheelGroups = [
    { id: "aromatics", name: texts.wheelGroupAromatics },
    { id: "mouthfeel", name: texts.attrMouthfeel },
  ];
  function countLabel(count: number, of: number): string {
    return texts.wheelCount
      .replace("{count}", String(count))
      .replace("{total}", String(of));
  }
  const cata = offering.cataConcordance ?? [];

  return (
    <Card layout="stacked" className={WIDE_CARD_CLASSES}>
      <CardContent className={CONTENT_CLASSES}>
        <h2 className="type-subheading">{texts.detailCataHeading}</h2>
        {cata.length > 0 ? (
          <FlavorWheel
            nodes={assignWheelGroups(
              buildFlavorWheelNodes(cata, lookup, total, countLabel),
              taxonomies,
            )}
            total={total}
            texts={wheelTexts}
            groups={wheelGroups}
          />
        ) : (
          <p className="type-body">{texts.detailTasteEmpty}</p>
        )}
      </CardContent>
    </Card>
  );
}
