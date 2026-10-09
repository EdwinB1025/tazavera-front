import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { RouteButton } from "@/shared/ui/RouteButton";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(() => {
  cleanup();
});

// spec base-controls "Action button widths" — scenario "Minimum width per
// size", as a route button (unify-action-button-widths D2).
describe("RouteButton", () => {
  it("takes its size's minimum width", () => {
    render(
      <RouteButton href="/es/offerings" size="sm">
        View
      </RouteButton>,
    );
    expect(screen.getByRole("button", { name: "View" }).classList.contains("min-w-action-sm")).toBe(true);
  });
});
