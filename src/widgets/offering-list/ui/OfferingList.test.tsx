import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { OfferingsPageMeta, OfferingSummary } from "@/shared/api";
import type { ResolvedTaxonomyBadge } from "@/entities/offering";
import { OfferingList } from "./OfferingList";

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
 * and every text as `texts` props (design.md D11), supplying `EvaluateLink` to
 * each card's actions slot (add-specialist-evaluations design.md D6). Both failures of D4 (the offerings fetch and the taxonomy fetch)
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

// `EvaluateLink` decides on the session itself (its own tests cover the
// roles); here it is replaced at its public API by a link carrying the props
// the widget supplies, so these cases construct no session.
vi.mock("@/features/evaluate-offering", () => ({
  EvaluateLink: ({
    ulid,
    locale,
    texts,
  }: {
    ulid: string;
    locale: string;
    texts: { evaluateLabel: string };
  }) => <a href={`/${locale}/manage/evaluations/new?offering=${ulid}`}>{texts.evaluateLabel}</a>,
}));

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
  navigationLabel: "texts.navigationLabel",
  previousLabel: "texts.previousLabel",
  nextLabel: "texts.nextLabel",
  pageLabel: "texts.pageLabel {page}",
};

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

function renderList(result: ListResult) {
  return render(<OfferingList result={result} locale="es" texts={TEXTS} />);
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

    it("pages at path keeping the query: Next pushes /es/offerings?verified=1&page=2", () => {
      render(
        <OfferingList
          result={SUCCESS}
          locale="es"
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

  describe("Filtered states (add-offering-facets design.md D9)", () => {
    const COUNT_TEXTS = { ...TEXTS, resultCount: "Results: {count}" };

    it("shows the empty action centered below the empty message, 1rem apart", () => {
      render(
        <OfferingList
          result={{ state: "empty" }}
          locale="es"
          texts={TEXTS}
          emptyAction={<button type="button">Clear all</button>}
        />,
      );
      const message = screen.getByText(TEXTS.emptyMessage);
      const action = screen.getByRole("button", { name: "Clear all" });
      expect(message.nextElementSibling).toBe(action);
      expect(classTokens(message)).toEqual(expect.arrayContaining(["text-center", "text-text-primary"]));
      expect(classTokens(message.parentElement!)).toEqual(
        expect.arrayContaining(["flex", "flex-col", "items-center", "gap-4"]),
      );
    });

    it("announces meta.total in a status element on success", () => {
      render(
        <OfferingList
          result={{
            state: "success",
            items: [ITEM_ONE],
            meta: { current_page: 1, last_page: 1, total: 12 },
          }}
          locale="es"
          texts={COUNT_TEXTS}
        />,
      );
      expect(screen.getByRole("status").textContent).toBe("Results: 12");
    });

    it("renders no status and no action without the new props", () => {
      renderList({ state: "empty" });
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.queryByRole("button")).toBeNull();
      cleanup();
      renderList({ state: "success", items: [ITEM_ONE], meta: { current_page: 1, last_page: 1, total: 1 } });
      expect(screen.queryByRole("status")).toBeNull();
    });
  });
});
