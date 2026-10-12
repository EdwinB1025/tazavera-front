import { Suspense, type ReactNode } from "react";
import type { Session } from "@/shared/api";
import { getMessages, type MessageCatalog } from "@/shared/lib/i18n";
import { cn } from "@/shared/lib/utils";
import { BackLink, PageSection } from "@/shared/ui";
import {
  OfferingDetail,
  toDetailTab,
  type OfferingDetailTexts,
} from "@/widgets/offering-detail";
import { OfferingSkeletonCard } from "@/widgets/offering-list";
import {
  EvaluationSheetBaseline,
  EvaluationSheetSkeleton,
  evaluationSheetTexts,
  type EvaluationBaselineTexts,
} from "@/widgets/evaluation-sheet";

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

// The header block and the tabs' place on the page background, 2rem apart,
// as the loaded detail lays them out (design.md D9).
const BLOCKS_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");

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

/** The detail block's texts from the catalogs of the route's locale. */
function detailTexts(
  catalog: MessageCatalog,
  landing: MessageCatalog,
  scales: MessageCatalog,
): OfferingDetailTexts {
  return {
    backLabel: catalog.detailBackLabel,
    errorMessage: catalog.detailErrorMessage,
    retryLabel: landing.listRetryLabel,
    notFoundTitle: catalog.detailNotFoundTitle,
    notFoundLine: catalog.detailNotFoundLine,
    tabInventory: catalog.detailTabInventory,
    tabConsensus: catalog.detailTabConsensus,
    tabProvisional: catalog.detailTabProvisional,
    viewEvaluationsLabel: catalog.detailViewEvaluations,
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
    showNotesLabel: landing.treeShowNotesLabel,
    hideNotesLabel: landing.treeHideNotesLabel,
  };
}

/** The detail block's fallback: the back link, the placeholder bars and two skeleton cards. */
function DetailFallback({ locale, backLabel }: { locale: string; backLabel: string }): ReactNode {
  return (
    <PageSection surface="page" containerClassName={BLOCKS_CLASSES}>
      <div className={TOP_CONTAINER_CLASSES}>
        <BackLink fallback={`/${locale}/offerings`}>
          {backLabel}
        </BackLink>
        <div className={BARS_CLASSES}>
          {BAR_SIZES.map((size) => (
            <div key={size} className={cn(PLACEHOLDER_CLASSES, size)} />
          ))}
        </div>
      </div>
      <div className={SKELETON_GRID_CLASSES}>
        {SKELETON_CARD_KEYS.map((key) => (
          <OfferingSkeletonCard key={key} />
        ))}
      </div>
    </PageSection>
  );
}

/**
 * Offering detail screen (add-offering-catalog design.md D7–D9; spec
 * "Offering detail page"). A thin composition: it loads the `catalog` and
 * `landing` texts of the route's locale, maps the raw `tab` value to a tab and
 * renders the detail block inside a `Suspense` boundary whose fallback is the
 * back link, the placeholder bars and two skeleton cards; it composes the
 * provisional tab's baseline panel and passes it down as a slot, only when
 * that tab is the one shown (cache-reference-reads design.md D3).
 */
export function OfferingDetailScreen({
  locale,
  ulid,
  tab,
}: OfferingDetailScreenProps): ReactNode {
  const catalog = getMessages("catalog", locale);
  const landing = getMessages("landing", locale);
  const scales = getMessages("scales", locale);

  const texts = detailTexts(catalog, landing, scales);

  const detailTab = toDetailTab(tab);
  // The provisional tab's panel (add-public-evaluations design.md D9): the
  // page composes it, since one widget cannot import another, and its own
  // boundary keeps its states inside the panel. On any other tab the slot
  // holds the panel's loading state, so the baseline is never requested
  // (cache-reference-reads design.md D3).
  const provisional =
    detailTab === "provisional" ? (
      <Suspense fallback={<EvaluationSheetSkeleton />}>
        <EvaluationSheetBaseline
          locale={locale}
          offeringUlid={ulid}
          texts={baselineTexts(locale, catalog, landing, scales)}
        />
      </Suspense>
    ) : (
      <EvaluationSheetSkeleton />
    );

  return (
    <div className="flex-1">
      <Suspense
        fallback={<DetailFallback locale={locale} backLabel={texts.backLabel} />}
      >
        <OfferingDetail
          locale={locale}
          ulid={ulid}
          tab={detailTab}
          session={ANONYMOUS_SESSION}
          texts={texts}
          provisional={provisional}
        />
      </Suspense>
    </div>
  );
}

/** The baseline panel's texts (add-public-evaluations design.md D9). */
function baselineTexts(
  locale: string,
  catalog: MessageCatalog,
  landing: MessageCatalog,
  scales: MessageCatalog,
): EvaluationBaselineTexts {
  return {
    ...evaluationSheetTexts({
      publicEvaluations: getMessages("public-evaluations", locale),
      evaluations: getMessages("evaluations", locale),
      scales,
      landing,
    }),
    emptyMessage: catalog.detailProvisionalEmpty,
    errorMessage: catalog.detailProvisionalError,
    retryLabel: landing.listRetryLabel,
  };
}
