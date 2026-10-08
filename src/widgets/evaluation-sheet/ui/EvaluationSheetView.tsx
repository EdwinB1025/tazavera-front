import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import type { EvaluationItem, OfferingDetail, TaxonomyNode } from "@/shared/api";
import { fetchEvaluation } from "@/entities/evaluation";
import { fetchOffering } from "@/entities/offering";
import { fetchTaxonomies } from "@/entities/taxonomy";
import { Link, PageSection, RetryButton } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { EvaluationSheet } from "./EvaluationSheet";
import { EvaluationSheetSkeleton } from "./EvaluationSheetBaseline";
import type { EvaluationSheetTexts } from "./EvaluationSheet";

// ─── UI-specific types (declared before the component) ───

export type EvaluationViewTexts = EvaluationSheetTexts & {
  eyebrow: string;
  coffeeshopCaption: string;
  roasterCaption: string;
  closedOnLabel: string;
  viewOfferingLabel: string;
  offeringUnavailableLabel: string;
  offeringMissingLabel: string;
  errorMessage: string;
  retryLabel: string;
};

export type EvaluationSheetViewProps = {
  locale: string;
  ulid: string;
  /** The route's back link, kept in section 1 in every state. */
  back: ReactNode;
  texts: EvaluationViewTexts;
};

type ViewData = {
  evaluation: EvaluationItem;
  /** `undefined`: no offering (`offeringId` null); `null`: its read failed. */
  offering: OfferingDetail | null | undefined;
  taxonomies: TaxonomyNode[];
};

// Section 1: the back link and the header block, 1.5rem apart (summary §5.3).
const HEADER_CONTAINER_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
const HEADER_BLOCK_CLASSES = ["flex", "flex-col", "items-start", "gap-2"].join(" ");
const STATE_CLASSES = ["flex", "flex-col", "items-center", "gap-4", "text-center"].join(" ");
const BARS_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
const BAR_CLASSES = ["bg-surface-section", "rounded-field"].join(" ");

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(value),
  );
}

/** The view's loading state (spec "Loading the view"). */
export function EvaluationSheetViewSkeleton({ back }: { back: ReactNode }): ReactNode {
  return (
    <>
      <PageSection surface="page" containerClassName={HEADER_CONTAINER_CLASSES}>
        {back}
        <div aria-hidden="true" className={BARS_CLASSES}>
          <div className={cn(BAR_CLASSES, "h-4 w-1/4")} />
          <div className={cn(BAR_CLASSES, "h-6 w-2/3")} />
          <div className={cn(BAR_CLASSES, "h-4 w-1/2")} />
        </div>
      </PageSection>
      <PageSection surface="section">
        <EvaluationSheetSkeleton />
      </PageSection>
    </>
  );
}

async function load(ulid: string): Promise<ViewData | null> {
  try {
    const evaluation = await fetchEvaluation(ulid);
    const offeringId = evaluation.offeringId;
    // A null `offeringId` is a deleted offering: nothing to request (design.md D4).
    const [offering, taxonomies] = await Promise.all([
      offeringId
        ? fetchOffering(offeringId).then((read) => (read.status === "found" ? read.offering : null))
        : Promise.resolve(undefined),
      fetchTaxonomies(),
    ]);
    return { evaluation, offering, taxonomies: taxonomies.data };
  } catch {
    return null;
  }
}

/**
 * The read-only evaluation view as a thin async Server Component (design.md
 * D1, D4; spec "Read-only evaluation view"): the evaluation read, then its
 * offering and the taxonomies in parallel. A closed evaluation renders the
 * header block and the sheet; any other status renders the 404 page; a
 * failed evaluation or taxonomy read keeps the back link and shows the error
 * with Retry.
 */
export async function EvaluationSheetView({
  locale,
  ulid,
  back,
  texts,
}: EvaluationSheetViewProps): Promise<ReactNode> {
  const data = await load(ulid);
  if (data === null) {
    return (
      <>
        <PageSection surface="page" containerClassName={HEADER_CONTAINER_CLASSES}>
          {back}
        </PageSection>
        <PageSection surface="section">
          <div className={STATE_CLASSES}>
            <p className="type-body">{texts.errorMessage}</p>
            <RetryButton label={texts.retryLabel} />
          </div>
        </PageSection>
      </>
    );
  }
  const { evaluation, offering, taxonomies } = data;
  if (evaluation.status !== "closed") notFound();

  const heading =
    offering === undefined
      ? texts.offeringMissingLabel
      : offering === null
        ? texts.offeringUnavailableLabel
        : offering.coffeeInventory?.coffee?.name;
  const metaLine = evaluation.closedAt
    ? `${texts.closedOnLabel} ${formatDate(evaluation.closedAt, locale)}`
    : null;
  const coffeeshopCaption = `${texts.coffeeshopCaption} ${offering?.location?.name ?? ""}`.trim();
  const roasterCaption =
    `${texts.roasterCaption} ${offering?.coffeeInventory?.roastery?.name ?? ""}`.trim();

  return (
    <>
      <PageSection surface="page" containerClassName={HEADER_CONTAINER_CLASSES}>
        {back}
        <div className={HEADER_BLOCK_CLASSES}>
          <p className="type-eyebrow-strong">{texts.eyebrow}</p>
          <h1 className="type-heading">{heading}</h1>
          {offering ? (
            <>
              <p className="type-label">{coffeeshopCaption}</p>
              <p className="type-label">{roasterCaption}</p>
            </>
          ) : null}
          {metaLine ? <p className="type-meta">{metaLine}</p> : null}
          {offering ? (
            <Link href={`/${locale}/offerings/${evaluation.offeringId ?? ""}`}>
              {texts.viewOfferingLabel}
            </Link>
          ) : null}
        </div>
      </PageSection>
      <PageSection surface="section">
        <EvaluationSheet
          evaluation={evaluation}
          taxonomies={taxonomies}
          locale={locale}
          texts={texts}
        />
      </PageSection>
    </>
  );
}
