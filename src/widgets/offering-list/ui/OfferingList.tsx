import type { ReactNode } from "react";
import type { OfferingsPageMeta, OfferingSummary, Session } from "@/shared/api";
import type {
  OfferingCardTexts,
  ResolvedTaxonomyBadge,
} from "@/entities/offering";
import { OfferingCard } from "@/entities/offering";
import { Link, Pagination } from "@/shared/ui";
import type { PaginationTexts } from "@/shared/ui";
import { RetryButton } from "./RetryButton";
import { OFFERING_GRID_CLASSES } from "../lib/grid";

// ─── UI-specific types (declared before the component) ───

export type OfferingListTexts = OfferingCardTexts &
  PaginationTexts & {
    emptyMessage: string;
    errorMessage: string;
    retryLabel: string;
    evaluateLabel: string;
  };

export type OfferingListItem = {
  offering: OfferingSummary;
  taxonomies: ResolvedTaxonomyBadge[];
};

/** The fetch result of design.md D9, mapped before it reaches this view. */
export type OfferingListResult =
  | { state: "success"; items: OfferingListItem[]; meta: OfferingsPageMeta }
  | { state: "empty" }
  | { state: "error" };

export type OfferingListProps = {
  result: OfferingListResult;
  locale: string;
  session: Session;
  texts: OfferingListTexts;
  /** The pagination's address without its query; landing's `/${locale}` by default. */
  path?: string;
  /** The query the pagination keeps while it replaces `page`; none by default. */
  query?: Record<string, string | string[] | undefined>;
  /** Replaces the grid classes; landing's `OFFERING_GRID_CLASSES` by default. */
  gridClassName?: string;
};

// The centered empty message (spec "Empty").
const EMPTY_CLASSES = "text-center";

// The grid of cards, then the pagination below it (design.md D14). The root is
// the container a region-sized grid measures (add-offering-catalog D10).
const BLOCK_CLASSES = ["@container", "flex", "flex-col", "gap-8"].join(" ");

// The error message with its retry action, centered like the empty message,
// so the button keeps its own width.
const ERROR_CLASSES = ["flex", "flex-col", "items-center", "gap-4"].join(" ");

/**
 * The presentation of the verified-offerings block (design.md D9; the landing
 * spec "Verified offerings list"). One offering card per item with the
 * pagination on success, the centered empty message on an empty page, and the
 * error message with the retry action on a failure — an offerings failure and
 * a taxonomy failure alike, since both map into the one `error` result
 * (design.md D4). Every text arrives as a prop (design.md D11) and this widget
 * fills each card's actions slot with the Evaluate link for a signed-in
 * specialist (replace-offering-card-session design.md D2).
 */
export function OfferingList({
  result,
  locale,
  session,
  texts,
  path = `/${locale}`,
  query,
  gridClassName = OFFERING_GRID_CLASSES,
}: OfferingListProps): ReactNode {
  // The contract marks the `meta` fields optional; the API always sends both,
  // and the fallbacks keep the paging arithmetic defined (design.md D3).
  const currentPage =
    result.state === "success" ? (result.meta.current_page ?? 1) : 1;
  const lastPage =
    result.state === "success" ? (result.meta.last_page ?? currentPage) : 1;

  return (
    <div id="offerings" className={BLOCK_CLASSES}>
      {result.state === "success" ? (
        <>
          <div className={gridClassName}>
            {result.items.map((item, index) => {
              // The specialist check moved unchanged from the entity
              // (replace-offering-card-session design.md D2).
              const isSpecialist =
                session.state === "authenticated" &&
                session.user.role === "specialist";
              return (
                <OfferingCard
                  key={item.offering.ulid ?? index}
                  offering={item.offering}
                  locale={locale}
                  taxonomies={item.taxonomies}
                  texts={texts}
                  actions={
                    isSpecialist ? (
                      <Link
                        href={`/${locale}/manage/evaluations/new?offering=${item.offering.ulid ?? ""}`}
                      >
                        {texts.evaluateLabel}
                      </Link>
                    ) : undefined
                  }
                />
              );
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            path={path}
            query={query}
            texts={texts}
          />
        </>
      ) : null}
      {result.state === "empty" ? (
        <p className={EMPTY_CLASSES}>{texts.emptyMessage}</p>
      ) : null}
      {result.state === "error" ? (
        <div className={ERROR_CLASSES}>
          <p>{texts.errorMessage}</p>
          <RetryButton label={texts.retryLabel} />
        </div>
      ) : null}
    </div>
  );
}
