import type { ReactNode } from "react";
import type { OfferingDetail, Session, TaxonomyNode } from "@/shared/api";
import { BackLink, PageSection, RetryButton } from "@/shared/ui";
import type { DetailTab } from "../lib/tab";
import { DetailHeader } from "./DetailHeader";
import type { DetailHeaderTexts } from "./DetailHeader";
import { DetailTabs } from "./DetailTabs";
import { ConsensusPanel } from "./ConsensusPanel";
import type { ConsensusPanelTexts } from "./ConsensusPanel";
import { InventoryPanel } from "./InventoryPanel";
import type { InventoryPanelTexts } from "./InventoryPanel";

// ─── UI-specific types (declared before the component) ───

/** Every text of the detail, as props (design.md D16). */
export type OfferingDetailTexts = DetailHeaderTexts &
  InventoryPanelTexts &
  ConsensusPanelTexts & {
    backLabel: string;
    errorMessage: string;
    retryLabel: string;
    tabInventory: string;
    tabConsensus: string;
    tabProvisional: string;
  };

/** The fetch result, mapped before it reaches this view (design.md D8). */
export type OfferingDetailResult =
  | { state: "success"; offering: OfferingDetail; taxonomies: TaxonomyNode[] }
  | { state: "error" };

export type OfferingDetailContentProps = {
  result: OfferingDetailResult;
  locale: string;
  ulid: string;
  tab: DetailTab;
  session: Session;
  texts: OfferingDetailTexts;
  /** The provisional tab's panel, composed by the page (add-public-evaluations D9). */
  provisional: ReactNode;
};

// The back link and the block below it, 1.5rem apart (design.md D9).
const TOP_CONTAINER_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");

// The view's top-level blocks on the page background, 2rem apart: the header
// block, then the tabs (design.md D9; content-structure "Page sections").
const BLOCKS_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");

// The error message with its retry action, 1rem apart; the button keeps its
// own width.
const ERROR_CLASSES = ["flex", "flex-col", "items-start", "gap-4"].join(" ");

/**
 * The offering detail's presentation (add-offering-catalog design.md D8, D9;
 * spec "Offering detail page"). On success, one section on the page
 * background holds the header block (the back link and the header) and the
 * two tabs, whose panels' cards hang from that background; on an
 * error, the back link and, below it, the message with the retry action
 * instead of the tabs. Every text arrives as a prop.
 */
export function OfferingDetailContent({
  result,
  locale,
  ulid,
  tab,
  session,
  texts,
  provisional,
}: OfferingDetailContentProps): ReactNode {
  const backLink = (
    <BackLink fallback={`/${locale}/offerings`}>
      {texts.backLabel}
    </BackLink>
  );

  if (result.state === "error") {
    return (
      <PageSection surface="page" containerClassName={TOP_CONTAINER_CLASSES}>
        {backLink}
        <div className={ERROR_CLASSES}>
          <p className="type-body">{texts.errorMessage}</p>
          <RetryButton label={texts.retryLabel} />
        </div>
      </PageSection>
    );
  }

  return (
    <PageSection surface="page" containerClassName={BLOCKS_CLASSES}>
      <div className={TOP_CONTAINER_CLASSES}>
        {backLink}
        <DetailHeader
          offering={result.offering}
          locale={locale}
          session={session}
          texts={texts}
        />
      </div>
      <DetailTabs
        key={tab}
        active={tab}
        locale={locale}
        ulid={ulid}
        labels={{
          inventory: texts.tabInventory,
          consensus: texts.tabConsensus,
          provisional: texts.tabProvisional,
        }}
        inventory={<InventoryPanel offering={result.offering} texts={texts} />}
        consensus={
          <ConsensusPanel
            offering={result.offering}
            taxonomies={result.taxonomies}
            locale={locale}
            texts={texts}
          />
        }
        provisional={provisional}
      />
    </PageSection>
  );
}
