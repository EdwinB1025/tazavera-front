import { Suspense, type ReactNode } from "react";
import type { Session } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { cn } from "@/shared/lib/utils";
import { Link, PageSection } from "@/shared/ui";
import {
  OfferingDetail,
  toDetailTab,
  type OfferingDetailTexts,
} from "@/widgets/offering-detail";
import { OfferingSkeletonCard } from "@/widgets/offering-list";

// ─── UI-specific types (declared before the component) ───

export type OfferingDetailScreenProps = {
  locale: string;
  ulid: string;
  /** The route's raw `tab` search param. */
  tab?: string | string[];
};

// The session supply expression (the `HomeScreen` pattern): one anonymous
// `Session` constant, at this single expression.
const ANONYMOUS_SESSION: Session = { state: "anonymous" };

// The back link and the header's place, 1.5rem apart (design.md D9).
const TOP_CONTAINER_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");

// The placeholder bars in the header's place, 0.5rem apart, shaped like
// `OfferingSkeletonCard`'s: the badge, the title and a caption.
const BARS_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
const PLACEHOLDER_CLASSES = [
  "animate-pulse",
  "bg-surface-section",
  "rounded-field",
].join(" ");
const BAR_SIZES = ["h-4 w-1/4", "h-6 w-2/3", "h-4 w-1/2"] as const;

// Two skeleton cards in the tabs' place, in the panels' card grid.
const SKELETON_GRID_CLASSES = [
  "grid",
  "grid-cols-1",
  "gap-6",
  "lg:grid-cols-2",
].join(" ");
const SKELETON_CARD_KEYS = [0, 1] as const;

/**
 * Offering detail screen (add-offering-catalog design.md D7–D9; spec
 * "Offering detail page"). A thin composition: it loads the `catalog` and
 * `landing` texts of the route's locale, maps the raw `tab` value to a tab and
 * renders the detail block inside a `Suspense` boundary whose fallback is the
 * back link, the placeholder bars and two skeleton cards.
 */
export function OfferingDetailScreen({
  locale,
  ulid,
  tab,
}: OfferingDetailScreenProps): ReactNode {
  const catalog = getMessages("catalog", locale);
  const landing = getMessages("landing", locale);
  const scales = getMessages("scales", locale);

  const texts: OfferingDetailTexts = {
    backLabel: catalog.detailBackLabel,
    errorMessage: catalog.detailErrorMessage,
    retryLabel: landing.listRetryLabel,
    tabInventory: catalog.detailTabInventory,
    tabConsensus: catalog.detailTabConsensus,
    verifiedLabel: landing.cardVerifiedLabel,
    provisionalLabel: landing.cardProvisionalLabel,
    coffeeshopCaption: landing.cardCoffeeshopCaption,
    roasterCaption: landing.cardRoasterCaption,
    evaluateLabel: landing.cardEvaluateLabel,
    detailInventoryHeading: catalog.detailInventoryHeading,
    fieldRoastLot: catalog.fieldRoastLot,
    fieldProductionDate: catalog.fieldProductionDate,
    fieldCountry: catalog.fieldCountry,
    fieldRegion: catalog.fieldRegion,
    fieldProducer: catalog.fieldProducer,
    fieldVariety: catalog.fieldVariety,
    fieldProcess: catalog.fieldProcess,
    fieldAltitude: catalog.fieldAltitude,
    fieldCoffeeLot: catalog.fieldCoffeeLot,
    fieldRoastLevel: catalog.fieldRoastLevel,
    fieldRoastery: catalog.fieldRoastery,
    fieldCoffeeshop: catalog.fieldCoffeeshop,
    ratingExceptionalLabel: landing.cardRatingExceptionalLabel,
    ratingExcellentLabel: landing.cardRatingExcellentLabel,
    ratingGoodLabel: landing.cardRatingGoodLabel,
    ratingCommercialLabel: landing.cardRatingCommercialLabel,
    detailStatusHeading: catalog.detailStatusHeading,
    fieldEvaluationCount: catalog.fieldEvaluationCount,
    fieldDefectiveCount: catalog.fieldDefectiveCount,
    fieldConcordanceAffective: catalog.fieldConcordanceAffective,
    fieldConcordanceDescriptive: catalog.fieldConcordanceDescriptive,
    concordanceLow: catalog.concordanceLow,
    concordanceModerate: catalog.concordanceModerate,
    concordanceHigh: catalog.concordanceHigh,
    concordanceExcellent: catalog.concordanceExcellent,
    detailAttributesHeading: catalog.detailAttributesHeading,
    attrFragrance: catalog.attrFragrance,
    attrAroma: catalog.attrAroma,
    attrFlavor: catalog.attrFlavor,
    attrAftertaste: catalog.attrAftertaste,
    attrAcidity: catalog.attrAcidity,
    attrSweetness: catalog.attrSweetness,
    attrMouthfeel: catalog.attrMouthfeel,
    attrOverall: catalog.attrOverall,
    beanValue: scales.beanValue,
    beanValueLabel: scales.beanValueLabel,
    detailMainTastesHeading: catalog.detailMainTastesHeading,
    detailDefectsHeading: catalog.detailDefectsHeading,
    detailTasteEmpty: catalog.detailTasteEmpty,
    detailCataHeading: catalog.detailCataHeading,
    detailNotVerifiedMessage: catalog.detailNotVerifiedMessage,
    wheelLabel: catalog.wheelLabel,
    wheelHint: catalog.wheelHint,
    wheelCount: catalog.wheelCount,
    wheelNotesToggle: catalog.wheelNotesToggle,
    wheelGroupsLabel: catalog.wheelGroupsLabel,
    wheelGroupAromatics: catalog.wheelGroupAromatics,
    detailAxesHeading: catalog.detailAxesHeading,
  };

  return (
    <div className="flex-1">
      <Suspense
        fallback={
          <>
            <PageSection
              surface="page"
              containerClassName={TOP_CONTAINER_CLASSES}
            >
              <Link variant="back" href={`/${locale}/offerings`}>
                {texts.backLabel}
              </Link>
              <div className={BARS_CLASSES}>
                {BAR_SIZES.map((size) => (
                  <div key={size} className={cn(PLACEHOLDER_CLASSES, size)} />
                ))}
              </div>
            </PageSection>
            <PageSection surface="section">
              <div className={SKELETON_GRID_CLASSES}>
                {SKELETON_CARD_KEYS.map((key) => (
                  <OfferingSkeletonCard key={key} />
                ))}
              </div>
            </PageSection>
          </>
        }
      >
        <OfferingDetail
          locale={locale}
          ulid={ulid}
          tab={toDetailTab(tab)}
          session={ANONYMOUS_SESSION}
          texts={texts}
        />
      </Suspense>
    </div>
  );
}
