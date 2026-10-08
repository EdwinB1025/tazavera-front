import type { ReactNode } from "react";
import type { OfferingDetail, TaxonomyNode } from "@/shared/api";
import {
  assignWheelGroups,
  buildDescriptorRows,
  buildFlavorWheelNodes,
  buildTaxonomyLookup,
} from "@/entities/taxonomy";
import {
  Card,
  CardAside,
  CardContent,
  Collapsible,
  CollapsibleBody,
  CollapsibleHeader,
  DescriptorChipGroup,
  FlavorWheel,
} from "@/shared/ui";
import { identifiedCounts } from "../lib/identified-counts";
import { AttributesCard } from "./AttributesCard";
import type { AttributesCardTexts } from "./AttributesCard";
import { ConsensusLegend } from "./ConsensusLegend";
import { ScoreCard } from "./ScoreCard";
import type { ScoreCardTexts } from "./ScoreCard";
import { SelectionBlock } from "./SelectionBlock";
import type { SelectionBlockTexts } from "./SelectionBlock";
import { StatusCard } from "./StatusCard";
import type { StatusCardTexts } from "./StatusCard";

// ─── UI-specific types (declared before the component) ───

export type ConsensusPanelTexts = ScoreCardTexts &
  AttributesCardTexts &
  StatusCardTexts &
  SelectionBlockTexts & {
  detailMainTastesHeading: string;
  detailDefectsHeading: string;
  detailCataHeading: string;
  /** The not-verified message shown instead of the SCA card (D20). */
  detailNotVerifiedMessage: string;
  wheelLabel: string;
  wheelHint: string;
  /** `{count} de {total} evaluadores`: a wheel note's accessible count. */
  wheelCount: string;
  wheelNotesToggle: string;
  /** The wheel's general group legend name and the aromatics group (D19). */
  wheelGroupsLabel: string;
  wheelGroupAromatics: string;
  /** The heading of the detail by axis (D18). */
  detailAxesHeading: string;
};

export type ConsensusPanelProps = {
  offering: OfferingDetail;
  /** The taxonomy tree of `GET /taxonomies`. */
  taxonomies: TaxonomyNode[];
  locale: string;
  texts: ConsensusPanelTexts;
};

// ─── Fixed pieces (no interface text) ───

// The score card above the card grid, 1.5rem apart.
const PANEL_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");

// The card grid: one column below `lg`, two equal columns from `lg`, with a
// 1.5rem gap; grid items stretch, so the cards of a row share one height.
const GRID_CLASSES = ["grid", "grid-cols-1", "gap-6", "lg:grid-cols-2"].join(
  " ",
);

// Each card: the heading and its content, 1rem apart.
const CONTENT_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

// A card spanning both grid columns from `lg`.
const WIDE_CARD_CLASSES = "lg:col-span-2";

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

/**
 * The Consensus panel (add-offering-catalog design.md D12–D14; the spec's
 * "Consensus …" requirements): the score card for a verified offering, then
 * the card grid with the blocks in the order of review round 1 (D12). Every text arrives as a
 * prop; the score and the bands never rest on colour alone.
 */
export function ConsensusPanel({
  offering,
  taxonomies,
  locale,
  texts,
}: ConsensusPanelProps): ReactNode {
  const total = offering.evaluationCount ?? 0;

  // The detail by axis (design.md D18): one collapsed section card per
  // sensory axis, its header in the band, its identified notes from
  // `sensoryTaxonomy` over the descriptor rows of the axis's category, with
  // the consensus legend beside them.
  function axisSection([
    axis,
    labelKey,
    category,
  ]: (typeof AXES)[number]): ReactNode {
    const rows = buildDescriptorRows(taxonomies, category, locale);
    const counts = identifiedCounts(offering.sensoryTaxonomy ?? [], axis);
    return (
      <Collapsible key={axis}>
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
              <ConsensusLegend rows={rows} counts={counts} total={total} />
            </CardContent>
          </CollapsibleBody>
        </Card>
      </Collapsible>
    );
  }

  // The CATA wheel (design.md D14, D19): one `FlavorWheel` fed the
  // `aromatics` group of `cataConcordance`, its roots grouped into aromatics
  // and mouthfeel; an empty concordance shows the empty text instead.
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
    <div className={PANEL_CLASSES}>
      <ScoreCard offering={offering} texts={texts} />
      <div className={GRID_CLASSES}>
        {offering.verificationStatus === "verified" ? (
          <AttributesCard offering={offering} locale={locale} texts={texts} />
        ) : (
          <Card layout="stacked">
            <CardContent>
              <p className="type-body">{texts.detailNotVerifiedMessage}</p>
            </CardContent>
          </Card>
        )}
        <StatusCard offering={offering} texts={texts} />
        <SelectionBlock
          offering={offering}
          taxonomies={taxonomies}
          locale={locale}
          category="main_tastes"
          heading={texts.detailMainTastesHeading}
          texts={texts}
        />
        <SelectionBlock
          offering={offering}
          taxonomies={taxonomies}
          locale={locale}
          category="defects"
          heading={texts.detailDefectsHeading}
          texts={texts}
        />
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
        <div className={AXES_BLOCK_CLASSES}>
          <h2 className="type-subheading">{texts.detailAxesHeading}</h2>
          <div className={AXIS_SECTIONS_CLASSES}>{AXES.map(axisSection)}</div>
        </div>
      </div>
    </div>
  );
}
