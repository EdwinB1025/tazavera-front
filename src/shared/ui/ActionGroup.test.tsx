import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ActionGroup } from "@/shared/ui/ActionGroup";

afterEach(() => {
  cleanup();
});

// spec base-controls "Action group" — scenario "Equal columns on mobile,
// predefined widths from 768px" (unify-action-button-widths D3).
describe("ActionGroup", () => {
  it("renders two equal columns below md and an end-aligned wrapping row from md", () => {
    render(
      <ActionGroup align="end" data-testid="group">
        <button type="button">Cancel</button>
        <button type="button">Save</button>
      </ActionGroup>,
    );
    expect(screen.getByTestId("group").className).toBe(
      "grid grid-cols-2 gap-3 max-md:*:w-full max-md:*:min-w-0 md:flex md:flex-wrap md:justify-end",
    );
  });
});
