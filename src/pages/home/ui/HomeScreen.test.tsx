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
 * as props (design.md D10, D11), supplies the session at one expression as the
 * anonymous `Session` constant (design.md D10), and wraps the offerings block
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

  it("reads the catalog of the locale the route asks for (spec: 'Texts follow the locale')", () => {
    render(<HomeScreen locale="ca" page={undefined} />);
    const ca = getMessages("landing", "ca");
    const es = getMessages("landing", "es");
    const rendered = document.body.textContent ?? "";
    expect(rendered.includes(ca.heroEyebrow)).toBe(true);
    expect(rendered.includes(es.heroEyebrow)).toBe(false);
  });

  it("supplies the session at one expression as the anonymous Session constant (design.md D10)", () => {
    render(<HomeScreen locale="es" page={undefined} />);
    expect(block.props?.session).toEqual({ state: "anonymous" });
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
      previousLabel: es.paginationPreviousLabel,
      nextLabel: es.paginationNextLabel,
      emptyMessage: es.listEmptyMessage,
      errorMessage: es.listErrorMessage,
      retryLabel: es.listRetryLabel,
    });
  });

  it("wraps the block in Suspense with the skeleton cards as fallback (design.md D9)", () => {
    block.suspend = true;
    render(<HomeScreen locale="es" page={undefined} />);
    // The block has not resolved: skeleton cards render in its place and the
    // hero renders normally outside the boundary.
    expect(screen.queryByTestId("offerings-block")).toBeNull();
    expect(screen.getAllByTestId("skeleton-card").length).toBeGreaterThan(1);
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });
});
