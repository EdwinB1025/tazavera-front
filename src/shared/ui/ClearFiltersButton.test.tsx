import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ClearFiltersButton } from "@/shared/ui";

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  pathname: "/",
  search: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(nav.search),
}));

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  nav.push.mockClear();
});

/** Shared "Clear all" of a filtered empty list (design.md D5; spec "Clear all action for an empty filtered list"). */
describe("ClearFiltersButton (design.md D2–D3)", () => {
  it("is one button named by its label that clears the filters and keeps the given keys", () => {
    nav.pathname = "/es/offerings";
    nav.search = "process=washed&orderBy=cupping_avg&orderDirection=desc&page=2";
    render(<ClearFiltersButton label="Clear all" keep={["orderBy", "orderDirection"]} />);
    const buttons = screen.getAllByRole("button", { name: "Clear all" });
    expect(buttons).toHaveLength(1);
    const button = buttons[0];
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("class")).toContain("focus-visible:focus-ring");
    fireEvent.click(button);
    expect(nav.push).toHaveBeenCalledWith("/es/offerings?orderBy=cupping_avg&orderDirection=desc", {
      scroll: false,
    });
  });

  it("opens the bare path when no key is kept", () => {
    nav.pathname = "/es/manage/evaluations";
    nav.search = "status=open";
    render(<ClearFiltersButton label="Clear all" keep={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(nav.push).toHaveBeenCalledWith("/es/manage/evaluations", { scroll: false });
  });
});
