import type { ReactNode } from "react";
import type { OfferingSummary, Session } from "@/shared/api";
import {
  Badge,
  Card,
  CardAside,
  CardContent,
  CardFooter,
  Link,
} from "@/shared/ui";
import { ratingTierFor } from "../lib/rating";

// ─── UI-specific types (declared before the component) ───
// The taxonomy badges arrive already resolved — label, data color and level —
// from the block that resolved each `ref` against `GET /taxonomies`
// (design.md D5, D8). No generated API type is edited or redefined here.

export type ResolvedTaxonomyBadge = {
  label: string;
  color: string;
  level: 0 | 1 | 2;
};

/** Every label and caption of the card, as props (design.md D11). */
export type OfferingCardTexts = {
  coffeeshopCaption: string;
  roasterCaption: string;
  evaluationsLabel: string;
  defectiveLabel: string;
  viewLabel: string;
  evaluateLabel: string;
  verifiedLabel: string;
  provisionalLabel: string;
};

export type OfferingCardProps = {
  offering: OfferingSummary;
  locale: string;
  session: Session;
  taxonomies: ResolvedTaxonomyBadge[];
  texts: OfferingCardTexts;
};

// ─── Fixed pieces (no interface text; design.md D11) ───
const SCORE_SCALE = "/100";
const ORIGIN_SEPARATOR = " · ";
const TAXONOMY_LEVELS = [0, 1, 2] as const;

// Each row wraps its badges so no row overflows the card below `md`
// (design.md D8; spec "Rows by level").
const ROW_CLASSES = ["flex", "flex-wrap", "gap-2"].join(" ");

/**
 * One offering filled into the shared card (design.md D4's field mapping and
 * D8; the landing spec "Offering card content" and "Taxonomy badges on the
 * offering card"). Every label and caption arrives as a prop (design.md D11)
 * and the session is an input of the `Session` type: the Evaluate link renders
 * exactly when its user role is `specialist` (design.md D8).
 */
export function OfferingCard({
  offering,
  locale,
  session,
  taxonomies,
  texts,
}: OfferingCardProps): ReactNode {
  const tier = ratingTierFor(offering.cuppingAvg);
  const coffee = offering.coffeeInventory?.coffee;
  const origin = [coffee?.country, coffee?.region, coffee?.process, coffee?.variety]
    .filter((part): part is string => part != null)
    .join(ORIGIN_SEPARATOR);
  const isVerified = offering.verificationStatus === "verified";
  const statusLabel = isVerified ? texts.verifiedLabel : texts.provisionalLabel;
  const isSpecialist =
    session.state === "authenticated" && session.user.role === "specialist";
  const coffeeshopCaption =
    `${texts.coffeeshopCaption} ${offering.location?.name ?? ""}`.trim();
  const roasterCaption =
    `${texts.roasterCaption} ${offering.coffeeInventory?.roastery?.name ?? ""}`.trim();
  const evaluations = `${texts.evaluationsLabel} ${offering.evaluationCount ?? 0}`;
  const defective = `${texts.defectiveLabel} ${offering.defectiveEvaluationCount ?? 0}`;

  return (
    <Card>
      {tier !== null ? (
        <CardAside>
          <div className="type-score">{offering.cuppingAvg}</div>
          <div className="type-meta">{SCORE_SCALE}</div>
          <Badge variant={tier}>{offering.cuppingAvg}</Badge>
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
        {TAXONOMY_LEVELS.map((level) => (
          <div key={level} className={ROW_CLASSES}>
            {taxonomies
              .filter((badge) => badge.level === level)
              .map((badge) => (
                <Badge
                  key={badge.label}
                  variant="taxonomy"
                  color={badge.color}
                  level={badge.level}
                >
                  {badge.label}
                </Badge>
              ))}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <span className="type-meta">{evaluations}</span>
        <span className="type-meta">{defective}</span>
        <Link href={`/${locale}/offerings/${offering.ulid ?? ""}`}>
          {texts.viewLabel}
        </Link>
        {isSpecialist ? (
          <Link
            href={`/${locale}/manage/evaluations/new?offering=${offering.ulid ?? ""}`}
          >
            {texts.evaluateLabel}
          </Link>
        ) : null}
      </CardFooter>
    </Card>
  );
}
