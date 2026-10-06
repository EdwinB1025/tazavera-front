import { Suspense, type ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import {
  OFFERING_GRID_CLASSES,
  OfferingSkeletonCard,
  VerifiedOfferings,
  type OfferingListTexts,
} from "@/widgets/offering-list";
import { HomeHero } from "./HomeHero";
import type { HomeHeroTexts } from "./HomeHero";

// ─── UI-specific types (declared before the component) ───

export type HomeScreenProps = {
  locale: string;
  /** The requested page from the route's search params (`?page=n`). */
  page?: string | string[];
};

// Placeholder cards rendered while the list loads (spec "Loading"): several,
// standing in for a page of offering cards (design.md D9).
const SKELETON_CARD_KEYS = [0, 1, 2] as const;

/**
 * Entry screen (design.md D10, D13; the landing spec "Entry page hero" and
 * "Localized page texts"). A thin composition: it loads the `landing`
 * catalog for the route's locale through the area reader of `add-app-shell`
 * (design.md D11), composes the hero with every text as a prop, and wraps the
 * verified-offerings block in a `Suspense` boundary whose fallback is the
 * skeleton cards (design.md D9), passing the locale and the
 * requested page down at one expression each.
 */
export function HomeScreen({ locale, page }: HomeScreenProps): ReactNode {
  const catalog = getMessages("landing", locale);
  // No `page` in the route's search params requests the first page.
  const currentPage = page ? Number(page) : 1;

  const heroTexts: HomeHeroTexts = {
    eyebrow: catalog.heroEyebrow,
    headingBefore: catalog.heroHeadingBefore,
    headingAccent: catalog.heroHeadingAccent,
    headingAfter: catalog.heroHeadingAfter,
    paragraph: catalog.heroParagraph,
    exploreLabel: catalog.heroExploreLabel,
    coffeeshopRegisterLabel: catalog.heroCoffeeshopRegisterLabel,
    specialistRegisterLabel: catalog.heroSpecialistRegisterLabel,
    photoAlt: catalog.heroPhotoAlt,
  };

  const listTexts: OfferingListTexts = {
    coffeeshopCaption: catalog.cardCoffeeshopCaption,
    roasterCaption: catalog.cardRoasterCaption,
    evaluationsLabel: catalog.cardEvaluationsLabel,
    defectiveLabel: catalog.cardDefectiveLabel,
    viewLabel: catalog.cardViewLabel,
    evaluateLabel: catalog.cardEvaluateLabel,
    verifiedLabel: catalog.cardVerifiedLabel,
    provisionalLabel: catalog.cardProvisionalLabel,
    ratingExceptionalLabel: catalog.cardRatingExceptionalLabel,
    ratingExcellentLabel: catalog.cardRatingExcellentLabel,
    ratingGoodLabel: catalog.cardRatingGoodLabel,
    ratingCommercialLabel: catalog.cardRatingCommercialLabel,
    previousLabel: catalog.paginationPreviousLabel,
    nextLabel: catalog.paginationNextLabel,
    emptyMessage: catalog.listEmptyMessage,
    errorMessage: catalog.listErrorMessage,
    retryLabel: catalog.listRetryLabel,
  };

  return (
    <div className="flex-1">
      <PageSection surface="page">
        <HomeHero locale={locale} texts={heroTexts} />
      </PageSection>
      <PageSection surface="section">
        <Suspense
          fallback={
            <div className={OFFERING_GRID_CLASSES}>
              {SKELETON_CARD_KEYS.map((key) => (
                <OfferingSkeletonCard key={key} />
              ))}
            </div>
          }
        >
          <VerifiedOfferings
            locale={locale}
            page={currentPage}
            texts={listTexts}
          />
        </Suspense>
      </PageSection>
    </div>
  );
}
