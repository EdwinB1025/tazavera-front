import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { FormStatus } from "@/shared/ui";

/**
 * Form status (design.md D9 and D10): the success status is `role="status"`
 * with the `aria-hidden` `Check` icon beside its text; the form-level error is
 * `role="alert"` text, never colour alone.
 */

afterEach(() => {
  cleanup();
});

describe("FormStatus", () => {
  it("a success is a status with the Check icon beside its text", () => {
    render(<FormStatus kind="success" text="fx-done" />);
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("fx-done");
    const icon = status.querySelector("svg")!;
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("class")).toContain("lucide-check");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("an error is an alert carrying its text", () => {
    render(<FormStatus kind="error" text="fx-error" />);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("fx-error");
    expect(alert.querySelector("svg")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });
});
