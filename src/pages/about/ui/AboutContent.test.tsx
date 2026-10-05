import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AboutContent } from "@/pages/about";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see sections left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * AboutContent tests (design.md D10; the landing spec "About us page" —
 * "Sections and order", "How we evaluate", "Registration links", "Closing
 * action"). Written before the implementation (task 7.2): the import fails to
 * resolve until `src/pages/about/index.ts` (the about screen's public API),
 * `AboutContent.tsx` and `ExploreButton.tsx` exist, so the file runs and fails
 * as required.
 *
 * Assertions are text- and attribute-based: jsdom has no CSS engine, so the
 * alternating backgrounds and the evaluation cards are verified by the exact
 * class tokens the design settles (`bg-surface-page`, `bg-surface-section`,
 * and the shared card root class `bg-surface-card` of design.md D6) and every
 * text is verified as the `texts` props the fixtures supply — the sentinels
 * below would not render if the component carried literal text of its own
 * (design.md D11). The five sections render in the design summary §5 order,
 * found here as `section` elements and pinned by one marker text per section.
 */

// The closing action navigates through the app router (design.md D10), which
// is mocked so the pushed target shows (test infrastructure only, exactly as
// `src/pages/home/ui/ExploreButton.test.tsx` does).
const router = { push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

beforeEach(() => {
  router.push.mockReset();
  router.refresh.mockReset();
});

// Any locale but the fixture's own sentinels' language: the hrefs and the
// pushed route must be built from the `locale` prop, not hardcoded.
const LOCALE = "ca";

// ─── Texts props (design.md D11: every text arrives as a prop) ──────────────
// One sentinel per text run of the five sections of the design summary §5:
// the hero's eyebrow and three-part heading, the story, the three evaluation
// steps, the audience line and the two registration labels, and the closing
// action's label. They pin `AboutContentTexts` and its `landing` catalog keys
// in `messages/*/landing.json` (design.md D11: flat keys, one identical set in
// `es`, `en` and `ca`).
const TEXTS = {
  eyebrow: "texts.eyebrow",
  headingBefore: "texts.headingBefore",
  headingAccent: "texts.headingAccent",
  headingAfter: "texts.headingAfter",
  storyText: "texts.storyText",
  stepProvisional: "texts.stepProvisional",
  stepCupping: "texts.stepCupping",
  stepConsensus: "texts.stepConsensus",
  audienceText: "texts.audienceText",
  coffeeshopRegisterLabel: "texts.coffeeshopRegisterLabel",
  specialistRegisterLabel: "texts.specialistRegisterLabel",
  closingLabel: "texts.closingLabel",
};

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

/** Every element below `root` that carries the given class token. */
function elementsWith(root: HTMLElement, token: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("*")).filter((el) =>
    classTokens(el).includes(token),
  );
}

describe("AboutContent", () => {
  describe("Sections and order (spec: 'Sections and order'; design.md D10)", () => {
    it("renders the five sections of the design summary §5 in order", () => {
      const { container } = render(
        <AboutContent locale={LOCALE} texts={TEXTS} />,
      );
      const sections = Array.from(container.querySelectorAll("section"));
      expect(sections).toHaveLength(5);

      // 1. Brief hero: the eyebrow and the three-part heading.
      expect(sections[0].textContent).toContain(TEXTS.eyebrow);
      expect(sections[0].textContent).toContain(TEXTS.headingBefore);
      expect(sections[0].textContent).toContain(TEXTS.headingAccent);
      expect(sections[0].textContent).toContain(TEXTS.headingAfter);
      // 2. Story.
      expect(sections[1].textContent).toContain(TEXTS.storyText);
      // 3. How we evaluate: the three steps.
      expect(sections[2].textContent).toContain(TEXTS.stepProvisional);
      expect(sections[2].textContent).toContain(TEXTS.stepCupping);
      expect(sections[2].textContent).toContain(TEXTS.stepConsensus);
      // 4. Who it is for: the audience line and the two registration links.
      expect(sections[3].textContent).toContain(TEXTS.audienceText);
      expect(sections[3].textContent).toContain(TEXTS.coffeeshopRegisterLabel);
      expect(sections[3].textContent).toContain(TEXTS.specialistRegisterLabel);
      // 5. Closing: the closing action's label from props.
      expect(sections[4].textContent).toContain(TEXTS.closingLabel);
    });

    it("alternates the section backgrounds starting at bg-surface-page", () => {
      const { container } = render(
        <AboutContent locale={LOCALE} texts={TEXTS} />,
      );
      const sections = Array.from(container.querySelectorAll("section"));
      const expected = [
        "bg-surface-page",
        "bg-surface-section",
        "bg-surface-page",
        "bg-surface-section",
        "bg-surface-page",
      ];
      const rejected = [
        "bg-surface-section",
        "bg-surface-page",
        "bg-surface-section",
        "bg-surface-page",
        "bg-surface-section",
      ];
      expect(sections).toHaveLength(expected.length);
      sections.forEach((section, index) => {
        const tokens = classTokens(section);
        expect(tokens, `section ${index}`).toContain(expected[index]);
        expect(tokens, `section ${index}`).not.toContain(rejected[index]);
      });
    });
  });

  describe("How we evaluate (spec: 'How we evaluate'; design.md D10)", () => {
    it("presents the provisional registration, the SCA cupping and the consensus verification as three cards in that order", () => {
      const { container } = render(
        <AboutContent locale={LOCALE} texts={TEXTS} />,
      );
      // The shared Card's settled root class (design.md D6) marks each card.
      const cards = elementsWith(container, "bg-surface-card");
      expect(cards).toHaveLength(3);

      // Each card carries its own step and no other: the provisional
      // registration, the SCA cupping by specialists, the consensus
      // verification (spec "How we evaluate").
      const steps = [TEXTS.stepProvisional, TEXTS.stepCupping, TEXTS.stepConsensus];
      cards.forEach((card, index) => {
        const rendered = card.textContent ?? "";
        expect(rendered, `card ${index}`).toContain(steps[index]);
        for (const other of steps.filter((_, otherIndex) => otherIndex !== index)) {
          expect(rendered.includes(other), `card ${index}`).toBe(false);
        }
      });
    });
  });

  describe("Registration links (spec: 'Registration links')", () => {
    it("addresses the two registration links at /{locale}/register/coffeeshop and /{locale}/register", () => {
      render(<AboutContent locale={LOCALE} texts={TEXTS} />);
      const coffeeshop = screen.getByRole("link", {
        name: TEXTS.coffeeshopRegisterLabel,
      });
      expect(coffeeshop.getAttribute("href")).toBe(
        `/${LOCALE}/register/coffeeshop`,
      );
      const specialist = screen.getByRole("link", {
        name: TEXTS.specialistRegisterLabel,
      });
      expect(specialist.getAttribute("href")).toBe(`/${LOCALE}/register`);
    });
  });

  describe("Closing action (spec: 'Closing action'; design.md D10)", () => {
    it("pushes /{locale} through useRouter when the closing action is activated, with its label from props", () => {
      render(<AboutContent locale={LOCALE} texts={TEXTS} />);
      fireEvent.click(screen.getByRole("button", { name: TEXTS.closingLabel }));
      expect(router.push).toHaveBeenCalledTimes(1);
      expect(router.push).toHaveBeenCalledWith(`/${LOCALE}`);
    });
  });

  describe("Page layout (spec: 'Centered content', 'Side and section spacing', 'How we evaluate', 'Link groups'; design.md D14)", () => {
    it("pads every section and centers its content in the container", () => {
      const { container } = render(
        <AboutContent locale={LOCALE} texts={TEXTS} />,
      );
      const sections = Array.from(container.querySelectorAll("section"));
      expect(sections).toHaveLength(5);
      for (const section of sections) {
        expect(classTokens(section)).toEqual(
          expect.arrayContaining(["py-12", "md:py-16"]),
        );
        expect(section.childElementCount).toBe(1);
        expect(classTokens(section.firstElementChild!)).toEqual(
          expect.arrayContaining([
            "mx-auto",
            "w-full",
            "max-w-6xl",
            "px-4",
            "md:px-8",
          ]),
        );
      }
    });

    it("shares the container width equally between the three evaluation cards from md", () => {
      const { container } = render(
        <AboutContent locale={LOCALE} texts={TEXTS} />,
      );
      const card = Array.from(container.querySelectorAll("p")).find(
        (p) => p.textContent === TEXTS.stepProvisional,
      )!.closest(".bg-surface-card")!;
      expect(classTokens(card.parentElement!)).toEqual(
        expect.arrayContaining(["grid", "gap-6", "md:grid-cols-3"]),
      );
      expect(card.parentElement!.childElementCount).toBe(3);
    });

    it("keeps the two registration links apart in a wrapping row", () => {
      render(<AboutContent locale={LOCALE} texts={TEXTS} />);
      const group = screen.getByRole("link", {
        name: TEXTS.coffeeshopRegisterLabel,
      }).parentElement!;
      expect(classTokens(group)).toEqual(
        expect.arrayContaining(["flex", "flex-wrap", "gap-x-6", "gap-y-2"]),
      );
    });
  });
});
