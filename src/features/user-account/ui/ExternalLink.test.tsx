import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ExternalLink } from "@/features/user-account";

/**
 * External link (design.md D4 and D9): a native anchor to an API page,
 * opening in the same tab, carrying exactly the link treatment that `Link`
 * exports, and named by its visible text.
 */

afterEach(() => {
  cleanup();
});

describe("ExternalLink", () => {
  it("is a same-tab native anchor with exactly the link treatment, named by its text", () => {
    render(<ExternalLink href="https://api.test/user/security">fx-link</ExternalLink>);
    const link = screen.getByRole("link", { name: "fx-link" });
    expect(link.getAttribute("href")).toBe("https://api.test/user/security");
    expect(link.getAttribute("target")).toBeNull();
    expect(link.className).toBe(
      "underline text-text-link hover:text-text-link-hover focus-visible:focus-ring",
    );
  });
});
