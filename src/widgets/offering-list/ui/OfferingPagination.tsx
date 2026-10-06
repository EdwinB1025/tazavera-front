"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { OfferingsPageMeta } from "@/shared/api";
import { Button } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type OfferingPaginationTexts = {
  previousLabel: string;
  nextLabel: string;
};

export type OfferingPaginationProps = {
  locale: string;
  meta: OfferingsPageMeta;
  texts: OfferingPaginationTexts;
};

// Previous and Next centered below the grid, 1rem apart (design.md D14).
const PAGINATION_CLASSES = [
  "flex",
  "flex-wrap",
  "justify-center",
  "gap-4",
].join(" ");

/**
 * Previous/Next pagination of the offerings list (design.md D9; the landing
 * spec "Paging", "Paging at the boundaries"). Activation pushes
 * `/{locale}?page={n}` through `useRouter` — an event handler, hence a Client
 * Component — and the buttons render disabled at `meta.current_page === 1` and
 * at `meta.current_page === meta.last_page`, where `Button` ignores
 * activation. The contract marks the `meta` fields optional; the API always
 * sends both, and the fallbacks keep the arithmetic defined (design.md D9).
 */
export function OfferingPagination({
  locale,
  meta,
  texts,
}: OfferingPaginationProps): ReactNode {
  const router = useRouter();
  const currentPage = meta.current_page ?? 1;
  const lastPage = meta.last_page ?? currentPage;

  return (
    <div className={PAGINATION_CLASSES}>
      <Button
        disabled={currentPage === 1}
        onClick={() => router.push(`/${locale}?page=${currentPage - 1}`)}
      >
        {texts.previousLabel}
      </Button>
      <Button
        disabled={currentPage === lastPage}
        onClick={() => router.push(`/${locale}?page=${currentPage + 1}`)}
      >
        {texts.nextLabel}
      </Button>
    </div>
  );
}
