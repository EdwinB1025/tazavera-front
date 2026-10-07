"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";

// ─── UI-specific types (declared before the component) ───

export type PaginationTexts = {
  /** Accessible name of the navigation landmark. */
  navigationLabel: string;
  previousLabel: string;
  nextLabel: string;
  /** Accessible name of a page number; `{page}` is replaced by the number. */
  pageLabel: string;
};

/** One position of the number list and the widths it shows at (D3). */
export type PageSlot =
  | { kind: "page"; page: number; narrow: boolean; wide: boolean }
  | { kind: "ellipsis"; narrow: boolean; wide: boolean };

export type PaginationProps = {
  currentPage: number;
  lastPage: number;
  /** The list's address without its query, e.g. `/es` or `/es/offerings`. */
  path: string;
  /** Next's `searchParams` shape; every key is kept and `page` is replaced. */
  query?: Record<string, string | string[] | undefined>;
  texts: PaginationTexts;
};

// Previous and Next centered below the list, 1rem apart, wrapping when the
// container is too narrow for both (design.md D6).
const PAGINATION_CLASSES = [
  "flex",
  "flex-wrap",
  "justify-center",
  "gap-4",
].join(" ");

// `path` with the query and `page` set to `page`: an existing `page` key is
// replaced in place, otherwise appended last; repeated keys keep all their
// values (design.md D4).
function pageAddress(
  path: string,
  query: PaginationProps["query"],
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) {
        params.append(key, item);
      }
    }
  }
  params.set("page", String(page));
  return `${path}?${params.toString()}`;
}

/**
 * Previous/Next pagination of a paged list (design.md D3–D6; the
 * content-structure spec "Pagination"). Activation pushes the list's own
 * address with the preceding or following page through `useRouter` — an event
 * handler, hence a Client Component — and reads no URL hook, so every input
 * comes from serializable props. Previous renders disabled at
 * `currentPage === 1` and Next at `currentPage === lastPage`, where `Button`
 * ignores activation. The host renders it only below a successfully loaded,
 * non-empty list (design.md D5).
 */
export function Pagination({
  currentPage,
  lastPage,
  path,
  query,
  texts,
}: PaginationProps): ReactNode {
  const router = useRouter();

  return (
    <div className={PAGINATION_CLASSES}>
      <Button
        variant="primary"
        size="base"
        disabled={currentPage === 1}
        onClick={() => router.push(pageAddress(path, query, currentPage - 1))}
      >
        {texts.previousLabel}
      </Button>
      <Button
        variant="primary"
        size="base"
        disabled={currentPage === lastPage}
        onClick={() => router.push(pageAddress(path, query, currentPage + 1))}
      >
        {texts.nextLabel}
      </Button>
    </div>
  );
}
