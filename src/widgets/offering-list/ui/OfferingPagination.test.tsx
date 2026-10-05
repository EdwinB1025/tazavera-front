import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { OfferingsPageMeta } from "@/shared/api";
import { OfferingPagination } from "./OfferingPagination";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see buttons left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * Pagination tests (design.md D9; the landing spec "Verified offerings list" —
 * "Paging", "Paging at the boundaries"). Written before the implementation
 * (task 5.2): the import fails to resolve until
 * `src/widgets/offering-list/ui/OfferingPagination.tsx` exists, so the file
 * runs and fails as required.
 *
 * The Previous/Next buttons push `/{locale}?page={n}` through `useRouter` —
 * the preceding and following page of `meta.current_page` — and render
 * disabled at `meta.current_page === 1` and at
 * `meta.current_page === meta.last_page` (design.md D9), where an unavailable
 * button accepts no activation (spec: "Paging at the boundaries"). The app
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
  previousLabel: "texts.previousLabel",
  nextLabel: "texts.nextLabel",
};

function renderPagination(locale: string, meta: OfferingsPageMeta) {
  return render(
    <OfferingPagination locale={locale} meta={meta} texts={TEXTS} />,
  );
}

describe("OfferingPagination", () => {
  it("pushes /{locale}?page={n} for the preceding page on Previous (spec: Paging)", () => {
    renderPagination("es", { current_page: 2, last_page: 5 });
    fireEvent.click(screen.getByRole("button", { name: TEXTS.previousLabel }));
    expect(router.push).toHaveBeenCalledWith("/es?page=1");
  });

  it("pushes /{locale}?page={n} for the following page on Next (spec: Paging)", () => {
    renderPagination("ca", { current_page: 2, last_page: 5 });
    fireEvent.click(screen.getByRole("button", { name: TEXTS.nextLabel }));
    expect(router.push).toHaveBeenCalledWith("/ca?page=3");
  });

  it("makes Previous unavailable on the first page (spec: Paging at the boundaries)", () => {
    renderPagination("es", { current_page: 1, last_page: 5 });
    const previous = screen.getByRole("button", { name: TEXTS.previousLabel });
    expect(previous.hasAttribute("disabled")).toBe(true);
    fireEvent.click(previous);
    expect(router.push).not.toHaveBeenCalled();
  });

  it("makes Next unavailable on the last page (spec: Paging at the boundaries)", () => {
    renderPagination("es", { current_page: 5, last_page: 5 });
    const next = screen.getByRole("button", { name: TEXTS.nextLabel });
    expect(next.hasAttribute("disabled")).toBe(true);
    fireEvent.click(next);
    expect(router.push).not.toHaveBeenCalled();
  });
});
