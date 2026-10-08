import { describe, it, expect, afterEach } from "vitest";
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
  it("is a section card with a subtle border and no accent edge", () => {
    render(
      <AccountSection heading="fx-heading">
        <p>fx-content</p>
      </AccountSection>,
    );
    const card = screen.getByRole("region", { name: "fx-heading" })
      .firstElementChild!;
    expect(card.classList.contains("border")).toBe(true);
    expect(card.classList.contains("border-border-subtle")).toBe(true);
    expect(card.classList.contains("border-l-4")).toBe(false);
  });

  it("holds the heading block in the header band, and the content outside it", () => {
    const { unmount } = render(
      <AccountSection heading="fx-heading" description="fx-description">
        <p>fx-content</p>
      </AccountSection>,
    );
    let band = screen
      .getByRole("heading", { level: 2, name: "fx-heading" })
      .closest(".bg-surface-section");
    expect(band).not.toBeNull();
    expect(band!.contains(screen.getByText("fx-description"))).toBe(true);
    expect(band!.contains(screen.getByText("fx-content"))).toBe(false);
    unmount();

    render(
      <AccountSection heading="fx-heading">
        <p>fx-content</p>
      </AccountSection>,
    );
    band = screen
      .getByRole("heading", { level: 2, name: "fx-heading" })
      .closest(".bg-surface-section");
    expect(band).not.toBeNull();
    expect(band!.textContent).toBe("fx-heading");
    expect(band!.contains(screen.getByText("fx-content"))).toBe(false);
  });
});
