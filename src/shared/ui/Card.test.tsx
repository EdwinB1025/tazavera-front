import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import {
  Card,
  CardAside,
  CardContent,
  CardFooter,
} from "@/shared/ui/Card";
import type { CardLayout, CardVariant } from "@/shared/ui/Card";
import {
  Collapsible,
  CollapsibleHeader,
  CollapsibleBody,
} from "@/shared/ui/Collapsible";

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
  describe("Full regions (spec: the side column beside the content, the footer below both)", () => {
    it("renders the side column, the content and the footer in that order", () => {
      const { root, aside, content, footer } = renderFullCard();
      expect(root.childElementCount).toBe(3);
      expect(aside.textContent).toBe("SCORE 84.25");
      expect(content.textContent).toBe("COFFEE NAME");
      expect(footer.textContent).toBe("FOOTER ACTIONS");
    });

    it("sits the side column beside the content at lg with the separator border on their boundary", () => {
      const { aside, content } = renderFullCard();
      // Row layout at lg: the side column floats beside a content box that
      // stays clear of it for its whole height.
      expect(classTokens(aside)).toContain("lg:float-left");
      expect(classTokens(aside)).toContain("lg:w-1/4");
      expect(classTokens(content)).toContain("lg:flow-root");
      // The separator lies on the boundary between the two regions.
      expect(classTokens(aside)).toContain("border-border-subtle");
    });

    it("renders the footer below both regions at lg", () => {
      const { footer } = renderFullCard();
      expect(classTokens(footer)).toContain("lg:clear-both");
    });
  });

  describe("Stacked regions (spec: below 1024px the parts stack in their order)", () => {
    it("stacks the parts in the same order below lg, with the layout classes switching at lg", () => {
      const { root, aside, content, footer } = renderFullCard();
      // Below lg the parts are plain blocks and stack in DOM order.
      expect(
        Array.from(root.children).map((region) => region.textContent),
      ).toEqual(["SCORE 84.25", "COFFEE NAME", "FOOTER ACTIONS"]);
      // The layout classes are lg-only, so nothing applies under 1024px.
      expect(classTokens(aside)).toContain("lg:float-left");
      expect(classTokens(aside)).not.toContain("float-left");
      expect(classTokens(content)).toContain("lg:flow-root");
      expect(classTokens(content)).not.toContain("flow-root");
      expect(classTokens(footer)).toContain("lg:clear-both");
      expect(classTokens(footer)).not.toContain("clear-both");
    });

    it("keeps the separator on the boundary between the side column and the content when they stack", () => {
      const { aside } = renderFullCard();
      // Stacked, the boundary is the side column's bottom edge (`border-b`);
      // at lg it switches to the right edge (`lg:border-r`) and the bottom
      // border goes away (`lg:border-b-0`).
      expect(classTokens(aside)).toContain("border-b");
      expect(classTokens(aside)).toContain("lg:border-r");
      expect(classTokens(aside)).toContain("lg:border-b-0");
    });
  });

  describe("Content only (spec: only the main content region renders)", () => {
    it("renders only the content region when there is no side column and no footer", () => {
      const { container } = render(
        <Card>
          <CardContent>ONLY CONTENT</CardContent>
        </Card>,
      );
      const root = cardRoot(container);
      expect(root.childElementCount).toBe(1);
      expect(root.textContent).toBe("ONLY CONTENT");
    });
  });

  describe("Consumer content only (spec: the rendered text and data are exactly what the consumer supplied)", () => {
    it("renders exactly the consumer's content in every region, with no text of its own", () => {
      const { container } = render(
        <Card>
          <CardAside>
            <span>84.25</span>
            <span>/100</span>
          </CardAside>
          <CardContent>
            <p>COFFEE NAME</p>
            <p>ORIGIN LINE</p>
          </CardContent>
          <CardFooter>
            <span>VIEW</span>
          </CardFooter>
        </Card>,
      );
      const root = cardRoot(container);
      const aside = root.children[0] as HTMLElement;
      const content = root.children[1] as HTMLElement;
      const footer = root.children[2] as HTMLElement;
      expect(aside.textContent).toBe("84.25/100");
      expect(content.textContent).toBe("COFFEE NAMEORIGIN LINE");
      expect(footer.textContent).toBe("VIEW");
      // Nothing outside the three regions contributes text.
      expect(root.textContent).toBe("84.25/100COFFEE NAMEORIGIN LINEVIEW");
    });
  });

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

    it("keeps the side column above the content at every width, with the separator on its bottom edge", () => {
      const { aside, content, footer } = renderStackedCard();
      expect(classTokens(aside)).toContain("border-b");
      expect(classTokens(aside)).toContain("border-border-subtle");
      for (const lgClass of [
        "lg:float-left",
        "lg:w-1/4",
        "lg:border-r",
        "lg:border-b-0",
      ]) {
        expect(classTokens(aside)).not.toContain(lgClass);
      }
      expect(classTokens(content)).not.toContain("lg:flow-root");
      expect(classTokens(footer)).not.toContain("lg:clear-both");
    });

    it("fills its container's height as a column with the footer pushed to the bottom", () => {
      const { root, footer } = renderStackedCard();
      expect(classTokens(root)).toEqual(
        expect.arrayContaining(["flex", "flex-col", "h-full"]),
      );
      expect(classTokens(footer)).toContain("mt-auto");
    });

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

  describe("Card root", () => {
    it("renders exactly the settled classes of design.md D6", () => {
      const { container } = render(
        <Card>
          <CardContent>CONTENT</CardContent>
        </Card>,
      );
      expect(cardRoot(container).className).toBe(
        "bg-surface-card rounded-container border-l-4 border-border-accent shadow-lg",
      );
    });
  });

  describe("Section card (spec 'Section card'; design.md D2–D5)", () => {
    const SECTION: CardVariant = "section";

    // The relational classes the build chose for D4: the band keys off any
    // descendant with `aria-expanded` (the collapsible header's button).
    const COLLAPSIBLE_PADDING = [
      "has-[[aria-expanded]]:p-2",
      "md:has-[[aria-expanded]]:px-4",
    ];
    const COLLAPSIBLE_HOVER = "has-[[aria-expanded]]:hover:bg-surface-section-hover";
    const COLLAPSED_NO_SEPARATOR = "has-[[aria-expanded=false]]:border-b-0";

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

    it("renders the root with the card fill, a 1px subtle border on all sides, the container radius, the shadow and a clip, without the accent edge", () => {
      const { root } = renderSectionCard();
      const tokens = classTokens(root);
      expect(tokens).toEqual(
        expect.arrayContaining([
          "bg-surface-card",
          "rounded-container",
          "shadow-lg",
          "border",
          "border-border-subtle",
          "overflow-hidden",
        ]),
      );
      expect(tokens).not.toContain("border-l-4");
      expect(tokens).not.toContain("border-border-accent");
    });

    for (const layout of [undefined, "stacked"] as const) {
      it(`stacks band, body and footer at every width (layout ${layout ?? "omitted"})`, () => {
        const { root, aside, content, footer } = renderSectionCard(layout);
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
    }

    it("renders the band on the section surface with its separator, flex column, static padding and the collapsible relational classes", () => {
      const { aside } = renderSectionCard();
      const tokens = classTokens(aside);
      expect(tokens).toEqual(
        expect.arrayContaining([
          "bg-surface-section",
          "border-b",
          "border-border-subtle",
          "flex",
          "flex-col",
          "gap-2",
          // Static band: 1rem; 1rem top and bottom, 1.5rem sides from md.
          "p-4",
          "md:px-6",
          // Collapsible band: 0.5rem; 0.5rem top and bottom, 1rem sides from md.
          ...COLLAPSIBLE_PADDING,
          COLLAPSIBLE_HOVER,
          COLLAPSED_NO_SEPARATOR,
        ]),
      );
      // No hover surface unless the band holds the collapsible header.
      expect(tokens.filter((token) => token.startsWith("hover:"))).toEqual([]);
    });

    it("pads the body and the footer 1rem sides and top, 1.25rem bottom, and 1.5rem from md, with no fill or border of their own", () => {
      const { content, footer } = renderSectionCard();
      for (const part of [content, footer]) {
        const tokens = classTokens(part);
        expect(tokens).toEqual(
          expect.arrayContaining(["px-4", "pt-4", "pb-5", "md:p-6"]),
        );
        expect(
          tokens.filter(
            (token) => token.startsWith("bg-") || token.startsWith("border"),
          ),
        ).toEqual([]);
      }
    });

    it("composes with Collapsible: the header button sits in the band and toggles aria-expanded while the band's classes stay the same", () => {
      const { container } = render(
        <Collapsible>
          <Card variant="section">
            <CardAside>
              <CollapsibleHeader>AXIS TITLE</CollapsibleHeader>
            </CardAside>
            <CollapsibleBody>
              <CardContent>BODY TEXT</CardContent>
            </CollapsibleBody>
          </Card>
        </Collapsible>,
      );
      const aside = cardRoot(container).children[0] as HTMLElement;
      const button = screen.getByRole("button", { name: "AXIS TITLE" });
      expect(aside.contains(button)).toBe(true);
      expect(button.getAttribute("aria-expanded")).toBe("false");
      const collapsedClasses = aside.className;
      fireEvent.click(button);
      expect(button.getAttribute("aria-expanded")).toBe("true");
      expect(aside.className).toBe(collapsedClasses);
    });

    it("renders exactly the consumer's text, with no role or aria attribute on the root", () => {
      const { container } = render(
        <Card variant="section">
          <CardAside>
            <h2>SECTION TITLE</h2>
          </CardAside>
          <CardContent>BODY TEXT</CardContent>
          <CardFooter>FOOTER TEXT</CardFooter>
        </Card>,
      );
      const root = cardRoot(container);
      expect(root.textContent).toBe("SECTION TITLEBODY TEXTFOOTER TEXT");
      expect(root.hasAttribute("role")).toBe(false);
      expect(
        Array.from(root.attributes).filter((attr) =>
          attr.name.startsWith("aria-"),
        ),
      ).toEqual([]);
    });
  });
});
