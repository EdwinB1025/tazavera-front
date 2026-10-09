import type { ReactNode } from "react";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";
import { Card, CardAside, CardContent, CardFooter, RouteButton } from "@/shared/ui";
import { CONTENT_CLASSES, FOOTER_CLASSES, OfferingCaptions, scoreRow } from "./EvaluationRowParts";
import type { EvaluationRowSharedTexts } from "./EvaluationRowParts";

// ─── UI-specific types (declared before the component) ───

/** The public row's labels and captions (`evaluations`, `public-evaluations`; design.md D3, D6). */
export type PublicEvaluationRowCardTexts = EvaluationRowSharedTexts & {
  viewLabel: string;
  viewOfferingLabel: string;
  /** The heading when the offering read failed. */
  offeringUnavailableLabel: string;
};

export type PublicEvaluationRowCardProps = {
  evaluation: EvaluationItem;
  /** The row's offering, or `null` when it could not be read or was deleted. */
  offering: OfferingDetail | null;
  locale: string;
  texts: PublicEvaluationRowCardTexts;
};

/** A closed date in the route's locale, medium style, no time (design.md D4). */
function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(value),
  );
}

/** The row's heading, and whether its offering is shown (neither missing nor unavailable). */
function rowHeading(
  evaluation: EvaluationItem,
  offering: OfferingDetail | null,
  texts: PublicEvaluationRowCardTexts,
): { heading: string | undefined; available: boolean } {
  // The offering was deleted (design.md D3, D6), or its read failed.
  if (evaluation.offeringId === null) return { heading: texts.offeringMissingLabel, available: false };
  if (offering === null) return { heading: texts.offeringUnavailableLabel, available: false };
  return { heading: offering.coffeeInventory?.coffee?.name, available: true };
}

type RowActionsProps = {
  evaluation: EvaluationItem;
  locale: string;
  texts: PublicEvaluationRowCardTexts;
  /** The hidden suffix that tells the row's actions apart. */
  suffix: string;
  /** Whether the View offering action is shown. */
  available: boolean;
};

/** The View and View offering route buttons (fix-production-aut-findings D4). */
function RowActions({ evaluation, locale, texts, suffix, available }: RowActionsProps): ReactNode {
  return (
    <CardFooter className={FOOTER_CLASSES}>
      <RouteButton
        href={`/${locale}/evaluations/${evaluation.ulid ?? ""}`}
        variant="action-3"
        size="sm"
      >
        {texts.viewLabel}{" "}
        <span className="sr-only">{suffix}</span>
      </RouteButton>
      {available ? (
        <RouteButton
          href={`/${locale}/offerings/${evaluation.offeringId ?? ""}`}
          variant="action-3"
          size="sm"
        >
          {texts.viewOfferingLabel}{" "}
          <span className="sr-only">{suffix}</span>
        </RouteButton>
      ) : null}
    </CardFooter>
  );
}

/**
 * One public evaluations row (spec "Public evaluations list"; design.md D6's
 * card field mapping; fix-production-aut-findings D4): the score row when the
 * evaluation has a rating tier, the coffee name, the localized closed date
 * and the coffeeshop and roaster captions, with the View and View offering
 * route buttons. A row whose `offeringId` is `null` shows the
 * offering-missing text, and a row whose offering read failed the
 * offering-unavailable text, both with no captions and no View offering.
 */
export function PublicEvaluationRowCard({
  evaluation,
  offering,
  locale,
  texts,
}: PublicEvaluationRowCardProps): ReactNode {
  const { heading, available } = rowHeading(evaluation, offering, texts);
  const closedDate = evaluation.closedAt ? formatDate(evaluation.closedAt, locale) : null;
  const dateLine = `${texts.closedOnLabel} ${closedDate ?? ""}`;
  // Rows with a coffee name are told apart by it; rows without one by their
  // heading and closed date (design.md D6, Open 12 a). The separating space
  // sits outside the hidden span so every accessible-name algorithm keeps it.
  const suffix =
    available && heading !== undefined
      ? heading
      : `${heading ?? ""}${closedDate ? `, ${closedDate}` : ""}`;

  return (
    <Card layout="default">
      <CardAside>{scoreRow(evaluation, texts)}</CardAside>
      <CardContent className={CONTENT_CLASSES}>
        <h2 className="type-card-heading">{heading}</h2>
        {closedDate ? <p className="type-meta">{dateLine}</p> : null}
        {available ? <OfferingCaptions offering={offering} texts={texts} /> : null}
      </CardContent>
      <RowActions
        evaluation={evaluation}
        locale={locale}
        texts={texts}
        suffix={suffix}
        available={available}
      />
    </Card>
  );
}
