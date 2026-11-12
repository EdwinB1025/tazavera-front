import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import { HomeHero } from "./HomeHero";

// The About us button is a `RouteButton`, whose `useRouter()` needs the App
// Router context (add-register-landing D6): mocked, with a `push` spy.
const router = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see heroes left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * HomeHero tests (design.md D10, D11, D12; the landing spec "Entry page hero"
 * — "Hero presentation", "Registration destinations", "Responsive hero" — and
 * "Localized page texts" — "Settled Spanish heading"). Written before the
 * implementation (task 6.2): the import fails to resolve until
 * `src/pages/home/ui/HomeHero.tsx` exists, and the Spanish heading case reads
 * `messages/es/landing.json` through `getMessages`, which task 6.2 creates —
 * so the file runs and fails as required.
 *
 * Assertions are attribute- and text-based: jsdom has no CSS engine, so the
 * emphasized heading run and the photograph's responsive treatment are
 * verified by the exact class tokens the build renders (`text-text-accent`,
 * `hidden`, `md:block`) and every text is verified as the `texts` props the
 * fixtures supply — the sentinels below would not render if the component
 * carried literal text of its own (design.md D11; `react/jsx-no-literals`
 * guards the literals at `npm run lint`).
 */

// ─── Texts props (design.md D11: every text arrives as a prop) ──────────────
// The nine keys pin `HomeHeroTexts`; the `landing` catalog keys of the Spanish
// case below pin the hero's key names in `messages/*/landing.json` (design.md
// D11: flat keys, one identical set in `es`, `en` and `ca`).

const TEXTS = {
  eyebrow: "texts.eyebrow",
  headingBefore: "texts.headingBefore",
  headingAccent: "texts.headingAccent",
  headingAfter: "texts.headingAfter",
  paragraph: "texts.paragraph",
  exploreLabel: "texts.exploreLabel",
  aboutLabel: "texts.aboutLabel",
  photoAlt: "texts.photoAlt",
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

describe("HomeHero", () => {
  describe("Hero presentation (spec: 'Hero presentation'; design.md D10, D11)", () => {
    it("renders every hero text from the texts props", () => {
      const { container } = render(<HomeHero locale="es" texts={TEXTS} />);
      const renderedText = container.textContent ?? "";
      for (const [key, text] of Object.entries(TEXTS)) {
        // The photograph's text is its alt attribute, not rendered text.
        const rendered =
          key === "photoAlt"
            ? (container.querySelector("img")?.getAttribute("alt") ?? "")
            : renderedText;
        expect(rendered.includes(text), text).toBe(true);
      }
    });
  });

  describe("Settled Spanish heading (spec: 'Settled Spanish heading'; design.md D11)", () => {
    it("concatenates the three heading parts of the Spanish landing catalog to exactly 'Tu café, el que merece cada sorbo' with exactly one emphasized run", () => {
      // The Spanish `landing` catalog (task 6.2) read through the area reader
      // of design.md D11 and fed as the hero's texts props.
      const catalog = getMessages("landing", "es");
      const texts = {
        eyebrow: catalog.heroEyebrow,
        headingBefore: catalog.heroHeadingBefore,
        headingAccent: catalog.heroHeadingAccent,
        headingAfter: catalog.heroHeadingAfter,
        paragraph: catalog.heroParagraph,
        exploreLabel: catalog.heroExploreLabel,
        aboutLabel: catalog.heroAboutLabel,
        photoAlt: catalog.heroPhotoAlt,
      };
      expect(
        `${texts.headingBefore}${texts.headingAccent}${texts.headingAfter}`,
      ).toBe("Tu café, el que merece cada sorbo");

      const { container } = render(<HomeHero locale="es" texts={texts} />);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
        "Tu café, el que merece cada sorbo",
      );

      // The heading renders as three parts — "before, the emphasized word,
      // after" (design.md D11): exactly one run is emphasized and it carries
      // the accent part.
      const emphasized = elementsWith(container, "text-text-accent");
      expect(emphasized).toHaveLength(1);
      expect(emphasized[0].textContent).toBe(texts.headingAccent);
    });
  });

  describe("Registration destinations (specs: 'Registration destinations', 'Specialist registration destination'; add-register-landing D6)", () => {
    it("opens /{locale}/about from the About us button outside any navigation landmark, and no link at a registration route", () => {
      const { container } = render(<HomeHero locale="es" texts={TEXTS} />);
      const about = screen.getByRole("button", { name: TEXTS.aboutLabel });
      expect(about.closest("nav")).toBeNull();
      // Positional treatment 3, the navigate treatment (corrections Round 2).
      expect(about.className).toContain("bg-action-3-bg");
      fireEvent.click(about);
      expect(router.push).toHaveBeenCalledWith("/es/about");
      const hrefs = Array.from(container.querySelectorAll("a")).map((link) =>
        link.getAttribute("href"),
      );
      expect(hrefs).not.toContain("/es/register");
      expect(hrefs).not.toContain("/es/register/coffeeshop");
    });
  });

  describe("Responsive hero (spec: 'Responsive hero'; design.md D12)", () => {
    it("renders the photograph through next/image with the alt from props and the classes hiding it below md", () => {
      render(<HomeHero locale="es" texts={TEXTS} />);
      const photograph = screen.getByRole("img", { name: TEXTS.photoAlt });
      // `next/image` marks the image it renders (`data-nimg`), so a plain
      // `img` element in its place fails here (design.md D12).
      expect(photograph.hasAttribute("data-nimg")).toBe(true);
      // The build's choice, asserted here (spec "Responsive hero"): hidden
      // below `md`, shown from `md` up.
      const tokens = classTokens(photograph);
      expect(tokens).toContain("hidden");
      expect(tokens).toContain("md:block");
    });
  });

  describe("Hero layout (spec: 'Responsive hero', 'Link groups'; add-register-landing D6)", () => {
    it("splits into two equal, vertically centered columns from md", () => {
      const { container } = render(<HomeHero locale="es" texts={TEXTS} />);
      expect(classTokens(container.firstElementChild!)).toEqual(
        expect.arrayContaining(["grid", "items-center", "gap-8", "md:grid-cols-2"]),
      );
    });

    it("keeps the hero's actions side by side in one wrapping row, each at its own width", () => {
      render(<HomeHero locale="es" texts={TEXTS} />);
      const group = screen.getByRole("button", { name: TEXTS.aboutLabel })
        .parentElement!;
      expect(group).toBe(
        screen.getByRole("link", { name: TEXTS.exploreLabel }).parentElement,
      );
      expect(classTokens(group)).toEqual(
        expect.arrayContaining(["flex-row", "flex-wrap", "items-center", "gap-4"]),
      );
    });
  });
});
