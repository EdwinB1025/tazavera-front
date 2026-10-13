import { Suspense, type ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import { cn } from "@/shared/lib/utils";
import type { QueryRecord } from "@/shared/lib/filter-query";
import { BackLink, PageSection } from "@/shared/ui";
import { offeringFacetsTexts } from "@/features/offering-facets";
import { CoffeeshopDetail, coffeeshopDetailTexts, toCoffeeshopTab } from "@/widgets/coffeeshop-detail";
import {
  FilteredOfferingsResults,
  FilteredOfferingsToolbar,
  OfferingSkeletonCard,
  type FilteredOfferingsResultsTexts,
} from "@/widgets/offering-list";

// ─── UI-specific types (declared before the component) ───

export type CoffeeshopDetailScreenProps = {
  locale: string;
  ulid: string;
  /** The route's raw search params: `tab` and the offering keys. */
  searchParams: QueryRecord;
};

// The back link and the header's place, 1.5rem apart; the header block and the
// tabs' place, 2rem apart (the loaded detail's layout).
const TOP_CONTAINER_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
const BLOCKS_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
const BARS_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
const PLACEHOLDER_CLASSES = ["animate-pulse", "bg-surface-section", "rounded-field"].join(" ");
const BAR_SIZES = ["h-4 w-1/4", "h-6 w-2/3", "h-4 w-1/2"] as const;
// Two skeleton cards in the tabs' place, one column.
const SKELETON_COLUMN_CLASSES = ["grid", "grid-cols-1", "gap-6"].join(" ");
const SKELETON_CARD_KEYS = [0, 1] as const;
// The offerings toolbar, then the results, 1.5rem apart.
const OFFERINGS_PANEL_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");

/**
 * Coffee shop detail screen (add-coffeeshop-directory design.md D8, D10):
 * it loads the texts, composes the Ofertas panel from the shared filtered
 * offerings — scoped to the coffee shop, its pagination keeping the tab — and
 * renders the detail block inside a `Suspense` boundary whose fallback is the
 * back link, the placeholder bars and two skeleton cards.
 */
export function CoffeeshopDetailScreen({ locale, ulid, searchParams }: CoffeeshopDetailScreenProps): ReactNode {
  const coffeeshops = getMessages("coffeeshops", locale);
  const landing = getMessages("landing", locale);
  const catalog = getMessages("catalog", locale);
  const filters = getMessages("filters", locale);
  const texts = coffeeshopDetailTexts(coffeeshops, getMessages("contact", locale), landing);
  const tab = toCoffeeshopTab(searchParams.tab);

  const resultsTexts: FilteredOfferingsResultsTexts = {
    coffeeshopCaption: landing.cardCoffeeshopCaption,
    roasterCaption: landing.cardRoasterCaption,
    evaluationsLabel: landing.cardEvaluationsLabel,
    defectiveLabel: landing.cardDefectiveLabel,
    viewLabel: landing.cardViewLabel,
    evaluateLabel: landing.cardEvaluateLabel,
    viewEvaluationsLabel: landing.cardViewEvaluationsLabel,
    verifiedLabel: landing.cardVerifiedLabel,
    provisionalLabel: landing.cardProvisionalLabel,
    ratingExceptionalLabel: landing.cardRatingExceptionalLabel,
    ratingExcellentLabel: landing.cardRatingExcellentLabel,
    ratingGoodLabel: landing.cardRatingGoodLabel,
    ratingCommercialLabel: landing.cardRatingCommercialLabel,
    showNotesLabel: landing.treeShowNotesLabel,
    hideNotesLabel: landing.treeHideNotesLabel,
    previousLabel: landing.paginationPreviousLabel,
    nextLabel: landing.paginationNextLabel,
    navigationLabel: landing.paginationNavigationLabel,
    pageLabel: landing.paginationPageLabel,
    emptyMessage: catalog.listEmptyMessage,
    resultCount: catalog.resultCount,
    errorMessage: catalog.listErrorMessage,
    retryLabel: landing.listRetryLabel,
    noMatches: filters.noMatches,
    clearAll: filters.clearAll,
  };

  const offerings =
    tab === "offerings" ? (
      <div className={OFFERINGS_PANEL_CLASSES}>
        <FilteredOfferingsToolbar
          locale={locale}
          searchParams={searchParams}
          texts={offeringFacetsTexts(filters)}
        />
        <FilteredOfferingsResults
          locale={locale}
          searchParams={searchParams}
          path={`/${locale}/coffeeshops/${ulid}`}
          fixedQuery={{ coffeeshopUlid: ulid }}
          paginationQuery={{ tab: "offerings" }}
          texts={resultsTexts}
        />
      </div>
    ) : null;

  return (
    <div className="flex-1">
      <Suspense
        fallback={
          <PageSection surface="page" containerClassName={BLOCKS_CLASSES}>
            <div className={TOP_CONTAINER_CLASSES}>
              <BackLink fallback={`/${locale}/coffeeshops`}>
                {texts.backToDirectory}
              </BackLink>
              <div className={BARS_CLASSES}>
                {BAR_SIZES.map((size) => (
                  <div key={size} className={cn(PLACEHOLDER_CLASSES, size)} />
                ))}
              </div>
            </div>
            <div className={SKELETON_COLUMN_CLASSES}>
              {SKELETON_CARD_KEYS.map((key) => (
                <OfferingSkeletonCard key={key} />
              ))}
            </div>
          </PageSection>
        }
      >
        <CoffeeshopDetail locale={locale} ulid={ulid} tab={tab} offerings={offerings} texts={texts} />
      </Suspense>
    </div>
  );
}
