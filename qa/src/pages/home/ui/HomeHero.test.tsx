import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { render, cleanup, screen } from "@testing-library/react";
import { HomeHero } from "@/pages/home/ui/HomeHero";

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
  coffeeshopRegisterLabel: "texts.coffeeshopRegisterLabel",
  specialistRegisterLabel: "texts.specialistRegisterLabel",
  photoAlt: "texts.photoAlt",
};

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

describe("HomeHero", () => {
  describe("Intrinsic photograph size (design.md D12)", () => {
    it("renders the photograph at the intrinsic width and height of the image file", () => {
      // The PNG header stores the intrinsic size: the IHDR chunk holds the
      // width and the height as big-endian uint32 at byte 16 and byte 20.
      const png = readFileSync(
        pathResolve(process.cwd(), "public/images/coffee-beans.png"),
      );
      render(<HomeHero locale="es" texts={TEXTS} />);
      const photograph = screen.getByRole("img", { name: TEXTS.photoAlt });
      expect(photograph.getAttribute("width")).toBe(
        String(png.readUInt32BE(16)),
      );
      expect(photograph.getAttribute("height")).toBe(
        String(png.readUInt32BE(20)),
      );
    });
  });

  describe("Hero layout (spec: 'Responsive hero', 'Link groups'; design.md D14)", () => {
    it("spaces the eyebrow, heading and paragraph 1rem apart and the actions 1.5rem below", () => {
      render(<HomeHero locale="es" texts={TEXTS} />);
      const column = screen.getByRole("heading", { level: 1 }).parentElement!;
      expect(classTokens(column)).toEqual(
        expect.arrayContaining(["flex", "flex-col", "gap-4"]),
      );
      const actions = screen.getByRole("button").parentElement!;
      expect(actions).not.toBe(column);
      expect(classTokens(actions)).toEqual(
        expect.arrayContaining(["mt-2", "flex", "flex-col", "items-start", "gap-4"]),
      );
    });
  });
});
