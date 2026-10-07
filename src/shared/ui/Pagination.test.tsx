import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Pagination } from "./Pagination";
import type { PaginationProps } from "./Pagination";

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
  it("pushes the preceding page at the list's address on Previous (spec: Next and Previous)", () => {
    renderPagination({ currentPage: 2, lastPage: 5, path: "/es" });
    fireEvent.click(screen.getByRole("button", { name: TEXTS.previousLabel }));
    expect(router.push).toHaveBeenCalledWith("/es?page=1");
  });

  it("pushes the following page at the list's address on Next (spec: Next and Previous)", () => {
    renderPagination({ currentPage: 2, lastPage: 5, path: "/ca" });
    fireEvent.click(screen.getByRole("button", { name: TEXTS.nextLabel }));
    expect(router.push).toHaveBeenCalledWith("/ca?page=3");
  });

  it("makes Previous unavailable on the first page (spec: Boundaries)", () => {
    renderPagination({ currentPage: 1, lastPage: 5, path: "/es" });
    const previous = screen.getByRole("button", { name: TEXTS.previousLabel });
    expect(previous.hasAttribute("disabled")).toBe(true);
    fireEvent.click(previous);
    expect(router.push).not.toHaveBeenCalled();
  });

  it("makes Next unavailable on the last page (spec: Boundaries)", () => {
    renderPagination({ currentPage: 5, lastPage: 5, path: "/es" });
    const next = screen.getByRole("button", { name: TEXTS.nextLabel });
    expect(next.hasAttribute("disabled")).toBe(true);
    fireEvent.click(next);
    expect(router.push).not.toHaveBeenCalled();
  });

  it("replaces page in place and keeps the other query parameters (spec: Other query parameters kept)", () => {
    renderPagination({
      currentPage: 2,
      lastPage: 5,
      path: "/es/offerings",
      query: { roasteryName: "Nómada", page: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: TEXTS.nextLabel }));
    expect(router.push).toHaveBeenCalledWith(
      "/es/offerings?roasteryName=N%C3%B3mada&page=3",
    );
  });

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

  describe("Layout (design.md D6)", () => {
    it("centers Previous and Next, 1rem apart, wrapping when narrow", () => {
      const { container } = renderPagination({
        currentPage: 2,
        lastPage: 3,
        path: "/es",
      });
      const tokens = (container.firstElementChild!.getAttribute("class") ?? "")
        .split(/\s+/)
        .filter(Boolean);
      expect(tokens.sort()).toEqual(
        ["flex", "flex-wrap", "justify-center", "gap-4"].sort(),
      );
    });
  });
});
