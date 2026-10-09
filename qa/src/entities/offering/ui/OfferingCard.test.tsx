import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import type { OfferingSummary } from "@/shared/api";
import { OfferingCard } from "@/entities/offering";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see cards left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * OfferingCard tests (design.md D4's card field mapping and D8; the landing
 * spec "Offering card content" — "Score and rating tier", "No score", "Origin
 * line skips null values", "Footer counts"). The tree layout of the taxonomy
 * badges (nest-card-taste-notes design.md D2) is covered by the validation
 * suite; since fix-production-aut-findings (design.md D3) the card renders no
 * View of its own. Written before
 * the implementation (task 4.2): the import goes through the slice's public
 * API, which fails to resolve until `src/entities/offering/` exists
 * (`lib/rating.ts`, `ui/OfferingCard.tsx` and the entity entry `index.ts`), so
 * the file runs and fails as required.
 *
 * Assertions are className- and text-based: jsdom has no CSS engine, so the
 * settled treatments are verified by the exact class tokens the build renders
 * (`type-score`, `type-meta`, `type-card-heading`, `type-label`, `flex-wrap`)
 * and the card's own texts are verified as the `texts` props the fixtures
 * supply — the sentinels below would not render if the component carried
 * literal text of its own (design.md D11; `react/jsx-no-literals` guards the
 * literals themselves at `npm run lint`).
 */

// ─── Texts props (design.md D11: every label and caption arrives as a prop;
// ten keys — `evaluateLabel` moved to the list's texts, design.md D3, and
// `viewLabel` left with the card's own View, fix-production-aut-findings
// design.md D3) ─────────────────────────────────────────────────────────────

const TEXTS = {
  coffeeshopCaption: "texts.coffeeshopCaption",
  roasterCaption: "texts.roasterCaption",
  evaluationsLabel: "texts.evaluationsLabel",
  defectiveLabel: "texts.defectiveLabel",
  verifiedLabel: "texts.verifiedLabel",
  provisionalLabel: "texts.provisionalLabel",
  ratingExceptionalLabel: "texts.ratingExceptionalLabel",
  ratingExcellentLabel: "texts.ratingExcellentLabel",
  ratingGoodLabel: "texts.ratingGoodLabel",
  ratingCommercialLabel: "texts.ratingCommercialLabel",
};

// ─── Resolved taxonomy badge tree (nest-card-taste-notes design.md D1: the
// labels, colors and levels arrive resolved, nested as the concordance) ─────

type ResolvedTaxonomyBadge = {
  ref: string;
  label: string;
  color: string;
  level: 0 | 1 | 2;
  children: ResolvedTaxonomyBadge[];
};

const TAXONOMIES: ResolvedTaxonomyBadge[] = [
  {
    ref: "01JTAXN0DE0000000000000001",
    label: "Floral",
    color: "#336699",
    level: 0,
    children: [
      {
        ref: "01JTAXN0DE0000000000000002",
        label: "Jazmin",
        color: "#000000",
        level: 1,
        children: [
          {
            ref: "01JTAXN0DE0000000000000003",
            label: "Bergamota",
            color: "#FFFFFF",
            level: 2,
            children: [],
          },
        ],
      },
    ],
  },
];

// ─── Offering fixture (design.md D4's mapping table) ────────────────────────

const ULID = "01K6A3M8Q2V7XH4T9B5N1RCW0D";

const OFFERING: OfferingSummary = {
  ulid: ULID,
  cuppingAvg: "84.25",
  verificationStatus: "verified",
  evaluationCount: 12,
  defectiveEvaluationCount: 3,
  location: { name: "Gracia" },
  coffeeInventory: {
    coffee: {
      name: "Geisha",
      country: "Colombia",
      region: "Huila",
      process: "washed",
      variety: "Caturra",
    },
    roastery: { name: "Nomada" },
  },
  sensoryTaxonomy: [],
};

// ─── One offering fixture per score range (spec: 'Score and rating tier';
// label-rating-badge design.md D1: one word per tier) ────────────────────────

const OFFERING_EXCEPTIONAL: OfferingSummary = { ...OFFERING, cuppingAvg: "95" };
const OFFERING_EXCELLENT: OfferingSummary = { ...OFFERING, cuppingAvg: "87" };
const OFFERING_GOOD: OfferingSummary = { ...OFFERING, cuppingAvg: "82" };
const OFFERING_COMMERCIAL: OfferingSummary = { ...OFFERING, cuppingAvg: "75" };

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

/** The element carrying `token` whose text also carries `text`. */
function findWith(
  root: HTMLElement,
  token: string,
  text: string,
): HTMLElement | undefined {
  return elementsWith(root, token).find((el) =>
    (el.textContent ?? "").includes(text),
  );
}

type RenderOptions = {
  offering?: OfferingSummary;
  actions?: ReactNode;
  taxonomies?: ResolvedTaxonomyBadge[];
};

/** One offering card over the shared card, filled per design.md D4. */
function renderCard(options: RenderOptions = {}) {
  return render(
    <OfferingCard
      offering={options.offering ?? OFFERING}
      taxonomies={options.taxonomies ?? TAXONOMIES}
      texts={TEXTS}
      actions={options.actions}
    />,
  );
}

describe("OfferingCard", () => {
  describe("Status badge (design.md D4)", () => {
    it("shows the verified status badge for verificationStatus 'verified'", () => {
      const { container } = renderCard();
      const verified = findWith(
        container,
        "bg-badge-verified-bg",
        TEXTS.verifiedLabel,
      );
      expect(verified).toBeDefined();
      expect(elementsWith(container, "bg-badge-provisional-bg")).toHaveLength(
        0,
      );
    });

    it("shows the provisional status badge for verificationStatus 'provisional'", () => {
      const { container } = renderCard({
        offering: { ...OFFERING, verificationStatus: "provisional" },
      });
      const provisional = findWith(
        container,
        "bg-badge-provisional-bg",
        TEXTS.provisionalLabel,
      );
      expect(provisional).toBeDefined();
      expect(elementsWith(container, "bg-badge-verified-bg")).toHaveLength(0);
    });
  });

  describe("Content mapping (design.md D4)", () => {
    it("shows the coffee name in type-card-heading", () => {
      const { container } = renderCard();
      expect(findWith(container, "type-card-heading", "Geisha")).toBeDefined();
    });

    it("shows the coffeeshop and roaster captions in type-label carrying the names", () => {
      const { container } = renderCard();
      const coffeeshop = findWith(
        container,
        "type-label",
        TEXTS.coffeeshopCaption,
      );
      expect(coffeeshop).toBeDefined();
      expect((coffeeshop?.textContent ?? "").includes("Gracia")).toBe(true);

      const roaster = findWith(container, "type-label", TEXTS.roasterCaption);
      expect(roaster).toBeDefined();
      expect((roaster?.textContent ?? "").includes("Nomada")).toBe(true);
    });

    it("joins country, region, process and variety in that fixed order in type-meta (spec: 'Origin line skips null values')", () => {
      const { container } = renderCard();
      const origin = elementsWith(container, "type-meta").find(
        (el) =>
          (el.textContent ?? "").includes("Colombia") &&
          !(el.textContent ?? "").includes("/100"),
      );
      expect(origin).toBeDefined();
      expect(origin?.textContent).toBe("Colombia · Huila · washed · Caturra");
    });
  });

  describe("Texts (design.md D11)", () => {
    it("renders every label and caption from the texts props", () => {
      // The per-tier rule (label-rating-badge design.md D1): one card per
      // score range (90 or above, 85 to below 90, 80 to below 85, below 80)
      // plus the provisional card. Their union must cover all ten texts —
      // the six labels and captions plus the four tier words — so the case
      // fails whenever any of the ten is never rendered.
      const { container: exceptionalCard } = renderCard({
        offering: OFFERING_EXCEPTIONAL,
      });
      const { container: excellentCard } = renderCard({
        offering: OFFERING_EXCELLENT,
      });
      const { container: goodCard } = renderCard({ offering: OFFERING_GOOD });
      const { container: commercialCard } = renderCard({
        offering: OFFERING_COMMERCIAL,
      });
      const { container: provisionalCard } = renderCard({
        offering: { ...OFFERING_GOOD, verificationStatus: "provisional" },
      });
      const rendered = [
        exceptionalCard,
        excellentCard,
        goodCard,
        commercialCard,
        provisionalCard,
      ]
        .map((card) => card.textContent ?? "")
        .join("\n");
      for (const text of Object.values(TEXTS)) {
        expect(rendered.includes(text), text).toBe(true);
      }
    });
  });

  describe("Card layout (spec: 'Score row above the content', 'Footer counts', 'Stacked at every width'; design.md D14)", () => {
    it("renders the shared card in its stacked layout", () => {
      const { container } = renderCard();
      expect(classTokens(container.firstElementChild!)).toEqual(
        expect.arrayContaining(["flex", "flex-col", "h-full"]),
      );
    });
  });
});
