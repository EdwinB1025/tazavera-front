import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { PageSection } from "@/shared/ui/PageSection";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see sections left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * PageSection tests (design.md D7, the "Page sections" requirement's "Section
 * background" and "Consumer content only" scenarios). Written before the
 * component is implemented (task 2.2): `PageSection` does not exist yet in
 * `src/shared/ui/PageSection.tsx`, so the file runs and fails as required.
 *
 * Assertions are class-token-based: jsdom has no CSS engine, so the section
 * and its container are verified by the exact class tokens of design.md D3.
 * Tokens, not strings: the order inside the class attribute may differ.
 */

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

/** The five container tokens of design.md D3. */
const CONTAINER_TOKENS = ["mx-auto", "w-full", "max-w-6xl", "px-4", "md:px-8"];

/** The rendered section root. */
function sectionOf(container: HTMLElement): HTMLElement {
  return container.querySelector("section") as HTMLElement;
}

describe("PageSection", () => {
  describe("Rendered structure (design.md D3: a section with exactly one container child)", () => {
    it("renders a section whose tokens include py-12 and md:py-16", () => {
      const { container } = render(<PageSection>CONTENT</PageSection>);
      const section = sectionOf(container);
      expect(section.tagName).toBe("SECTION");
      const tokens = classTokens(section);
      expect(tokens).toContain("py-12");
      expect(tokens).toContain("md:py-16");
    });

    it("renders exactly one child whose tokens include the five container tokens", () => {
      const { container } = render(<PageSection>CONTENT</PageSection>);
      const section = sectionOf(container);
      expect(section.childElementCount).toBe(1);
      const tokens = classTokens(section.firstElementChild as Element);
      for (const token of CONTAINER_TOKENS) {
        expect(tokens, token).toContain(token);
      }
    });
  });

  describe("Section background (spec: the background is the page or the section background)", () => {
    it("carries the page background without surface and the section background with surface=\"section\"", () => {
      const page = render(<PageSection>CONTENT</PageSection>);
      const pageTokens = classTokens(sectionOf(page.container));
      expect(pageTokens).toContain("bg-surface-page");
      expect(pageTokens).not.toContain("bg-surface-section");

      const sectioned = render(
        <PageSection surface="section">CONTENT</PageSection>,
      );
      const sectionTokens = classTokens(sectionOf(sectioned.container));
      expect(sectionTokens).toContain("bg-surface-section");
      expect(sectionTokens).not.toContain("bg-surface-page");
    });
  });

  describe("Consumer content only (spec: the rendered content is exactly what the consumer supplied)", () => {
    it("renders the children inside the container and adds no text of its own", () => {
      const { container } = render(
        <PageSection>
          <p>COFFEE NAME</p>
          <p>ORIGIN LINE</p>
        </PageSection>,
      );
      const section = sectionOf(container);
      const containerBox = section.firstElementChild as HTMLElement;
      // The children render inside the container, exactly as supplied.
      expect(
        Array.from(containerBox.children).map((child) => child.textContent),
      ).toEqual(["COFFEE NAME", "ORIGIN LINE"]);
      expect(containerBox.textContent).toBe("COFFEE NAMEORIGIN LINE");
      // The primitive adds no text of its own.
      expect(section.textContent).toBe("COFFEE NAMEORIGIN LINE");
    });
  });
});
