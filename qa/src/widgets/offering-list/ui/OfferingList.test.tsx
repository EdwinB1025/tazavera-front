import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { OfferingsPageMeta, OfferingSummary, Session } from "@/shared/api";
import type { ResolvedTaxonomyBadge } from "@/entities/offering";
import { OfferingList } from "@/widgets/offering-list/ui/OfferingList";
import { CATALOG_GRID_CLASSES, OFFERING_GRID_CLASSES } from "@/widgets/offering-list/lib/grid";

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

// The View action shows to a signed-in user only (fix-production-aut-findings
// design.md D3): the widget reads the session, mocked here at its public API.
const auth = vi.hoisted(() => ({
  session: { state: "anonymous" } as Session,
}));
vi.mock("@/features/auth", () => ({
  useSession: () => auth.session,
}));

const SIGNED_IN: Session = {
  state: "authenticated",
  user: { ulid: "01JUSER", role: "coffeeshop" } as never,
};

beforeEach(() => {
  router.push.mockReset();
  router.refresh.mockReset();
  auth.session = SIGNED_IN;
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
  viewEvaluationsLabel: "texts.viewEvaluationsLabel",
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
  describe("Evaluate action (add-specialist-evaluations design.md D6)", () => {
    it("supplies EvaluateLink with each offering's ulid and the locale to every card", () => {
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
  });


  describe("Empty (spec: 'Empty')", () => {
    it("renders the empty message in the primary text colour", () => {
      renderList({ state: "empty" });
      expect(classTokens(screen.getByText(TEXTS.emptyMessage))).toContain(
        "text-text-primary",
      );
    });
  });

  describe("Error and retry (spec: 'Error and retry', 'Retry reloads'; design.md D4)", () => {
    it("renders the error message in the primary text colour", () => {
      renderList({ state: "error" });
      const message = screen.getByText(TEXTS.errorMessage);
      expect(classTokens(message.parentElement!)).toContain("text-text-primary");
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
          texts={TEXTS}
          gridClassName={CATALOG_GRID_CLASSES}
        />,
      );
      expect(gridOf(container).getAttribute("class")).toBe(
        CATALOG_GRID_CLASSES,
      );
    });

  });

  describe("Filtered states (add-offering-facets design.md D9)", () => {
    const COUNT_TEXTS = { ...TEXTS, resultCount: "Results: {count}" };

    it("announces 0 in the empty state", () => {
      render(
        <OfferingList result={{ state: "empty" }} locale="es" texts={COUNT_TEXTS} />,
      );
      expect(screen.getByRole("status").textContent).toBe("Results: 0");
    });

  });
});
