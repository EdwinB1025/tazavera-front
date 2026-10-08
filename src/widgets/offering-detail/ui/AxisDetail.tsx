import type { ReactNode } from "react";
import type { OfferingDetail, TaxonomyNode } from "@/shared/api";
import { buildDescriptorRows } from "@/entities/taxonomy";
import {
  Card,
  CardAside,
  CardContent,
  Collapsible,
  CollapsibleBody,
  CollapsibleHeader,
  DescriptorChipGroup,
} from "@/shared/ui";
import { identifiedCounts } from "../lib/identified-counts";
import { ConsensusLegend } from "./ConsensusLegend";

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
// label key of each and the taxonomy category its descriptor rows come from.
const AXES = [
  ["fragrance", "attrFragrance", "aromatics"],
  ["aroma", "attrAroma", "aromatics"],
  ["flavor", "attrFlavor", "aromatics"],
  ["aftertaste", "attrAftertaste", "aromatics"],
  ["mouthfeel", "attrMouthfeel", "mouthfeel"],
] as const;

// The detail by axis on the page background, spanning both columns: the
// heading, then 1rem below it the sections group (review round 2).
const AXES_BLOCK_CLASSES = ["flex", "flex-col", "gap-4", "lg:col-span-2"].join(
  " ",
);

// The sections group: the axis section cards, 1rem apart.
const AXIS_SECTIONS_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

// An axis body: the selection and its legend beside it from `md`, as in the
// selection blocks (D13). The section card's body pads it.
const AXIS_BODY_CLASSES = [
  "flex",
  "flex-col",
  "gap-4",
  "md:flex-row",
  "md:gap-6",
].join(" ");

type AxisSectionProps = AxisDetailProps & { axis: (typeof AXES)[number] };

// One collapsed section card per sensory axis, its header in the band, its
// identified notes from `sensoryTaxonomy` over the descriptor rows of the
// axis's category, with the consensus legend beside them.
function AxisSection({
  offering,
  taxonomies,
  locale,
  texts,
  axis: [axis, labelKey, category],
}: AxisSectionProps): ReactNode {
  const rows = buildDescriptorRows(taxonomies, category, locale);
  const counts = identifiedCounts(offering.sensoryTaxonomy ?? [], axis);
  return (
    <Collapsible>
      <Card variant="section">
        <CardAside>
          <CollapsibleHeader headingLevel={3}>
            {texts[labelKey]}
          </CollapsibleHeader>
        </CardAside>
        <CollapsibleBody>
          <CardContent className={AXIS_BODY_CLASSES}>
            <div className="min-w-0 flex-1">
              <DescriptorChipGroup
                readOnly
                legend={texts[labelKey]}
                rows={rows}
                value={[...counts.keys()]}
                emptyText={texts.detailTasteEmpty}
              />
            </div>
            <ConsensusLegend
              rows={rows}
              counts={counts}
              total={offering.evaluationCount ?? 0}
            />
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
