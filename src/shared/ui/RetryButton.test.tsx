import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { RetryButton } from "@/shared/ui/RetryButton";

// The retry action refreshes through the app router; the hook is mocked here —
// test infrastructure only.
const router = { push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  router.refresh.mockReset();
});

describe("RetryButton", () => {
  it("renders one button with the consumer's label", () => {
    render(<RetryButton label="Retry" />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Retry" })).toBeDefined();
  });

  it("calls router.refresh() on activation", () => {
    render(<RetryButton label="Retry" />);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });
});
