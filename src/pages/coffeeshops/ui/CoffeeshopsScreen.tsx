import { Suspense, type ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import {
  CoffeeshopsToolbar,
  appliedCoffeeshopFilters,
  coffeeshopFacetsTexts,
  parseCoffeeshopFilters,
  sanitizeCoffeeshopQuery,
} from "@/features/coffeeshop-facets";
import { OfferingSkeletonCard } from "@/widgets/offering-list";
import {
  COFFEESHOP_COLUMN_CLASSES,
  Coffeeshops,
  CoffeeshopsViewToggle,
  type CoffeeshopListMapTexts,
  buildCoffeeshopsQuery,
  type CoffeeshopListTexts,
  type CoffeeshopsQuery,
} from "@/widgets/coffeeshop-list";

// ─── UI-specific types (declared before the component) ───

export type CoffeeshopsScreenProps = {
  locale: string;
  /** The route's raw search params; only the contract's names are requested. */
  searchParams: CoffeeshopsQuery;
};

// The heading block and the toolbar, 2rem apart.
const HEADER_CONTAINER_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
// The eyebrow, the heading and the intro, 0.5rem apart.
const HEADING_BLOCK_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");

const SKELETON_CARD_KEYS = [0, 1, 2] as const;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * The coffee shop directory screen (add-coffeeshop-directory design.md D7;
 * specs "Directory heading and results column" and "Coffee shop directory
 * page"): the heading block, the toolbar and the list on the page background,
 * the list inside a `Suspense` boundary whose fallback is three skeleton cards
 * in the directory column.
 */
export function CoffeeshopsScreen({ locale, searchParams }: CoffeeshopsScreenProps): ReactNode {
  const coffeeshops = getMessages("coffeeshops", locale);
  const landing = getMessages("landing", locale);
  const filters = getMessages("filters", locale);
  const catalog = getMessages("catalog", locale);
  const filterTexts = coffeeshopFacetsTexts(coffeeshops, filters);
  const values = parseCoffeeshopFilters(searchParams);
  const applied = appliedCoffeeshopFilters(values, filterTexts);
  const texts: CoffeeshopListTexts = {
    verifiedBadge: coffeeshops.verifiedBadge,
    locationsCount: coffeeshops.locationsCount,
    offeringsCount: coffeeshops.offeringsCount,
    verifiedCount: coffeeshops.verifiedCount,
    viewLabel: coffeeshops.viewLabel,
    previousLabel: landing.paginationPreviousLabel,
    nextLabel: landing.paginationNextLabel,
    emptyMessage: coffeeshops.listEmpty,
    errorMessage: coffeeshops.listError,
    retryLabel: landing.listRetryLabel,
    resultCount: catalog.resultCount,
    noMatches: filters.noMatches,
    clearAll: filters.clearAll,
    showOnMapLabel: coffeeshops.showOnMapLabel,
  };
  const mapTexts: CoffeeshopListMapTexts = {
    mapLabel: coffeeshops.mapLabel,
    mapHelp: coffeeshops.mapHelp,
    mapEmpty: coffeeshops.mapEmpty,
    unlocatedCount: coffeeshops.unlocatedCount,
    zoomIn: coffeeshops.zoomIn,
    zoomOut: coffeeshops.zoomOut,
    closePanel: coffeeshops.closePanel,
    viewCoffeeshop: coffeeshops.viewCoffeeshop,
    osmAttribution: coffeeshops.osmAttribution,
    osmContributors: coffeeshops.osmContributors,
    backToList: coffeeshops.backToList,
    mapLoading: coffeeshops.mapLoading,
  };
  const view = firstValue(searchParams.view) === "map" ? "map" : undefined;
  const focus = firstValue(searchParams.focus);
  const query = sanitizeCoffeeshopQuery(buildCoffeeshopsQuery(searchParams));

  return (
    <div className="flex-1">
      <PageSection surface="page" containerClassName={HEADER_CONTAINER_CLASSES}>
        <div className={HEADING_BLOCK_CLASSES}>
          <p className="type-eyebrow">{coffeeshops.listEyebrow}</p>
          <h1 className="type-heading">{coffeeshops.listHeading}</h1>
          <p className="type-body">{coffeeshops.listIntro}</p>
        </div>
        <CoffeeshopsToolbar
          count={applied.length}
          sort={values.sort}
          texts={filterTexts}
          viewSlot={
            <CoffeeshopsViewToggle
              texts={{
                viewToggleLabel: coffeeshops.viewToggleLabel,
                viewList: coffeeshops.viewList,
                viewMap: coffeeshops.viewMap,
              }}
            />
          }
        />
      </PageSection>
      <PageSection surface="page">
        <Suspense
          fallback={
            <div className={COFFEESHOP_COLUMN_CLASSES}>
              {SKELETON_CARD_KEYS.map((key) => (
                <OfferingSkeletonCard key={key} />
              ))}
            </div>
          }
        >
          <Coffeeshops
            locale={locale}
            query={query}
            filtered={applied.length > 0}
            view={view}
            focus={focus}
            texts={texts}
            mapTexts={mapTexts}
          />
        </Suspense>
      </PageSection>
    </div>
  );
}
