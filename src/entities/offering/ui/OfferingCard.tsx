import type { ReactNode } from "react";
import type { OfferingSummary } from "@/shared/api";
import {
  Badge,
  Card,
  CardAside,
  CardContent,
  CardFooter,
  TaxonomyTree,
} from "@/shared/ui";
import type { TaxonomyTreeNode } from "@/shared/ui";
import { ratingTierFor } from "../lib/rating";

// ─── UI-specific types (declared before the component) ───
// The taxonomy badges arrive already resolved — reference, label, data color,
// level and children, nested as the consensus tree — from the taxonomy
// entity's tree resolver, whose type matches this one structurally
// (nest-card-taste-notes design.md D1), and render as the shared taxonomy
// tree (nest-consensus-notes D1). No generated API type is edited or
// redefined here.

export type ResolvedTaxonomyBadge = TaxonomyTreeNode;

/** Every label and caption of the card, as props (design.md D11). */
export type OfferingCardTexts = {
  coffeeshopCaption: string;
  roasterCaption: string;
  evaluationsLabel: string;
  defectiveLabel: string;
  verifiedLabel: string;
  provisionalLabel: string;
  ratingExceptionalLabel: string;
  ratingExcellentLabel: string;
  ratingGoodLabel: string;
  ratingCommercialLabel: string;
};

export type OfferingCardProps = {
  offering: OfferingSummary;
  taxonomies: ResolvedTaxonomyBadge[];
  texts: OfferingCardTexts;
  actions?: ReactNode;
};

// ─── Fixed pieces (no interface text; design.md D11) ───
const SCORE_SCALE = "/100";
const ORIGIN_SEPARATOR = " · ";

// ─── Card layout (design.md D14) ───
// Score, `/100` and rating badge on one row above the content.
const SCORE_ROW_CLASSES = ["flex", "flex-wrap", "items-baseline", "gap-2"].join(
  " ",
);
// The counts 1rem apart, the actions grouped at the end; the footer wraps.
const FOOTER_CLASSES = ["flex", "flex-wrap", "items-center", "gap-4"].join(" ");
const FOOTER_COUNTS_CLASSES = ["flex", "flex-wrap", "gap-4"].join(" ");
const FOOTER_LINKS_CLASSES = ["ml-auto", "flex", "gap-4"].join(" ");

/**
 * One offering filled into the shared card (design.md D4's field mapping and
 * D8; the landing spec "Offering card content" and "Taxonomy badge trees on
 * the offering card"). Every label and caption arrives as a prop (design.md
 * D11) and the consumer's actions arrive as the `actions` node, rendered in the
 * footer's group with no wrapper; the card has no action of its own, the View
 * action included (fix-production-aut-findings design.md D3).
 */
export function OfferingCard({
  offering,
  taxonomies,
  texts,
  actions,
}: OfferingCardProps): ReactNode {
  const tier = ratingTierFor(offering.cuppingAvg);
  // The badge's text is the word of the tier the score falls in, in place of
  // the score (label-rating-badge design.md D1, D2): the word follows the same
  // tier that picks the treatment, so the two can never disagree.
  const tierWords = {
    "rating-exceptional": texts.ratingExceptionalLabel,
    "rating-excellent": texts.ratingExcellentLabel,
    "rating-good": texts.ratingGoodLabel,
    "rating-commercial": texts.ratingCommercialLabel,
  };
  const coffee = offering.coffeeInventory?.coffee;
  const origin = [
    coffee?.country,
    coffee?.region,
    coffee?.process,
    coffee?.variety,
  ]
    .filter((part): part is string => part != null)
    .join(ORIGIN_SEPARATOR);
  const isVerified = offering.verificationStatus === "verified";
  const statusLabel = isVerified ? texts.verifiedLabel : texts.provisionalLabel;
  const coffeeshopCaption =
    `${texts.coffeeshopCaption} ${offering.location?.name ?? ""}`.trim();
  const roasterCaption =
    `${texts.roasterCaption} ${offering.coffeeInventory?.roastery?.name ?? ""}`.trim();
  const evaluations = `${texts.evaluationsLabel} ${offering.evaluationCount ?? 0}`;
  const defective = `${texts.defectiveLabel} ${offering.defectiveEvaluationCount ?? 0}`;

  return (
    <Card layout="stacked">
      {tier !== null ? (
        <CardAside>
          <div className={SCORE_ROW_CLASSES}>
            <div className="type-score">{offering.cuppingAvg}</div>
            <div className="type-meta">{SCORE_SCALE}</div>
            <Badge variant={tier}>{tierWords[tier]}</Badge>
          </div>
        </CardAside>
      ) : null}
      <CardContent>
        <Badge variant={isVerified ? "verified" : "provisional"}>
          {statusLabel}
        </Badge>
        <h3 className="type-card-heading">{coffee?.name}</h3>
        <p className="type-label">{coffeeshopCaption}</p>
        <p className="type-label">{roasterCaption}</p>
        <p className="type-meta">{origin}</p>
        <TaxonomyTree notes={taxonomies} />
      </CardContent>
      <CardFooter className={FOOTER_CLASSES}>
        <div className={FOOTER_COUNTS_CLASSES}>
          <span className="type-meta">{evaluations}</span>
          <span className="type-meta">{defective}</span>
        </div>
        <div className={FOOTER_LINKS_CLASSES}>{actions}</div>
      </CardFooter>
    </Card>
  );
}
