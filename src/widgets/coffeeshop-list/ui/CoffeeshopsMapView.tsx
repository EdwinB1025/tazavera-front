"use client";

import { useId, type ReactNode } from "react";
import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CoffeeshopSummary } from "@/shared/api";
import { useIsMobile } from "@/shared/lib/hooks";
import {
  Button,
  LINK_CLASSES,
  LocationsMapLoader,
  Pagination,
  Sheet,
  SheetContent,
  SheetTitle,
  type LocationsMapPoint,
  type PaginationTexts,
} from "@/shared/ui";
import { List } from "@/shared/ui/icons";
import { countUnlocated, toMapPoints } from "@/entities/coffeeshop";
import { requestFocus } from "../lib/map-focus";
import { viewHref } from "../lib/view-href";

// ─── UI-specific types (declared before the component) ───

export type CoffeeshopsMapTexts = PaginationTexts & {
  mapLabel: string;
  mapHelp: string;
  mapEmpty: string;
  unlocatedCount: string;
  zoomIn: string;
  zoomOut: string;
  closePanel: string;
  viewCoffeeshop: string;
  osmAttribution: string;
  osmContributors: string;
  backToList: string;
  mapLoading: string;
};

export type CoffeeshopsMapViewProps = {
  items: CoffeeshopSummary[];
  currentPage: number;
  lastPage: number;
  locale: string;
  /** The request's query; the pagination keeps it with the map view. */
  query: Record<string, string>;
  /** The address's `focus`; used only when it names a coffee shop of the page. */
  focus?: string;
  texts: CoffeeshopsMapTexts;
};

const INLINE_CLASSES = "flex flex-col gap-8";
const MAP_BLOCK_CLASSES = "flex flex-col gap-2";
const INLINE_MAP_CLASSES = "h-[min(32rem,70vh)] border border-border-subtle rounded-container overflow-hidden";
const SHEET_CLASSES = "inset-0 bg-surface-page text-text-primary rounded-none border-0";
const SHEET_HEADER_CLASSES = "flex items-center justify-between gap-3 px-4 py-3 border-b border-border-subtle";
const SHEET_MAP_CLASSES = "flex-1 min-h-0";
const EMPTY_CLASSES = "text-center text-text-primary";

/** The map, or the empty line when no location of the page is located. */
function MapArea({
  points,
  focusGroupId,
  locale,
  helpId,
  className,
  texts,
}: {
  points: LocationsMapPoint[];
  focusGroupId?: string;
  locale: string;
  helpId: string;
  className: string;
  texts: CoffeeshopsMapTexts;
}): ReactNode {
  return points.length === 0 ? (
    <p className={EMPTY_CLASSES}>{texts.mapEmpty}</p>
  ) : (
    <LocationsMapLoader
      points={points}
      focusGroupId={focusGroupId}
      renderPanelLink={(point: LocationsMapPoint) => (
        <NextLink href={`/${locale}/coffeeshops/${point.groupId}`} className={LINK_CLASSES}>
          {texts.viewCoffeeshop}
        </NextLink>
      )}
      helpId={helpId}
      className={className}
      texts={{
        mapLabel: texts.mapLabel,
        zoomIn: texts.zoomIn,
        zoomOut: texts.zoomOut,
        closePanel: texts.closePanel,
        osmAttribution: texts.osmAttribution,
        osmContributors: texts.osmContributors,
        mapLoading: texts.mapLoading,
      }}
    />
  );
}

/** Below `md`: the map full screen in the shared sheet; closing it returns to the list. */
function MapSheet({
  focus,
  helpId,
  map,
  unlocatedLine,
  texts,
}: {
  focus?: string;
  helpId: string;
  map: ReactNode;
  unlocatedLine: ReactNode;
  texts: CoffeeshopsMapTexts;
}): ReactNode {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const close = () => {
    requestFocus(focus ? `card:${focus}` : "toggle");
    router.push(
      viewHref(pathname, new URLSearchParams(searchParams?.toString()), { view: undefined, focus: undefined }),
      { scroll: false },
    );
  };
  return (
    <Sheet open onOpenChange={(open) => (open ? undefined : close())}>
      <SheetContent
        className={SHEET_CLASSES}
        aria-describedby={helpId}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className={SHEET_HEADER_CLASSES}>
          <SheetTitle className="type-subheading">{texts.mapLabel}</SheetTitle>
          <Button type="button" variant="action-3" size="sm" icon={List} onClick={close}>
            {texts.backToList}
          </Button>
        </div>
        <p id={helpId} className="sr-only">
          {texts.mapHelp}
        </p>
        {map}
        {unlocatedLine ? <div className="px-4 py-2">{unlocatedLine}</div> : null}
      </SheetContent>
    </Sheet>
  );
}

/**
 * The directory's map view (add-coffeeshop-directory design.md D13; specs
 * "Directory map view", "Show a coffee shop on the map" and "Full-screen map
 * on a small viewport"): every located location of the page on the shared
 * map. From `md` the map is inline with the help line above, the unlocated
 * count and the pagination below; below `md` it opens full screen in the
 * shared sheet, and closing it returns to the list without the view keys.
 */
export function CoffeeshopsMapView({
  items,
  currentPage,
  lastPage,
  locale,
  query,
  focus,
  texts,
}: CoffeeshopsMapViewProps): ReactNode {
  const isMobile = useIsMobile();
  const helpId = useId();
  const points = toMapPoints(items);
  const unlocated = countUnlocated(items);
  const focusGroupId = items.some((item) => item.ulid === focus) ? focus : undefined;
  const pagingQuery = Object.fromEntries(Object.entries(query).filter(([key]) => key !== "page"));

  const map = (
    <MapArea
      points={points}
      focusGroupId={focusGroupId}
      locale={locale}
      helpId={helpId}
      className={isMobile ? SHEET_MAP_CLASSES : INLINE_MAP_CLASSES}
      texts={texts}
    />
  );
  const unlocatedLine =
    unlocated > 0 ? (
      <p className="type-meta">{texts.unlocatedCount.replace("{count}", String(unlocated))}</p>
    ) : null;

  if (isMobile) {
    return (
      <MapSheet
        focus={focus}
        helpId={helpId}
        map={map}
        unlocatedLine={unlocatedLine}
        texts={texts}
      />
    );
  }

  return (
    <div className={INLINE_CLASSES}>
      <div className={MAP_BLOCK_CLASSES}>
        <p id={helpId} className="type-body">
          {texts.mapHelp}
        </p>
        {map}
        {unlocatedLine}
      </div>
      <Pagination
        currentPage={currentPage}
        lastPage={lastPage}
        path={`/${locale}/coffeeshops`}
        query={{ ...pagingQuery, view: "map" }}
        texts={texts}
      />
    </div>
  );
}
