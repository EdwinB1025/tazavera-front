import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SeeMoreButton } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

/** "See more" / "See less" action (spec filtering "Radio-list facet"; design.md D6). */

const TEXTS = { seeMore: "See more ({count})", seeLess: "See less" };

describe("SeeMoreButton", () => {
  it("collapsed: reads See more with the count and exposes the controlled group", () => {
    const onToggle = vi.fn();
    render(
      <SeeMoreButton expanded={false} count={3} controls="g" onToggle={onToggle} texts={TEXTS} />,
    );
    const button = screen.getByRole("button", { name: "See more (3)" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe("g");
    expect(button.className).toContain("focus-visible:focus-ring");
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("expanded: reads See less", () => {
    render(<SeeMoreButton expanded count={3} controls="g" onToggle={() => {}} texts={TEXTS} />);
    expect(
      screen.getByRole("button", { name: "See less" }).getAttribute("aria-expanded"),
    ).toBe("true");
  });
});
