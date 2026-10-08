import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  Collapsible,
  CollapsibleHeader,
  CollapsibleBody,
} from "@/shared/ui/Collapsible";
import type { CollapsibleProps } from "@/shared/ui/Collapsible";

// This project has no global test setup, so RTL's auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

function renderSection(
  props: Partial<CollapsibleProps> = {},
  header: { aside?: string; headingLevel?: 2 | 3 | 4 | 5 | 6 } = {},
) {
  const utils = render(
    <Collapsible {...props}>
      <CollapsibleHeader aside={header.aside} headingLevel={header.headingLevel}>
        Fragancia / Aroma
      </CollapsibleHeader>
      <CollapsibleBody data-testid="body">
        <a href="#x">Inner link</a>
      </CollapsibleBody>
    </Collapsible>,
  );
  const button = screen.getByRole("button");
  const body = screen.getByTestId("body");
  return { ...utils, button, body };
}

describe("Collapsible section", () => {
  it("reports toggles and follows the prop when controlled", () => {
    const onOpenChange = vi.fn();
    const { button, rerender } = renderSection({ open: false, onOpenChange });
    fireEvent.click(button);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(button.getAttribute("aria-expanded")).toBe("false");

    rerender(
      <Collapsible open onOpenChange={onOpenChange}>
        <CollapsibleHeader>Fragancia / Aroma</CollapsibleHeader>
        <CollapsibleBody data-testid="body">
          <a href="#x">Inner link</a>
        </CollapsibleBody>
      </Collapsible>,
    );
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true");
  });

  it("reports toggles when uncontrolled", () => {
    const onOpenChange = vi.fn();
    const { button } = renderSection({ onOpenChange });
    fireEvent.click(button);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });

  it("has no description without an aside", () => {
    const { button } = renderSection();
    expect(button.hasAttribute("aria-describedby")).toBe(false);
  });

  it("wraps the button in a heading of the given level", () => {
    const { button } = renderSection({}, { headingLevel: 3 });
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading.tagName).toBe("H3");
    expect(heading.contains(button)).toBe(true);
  });

  it("renders no heading without a heading level", () => {
    renderSection();
    expect(screen.queryByRole("heading")).toBeNull();
  });
});
