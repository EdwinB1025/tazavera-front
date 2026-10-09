import type { ReactNode } from "react";
import type { EvaluationItem, OfferingDetail, TaxonomyNode } from "@/shared/api";
import { fetchEvaluation } from "@/entities/evaluation";
import { fetchOffering } from "@/entities/offering";
import { collectTaxonomyRefs, fetchTaxonomiesCovering } from "@/entities/taxonomy";
import { PageSection, RetryButton, RouteButton } from "@/shared/ui";
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
  notFoundTitle: string;
  notFoundLine: string;
};

export type EvaluationSheetViewProps = {
  locale: string;
  ulid: string;
  /** The route's back link, kept in section 1 in every state. */
  back: ReactNode;
  /** The route's back button, at the end of section 2 of a closed evaluation (apply-header-link-rule). */
  bottomBack: ReactNode;
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
// Section 2: the sheet, then the back button, 2rem apart
// (add-bottom-back-links D3; apply-header-link-rule).
const SHEET_CONTAINER_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
const HEADER_BLOCK_CLASSES = ["flex", "flex-col", "items-start", "gap-2"].join(" ");
// The not-found title and its line, 0.5rem apart (show-item-not-found-message
// design.md D2).
const NOT_FOUND_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
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

/** The view's data, `"not-found"` for a `404` or an evaluation that is not closed, `null` on a failure. */
async function load(ulid: string): Promise<ViewData | "not-found" | null> {
  try {
    const read = await fetchEvaluation(ulid);
    if (!read.ok) return read.kind === "not-found" ? "not-found" : null;
    const evaluation = read.data;
    if (evaluation.status !== "closed") return "not-found";
    const offeringId = evaluation.offeringId;
    // A null `offeringId` is a deleted offering: nothing to request (design.md D4).
    const [offering, taxonomies] = await Promise.all([
      offeringId
        ? fetchOffering(offeringId).then((offeringRead) => (offeringRead.ok ? offeringRead.data : null))
        : Promise.resolve(undefined),
      fetchTaxonomiesCovering(collectTaxonomyRefs(evaluation.tastes ?? [])),
    ]);
    if (!taxonomies.ok) return null;
    return { evaluation, offering, taxonomies: taxonomies.data.data };
  } catch {
    return null;
  }
}

/**
 * The not-found state (show-item-not-found-message design.md D2): the title and
 * line above the back button, which follows the title and so is a button
 * (base-controls "Navigation controls by position"); no Retry.
 */
function EvaluationNotFound({ back, texts }: { back: ReactNode; texts: EvaluationViewTexts }): ReactNode {
  return (
    <PageSection surface="page" containerClassName={HEADER_CONTAINER_CLASSES}>
      <div className={NOT_FOUND_CLASSES}>
        <h1 className="type-heading">{texts.notFoundTitle}</h1>
        <p className="type-body">{texts.notFoundLine}</p>
      </div>
      <div>{back}</div>
    </PageSection>
  );
}

/**
 * The read-only evaluation view as a thin async Server Component (design.md
 * D1, D4; spec "Read-only evaluation view"): the evaluation read, then its
 * offering and the taxonomies in parallel. A closed evaluation renders the
 * header block and the sheet; a `404` or any other status renders the
 * not-found title and line; a failed evaluation or taxonomy read keeps the
 * back link and shows the error with Retry.
 */
export async function EvaluationSheetView({
  locale,
  ulid,
  back,
  bottomBack,
  texts,
}: EvaluationSheetViewProps): Promise<ReactNode> {
  const data = await load(ulid);
  if (data === "not-found") return <EvaluationNotFound back={bottomBack} texts={texts} />;
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
            <RouteButton
              href={`/${locale}/offerings/${evaluation.offeringId ?? ""}`}
              variant="action-3"
              size="sm"
            >
              {texts.viewOfferingLabel}
            </RouteButton>
          ) : null}
        </div>
      </PageSection>
      <PageSection surface="section" containerClassName={SHEET_CONTAINER_CLASSES}>
        <EvaluationSheet
          evaluation={evaluation}
          taxonomies={taxonomies}
          locale={locale}
          texts={texts}
        />
        <div>{bottomBack}</div>
      </PageSection>
    </>
  );
}
