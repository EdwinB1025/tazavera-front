import type { ReactNode } from "react";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";
import { ratingTierFor } from "@/entities/offering";
import { Badge, Card, CardAside, CardContent, CardFooter, RouteButton } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

/** The row's labels and captions (`evaluations`, `public-evaluations`; design.md D3, D6). */
export type EvaluationRowCardTexts = {
  openLabel: string;
  closedLabel: string;
  createdOnLabel: string;
  closedOnLabel: string;
  coffeeshopCaption: string;
  roasterCaption: string;
  ratingExceptionalLabel: string;
  ratingExcellentLabel: string;
  ratingGoodLabel: string;
  ratingCommercialLabel: string;
  /** Shown in place of the offering when its `offeringId` is `null`. */
  offeringMissingLabel: string;
  viewLabel: string;
  /** Public variant: the offering action. */
  viewOfferingLabel?: string;
  /** Public variant: the heading when the offering read failed. */
  offeringUnavailableLabel?: string;
};

export type EvaluationRowCardProps = {
  /**
   * `specialist`: status badge, `h3`, ISO date in a `<time>`, `actions` in
   * the footer. `public`: no badge, `h2`, the localized closed date and the
   * View / View offering action buttons (design.md D6; fix-production-aut-findings D4).
   */
  variant: "specialist" | "public";
  evaluation: EvaluationItem;
  /** The row's offering, or `null` when it could not be read or was deleted. */
  offering: OfferingDetail | null;
  locale: string;
  texts: EvaluationRowCardTexts;
  /** The specialist variant's footer actions. */
  actions?: ReactNode;
};

// ─── Fixed pieces (no interface text) ───
const SCORE_SCALE = "/100";

const SCORE_ROW_CLASSES = ["flex", "flex-wrap", "items-baseline", "gap-2"].join(" ");
const CONTENT_CLASSES = ["flex", "flex-col", "items-start", "gap-2"].join(" ");
const FOOTER_CLASSES = ["flex", "flex-wrap", "justify-end", "gap-4"].join(" ");

/** The date part (`YYYY-MM-DD`) of an API timestamp. */
function datePart(value: string): string {
  return value.slice(0, 10);
}

/** A closed date in the route's locale, medium style, no time (design.md D4). */
function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(value),
  );
}

/**
 * One evaluation row (design.md D6's card field mapping; spec "Public
 * evaluations list" and "My evaluations list"): the score row when the
 * evaluation has a `cuppingScore`, the coffee name, the date and the
 * coffeeshop and roaster captions. A row whose `offeringId` is `null` shows
 * the offering-missing text with no captions; on the public variant a row
 * whose offering read failed shows the offering-unavailable text the same way.
 */
export function EvaluationRowCard({
  variant,
  evaluation,
  offering,
  locale,
  texts,
  actions,
}: EvaluationRowCardProps): ReactNode {
  const isPublic = variant === "public";
  const tier = ratingTierFor(evaluation.cuppingScore);
  const tierWords = {
    "rating-exceptional": texts.ratingExceptionalLabel,
    "rating-excellent": texts.ratingExcellentLabel,
    "rating-good": texts.ratingGoodLabel,
    "rating-commercial": texts.ratingCommercialLabel,
  };
  const closed = evaluation.status === "closed";
  // The offering was deleted (design.md D3, D6).
  const orphan = evaluation.offeringId === null;
  const unavailable = isPublic && !orphan && offering === null;
  const coffeeName = offering?.coffeeInventory?.coffee?.name;
  const heading = orphan
    ? texts.offeringMissingLabel
    : unavailable
      ? texts.offeringUnavailableLabel
      : coffeeName;
  const coffeeshopCaption = `${texts.coffeeshopCaption} ${offering?.location?.name ?? ""}`.trim();
  const roasterCaption =
    `${texts.roasterCaption} ${offering?.coffeeInventory?.roastery?.name ?? ""}`.trim();

  const scoreRow =
    tier !== null ? (
      <div className={SCORE_ROW_CLASSES}>
        <div className="type-score">{evaluation.cuppingScore}</div>
        <div className="type-meta">{SCORE_SCALE}</div>
        <Badge variant={tier}>{tierWords[tier]}</Badge>
      </div>
    ) : null;

  const captions =
    orphan || unavailable ? null : (
      <div>
        <p className="type-label">{coffeeshopCaption}</p>
        <p className="type-label">{roasterCaption}</p>
      </div>
    );

  if (!isPublic) {
    const dateValue = closed ? evaluation.closedAt : evaluation.createdAt;
    const dateLabel = closed ? texts.closedOnLabel : texts.createdOnLabel;
    return (
      <Card layout="default">
        {scoreRow ? <CardAside>{scoreRow}</CardAside> : null}
        <CardContent className={CONTENT_CLASSES}>
          <Badge variant={closed ? "verified" : "provisional"}>
            {closed ? texts.closedLabel : texts.openLabel}
          </Badge>
          <h3 className="type-card-heading">{heading}</h3>
          <p className="type-meta">
            {dateLabel}{" "}
            {dateValue ? <time dateTime={dateValue}>{datePart(dateValue)}</time> : null}
          </p>
          {captions}
        </CardContent>
        <CardFooter className={FOOTER_CLASSES}>{actions}</CardFooter>
      </Card>
    );
  }

  const closedDate = evaluation.closedAt ? formatDate(evaluation.closedAt, locale) : null;
  const dateLine = `${texts.closedOnLabel} ${closedDate ?? ""}`;
  // Rows with a coffee name are told apart by it; rows without one by their
  // heading and closed date (design.md D6, Open 12 a). The separating space
  // sits outside the hidden span so every accessible-name algorithm keeps it.
  const linkSuffix =
    coffeeName !== undefined && !orphan && !unavailable
      ? coffeeName
      : `${heading ?? ""}${closedDate ? `, ${closedDate}` : ""}`;

  return (
    <Card layout="default">
      <CardAside>{scoreRow}</CardAside>
      <CardContent className={CONTENT_CLASSES}>
        <h2 className="type-card-heading">{heading}</h2>
        {closedDate ? (
          <p className="type-meta">{dateLine}</p>
        ) : null}
        {captions}
      </CardContent>
      <CardFooter className={FOOTER_CLASSES}>
        <RouteButton
          href={`/${locale}/evaluations/${evaluation.ulid ?? ""}`}
          variant="action-3"
          size="sm"
        >
          {texts.viewLabel}{" "}
          <span className="sr-only">{linkSuffix}</span>
        </RouteButton>
        {orphan || unavailable ? null : (
          <RouteButton
            href={`/${locale}/offerings/${evaluation.offeringId ?? ""}`}
            variant="action-4"
            size="sm"
          >
            {texts.viewOfferingLabel}{" "}
            <span className="sr-only">{linkSuffix}</span>
          </RouteButton>
        )}
      </CardFooter>
    </Card>
  );
}
