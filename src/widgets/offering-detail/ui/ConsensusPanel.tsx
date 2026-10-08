import type { ReactNode } from "react";
import type { OfferingDetail, TaxonomyNode } from "@/shared/api";
import { Card, CardContent } from "@/shared/ui";
import { AttributesCard } from "./AttributesCard";
import type { AttributesCardTexts } from "./AttributesCard";
import { AxisDetail } from "./AxisDetail";
import type { AxisDetailTexts } from "./AxisDetail";
import { CataCard } from "./CataCard";
import type { CataCardTexts } from "./CataCard";
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
  SelectionBlockTexts &
  CataCardTexts &
  AxisDetailTexts & {
    detailMainTastesHeading: string;
    detailDefectsHeading: string;
    /** The not-verified message shown instead of the SCA card (D20). */
    detailNotVerifiedMessage: string;
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
  const taxonomyProps = { offering, taxonomies, locale, texts };
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
          {...taxonomyProps}
          category="main_tastes"
          heading={texts.detailMainTastesHeading}
        />
        <SelectionBlock
          {...taxonomyProps}
          category="defects"
          heading={texts.detailDefectsHeading}
        />
        <CataCard {...taxonomyProps} />
        <AxisDetail {...taxonomyProps} />
      </div>
    </div>
  );
}
