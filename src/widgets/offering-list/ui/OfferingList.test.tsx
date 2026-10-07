import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { OfferingsPageMeta, OfferingSummary, Session } from "@/shared/api";
import type { ResolvedTaxonomyBadge } from "@/entities/offering";
import { OfferingList } from "./OfferingList";
import { CATALOG_GRID_CLASSES, OFFERING_GRID_CLASSES } from "../lib/grid";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see cards left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * Offering list tests (design.md D9; the landing spec "Verified offerings
 * list" — "Success", "Empty", "Error and retry", "Retry reloads" — and
 * "Offering card content" — "Evaluate link for specialists", "No Evaluate
 * link for other viewers"). Written before the implementation (task 5.2): the
 * import fails to resolve until `src/widgets/offering-list/ui/OfferingList.tsx`
 * exists, so the file runs and fails as required.
 *
 * The presentation takes the fetch result of design.md D9 as one `result` prop
 * — `success` with the items and the pagination `meta`, `empty`, or `error` —
 * and every text as `texts` props (design.md D11), passing the session down to
 * each card. Both failures of D4 (the offerings fetch and the taxonomy fetch)
 * map into the single `error` result, so one error presentation covers them
 * alike. The retry action is a client component whose activation calls
 * `router.refresh()` (spec: "Retry reloads"); the app router hook is mocked
 * here — test infrastructure only.
 */

const router = { push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

beforeEach(() => {
  router.push.mockReset();
  router.refresh.mockReset();
});

const TEXTS = {
  coffeeshopCaption: "texts.coffeeshopCaption",
  roasterCaption: "texts.roasterCaption",
  evaluationsLabel: "texts.evaluationsLabel",
  defectiveLabel: "texts.defectiveLabel",
  viewLabel: "texts.viewLabel",
  evaluateLabel: "texts.evaluateLabel",
  verifiedLabel: "texts.verifiedLabel",
  provisionalLabel: "texts.provisionalLabel",
  ratingExceptionalLabel: "texts.ratingExceptionalLabel",
  ratingExcellentLabel: "texts.ratingExcellentLabel",
  ratingGoodLabel: "texts.ratingGoodLabel",
  ratingCommercialLabel: "texts.ratingCommercialLabel",
  emptyMessage: "texts.emptyMessage",
  errorMessage: "texts.errorMessage",
  retryLabel: "texts.retryLabel",
  previousLabel: "texts.previousLabel",
  nextLabel: "texts.nextLabel",
};

// ─── Session fixtures (design.md D8: the session arrives as a prop and gates
// the Evaluate link on the role `specialist`) ────────────────────────────────

const SPECIALIST: Session = {
  state: "authenticated",
  user: { role: "specialist" },
};
const OTHER_ROLE: Session = {
  state: "authenticated",
  user: { role: "coffeeshop" },
};
const ANONYMOUS: Session = { state: "anonymous" };

// ─── Result fixtures (design.md D9's result mapping) ────────────────────────

type ListItem = { offering: OfferingSummary; taxonomies: ResolvedTaxonomyBadge[] };
type ListResult =
  | { state: "success"; items: ListItem[]; meta: OfferingsPageMeta }
  | { state: "empty" }
  | { state: "error" };

const ULID_ONE = "01K6A3M8Q2V7XH4T9B5N1RCW0D";
const ULID_TWO = "01K6A3M8Q2V7XH4T9B5N1RCW0E";

const ITEM_ONE: ListItem = {
  offering: {
    ulid: ULID_ONE,
    coffeeInventory: { coffee: { name: "Geisha" } },
  },
  taxonomies: [],
};
const ITEM_TWO: ListItem = {
  offering: {
    ulid: ULID_TWO,
    coffeeInventory: { coffee: { name: "Bourbon" } },
  },
  taxonomies: [],
};

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

function renderList(result: ListResult, session: Session = SPECIALIST) {
  return render(
    <OfferingList result={result} locale="es" session={session} texts={TEXTS} />,
  );
}

describe("OfferingList", () => {
  describe("Success (spec: 'Success'; design.md D9)", () => {
    it("renders one card per item and the pagination reflecting meta.current_page and meta.last_page", () => {
      const first = renderList({
        state: "success",
        items: [ITEM_ONE, ITEM_TWO],
        meta: { current_page: 1, last_page: 2 },
      });
      const views = screen.getAllByRole("link", { name: TEXTS.viewLabel });
      expect(views).toHaveLength(2);
      const hrefs = views.map((view) => view.getAttribute("href"));
      expect(hrefs).toContain(`/es/offerings/${ULID_ONE}`);
      expect(hrefs).toContain(`/es/offerings/${ULID_TWO}`);
      expect(first.container.textContent ?? "").toContain("Geisha");
      expect(first.container.textContent ?? "").toContain("Bourbon");
      // meta.current_page = 1 makes Previous unavailable; meta.last_page = 2
      // keeps Next available (specs "Paging at the boundaries").
      expect(
        screen
          .getByRole("button", { name: TEXTS.previousLabel })
          .hasAttribute("disabled"),
      ).toBe(true);
      expect(
        screen
          .getByRole("button", { name: TEXTS.nextLabel })
          .hasAttribute("disabled"),
      ).toBe(false);
      first.unmount();

      // meta.current_page = meta.last_page makes Next unavailable.
      renderList({
        state: "success",
        items: [ITEM_ONE],
        meta: { current_page: 2, last_page: 2 },
      });
      expect(
        screen
          .getByRole("button", { name: TEXTS.nextLabel })
          .hasAttribute("disabled"),
      ).toBe(true);
    });

    it("pushes the landing address /{locale}?page={n} on Next (design.md D8)", () => {
      renderList({
        state: "success",
        items: [ITEM_ONE],
        meta: { current_page: 1, last_page: 2 },
      });
      fireEvent.click(screen.getByRole("button", { name: TEXTS.nextLabel }));
      expect(router.push).toHaveBeenCalledWith("/es?page=2");
    });
  });

  describe("Session (specs: 'Evaluate link for specialists', 'No Evaluate link for other viewers'; design.md D8)", () => {
    it("passes the session to every card and shows Evaluate on each of them for a specialist", () => {
      renderList({
        state: "success",
        items: [ITEM_ONE, ITEM_TWO],
        meta: { current_page: 1, last_page: 1 },
      });
      const evaluates = screen.getAllByRole("link", {
        name: TEXTS.evaluateLabel,
      });
      expect(evaluates).toHaveLength(2);
      const hrefs = evaluates.map((link) => link.getAttribute("href"));
      expect(hrefs).toContain(`/es/manage/evaluations/new?offering=${ULID_ONE}`);
      expect(hrefs).toContain(`/es/manage/evaluations/new?offering=${ULID_TWO}`);
    });

    it("shows no Evaluate link for an anonymous viewer or another role", () => {
      const anonymous = renderList(
        { state: "success", items: [ITEM_ONE], meta: { current_page: 1, last_page: 1 } },
        ANONYMOUS,
      );
      expect(
        screen.queryByRole("link", { name: TEXTS.evaluateLabel }),
      ).toBeNull();
      anonymous.unmount();

      renderList(
        { state: "success", items: [ITEM_ONE], meta: { current_page: 1, last_page: 1 } },
        OTHER_ROLE,
      );
      expect(
        screen.queryByRole("link", { name: TEXTS.evaluateLabel }),
      ).toBeNull();
    });
  });

  describe("Consumer actions after View (spec: 'Consumer actions after View')", () => {
    it("renders each card's Evaluate link after its View link and in the same group", () => {
      renderList({
        state: "success",
        items: [ITEM_ONE, ITEM_TWO],
        meta: { current_page: 1, last_page: 1 },
      });
      const views = screen.getAllByRole("link", { name: TEXTS.viewLabel });
      expect(views).toHaveLength(2);
      for (const view of views) {
        const ulid = (view.getAttribute("href") ?? "").split("/").pop() ?? "";
        const evaluate = screen
          .getAllByRole("link", { name: TEXTS.evaluateLabel })
          .find(
            (link) =>
              link.getAttribute("href") ===
              `/es/manage/evaluations/new?offering=${ulid}`,
          );
        expect(evaluate).toBeDefined();
        expect(evaluate!.parentElement).toBe(view.parentElement);
        const children = Array.from(view.parentElement!.children);
        expect(children.indexOf(evaluate!)).toBeGreaterThan(
          children.indexOf(view),
        );
      }
    });
  });

  describe("Empty (spec: 'Empty')", () => {
    it("renders the centered empty message and no offering card", () => {
      renderList({ state: "empty" });
      const message = screen.getByText(TEXTS.emptyMessage);
      expect(classTokens(message).includes("text-center")).toBe(true);
      expect(screen.queryAllByRole("link", { name: TEXTS.viewLabel })).toHaveLength(0);
    });

    it("renders the empty message in the primary text colour", () => {
      renderList({ state: "empty" });
      expect(classTokens(screen.getByText(TEXTS.emptyMessage))).toContain(
        "text-text-primary",
      );
    });
  });

  describe("Error and retry (spec: 'Error and retry', 'Retry reloads'; design.md D4)", () => {
    it("renders the error message with the retry action and no offering card", () => {
      // design.md D4 maps an offerings failure and a taxonomy failure alike
      // into this one error result, so this presentation covers both.
      renderList({ state: "error" });
      expect(screen.getByText(TEXTS.errorMessage)).toBeDefined();
      expect(screen.getByRole("button", { name: TEXTS.retryLabel })).toBeDefined();
      expect(screen.queryAllByRole("link", { name: TEXTS.viewLabel })).toHaveLength(0);
    });

    it("renders the error message in the primary text colour", () => {
      renderList({ state: "error" });
      const message = screen.getByText(TEXTS.errorMessage);
      expect(classTokens(message.parentElement!)).toContain("text-text-primary");
    });

    it("calls router.refresh() when the retry action is activated (spec: Retry reloads)", () => {
      renderList({ state: "error" });
      fireEvent.click(screen.getByRole("button", { name: TEXTS.retryLabel }));
      expect(router.refresh).toHaveBeenCalledTimes(1);
    });
  });

  describe("Block root (design.md D9)", () => {
    it('carries id="offerings" on the block root in every branch', () => {
      const results: ListResult[] = [
        { state: "success", items: [ITEM_ONE], meta: { current_page: 1, last_page: 1 } },
        { state: "empty" },
        { state: "error" },
      ];
      for (const result of results) {
        const { container, unmount } = renderList(result);
        expect(container.firstElementChild?.id).toBe("offerings");
        unmount();
      }
    });
  });

  describe("Grid by viewport (spec: 'Grid by viewport'; design.md D14)", () => {
    it("lays the cards out in one column, two from md and three from xl, with a gap", () => {
      const { container } = renderList({
        state: "success",
        items: [ITEM_ONE, ITEM_TWO],
        meta: { current_page: 1, last_page: 1 },
      });
      const cards = Array.from(container.querySelectorAll(".bg-surface-card"));
      expect(cards).toHaveLength(2);
      const grid = cards[0].parentElement!;
      expect(cards[1].parentElement).toBe(grid);
      expect(grid.childElementCount).toBe(2);
      expect(classTokens(grid)).toEqual(
        expect.arrayContaining([
          "grid",
          "grid-cols-1",
          "gap-6",
          "md:grid-cols-2",
          "xl:grid-cols-3",
        ]),
      );
    });
  });
  describe("Catalog props (add-offering-catalog design.md D10; spec 'Next and Previous keep the query')", () => {
    const SUCCESS: ListResult = {
      state: "success",
      items: [ITEM_ONE, ITEM_TWO],
      meta: { current_page: 1, last_page: 2 },
    };

    function gridOf(container: HTMLElement): Element {
      return container.querySelector(".bg-surface-card")!.parentElement!;
    }

    it("carries @container on the block root in every branch", () => {
      const results: ListResult[] = [
        SUCCESS,
        { state: "empty" },
        { state: "error" },
      ];
      for (const result of results) {
        const { container, unmount } = renderList(result);
        expect(classTokens(container.firstElementChild!)).toContain(
          "@container",
        );
        unmount();
      }
    });

    it("keeps landing's grid classes by default", () => {
      const { container } = renderList(SUCCESS);
      expect(gridOf(container).getAttribute("class")).toBe(
        OFFERING_GRID_CLASSES,
      );
    });

    it("replaces the grid classes with gridClassName when passed", () => {
      const { container } = render(
        <OfferingList
          result={SUCCESS}
          locale="es"
          session={ANONYMOUS}
          texts={TEXTS}
          gridClassName={CATALOG_GRID_CLASSES}
        />,
      );
      expect(gridOf(container).getAttribute("class")).toBe(
        CATALOG_GRID_CLASSES,
      );
    });

    it("pages at path keeping the query: Next pushes /es/offerings?verified=1&page=2", () => {
      render(
        <OfferingList
          result={SUCCESS}
          locale="es"
          session={ANONYMOUS}
          texts={TEXTS}
          path="/es/offerings"
          query={{ verified: "1" }}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: TEXTS.nextLabel }));
      expect(router.push).toHaveBeenCalledWith(
        "/es/offerings?verified=1&page=2",
      );
    });
  });
});
