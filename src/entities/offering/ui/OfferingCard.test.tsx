import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import type { OfferingSummary } from "@/shared/api";
import { OfferingCard } from "@/entities/offering";
import { Link } from "@/shared/ui";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see cards left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * OfferingCard tests (design.md D4's card field mapping and D8; the landing
 * spec "Offering card content" — "Score and rating tier", "No score", "Origin
 * line skips null values", "Footer counts" — and
 * "Taxonomy badge trees on the offering card" — "Nested trees", "Trees side
 * by side"; nest-card-taste-notes design.md D2, D3). The actions slot
 * cases cover replace-offering-card-session's design.md D1 and the spec
 * "Offering card actions" — "Consumer actions after View", "No consumer
 * actions"; since fix-production-aut-findings (design.md D3) the card renders
 * no View of its own: its consumers supply every action. Written before
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
// eleven keys — `evaluateLabel` moved to the list's texts, design.md D3) ─────

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
  showNotesLabel: "texts.show {label}",
  hideNotesLabel: "texts.hide {label}",
};

// ─── Consumer action fixtures (replace-offering-card-session's design.md D1:
// the consumer's actions render after the View link, with no wrapper) ────────

const ACTION_LABEL = "ACTION";
const SECOND_ACTION_LABEL = "ACTION_2";
const ROW_END_LABEL = "ROW_END";
const ACTION = <Link href="/es/action">{ACTION_LABEL}</Link>;
const SECOND_ACTION = <Link href="/es/action-2">{SECOND_ACTION_LABEL}</Link>;
const TWO_ACTIONS = (
  <>
    {ACTION}
    {SECOND_ACTION}
  </>
);

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
  {
    ref: "01JTAXN0DE0000000000000004",
    label: "Frutal",
    color: "#D9345A",
    level: 0,
    children: [],
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

/** False when the element sits inside a hidden (closed) child list. */
function isShown(element: Element): boolean {
  return element.closest("[hidden]") === null;
}

/** The toggle in the row of the note labelled `label`. */
function toggleOf(label: string): HTMLElement {
  return screen.getByText(label).parentElement!.querySelector("button")!;
}

type RenderOptions = {
  offering?: OfferingSummary;
  actions?: ReactNode;
  badgeRowEnd?: ReactNode;
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
      badgeRowEnd={options.badgeRowEnd}
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

    // The badge's text is the word of the tier, not the score (label-rating-badge
    // design.md D1, D2). Each case pins one range's word as exactly that tier's
    // `texts` field on that range's treatment, so the badge showing the score
    // or another tier's word fails.
    it("carries the exceptional word on the exceptional badge at 90 or above", () => {
      const { container } = renderCard({ offering: OFFERING_EXCEPTIONAL });
      const badges = ratingBadges(container);
      expect(badges).toHaveLength(1);
      expect(
        classTokens(badges[0]).includes("bg-evaluation-rating-exceptional"),
      ).toBe(true);
      expect(badges[0].textContent).toBe(TEXTS.ratingExceptionalLabel);
    });

    it("carries the excellent word on the excellent badge from 85 to below 90", () => {
      const { container } = renderCard({ offering: OFFERING_EXCELLENT });
      const badges = ratingBadges(container);
      expect(badges).toHaveLength(1);
      expect(
        classTokens(badges[0]).includes("bg-evaluation-rating-excellent"),
      ).toBe(true);
      expect(badges[0].textContent).toBe(TEXTS.ratingExcellentLabel);
    });

    it("carries the good word on the good badge from 80 to below 85", () => {
      const { container } = renderCard({ offering: OFFERING_GOOD });
      const badges = ratingBadges(container);
      expect(badges).toHaveLength(1);
      expect(
        classTokens(badges[0]).includes("bg-evaluation-rating-good"),
      ).toBe(true);
      expect(badges[0].textContent).toBe(TEXTS.ratingGoodLabel);
    });

    it("carries the commercial word on the commercial badge below 80", () => {
      const { container } = renderCard({ offering: OFFERING_COMMERCIAL });
      const badges = ratingBadges(container);
      expect(badges).toHaveLength(1);
      expect(
        classTokens(badges[0]).includes("bg-evaluation-rating-commercial"),
      ).toBe(true);
      expect(badges[0].textContent).toBe(TEXTS.ratingCommercialLabel);
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

  describe("Content mapping (design.md D4)", () => {
    it("omits a null value and keeps the fixed order (spec: 'Origin line skips null values')", () => {
      const { container } = renderCard({ offering: OFFERING_NULL_REGION });
      const origin = elementsWith(container, "type-meta").find((el) =>
        (el.textContent ?? "").includes("Colombia"),
      );
      expect(origin).toBeDefined();
      expect(origin?.textContent).toBe("Colombia · washed · Caturra");
    });
  });

  describe("Taxonomy badge trees (nest-card-taste-notes design.md D2, D3)", () => {
    it("nests each child list in its parent's item, indented, the level-1 column behind a connector (spec: 'Nested trees')", () => {
      renderCard();
      fireEvent.click(toggleOf("Floral"));
      fireEvent.click(toggleOf("Jazmin"));
      const floral = screen.getByText("Floral").closest("li")!;
      const jazmin = screen.getByText("Jazmin").closest("li")!;
      const bergamota = screen.getByText("Bergamota").closest("li")!;
      const column = jazmin.parentElement!;
      expect(column.parentElement).toBe(floral);
      expect(column.getAttribute("role")).toBe("list");
      expect(classTokens(column)).toEqual(
        expect.arrayContaining(["ml-5", "border-l", "border-border-subtle"]),
      );
      const row = bergamota.parentElement!;
      expect(row.parentElement).toBe(jazmin);
      expect(row.getAttribute("role")).toBe("list");
      expect(classTokens(row)).toEqual(
        expect.arrayContaining(["ml-5", "flex-wrap"]),
      );
    });

    it("renders one tree per top-level note in one wrapping list (spec: 'Trees side by side')", () => {
      renderCard();
      const floral = screen.getByText("Floral").closest("li")!;
      const frutal = screen.getByText("Frutal").closest("li")!;
      const trees = floral.parentElement!;
      expect(frutal.parentElement).toBe(trees);
      expect(trees.children).toHaveLength(2);
      expect(trees.getAttribute("role")).toBe("list");
      expect(classTokens(trees)).toContain("flex-wrap");
    });
  });

  describe("Collapsible taxonomy trees (spec: 'Taxonomy badge trees on the offering card'; collapse-taxonomy-trees design.md D3, D4)", () => {
    it("shows only the top-level notes at first (spec: 'Closed at first')", () => {
      renderCard();
      expect(isShown(screen.getByText("Floral"))).toBe(true);
      expect(isShown(screen.getByText("Frutal"))).toBe(true);
      expect(isShown(screen.getByText("Jazmin"))).toBe(false);
      expect(isShown(screen.getByText("Bergamota"))).toBe(false);
    });

    it("puts a + toggle inside the badge, right after the name, of a note with children and none on a note without (spec: 'Toggle on notes with children')", () => {
      renderCard();
      const toggle = toggleOf("Floral");
      const name = screen.getByText("Floral");
      const badge = name.parentElement!;
      expect(badge.hasAttribute("data-taxonomy")).toBe(true);
      expect(name.nextElementSibling).toBe(toggle);
      expect(toggle.textContent).toBe("+");
      expect(badge.hasAttribute("role")).toBe(false);
      expect(badge.hasAttribute("tabindex")).toBe(false);
      expect(
        screen.getByText("Frutal").closest("li")!.querySelector("button"),
      ).toBeNull();
    });

    it("shows a note's children, each closed, when it opens, and the grandchildren when the child opens (spec: 'Opening a note')", () => {
      renderCard();
      fireEvent.click(toggleOf("Floral"));
      expect(toggleOf("Floral").textContent).toBe("\u2212");
      expect(isShown(screen.getByText("Jazmin"))).toBe(true);
      expect(toggleOf("Jazmin").textContent).toBe("+");
      expect(isShown(screen.getByText("Bergamota"))).toBe(false);
      fireEvent.click(toggleOf("Jazmin"));
      expect(isShown(screen.getByText("Bergamota"))).toBe(true);
    });

    it("closes every descendant when a note closes (spec: 'Closing a note closes its descendants')", () => {
      renderCard();
      fireEvent.click(toggleOf("Floral"));
      fireEvent.click(toggleOf("Jazmin"));
      fireEvent.click(toggleOf("Floral"));
      fireEvent.click(toggleOf("Floral"));
      expect(isShown(screen.getByText("Jazmin"))).toBe(true);
      expect(toggleOf("Jazmin").textContent).toBe("+");
      expect(isShown(screen.getByText("Bergamota"))).toBe(false);
    });

    it("exposes the toggle's state, its child list and its catalog name, the glyph hidden (spec: 'Accessible toggle')", () => {
      renderCard();
      const toggle = toggleOf("Floral");
      expect(toggle.getAttribute("aria-expanded")).toBe("false");
      expect(toggle.getAttribute("aria-label")).toBe("texts.show Floral");
      const list = document.getElementById(toggle.getAttribute("aria-controls")!)!;
      expect(list.tagName).toBe("UL");
      expect(list).toBe(screen.getByText("Jazmin").closest("li")!.parentElement);
      expect(toggle.querySelector('[aria-hidden="true"]')!.textContent).toBe("+");
      fireEvent.click(toggle);
      expect(toggle.getAttribute("aria-expanded")).toBe("true");
      expect(toggle.getAttribute("aria-label")).toBe("texts.hide Floral");
    });

    it("keeps the open state on the page only: no address change, no request, closed again on a new render (spec: 'Open state stays on the page')", () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      const href = window.location.href;
      const { unmount } = renderCard();
      fireEvent.click(toggleOf("Floral"));
      expect(window.location.href).toBe(href);
      expect(fetchSpy).not.toHaveBeenCalled();
      unmount();
      renderCard();
      expect(isShown(screen.getByText("Jazmin"))).toBe(false);
      expect(toggleOf("Floral").textContent).toBe("+");
      fetchSpy.mockRestore();
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

  describe("Actions (spec: 'Offering card actions'; fix-production-aut-findings design.md D3)", () => {
    it("renders the consumer's actions in the order supplied (spec: 'Consumer actions after View')", () => {
      renderCard({ actions: TWO_ACTIONS });
      const first = screen.getByRole("link", { name: ACTION_LABEL });
      const second = screen.getByRole("link", { name: SECOND_ACTION_LABEL });
      const children = Array.from(first.parentElement!.children);
      expect(children).toEqual([first, second]);
    });

    it("renders the consumer's actions in the footer's group of actions (spec: 'Consumer actions after View')", () => {
      renderCard({ actions: ACTION });
      const action = screen.getByRole("link", { name: ACTION_LABEL });
      const group = action.parentElement!;
      expect(classTokens(group)).toEqual(
        expect.arrayContaining(["grid-cols-2", "md:justify-end"]),
      );
    });

    it("renders the consumer's badge-row content last in the badge's row, outside the footer (spec: 'Consumer content in the badge row')", () => {
      renderCard({ actions: ACTION, badgeRowEnd: <span>{ROW_END_LABEL}</span> });
      const end = screen.getByText(ROW_END_LABEL);
      const row = screen.getByText(TEXTS.verifiedLabel).parentElement!;
      expect(row.lastElementChild).toBe(end);
      expect(classTokens(row)).toContain("justify-between");
      const group = screen.getByRole("link", { name: ACTION_LABEL }).parentElement!;
      expect(group.parentElement!.contains(end)).toBe(false);
    });

    it("renders no action of its own when the consumer supplies none (spec: 'No consumer actions')", () => {
      // No taxonomy tree, so no tree toggle (collapse-taxonomy-trees D4) is
      // counted among the card's buttons.
      renderCard({ taxonomies: [] });
      expect(screen.queryAllByRole("link")).toHaveLength(0);
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });
  });

  describe("Card layout (spec: 'Score row above the content', 'Footer counts', 'Stacked at every width'; design.md D14)", () => {
    it("puts the score, the /100 scale and the rating badge on one row", () => {
      const { container } = renderCard();
      const score = elementsWith(container, "type-score")[0];
      const row = score.parentElement!;
      expect(classTokens(row)).toEqual(
        expect.arrayContaining([
          "flex",
          "flex-wrap",
          "items-baseline",
          "gap-2",
        ]),
      );
      expect(row.contains(elementsWith(container, "type-meta")[0])).toBe(true);
      expect(row.contains(ratingBadges(container)[0])).toBe(true);
    });

    it("separates the counts and groups the actions apart at the end of the footer", () => {
      const { container } = renderCard({ actions: TWO_ACTIONS });
      const action = screen.getByRole("link", { name: ACTION_LABEL });
      const links = action.parentElement!;
      const counts = findWith(
        container,
        "type-meta",
        TEXTS.evaluationsLabel,
      )!.parentElement!;
      const footer = links.parentElement!;
      expect(counts.parentElement).toBe(footer);
      expect(links).not.toBe(counts);
      expect(links.querySelectorAll("a")).toHaveLength(2);
      expect(classTokens(footer)).toEqual(
        expect.arrayContaining(["flex", "flex-wrap", "items-center", "gap-4"]),
      );
      expect(classTokens(counts)).toEqual(
        expect.arrayContaining(["flex", "flex-wrap", "gap-4"]),
      );
      expect(classTokens(links)).toEqual(
        expect.arrayContaining(["grid-cols-2", "md:justify-end", "md:ml-auto"]),
      );
    });
  });
});
