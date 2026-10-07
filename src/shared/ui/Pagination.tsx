"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "./icons";

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

// Previous, the numbers and Next centred below the list, wrapping when the
// container is too narrow, 0.25rem apart below md and 0.5rem from md
// (design.md D6).
const PAGINATION_CLASSES = [
  "flex",
  "flex-wrap",
  "items-center",
  "justify-center",
  "gap-1",
  "md:gap-2",
].join(" ");

const SLOT_LIST_CLASSES = "inline-flex items-center gap-1 md:gap-2";

// Below md Previous and Next are a 2.5rem square showing only the chevron;
// from md they keep `Button`'s base geometry with the label and no chevron
// (design.md D6). `max-md:` utilities follow `Button`'s own in the CSS.
const ARROW_CLASSES = "max-md:w-10 max-md:px-0";
const ARROW_ICON_CLASSES = "size-4 shrink-0 md:hidden";
const ARROW_LABEL_CLASSES = "max-md:sr-only";

// A page number: 2.5rem tall, at least 2.5rem wide, 0.75rem padding; `px-3!`
// wins over `Button`'s `px-4` (design.md D6, Risks).
const NUMBER_CLASSES = "min-w-10 px-3!";

// The current number shows the hover fill at rest (design.md D5); these
// utilities follow `bg-action-3-bg` / `text-action-3-text` in the CSS.
const CURRENT_NUMBER_CLASSES = "bg-action-3-bg-hover text-action-3-text-hover";

// The ellipsis mark is a symbol, not a translatable text (design.md D2).
const ELLIPSIS_MARK = "…";

const ELLIPSIS_CLASSES =
  "inline-flex h-10 w-6 items-center justify-center text-text-primary";

// A slot absent from one window is hidden at that width (design.md D3).
function slotItemClasses(slot: PageSlot): string | undefined {
  if (!slot.narrow) return "max-md:hidden";
  if (!slot.wide) return "md:hidden";
  return undefined;
}

// The pages of one window and the pages an ellipsis follows: a gap of
// exactly one page shows that page, a gap of two or more one ellipsis right
// after the lower page (design.md D3).
function windowOf(shown: number[]): {
  pages: Set<number>;
  ellipsisAfter: Set<number>;
} {
  const sorted = [...new Set(shown)].sort((x, y) => x - y);
  const pages = new Set<number>();
  const ellipsisAfter = new Set<number>();
  sorted.forEach((page, index) => {
    pages.add(page);
    const next = sorted[index + 1];
    if (next === undefined) return;
    if (next - page === 2) pages.add(page + 1);
    if (next - page > 2) ellipsisAfter.add(page);
  });
  return { pages, ellipsisAfter };
}

/**
 * The merged slot list of the narrow window (first, current, last) and the
 * wide window (first, current − 1 … current + 1, last), each slot marked with
 * the widths it shows at (design.md D3).
 */
export function pageSlots(currentPage: number, lastPage: number): PageSlot[] {
  const narrow = windowOf([1, currentPage, lastPage]);
  const wide = windowOf([
    1,
    Math.max(1, currentPage - 1),
    currentPage,
    Math.min(lastPage, currentPage + 1),
    lastPage,
  ]);
  const pages = [...new Set([...narrow.pages, ...wide.pages])].sort(
    (x, y) => x - y,
  );
  const slots: PageSlot[] = [];
  for (const page of pages) {
    slots.push({
      kind: "page",
      page,
      narrow: narrow.pages.has(page),
      wide: wide.pages.has(page),
    });
    const inNarrow = narrow.ellipsisAfter.has(page);
    const inWide = wide.ellipsisAfter.has(page);
    if (inNarrow && inWide) {
      slots.push({ kind: "ellipsis", narrow: true, wide: true });
    } else if (inNarrow) {
      slots.push({ kind: "ellipsis", narrow: true, wide: false });
    } else if (inWide) {
      slots.push({ kind: "ellipsis", narrow: false, wide: true });
    }
  }
  return slots;
}

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
 * Numbered pagination of a paged list (design.md D2–D6; the content-structure
 * spec "Pagination", "Pagination page numbers" and "Compact Previous and
 * Next"). A `nav` named by `navigationLabel` holds Previous, the list of
 * `pageSlots` and Next, in focus order. Every slot renders once and the slots
 * of one window only are hidden at the other width, so the markup does not
 * depend on the viewport. Activation pushes the list's own address with the
 * chosen page through `useRouter` — an event handler, hence a Client
 * Component — and reads no URL hook, so every input comes from serializable
 * props. Previous renders disabled at `currentPage === 1` and Next at
 * `currentPage === lastPage`, where `Button` ignores activation; the current
 * number carries `aria-current="page"`, is never disabled and pushes nothing.
 * The host renders it only below a successfully loaded, non-empty list.
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
    <nav aria-label={texts.navigationLabel} className={PAGINATION_CLASSES}>
      <Button
        variant="primary"
        size="base"
        className={ARROW_CLASSES}
        disabled={currentPage === 1}
        onClick={() => router.push(pageAddress(path, query, currentPage - 1))}
      >
        <ChevronLeft aria-hidden className={ARROW_ICON_CLASSES} />
        <span className={ARROW_LABEL_CLASSES}>{texts.previousLabel}</span>
      </Button>
      <ul className={SLOT_LIST_CLASSES}>
        {pageSlots(currentPage, lastPage).map((slot, index) => (
          <li
            key={slot.kind === "page" ? `page-${slot.page}` : `ellipsis-${index}`}
            className={slotItemClasses(slot)}
          >
            {slot.kind === "page" ? (
              <Button
                variant="action-3"
                size="base"
                aria-label={texts.pageLabel.replace("{page}", String(slot.page))}
                aria-current={slot.page === currentPage ? "page" : undefined}
                className={
                  slot.page === currentPage
                    ? `${NUMBER_CLASSES} ${CURRENT_NUMBER_CLASSES}`
                    : NUMBER_CLASSES
                }
                onClick={() => {
                  if (slot.page !== currentPage) {
                    router.push(pageAddress(path, query, slot.page));
                  }
                }}
              >
                {slot.page}
              </Button>
            ) : (
              <span aria-hidden="true" className={ELLIPSIS_CLASSES}>
                {ELLIPSIS_MARK}
              </span>
            )}
          </li>
        ))}
      </ul>
      <Button
        variant="primary"
        size="base"
        className={ARROW_CLASSES}
        disabled={currentPage === lastPage}
        onClick={() => router.push(pageAddress(path, query, currentPage + 1))}
      >
        <span className={ARROW_LABEL_CLASSES}>{texts.nextLabel}</span>
        <ChevronRight aria-hidden className={ARROW_ICON_CLASSES} />
      </Button>
    </nav>
  );
}
