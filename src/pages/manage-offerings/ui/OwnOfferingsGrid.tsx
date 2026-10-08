import type { ReactNode } from "react";
import type { OfferingSummary } from "@/shared/api";
import {
  OfferingActions,
  SelectionToolbar,
  type DeleteTarget,
  type OwnOfferings,
  type OfferingActionsTexts,
  type SelectionToolbarTexts,
} from "@/features/offering-management";
import {
  OfferingCard,
  OfferingViewButton,
  type OfferingCardTexts,
} from "@/entities/offering";
import type { TaxonomyLookup } from "@/entities/taxonomy";
import { Pagination, type PaginationTexts } from "@/shared/ui";
import { resolveTaxonomies } from "../lib/resolve-taxonomies";
import { GRID_CLASSES } from "./SkeletonGrid";

// ─── UI-specific types (declared before the component) ───

export type OwnOfferingsGridTexts = OfferingCardTexts &
  PaginationTexts &
  OfferingActionsTexts &
  SelectionToolbarTexts & {
    viewLabel: string;
  };

export type OwnOfferingsGridProps = {
  offerings: OfferingSummary[];
  currentPage: number;
  lastPage: number;
  route: string;
  locale: string;
  lookup: TaxonomyLookup;
  selection: OwnOfferings["selection"];
  onDelete: (target: DeleteTarget) => void;
  texts: OwnOfferingsGridTexts;
};

// Toolbar → grid: 1.5rem.
const SUCCESS_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
// Grid → pagination: 2rem.
const LIST_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");

/** The loaded list: the selection toolbar, the cards and the pagination. */
export function OwnOfferingsGrid({
  offerings,
  currentPage,
  lastPage,
  route,
  locale,
  lookup,
  selection,
  onDelete,
  texts,
}: OwnOfferingsGridProps): ReactNode {
  return (
    <div className={SUCCESS_CLASSES}>
      <SelectionToolbar
        allSelected={selection.allSelected}
        selectedCount={selection.selected.size}
        onToggleAll={selection.toggleAll}
        onDeleteSelected={() =>
          onDelete({ kind: "many", ulids: [...selection.selected] })
        }
        texts={texts}
      />
      <div className={LIST_CLASSES}>
        <div className={GRID_CLASSES}>
          {offerings.map((offering, index) => (
            <OfferingCard
              key={offering.ulid ?? index}
              offering={offering}
              taxonomies={resolveTaxonomies(offering, lookup)}
              texts={texts}
              actions={
                <>
                  <OfferingViewButton
                    ulid={offering.ulid ?? ""}
                    locale={locale}
                    label={texts.viewLabel}
                  />
                  <OfferingActions
                    offering={offering}
                    selected={selection.selected.has(offering.ulid ?? "")}
                    onToggle={() => selection.toggle(offering.ulid ?? "")}
                    onDelete={() => onDelete({ kind: "one", ulid: offering.ulid ?? "" })}
                    texts={texts}
                  />
                </>
              }
            />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          path={route}
          texts={texts}
        />
      </div>
    </div>
  );
}
