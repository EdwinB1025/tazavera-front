import type { ReactNode } from "react";
import type { CoffeeshopDetail } from "@/shared/api";
import { Link, PageSection, RetryButton } from "@/shared/ui";
import type { CoffeeshopTab } from "../lib/tab";
import { CoffeeshopHeader } from "./CoffeeshopHeader";
import { CoffeeshopTabs } from "./CoffeeshopTabs";
import { LocationsPanel } from "./LocationsPanel";
import type { CoffeeshopDetailTexts } from "./texts";

// ─── UI-specific types (declared before the component) ───

export type CoffeeshopDetailResult =
  | { state: "success"; coffeeshop: CoffeeshopDetail }
  | { state: "error" };

export type CoffeeshopDetailContentProps = {
  result: CoffeeshopDetailResult;
  locale: string;
  ulid: string;
  tab: CoffeeshopTab;
  /** The Ofertas panel, composed by the page (design.md D10). */
  offerings?: ReactNode;
  texts: CoffeeshopDetailTexts;
};

// The back link and the block below it, 1.5rem apart.
const TOP_CONTAINER_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
// The header block, then the tabs, 2rem apart, on the page background.
const BLOCKS_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
// The error message with its retry action, 1rem apart.
const ERROR_CLASSES = ["flex", "flex-col", "items-start", "gap-4"].join(" ");

/**
 * The coffee shop detail presentation (add-coffeeshop-directory design.md D8;
 * spec "Coffee shop detail page"): on success the back link, the header and
 * the two tabs on the page background; on a not-found or failed read the back
 * link, the error message and the retry action, and no tab.
 */
export function CoffeeshopDetailContent({
  result,
  locale,
  ulid,
  tab,
  offerings,
  texts,
}: CoffeeshopDetailContentProps): ReactNode {
  const backLink = (
    <Link variant="back" href={`/${locale}/coffeeshops`}>
      {texts.backToDirectory}
    </Link>
  );

  if (result.state === "error") {
    return (
      <PageSection surface="page" containerClassName={TOP_CONTAINER_CLASSES}>
        {backLink}
        <div className={ERROR_CLASSES}>
          <p className="type-body">{texts.detailError}</p>
          <RetryButton label={texts.retryLabel} />
        </div>
      </PageSection>
    );
  }

  return (
    <PageSection surface="page" containerClassName={BLOCKS_CLASSES}>
      <div className={TOP_CONTAINER_CLASSES}>
        {backLink}
        <CoffeeshopHeader coffeeshop={result.coffeeshop} texts={texts} />
      </div>
      <CoffeeshopTabs
        key={tab}
        active={tab}
        locale={locale}
        ulid={ulid}
        labels={{ offerings: texts.tabOfferings, locations: texts.tabLocations }}
        offerings={offerings}
        locations={<LocationsPanel locations={result.coffeeshop.locations ?? []} texts={texts} />}
      />
    </PageSection>
  );
}
