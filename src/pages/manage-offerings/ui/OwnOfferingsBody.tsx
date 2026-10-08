import type { ReactNode } from "react";
import type { DeleteTarget, OwnOfferings } from "@/features/offering-management";
import type { TaxonomyLookup } from "@/entities/taxonomy";
import { Button, Link } from "@/shared/ui";
import { OwnOfferingsGrid, type OwnOfferingsGridTexts } from "./OwnOfferingsGrid";
import { SkeletonGrid } from "./SkeletonGrid";

// ─── UI-specific types (declared before the component) ───

export type OwnOfferingsBodyTexts = OwnOfferingsGridTexts & {
  listEmptyMessage: string;
  listEmptyCreateLink: string;
  listErrorMessage: string;
  retryLabel: string;
};

export type OwnOfferingsBodyProps = {
  list: OwnOfferings["list"];
  page: number;
  route: string;
  locale: string;
  lookup: TaxonomyLookup;
  taxonomiesFailed: boolean;
  onRetry: () => void;
  selection: OwnOfferings["selection"];
  onDelete: (target: DeleteTarget) => void;
  texts: OwnOfferingsBodyTexts;
};

// Empty and error: a centred column 1rem apart, no box.
const MESSAGE_CLASSES = ["flex", "flex-col", "items-center", "gap-4", "text-center"].join(
  " ",
);

/** The list's states: loading, error, empty, and the toolbar, grid and pagination. */
export function OwnOfferingsBody({
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
  return (
    <OwnOfferingsGrid
      offerings={list.data}
      currentPage={currentPage}
      lastPage={list.meta.last_page ?? currentPage}
      route={route}
      locale={locale}
      lookup={lookup}
      selection={selection}
      onDelete={onDelete}
      texts={texts}
    />
  );
}
