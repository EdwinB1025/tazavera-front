"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { TaxonomyNode } from "@/shared/api";
import { requestProfileWrite, signIn, useSession } from "@/features/auth";
import {
  DeleteOfferingsDialog,
  OfferingActions,
  SelectionToolbar,
  previousPageAfterDelete,
  useDeleteFlow,
  useOwnOfferings,
  type DeleteOfferingsDialogTexts,
  type DeleteTarget,
  type OwnOfferings,
  type OfferingActionsTexts,
  type SelectionToolbarTexts,
} from "@/features/offering-management";
import { OfferingCard, type OfferingCardTexts } from "@/entities/offering";
import { buildTaxonomyLookup, type TaxonomyLookup } from "@/entities/taxonomy";
import {
  Button,
  Link,
  Pagination,
  SessionGate,
  SignedOutPrompt,
  type PaginationTexts,
} from "@/shared/ui";
import { OfferingSkeletonCard } from "@/widgets/offering-list";
import { resolveTaxonomies } from "../lib/resolve-taxonomies";

// ─── UI-specific types (declared before the component) ───

export type ManageOfferingsTexts = OfferingCardTexts &
  PaginationTexts &
  OfferingActionsTexts &
  SelectionToolbarTexts &
  DeleteOfferingsDialogTexts & {
    signedOutMessage: string;
    signInLabel: string;
    deletedStatus: string;
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
// Header → status region: 2rem.
const COLUMN_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
// Status region → the list: 1rem; with no status line, no gap.
const BODY_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");
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
  /** A delete succeeded: the number of deleted offerings. */
  onDeleted: (count: number) => void;
  locale: string;
  page: number;
  route: string;
  taxonomies: TaxonomyNode[] | null;
  texts: ManageOfferingsTexts;
};

/** The own list of a signed-in coffeeshop: loading, empty, error and success. */
function OwnOfferingsList({
  coffeeshopUlid,
  onDeleted,
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
  // The page a delete was made on: when its reload comes back empty beyond
  // the first page, the list moves to the previous page.
  const [deletedOnPage, setDeletedOnPage] = useState<number | null>(null);
  const flow = useDeleteFlow({
    onDeleted: (count) => {
      setDeletedOnPage(page);
      reload();
      onDeleted(count);
    },
  });
  const stepTo =
    deletedOnPage === page ? previousPageAfterDelete(list.state, page) : null;
  useEffect(() => {
    if (stepTo !== null) router.push(`${route}?page=${stepTo}`);
  }, [stepTo, route, router]);

  return (
    <>
      <OwnOfferingsBody
        list={list}
        page={page}
        route={route}
        locale={locale}
        lookup={lookup}
        taxonomiesFailed={taxonomies === null}
        onRetry={() => {
          if (taxonomies === null) router.refresh();
          reload();
        }}
        selection={selection}
        onDelete={flow.start}
        texts={texts}
      />
      <DeleteOfferingsDialog
        target={flow.target}
        pending={flow.pending}
        error={flow.error}
        onCancel={flow.cancel}
        onConfirm={flow.confirm}
        onStepUp={() => requestProfileWrite(route)}
        texts={texts}
      />
    </>
  );
}

type OwnOfferingsBodyProps = {
  list: OwnOfferings["list"];
  page: number;
  route: string;
  locale: string;
  lookup: TaxonomyLookup;
  taxonomiesFailed: boolean;
  onRetry: () => void;
  selection: OwnOfferings["selection"];
  onDelete: (target: DeleteTarget) => void;
  texts: ManageOfferingsTexts;
};

/** The list's states: loading, error, empty, and the toolbar, grid and pagination. */
function OwnOfferingsBody({
  list,
  page,
  route,
  locale,
  lookup,
  taxonomiesFailed,
  onRetry,
  selection,
  onDelete,
  texts,
}: OwnOfferingsBodyProps): ReactNode {
  if (list.state === "loading") {
    return <SkeletonGrid />;
  }
  // A taxonomy failure puts the list in its error state, as on landing; its
  // retry also reloads the server data that carries the taxonomies.
  if (list.state === "error" || taxonomiesFailed) {
    return (
      <div className={MESSAGE_CLASSES}>
        <p className="type-body">{texts.listErrorMessage}</p>
        <Button variant="primary" onClick={onRetry}>
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
        onDeleteSelected={() =>
          onDelete({ kind: "many", ulids: [...selection.selected] })
        }
        texts={texts}
      />
      <div className={LIST_CLASSES}>
        <div className={GRID_CLASSES}>
          {list.data.map((offering, index) => (
            <OfferingCard
              key={offering.ulid ?? index}
              offering={offering}
              locale={locale}
              taxonomies={resolveTaxonomies(offering, lookup)}
              texts={texts}
              actions={
                <OfferingActions
                  offering={offering}
                  selected={selection.selected.has(offering.ulid ?? "")}
                  onToggle={() => selection.toggle(offering.ulid ?? "")}
                  onDelete={() => onDelete({ kind: "one", ulid: offering.ulid ?? "" })}
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [deletedCount, setDeletedCount] = useState<number | null>(null);
  // Bumped by each successful delete: focus moves to the heading, because
  // the control that triggered the delete may be gone.
  const [focusRequest, setFocusRequest] = useState(0);
  useEffect(() => {
    if (focusRequest === 0) return;
    // After the confirmation has closed and returned focus to its trigger.
    const timer = setTimeout(() => headingRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [focusRequest]);
  const status =
    deletedCount === null ? null : `${texts.deletedStatus} ${deletedCount}`;
  const isCoffeeshop =
    session.state === "authenticated" && session.user.role === "coffeeshop";

  return (
    <div className={COLUMN_CLASSES}>
      <div className={HEADER_CLASSES}>
        <div className={TITLE_GROUP_CLASSES}>
          <p className="type-eyebrow-strong">{texts.eyebrow}</p>
          <h1 ref={headingRef} className="type-heading" tabIndex={-1}>
            {texts.listHeading}
          </h1>
        </div>
        {isCoffeeshop ? (
          <Link href={`/${locale}/manage/offerings/new`}>{texts.newOfferingLink}</Link>
        ) : null}
      </div>
      <div className={BODY_CLASSES}>
        {status !== null ? (
          <p role="status" className="type-body">
            {status}
          </p>
        ) : null}
        <SessionGate
          session={session}
          loading={<SkeletonGrid />}
          signedOut={
            <SignedOutPrompt
              text={texts.signedOutMessage}
              signInLabel={texts.signInLabel}
              onSignIn={() => signIn(route)}
            />
          }
          allows={(user) => user.role === "coffeeshop"}
        >
          {(user) => (
            <OwnOfferingsList
              coffeeshopUlid={user.ulid ?? ""}
              onDeleted={(count) => {
                setDeletedCount(count);
                setFocusRequest((value) => value + 1);
              }}
            locale={locale}
            page={page}
            route={route}
              taxonomies={taxonomies}
              texts={texts}
            />
          )}
        </SessionGate>
      </div>
    </div>
  );
}
