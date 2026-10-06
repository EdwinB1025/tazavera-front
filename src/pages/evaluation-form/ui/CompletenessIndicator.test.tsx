import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CompletenessIndicator } from "./CompletenessIndicator";

/** The completeness indicator (design.md D10): words first, the icon only when complete. */

afterEach(cleanup);

describe("CompletenessIndicator (design.md D10)", () => {
  it("shows Complete with the check icon", () => {
    render(<CompletenessIndicator complete completeLabel="Complete" incompleteLabel="Incomplete" />);
    const indicator = screen.getByText("Complete");
    expect(indicator.textContent).toBe("Complete");
    const icon = indicator.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows Incomplete as text with no icon", () => {
    render(
      <CompletenessIndicator complete={false} completeLabel="Complete" incompleteLabel="Incomplete" />,
    );
    const indicator = screen.getByText("Incomplete");
    expect(indicator.querySelector("svg")).toBeNull();
    expect(screen.queryByText("Complete")).toBeNull();
  });
});
