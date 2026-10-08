import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * The view screen (design.md D3, D5; summary §5.3; spec "Read-only
 * evaluation view"; tasks 3.3). The async wrapper is replaced at the widget's
 * public API by a marker that renders the back link it receives.
 */

vi.mock("@/widgets/evaluation-sheet", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/widgets/evaluation-sheet")>()),
  EvaluationSheetView: ({ ulid, back }: { ulid: string; back: ReactNode }) => (
    <div data-testid="view" data-ulid={ulid}>
      {back}
    </div>
  ),
  EvaluationSheetViewSkeleton: () => null,
}));

import { ViewScreen, viewMetadata } from "@/pages/public-evaluation/ui/ViewScreen";

afterEach(cleanup);

describe("ViewScreen (summary §5.3)", () => {
  it("passes the ulid and a back link to the plain list with no query", () => {
    render(<ViewScreen locale="en" ulid="01JEVAL1" />);
    expect(screen.getByTestId("view").getAttribute("data-ulid")).toBe("01JEVAL1");
    const back = screen.getByRole("link", { name: "Back" });
    expect(back.getAttribute("href")).toBe("/en/evaluations");
    expect(back.className).toContain("gap-2");
  });

  it("carries the public-evaluations metaDescription in the document metadata", () => {
    expect(viewMetadata("en")).toEqual({ description: "Public specialist evaluations" });
  });
});
