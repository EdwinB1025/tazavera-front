import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import {
  Card,
  CardAside,
  CardContent,
  CardFooter,
} from "@/shared/ui/Card";
import type { CardLayout, CardVariant } from "@/shared/ui/Card";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see regions left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * Card region tests (design.md D6, specs "Card regions" and "Card stacking on
 * narrow viewports"). Written before the component is implemented (task 2.2);
 * the import of the card parts fails to resolve until `src/shared/ui/Card.tsx`
 * exists, so the file runs and fails as required.
 *
 * Assertions are className-/attribute-based: jsdom has no CSS engine, so the
 * row and stacked layouts are verified by the border and stacking classes the
 * build chose for them (task 2.1 leaves that choice to the build; these tests
 * pin it):
 *
 *   CardAside   — `lg:float-left lg:w-1/4` beside the content at lg, with the
 *                 separator on the boundary between the two regions in both
 *                 layouts: `border-b border-border-subtle` below lg (the parts
 *                 stacked), switching at lg to `lg:border-r` with
 *                 `lg:border-b-0`.
 *   CardContent — `lg:flow-root`, so its box stays beside the floating side
 *                 column at lg and fills the card when no side column renders.
 *   CardFooter  — `lg:clear-both`, below both regions at lg.
 *
 * Every layout class is `lg`-prefixed: below 1024px the parts are plain blocks
 * and stack in DOM order — side column, content, footer.
 */

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: HTMLElement): string[] {
  return element.className.split(/\s+/).filter(Boolean);
}

/** The card root element rendered into the container. */
function cardRoot(container: HTMLElement): HTMLElement {
  return container.firstElementChild as HTMLElement;
}

/** The three regions of a card rendered with full content. */
function renderFullCard(): {
  root: HTMLElement;
  aside: HTMLElement;
  content: HTMLElement;
  footer: HTMLElement;
} {
  const { container } = render(
    <Card>
      <CardAside>SCORE 84.25</CardAside>
      <CardContent>COFFEE NAME</CardContent>
      <CardFooter>FOOTER ACTIONS</CardFooter>
    </Card>,
  );
  const root = cardRoot(container);
  return {
    root,
    aside: root.children[0] as HTMLElement,
    content: root.children[1] as HTMLElement,
    footer: root.children[2] as HTMLElement,
  };
}

describe("Card", () => {
  describe("Stacked card layout (spec: 'Stacked at every width', 'Footer at the bottom'; design.md D14)", () => {
    function renderStackedCard(): {
      root: HTMLElement;
      aside: HTMLElement;
      content: HTMLElement;
      footer: HTMLElement;
    } {
      const { container } = render(
        <Card layout="stacked">
          <CardAside>SCORE 84.25</CardAside>
          <CardContent>COFFEE NAME</CardContent>
          <CardFooter>FOOTER ACTIONS</CardFooter>
        </Card>,
      );
      const root = cardRoot(container);
      return {
        root,
        aside: root.children[0] as HTMLElement,
        content: root.children[1] as HTMLElement,
        footer: root.children[2] as HTMLElement,
      };
    }

    it("keeps the settled card classes on the root", () => {
      const { root } = renderStackedCard();
      expect(classTokens(root)).toEqual(
        expect.arrayContaining([
          "bg-surface-card",
          "rounded-container",
          "border-l-4",
          "border-border-accent",
          "shadow-lg",
        ]),
      );
    });

    it("leaves the default layout a block with its lg behaviour", () => {
      const { root, aside } = renderFullCard();
      expect(classTokens(root)).not.toContain("flex");
      expect(classTokens(aside)).toContain("lg:float-left");
    });
  });

  describe("Section card (spec 'Section card'; design.md D2–D5)", () => {
    const SECTION: CardVariant = "section";

    function renderSectionCard(layout?: CardLayout): {
      root: HTMLElement;
      aside: HTMLElement;
      content: HTMLElement;
      footer: HTMLElement;
    } {
      const { container } = render(
        <Card variant={SECTION} layout={layout}>
          <CardAside>BAND</CardAside>
          <CardContent>BODY</CardContent>
          <CardFooter>FOOTER</CardFooter>
        </Card>,
      );
      const root = cardRoot(container);
      return {
        root,
        aside: root.children[0] as HTMLElement,
        content: root.children[1] as HTMLElement,
        footer: root.children[2] as HTMLElement,
      };
    }

    it("stacks band, body and footer at every width (layout stacked)", () => {
      const { root, aside, content, footer } = renderSectionCard("stacked");
      expect(
        Array.from(root.children).map((region) => region.textContent),
      ).toEqual(["BAND", "BODY", "FOOTER"]);
      for (const part of [aside, content, footer]) {
        for (const lgClass of [
          "lg:float-left",
          "lg:w-1/4",
          "lg:border-r",
          "lg:border-b-0",
          "lg:flow-root",
          "lg:clear-both",
        ]) {
          expect(classTokens(part)).not.toContain(lgClass);
        }
      }
      expect(classTokens(root)).not.toContain("h-full");
      expect(classTokens(footer)).not.toContain("mt-auto");
    });
  });
});
