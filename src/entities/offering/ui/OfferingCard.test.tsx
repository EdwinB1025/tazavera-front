import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import type { OfferingSummary, Session, SessionUser } from "@/shared/api";
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
 * line skips null values", "Footer counts", "View link for everyone",
 * "Evaluate link for specialists", "No Evaluate link for other viewers" — and
 * "Taxonomy badges on the offering card" — "Rows by level"). Written before
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

// ─── Texts props (design.md D11: every label and caption arrives as a prop) ─

const TEXTS = {
  coffeeshopCaption: "texts.coffeeshopCaption",
  roasterCaption: "texts.roasterCaption",
  evaluationsLabel: "texts.evaluationsLabel",
  defectiveLabel: "texts.defectiveLabel",
  viewLabel: "texts.viewLabel",
  evaluateLabel: "texts.evaluateLabel",
  verifiedLabel: "texts.verifiedLabel",
  provisionalLabel: "texts.provisionalLabel",
};

// ─── Session fixtures (design.md D8: the session arrives as a prop and gates
// the Evaluate link on the role `specialist`) ────────────────────────────────

const SPECIALIST_USER: SessionUser = { role: "specialist" };
const SPECIALIST: Session = { state: "authenticated", user: SPECIALIST_USER };
const OTHER_ROLE: Session = {
  state: "authenticated",
  user: { role: "coffeeshop" },
};
const ANONYMOUS: Session = { state: "anonymous" };

// ─── Resolved taxonomy badge data (design.md D5 and D8: the labels, colors
// and levels arrive resolved) ───────────────────────────────────────────────

type ResolvedTaxonomyBadge = { label: string; color: string; level: 0 | 1 | 2 };

const TAXONOMIES: ResolvedTaxonomyBadge[] = [
  { label: "Floral", color: "#336699", level: 0 },
  { label: "Jazmin", color: "#000000", level: 1 },
  { label: "Bergamota", color: "#FFFFFF", level: 2 },
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

/**
 * The generated `OfferingSummary` types the origin fields as
 * `string | undefined`, while the spec's scenario "Origin line skips null
 * values" drives a `null` arriving from the API. The fixture carries that
 * runtime shape and is narrowed once here.
 */
const OFFERING_NULL_REGION = {
  ...OFFERING,
  coffeeInventory: {
    coffee: {
      name: "Geisha",
      country: "Colombia",
      region: null,
      process: "washed",
      variety: "Caturra",
    },
    roastery: { name: "Nomada" },
  },
} as unknown as OfferingSummary;

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

/** The four rating treatments of design.md D7. */
const RATING_CLASSES = [
  "bg-evaluation-rating-exceptional",
  "bg-evaluation-rating-excellent",
  "bg-evaluation-rating-good",
  "bg-evaluation-rating-commercial",
];

/** Every rating badge rendered inside `root`. */
function ratingBadges(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("*")).filter((el) =>
    classTokens(el).some((token) => RATING_CLASSES.includes(token)),
  );
}

type RenderOptions = {
  offering?: OfferingSummary;
  session?: Session;
  taxonomies?: ResolvedTaxonomyBadge[];
};

/** One offering card over the shared card, filled per design.md D4. */
function renderCard(options: RenderOptions = {}) {
  return render(
    <OfferingCard
      offering={options.offering ?? OFFERING}
      locale="es"
      session={options.session ?? SPECIALIST}
      taxonomies={options.taxonomies ?? TAXONOMIES}
      texts={TEXTS}
    />,
  );
}

describe("OfferingCard", () => {
  describe("Score and rating tier (spec: 'Score and rating tier'; design.md D4)", () => {
    it("shows the score over /100 in type-score with type-meta", () => {
      const { container } = renderCard();
      expect(findWith(container, "type-score", "84.25")).toBeDefined();
      expect(findWith(container, "type-meta", "/100")).toBeDefined();
    });

    it("shows the rating badge of the score's range (design.md D8)", () => {
      const { container } = renderCard();
      // 84.25 sits from 80 to below 85, so the badge carries the good
      // treatment chosen by ratingTierFor (design.md D8).
      expect(ratingBadges(container)).toHaveLength(1);
      expect(
        classTokens(ratingBadges(container)[0]).includes(
          "bg-evaluation-rating-good",
        ),
      ).toBe(true);
    });
  });

  describe("No score (spec: 'No score')", () => {
    it("shows no score and no rating badge and renders the rest normally", () => {
      const { container } = renderCard({
        offering: { ...OFFERING, cuppingAvg: undefined },
      });
      expect(elementsWith(container, "type-score")).toHaveLength(0);
      expect(ratingBadges(container)).toHaveLength(0);
      // The rest of the card renders normally.
      expect(findWith(container, "type-card-heading", "Geisha")).toBeDefined();
    });
  });

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

    it("omits a null value and keeps the fixed order (spec: 'Origin line skips null values')", () => {
      const { container } = renderCard({ offering: OFFERING_NULL_REGION });
      const origin = elementsWith(container, "type-meta").find((el) =>
        (el.textContent ?? "").includes("Colombia"),
      );
      expect(origin).toBeDefined();
      expect(origin?.textContent).toBe("Colombia · washed · Caturra");
    });
  });

  describe("Taxonomy badge rows (spec: 'Rows by level'; design.md D8)", () => {
    it("renders the resolved badges in three rows by level, each row carrying flex-wrap", () => {
      const { container } = renderCard();
      // The rows are found by their `flex-wrap` token: a row without it does
      // not show up here and the count below fails (design.md D8: each row
      // carries `flex-wrap` so no row overflows the card below `md`).
      const rows = elementsWith(container, "flex-wrap");
      expect(rows).toHaveLength(3);
      expect((rows[0].textContent ?? "").includes("Floral")).toBe(true);
      expect((rows[1].textContent ?? "").includes("Jazmin")).toBe(true);
      expect((rows[2].textContent ?? "").includes("Bergamota")).toBe(true);
    });
  });

  describe("Footer counts (spec: 'Footer counts')", () => {
    it("shows both counts in type-meta with their labels from the texts props", () => {
      const { container } = renderCard();
      const evaluations = findWith(
        container,
        "type-meta",
        TEXTS.evaluationsLabel,
      );
      expect(evaluations).toBeDefined();
      expect((evaluations?.textContent ?? "").includes("12")).toBe(true);

      const defective = findWith(container, "type-meta", TEXTS.defectiveLabel);
      expect(defective).toBeDefined();
      expect((defective?.textContent ?? "").includes("3")).toBe(true);
    });
  });

  describe("Links (specs: 'View link for everyone', 'Evaluate link for specialists', 'No Evaluate link for other viewers')", () => {
    it("addresses the View link at /{locale}/offerings/{ulid} on every card (spec: 'View link for everyone')", () => {
      renderCard({ session: SPECIALIST });
      renderCard({ session: ANONYMOUS });
      renderCard({ session: OTHER_ROLE });
      const views = screen.getAllByRole("link", { name: TEXTS.viewLabel });
      expect(views).toHaveLength(3);
      for (const view of views) {
        expect(view.getAttribute("href")).toBe(`/es/offerings/${ULID}`);
      }
    });

    it("addresses the Evaluate link at /{locale}/manage/evaluations/new?offering={ulid} for a signed-in specialist (spec: 'Evaluate link for specialists')", () => {
      renderCard({ session: SPECIALIST });
      const evaluate = screen.getByRole("link", {
        name: TEXTS.evaluateLabel,
      });
      expect(evaluate.getAttribute("href")).toBe(
        `/es/manage/evaluations/new?offering=${ULID}`,
      );
    });

    it("shows no Evaluate link for an anonymous viewer (spec: 'No Evaluate link for other viewers')", () => {
      renderCard({ session: ANONYMOUS });
      expect(
        screen.queryByRole("link", { name: TEXTS.evaluateLabel }),
      ).toBeNull();
    });

    it("shows no Evaluate link for another role (spec: 'No Evaluate link for other viewers')", () => {
      renderCard({ session: OTHER_ROLE });
      expect(
        screen.queryByRole("link", { name: TEXTS.evaluateLabel }),
      ).toBeNull();
    });
  });

  describe("Texts (design.md D11)", () => {
    it("renders every label and caption from the texts props", () => {
      const { container } = renderCard();
      const rendered = container.textContent ?? "";
      for (const text of Object.values(TEXTS)) {
        expect(rendered.includes(text), text).toBe(true);
      }
    });
  });
});
