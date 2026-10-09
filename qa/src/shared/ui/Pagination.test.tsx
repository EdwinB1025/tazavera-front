import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Pagination, pageSlots } from "@/shared/ui/Pagination";
import type { PageSlot, PaginationProps } from "@/shared/ui/Pagination";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see buttons left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * Pagination tests (design.md D3–D6, D9; the content-structure spec
 * "Pagination"). The five cases of the landing's former widget pagination
 * test keep their expectations, rewritten for the props of D3, plus the two
 * query cases of D9.
 *
 * Previous and Next push `path` with the query and `page` set to the
 * preceding or following page of `currentPage` through `useRouter`; `page`
 * replaces an existing `page` key in place and repeated keys keep every value,
 * as `URLSearchParams` builds it (design.md D4). Previous renders disabled at
 * `currentPage === 1` and Next at `currentPage === lastPage`, where an
 * unavailable button accepts no activation (spec: "Boundaries"). The app
 * router hook is mocked here — test infrastructure only.
 */

const router = { push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

beforeEach(() => {
  router.push.mockReset();
  router.refresh.mockReset();
});

const TEXTS = {
  navigationLabel: "texts.navigationLabel",
  previousLabel: "texts.previousLabel",
  nextLabel: "texts.nextLabel",
  pageLabel: "texts.pageLabel {page}",
};

function renderPagination(props: Omit<PaginationProps, "texts">) {
  return render(<Pagination {...props} texts={TEXTS} />);
}

describe("Pagination", () => {
  it("keeps every value of a repeated key (spec: Other query parameters kept)", () => {
    renderPagination({
      currentPage: 2,
      lastPage: 5,
      path: "/es/offerings",
      query: { process: ["washed", "natural"] },
    });
    fireEvent.click(screen.getByRole("button", { name: TEXTS.nextLabel }));
    expect(router.push).toHaveBeenCalledWith(
      "/es/offerings?process=washed&process=natural&page=3",
    );
  });

  describe("pageSlots (design.md D3)", () => {
    // Slot shorthands: a page or an ellipsis shown at both widths, narrow
    // only (n) or wide only (w).
    const page = (p: number, narrow = true, wide = true): PageSlot => ({
      kind: "page",
      page: p,
      narrow,
      wide,
    });
    const ellipsis = (narrow = true, wide = true): PageSlot => ({
      kind: "ellipsis",
      narrow,
      wide,
    });
    const n = false;
    const w = false;

    it("returns the D3 slots for lastPage 20 and current 1", () => {
      expect(pageSlots(1, 20)).toEqual([
        page(1),
        ellipsis(true, w),
        page(2, n),
        ellipsis(n, true),
        page(20),
      ]);
    });

    it("returns the D3 slots for lastPage 20 and current 10", () => {
      expect(pageSlots(10, 20)).toEqual([
        page(1),
        ellipsis(),
        page(9, n),
        page(10),
        ellipsis(true, w),
        page(11, n),
        ellipsis(n, true),
        page(20),
      ]);
    });

    it("returns the D3 slots for lastPage 20 and current 20", () => {
      expect(pageSlots(20, 20)).toEqual([
        page(1),
        ellipsis(),
        page(19, n),
        page(20),
      ]);
    });

    it("returns one page slot 1 at both widths for lastPage 1", () => {
      expect(pageSlots(1, 1)).toEqual([page(1)]);
    });

    it("returns 1 2 3 at both widths and no ellipsis for lastPage 3 and current 2", () => {
      expect(pageSlots(2, 3)).toEqual([page(1), page(2), page(3)]);
    });
  });

  it("keeps the other query parameters on a number (spec: Other query parameters kept)", () => {
    renderPagination({
      currentPage: 10,
      lastPage: 20,
      path: "/es/offerings",
      query: { roasteryName: "Nómada", page: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "texts.pageLabel 9" }));
    expect(router.push).toHaveBeenCalledWith(
      "/es/offerings?roasteryName=N%C3%B3mada&page=9",
    );
  });

  describe("Classes (design.md D3, D5, D6)", () => {
    const tokensOf = (element: Element): string[] =>
      (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);

    it("hides a narrow-only slot from md and a wide-only slot below md", () => {
      const { container } = renderPagination({
        currentPage: 10,
        lastPage: 20,
        path: "/es",
      });
      const itemOf = (p: number) =>
        screen.getByRole("button", { name: `texts.pageLabel ${p}` }).closest("li")!;
      // 9 is wide only, 10 both widths; the ellipsis after 10 is narrow only.
      const wideOnly = tokensOf(itemOf(9));
      expect(wideOnly).toContain("max-md:hidden");
      expect(wideOnly).not.toContain("md:hidden");
      const both = tokensOf(itemOf(10));
      expect(both).not.toContain("max-md:hidden");
      expect(both).not.toContain("md:hidden");
      const items = Array.from(container.querySelectorAll("li"));
      const narrowOnly = tokensOf(items[items.indexOf(itemOf(10)) + 1]!);
      expect(narrowOnly).toContain("md:hidden");
      expect(narrowOnly).not.toContain("max-md:hidden");
    });

    it("gives the current number the current treatment of D5", () => {
      renderPagination({ currentPage: 10, lastPage: 20, path: "/es" });
      const current = tokensOf(
        screen.getByRole("button", { name: "texts.pageLabel 10" }),
      );
      const other = tokensOf(
        screen.getByRole("button", { name: "texts.pageLabel 9" }),
      );
      expect(current.filter((t) => !other.includes(t)).sort()).toEqual(
        ["bg-action-3-bg-hover", "text-action-3-text-hover"].sort(),
      );
      expect(other.filter((t) => !current.includes(t))).toEqual([]);
    });

    it("gives a page number the D6 geometry", () => {
      renderPagination({ currentPage: 10, lastPage: 20, path: "/es" });
      const number = tokensOf(
        screen.getByRole("button", { name: "texts.pageLabel 9" }),
      );
      expect(number).toEqual(
        expect.arrayContaining(["h-10", "min-w-10!", "px-3!"]),
      );
    });

    it("colours the ellipsis with text-text-primary", () => {
      const { container } = renderPagination({
        currentPage: 10,
        lastPage: 20,
        path: "/es",
      });
      const ellipsis = Array.from(container.querySelectorAll("li")).find(
        (item) => item.textContent === "…",
      )!.firstElementChild!;
      expect(tokensOf(ellipsis)).toContain("text-text-primary");
    });
  });
});
