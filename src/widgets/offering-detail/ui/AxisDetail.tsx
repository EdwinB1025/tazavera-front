import type { ReactNode } from "react";
import type { OfferingDetail, TaxonomyNode } from "@/shared/api";
import { buildConsensusNoteTree, buildTaxonomyLookup } from "@/entities/taxonomy";
import {
  Card,
  CardAside,
  CardContent,
  Collapsible,
  CollapsibleBody,
  CollapsibleHeader,
  TaxonomyTree,
} from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type AxisDetailTexts = {
  /** The heading of the detail by axis (D18). */
  detailAxesHeading: string;
  detailTasteEmpty: string;
  attrFragrance: string;
  attrAroma: string;
  attrFlavor: string;
  attrAftertaste: string;
  attrMouthfeel: string;
};

export type AxisDetailProps = {
  offering: OfferingDetail;
  /** The taxonomy tree of `GET /taxonomies`. */
  taxonomies: TaxonomyNode[];
  locale: string;
  texts: AxisDetailTexts;
};

// ─── Fixed pieces (no interface text) ───

// The detail by axis (design.md D18): the sensory axes in order, with the
// label key of each.
const AXES = [
  ["fragrance", "attrFragrance"],
  ["aroma", "attrAroma"],
  ["flavor", "attrFlavor"],
  ["aftertaste", "attrAftertaste"],
  ["mouthfeel", "attrMouthfeel"],
] as const;

// The detail by axis on the page background, spanning both columns: the
// heading, then 1rem below it the sections group (review round 2).
const AXES_BLOCK_CLASSES = ["flex", "flex-col", "gap-4", "lg:col-span-2"].join(
  " ",
);

// The sections group: the axis section cards, 1rem apart.
const AXIS_SECTIONS_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

type AxisSectionProps = AxisDetailProps & { axis: (typeof AXES)[number] };

// One collapsed section card per sensory axis, its header in the band, the
// axis's identified notes from `sensoryTaxonomy` as their resolved tree, each
// share inline (nest-consensus-notes D3, D4), or the empty text.
function AxisSection({
  offering,
  taxonomies,
  locale,
  texts,
  axis: [axis, labelKey],
}: AxisSectionProps): ReactNode {
  const notes = buildConsensusNoteTree(
    (offering.sensoryTaxonomy ?? []).filter((node) => node.type === axis),
    buildTaxonomyLookup(taxonomies, locale),
  );
  return (
    <Collapsible>
      <Card variant="section">
        <CardAside>
          <CollapsibleHeader headingLevel={3}>
            {texts[labelKey]}
          </CollapsibleHeader>
        </CardAside>
        <CollapsibleBody>
          <CardContent>
            {notes.length > 0 ? (
              <TaxonomyTree notes={notes} total={offering.evaluationCount ?? 0} />
            ) : (
              <p className="type-body">{texts.detailTasteEmpty}</p>
            )}
          </CardContent>
        </CollapsibleBody>
      </Card>
    </Collapsible>
  );
}

/**
 * The detail by axis (design.md D18): the heading, then one collapsed
 * section card per sensory axis, in the axis order.
 */
export function AxisDetail(props: AxisDetailProps): ReactNode {
  return (
    <div className={AXES_BLOCK_CLASSES}>
      <h2 className="type-subheading">{props.texts.detailAxesHeading}</h2>
      <div className={AXIS_SECTIONS_CLASSES}>
        {AXES.map((axis) => (
          <AxisSection key={axis[0]} {...props} axis={axis} />
        ))}
      </div>
    </div>
  );
}
