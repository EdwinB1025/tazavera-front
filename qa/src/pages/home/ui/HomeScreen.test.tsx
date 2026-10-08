import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import type { VerifiedOfferingsProps } from "@/widgets/offering-list";
import { HomeScreen } from "@/pages/home";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  block.suspend = false;
  block.props = null;
});

/**
 * Home screen tests (design.md D9, D10, D11; the landing spec "Entry page
 * hero" and "Localized page texts"). The screen is a thin composition: it
 * loads the `landing` catalog of the route's locale and feeds every text down
 * as props (design.md D10, D11), passes no session (add-specialist-evaluations
 * design.md D6: the Evaluate link reads it itself), and wraps the offerings block
 * in a `Suspense` boundary whose fallback is the skeleton cards (design.md
 * D9). The block is replaced at its public API: it is an async Server
 * Component — untestable in Vitest (the testing rule) — and the stub records
 * the props the screen passes; the skeleton card stub counts the fallback.
 *
 * The previous case of `add-app-shell` ("fills the main area with no content")
 * is replaced here: design.md D13 fills that main area with the hero and the
 * list, which is the behaviour these cases pin.
 */

const block = vi.hoisted(() => ({
  suspend: false,
  props: null as VerifiedOfferingsProps | null,
}));

vi.mock("@/widgets/offering-list", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/widgets/offering-list")>();
  return {
    ...actual,
    VerifiedOfferings: (props: VerifiedOfferingsProps) => {
      block.props = props;
      // Never settles, so the boundary keeps showing its fallback.
      if (block.suspend) throw new Promise<void>(() => {});
      return <div data-testid="offerings-block" />;
    },
    OfferingSkeletonCard: () => <div data-testid="skeleton-card" />,
  };
});

describe("HomeScreen", () => {
  it("fills the main area with the hero and the offerings block (design.md D10, D13)", () => {
    const { container } = render(<HomeScreen locale="es" page={undefined} />);
    const root = container.firstElementChild;
    expect(root).not.toBeNull();
    expect(root!.className).toContain("flex-1");
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getByTestId("offerings-block")).toBeTruthy();
    // No `page` in the route's search params requests the first page.
    expect(block.props?.page).toBe(1);
  });

  it("loads the `landing` catalog of the route's locale and feeds every hero text to the hero (design.md D10, D11)", () => {
    render(<HomeScreen locale="es" page={undefined} />);
    const es = getMessages("landing", "es");
    const rendered = document.body.textContent ?? "";
    const heading =
      `${es.heroHeadingBefore}${es.heroHeadingAccent}${es.heroHeadingAfter}`;
    for (const value of [
      es.heroEyebrow,
      heading,
      es.heroParagraph,
      es.heroExploreLabel,
      es.heroCoffeeshopRegisterLabel,
      es.heroSpecialistRegisterLabel,
    ]) {
      expect(rendered.includes(value), value).toBe(true);
    }
    expect(document.querySelector("img")?.getAttribute("alt")).toBe(
      es.heroPhotoAlt,
    );
  });

  it("passes no session to the block (add-specialist-evaluations design.md D6)", () => {
    render(<HomeScreen locale="es" page={undefined} />);
    expect(block.props).not.toBeNull();
    expect(block.props).not.toHaveProperty("session");
  });

  it("passes the route's locale, the requested page and every list text to the block (design.md D10, D11)", () => {
    render(<HomeScreen locale="es" page="2" />);
    const es = getMessages("landing", "es");
    expect(block.props?.locale).toBe("es");
    expect(block.props?.page).toBe(2);
    expect(block.props?.texts).toEqual({
      coffeeshopCaption: es.cardCoffeeshopCaption,
      roasterCaption: es.cardRoasterCaption,
      evaluationsLabel: es.cardEvaluationsLabel,
      defectiveLabel: es.cardDefectiveLabel,
      viewLabel: es.cardViewLabel,
      evaluateLabel: es.cardEvaluateLabel,
      verifiedLabel: es.cardVerifiedLabel,
      provisionalLabel: es.cardProvisionalLabel,
      ratingExceptionalLabel: es.cardRatingExceptionalLabel,
      ratingExcellentLabel: es.cardRatingExcellentLabel,
      ratingGoodLabel: es.cardRatingGoodLabel,
      ratingCommercialLabel: es.cardRatingCommercialLabel,
      previousLabel: es.paginationPreviousLabel,
      nextLabel: es.paginationNextLabel,
      navigationLabel: es.paginationNavigationLabel,
      pageLabel: es.paginationPageLabel,
      emptyMessage: es.listEmptyMessage,
      errorMessage: es.listErrorMessage,
      retryLabel: es.listRetryLabel,
    });
  });

  describe("Page layout (spec: 'Entry page sections', 'Centered content', 'Side and section spacing', 'Grid by viewport'; design.md D14)", () => {
    function classTokens(element: Element): string[] {
      return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
    }

    it("lays the skeleton fallback out in the offerings grid", () => {
      block.suspend = true;
      render(<HomeScreen locale="es" page={undefined} />);
      const grid = screen.getAllByTestId("skeleton-card")[0].parentElement!;
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
});
