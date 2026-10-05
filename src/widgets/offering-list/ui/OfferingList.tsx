import type { ReactNode } from "react";
import type { OfferingsPageMeta, OfferingSummary, Session } from "@/shared/api";
import type {
  OfferingCardTexts,
  ResolvedTaxonomyBadge,
} from "@/entities/offering";
import { OfferingCard } from "@/entities/offering";
import { OfferingPagination } from "./OfferingPagination";
import type { OfferingPaginationTexts } from "./OfferingPagination";
import { RetryButton } from "./RetryButton";
import { OFFERING_GRID_CLASSES } from "../lib/grid";

// ─── UI-specific types (declared before the component) ───

export type OfferingListTexts = OfferingCardTexts &
  OfferingPaginationTexts & {
    emptyMessage: string;
    errorMessage: string;
    retryLabel: string;
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
};

// The centered empty message (spec "Empty").
const EMPTY_CLASSES = "text-center";

// The grid of cards, then the pagination below it (design.md D14).
const BLOCK_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");

// The error message with its retry action, centered like the empty message,
// so the button keeps its own width.
const ERROR_CLASSES = ["flex", "flex-col", "items-center", "gap-4"].join(" ");

/**
 * The presentation of the verified-offerings block (design.md D9; the landing
 * spec "Verified offerings list"). One offering card per item with the
 * pagination on success, the centered empty message on an empty page, and the
 * error message with the retry action on a failure — an offerings failure and
 * a taxonomy failure alike, since both map into the one `error` result
 * (design.md D4). Every text arrives as a prop (design.md D11) and the session
 * passes through to each card (design.md D8).
 */
export function OfferingList({
  result,
  locale,
  session,
  texts,
}: OfferingListProps): ReactNode {
  return (
    <div id="offerings" className={BLOCK_CLASSES}>
      {result.state === "success" ? (
        <>
          <div className={OFFERING_GRID_CLASSES}>
            {result.items.map((item, index) => (
              <OfferingCard
                key={item.offering.ulid ?? index}
                offering={item.offering}
                locale={locale}
                session={session}
                taxonomies={item.taxonomies}
                texts={texts}
              />
            ))}
          </div>
          <OfferingPagination
            locale={locale}
            meta={result.meta}
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
