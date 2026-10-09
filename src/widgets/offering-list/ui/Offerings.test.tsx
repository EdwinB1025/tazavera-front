import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import type { OfferingListTexts } from "./OfferingList";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * The offerings block (spec "Filtered offerings scoped by a host"). The
 * offerings fetch is replaced by a spy so the request can fail; the retry
 * action uses the app router, mocked here. Test infrastructure only.
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const fetchOfferings = vi.hoisted(() => vi.fn());
vi.mock("../api/offerings", () => ({ fetchOfferings }));

import { Offerings } from "./Offerings";

const TEXTS: OfferingListTexts = {
  coffeeshopCaption: "coffeeshopCaption",
  roasterCaption: "roasterCaption",
  evaluationsLabel: "evaluationsLabel",
  defectiveLabel: "defectiveLabel",
  viewLabel: "viewLabel",
  evaluateLabel: "evaluateLabel",
  viewEvaluationsLabel: "viewEvaluationsLabel",
  verifiedLabel: "verifiedLabel",
  provisionalLabel: "provisionalLabel",
  ratingExceptionalLabel: "ratingExceptionalLabel",
  ratingExcellentLabel: "ratingExcellentLabel",
  ratingGoodLabel: "ratingGoodLabel",
  ratingCommercialLabel: "ratingCommercialLabel",
  previousLabel: "previousLabel",
  nextLabel: "nextLabel",
  navigationLabel: "navigationLabel",
  pageLabel: "pageLabel {page}",
  emptyMessage: "emptyMessage",
  resultCount: "resultCount",
  errorMessage: "errorMessage",
  retryLabel: "retryLabel",
};

describe("Offerings", () => {
  it("shows the catalog's error state when the request of a view with a fixed key fails (spec: Scoped list fails)", async () => {
    fetchOfferings.mockResolvedValue({ ok: false, kind: "error" });
    const query = { coffeeshopUlid: "Y", process: "washed" };
    render(await Offerings({ locale: "es", query, texts: TEXTS, path: "/es/coffeeshops/Y" }));
    expect(fetchOfferings).toHaveBeenCalledWith(query);
    expect(screen.getByText("errorMessage")).toBeDefined();
    expect(screen.getByRole("button", { name: "retryLabel" })).toBeDefined();
  });
});
