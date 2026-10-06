"use client";

import { useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { TaxonomyNode } from "@/shared/api";
import { signIn, useSession } from "@/features/auth";
import {
  ManagementGate,
  OfferingActions,
  SelectionToolbar,
  useOwnOfferings,
  type ManagementGateTexts,
  type OfferingActionsTexts,
  type SelectionToolbarTexts,
} from "@/features/offering-management";
import { OfferingCard, type OfferingCardTexts } from "@/entities/offering";
import { buildTaxonomyLookup } from "@/entities/taxonomy";
import { Button, Link, Pagination, type PaginationTexts } from "@/shared/ui";
import { OfferingSkeletonCard } from "@/widgets/offering-list";
import { resolveTaxonomies } from "../lib/resolve-taxonomies";

// ─── UI-specific types (declared before the component) ───

export type ManageOfferingsTexts = OfferingCardTexts &
  PaginationTexts &
  ManagementGateTexts &
  OfferingActionsTexts &
  SelectionToolbarTexts & {
    eyebrow: string;
    listHeading: string;
    newOfferingLink: string;
    listEmptyMessage: string;
    listEmptyCreateLink: string;
    listErrorMessage: string;
    retryLabel: string;
  };

export type ManageOfferingsPanelProps = {
  locale: string;
  /** The requested page from the route's query (`?page=n`). */
  page: number;
  /** `GET /taxonomies` resolved on the server; `null` when it failed. */
  taxonomies: TaxonomyNode[] | null;
  texts: ManageOfferingsTexts;
};

// ─── Layout (summary §6.2) ───
// Header → the list: 2rem.
const COLUMN_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
// Stacked and left-aligned below `md`; one wrapping row from `md`, spread and
// aligned to the bottom.
const HEADER_CLASSES = [
  "flex",
  "flex-col",
  "items-start",
  "gap-4",
  "md:flex-row",
  "md:flex-wrap",
  "md:items-end",
  "md:justify-between",
].join(" ");
// Eyebrow and h1 0.5rem apart.
const TITLE_GROUP_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
// The grid beside the sidebar (design.md D3): 1 column, 2 from `lg`, 3 from
// `2xl`, 1.5rem gap; grid items stretch, so a row shares its height.
const GRID_CLASSES = [
  "grid",
  "grid-cols-1",
  "gap-6",
  "lg:grid-cols-2",
  "2xl:grid-cols-3",
].join(" ");
// Toolbar → grid: 1.5rem.
const SUCCESS_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
// Grid → pagination: 2rem.
const LIST_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
// Empty and error: a centred column 1rem apart, no box.
const MESSAGE_CLASSES = ["flex", "flex-col", "items-center", "gap-4", "text-center"].join(
  " ",
);

const SKELETON_CARD_KEYS = [0, 1, 2] as const;

function SkeletonGrid(): ReactNode {
  return (
    <div className={GRID_CLASSES}>
      {SKELETON_CARD_KEYS.map((key) => (
        <OfferingSkeletonCard key={key} />
      ))}
    </div>
  );
}

type OwnOfferingsListProps = {
  coffeeshopUlid: string;
  locale: string;
  page: number;
  route: string;
  taxonomies: TaxonomyNode[] | null;
  texts: ManageOfferingsTexts;
};

/** The own list of a signed-in coffeeshop: loading, empty, error and success. */
function OwnOfferingsList({
  coffeeshopUlid,
  locale,
  page,
  route,
  taxonomies,
  texts,
}: OwnOfferingsListProps): ReactNode {
  const router = useRouter();
  const { list, reload, selection } = useOwnOfferings(coffeeshopUlid, page);
  const lookup = useMemo(
    () => buildTaxonomyLookup(taxonomies ?? [], locale),
    [taxonomies, locale],
  );

  if (list.state === "loading") {
    return <SkeletonGrid />;
  }
  // A taxonomy failure puts the list in its error state, as on landing; its
  // retry also reloads the server data that carries the taxonomies.
  if (list.state === "error" || taxonomies === null) {
    return (
      <div className={MESSAGE_CLASSES}>
        <p className="type-body">{texts.listErrorMessage}</p>
        <Button
          variant="primary"
          onClick={() => {
            if (taxonomies === null) router.refresh();
            reload();
          }}
        >
          {texts.retryLabel}
        </Button>
      </div>
    );
  }
  if (list.state === "empty") {
    return (
      <div className={MESSAGE_CLASSES}>
        <p className="type-body">{texts.listEmptyMessage}</p>
        <Link href={`/${locale}/manage/offerings/new`}>{texts.listEmptyCreateLink}</Link>
      </div>
    );
  }

  // The contract marks the `meta` fields optional; the fallbacks keep the
  // paging arithmetic defined.
  const currentPage = list.meta.current_page ?? page;
  const lastPage = list.meta.last_page ?? currentPage;
  return (
    <div className={SUCCESS_CLASSES}>
      <SelectionToolbar
        allSelected={selection.allSelected}
        selectedCount={selection.selected.size}
        onToggleAll={selection.toggleAll}
        onDeleteSelected={() => {}}
        texts={texts}
      />
      <div className={LIST_CLASSES}>
        <div className={GRID_CLASSES}>
          {list.data.map((offering, index) => (
            <OfferingCard
              key={offering.ulid ?? index}
              offering={offering}
              locale={locale}
              taxonomies={resolveTaxonomies(offering.sensoryTaxonomy ?? [], lookup)}
              texts={texts}
              actions={
                <OfferingActions
                  offering={offering}
                  selected={selection.selected.has(offering.ulid ?? "")}
                  onToggle={() => selection.toggle(offering.ulid ?? "")}
                  onDelete={() => {}}
                  texts={texts}
                />
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

/**
 * The client composition of "My offerings" (design.md D1, D2, D6; spec "My
 * offerings list"). The header always renders — the "New offering" link only
 * for a signed-in coffeeshop — and the gate renders the own list in its
 * place: skeleton cards while the session resolves, the signed-out branch for
 * an anonymous visitor, the 404 for another role. The list loads on the
 * client because its filter is the session user's `ulid` (design.md D1).
 */
export function ManageOfferingsPanel({
  locale,
  page,
  taxonomies,
  texts,
}: ManageOfferingsPanelProps): ReactNode {
  const session = useSession();
  const route = `/${locale}/manage/offerings`;
  const isCoffeeshop =
    session.state === "authenticated" && session.user.role === "coffeeshop";

  return (
    <div className={COLUMN_CLASSES}>
      <div className={HEADER_CLASSES}>
        <div className={TITLE_GROUP_CLASSES}>
          <p className="type-eyebrow-strong">{texts.eyebrow}</p>
          <h1 className="type-heading" tabIndex={-1}>
            {texts.listHeading}
          </h1>
        </div>
        {isCoffeeshop ? (
          <Link href={`/${locale}/manage/offerings/new`}>{texts.newOfferingLink}</Link>
        ) : null}
      </div>
      <ManagementGate
        session={session}
        route={route}
        texts={texts}
        onSignIn={signIn}
        loading={<SkeletonGrid />}
      >
        {(user) => (
          <OwnOfferingsList
            coffeeshopUlid={user.ulid ?? ""}
            locale={locale}
            page={page}
            route={route}
            taxonomies={taxonomies}
            texts={texts}
          />
        )}
      </ManagementGate>
    </div>
  );
}
