import { describe, it, expect, afterEach } from "vitest";
import { createRef } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { AccountSection } from "@/features/user-account";

/**
 * An account section (design.md D9 and D10): a named region labelled by its
 * `h2`, one card holding the header — the heading and an optional
 * description — and the content.
 */

afterEach(() => {
  cleanup();
});

describe("AccountSection", () => {
  it("is a region named by its h2, with its description and content", () => {
    render(
      <AccountSection heading="fx-heading" description="fx-description">
        <p>fx-content</p>
      </AccountSection>,
    );
    const region = screen.getByRole("region", { name: "fx-heading" });
    expect(region.tagName).toBe("SECTION");
    const heading = screen.getByRole("heading", { level: 2, name: "fx-heading" });
    expect(region.getAttribute("aria-labelledby")).toBe(heading.id);
    expect(screen.getByText("fx-description")).toBeTruthy();
    expect(screen.getByText("fx-content")).toBeTruthy();
  });
});

describe("AccountSection — headingRef", () => {
  it("gives the h2 the ref and tabIndex -1 when headingRef is given", () => {
    const headingRef = createRef<HTMLHeadingElement>();
    render(
      <AccountSection heading="fx-heading" headingRef={headingRef}>
        <p>fx-content</p>
      </AccountSection>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "fx-heading" });
    expect(headingRef.current).toBe(heading);
    expect(heading.getAttribute("tabindex")).toBe("-1");
  });

  it("renders the h2 with no tabIndex without headingRef", () => {
    render(
      <AccountSection heading="fx-heading">
        <p>fx-content</p>
      </AccountSection>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "fx-heading" });
    expect(heading.hasAttribute("tabindex")).toBe(false);
  });
});
