"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { TaxonomyNode } from "@/shared/api";
import { requestProfileWrite } from "@/features/auth";
import {
  DeleteOfferingsDialog,
  previousPageAfterDelete,
  useDeleteFlow,
  useOwnOfferings,
  type DeleteOfferingsDialogTexts,
} from "@/features/offering-management";
import { buildTaxonomyLookup } from "@/entities/taxonomy";
import { OwnOfferingsBody, type OwnOfferingsBodyTexts } from "./OwnOfferingsBody";

// ─── UI-specific types (declared before the component) ───

export type OwnOfferingsListTexts = OwnOfferingsBodyTexts & DeleteOfferingsDialogTexts;

export type OwnOfferingsListProps = {
  coffeeshopUlid: string;
  /** A delete succeeded: the number of deleted offerings. */
  onDeleted: (count: number) => void;
  locale: string;
  page: number;
  route: string;
  taxonomies: TaxonomyNode[] | null;
  texts: OwnOfferingsListTexts;
};

/** The own list of a signed-in coffeeshop: loading, empty, error and success. */
export function OwnOfferingsList({
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
