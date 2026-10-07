import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ClearFiltersButton } from "@/features/offering-facets";

const nav = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/es/offerings",
  useSearchParams: () =>
    new URLSearchParams("process=washed&orderBy=cupping_avg&orderDirection=desc&page=2"),
}));

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/** "Clear all" of the filtered empty state (design.md D5, D9; spec "Filtered offerings results"). */
describe("ClearFiltersButton (design.md D9)", () => {
  it("is a button named Clear all that clears the filters and keeps the sort", () => {
    render(<ClearFiltersButton label="Clear all" />);
    const button = screen.getByRole("button", { name: "Clear all" });
    expect(button.getAttribute("class")).toContain("focus-visible:focus-ring");
    fireEvent.click(button);
    expect(nav.push).toHaveBeenCalledWith("/es/offerings?orderBy=cupping_avg&orderDirection=desc", {
      scroll: false,
    });
  });
});
