import { describe, it, expect, afterEach, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { FilteredOfferingsResultsProps, FilteredOfferingsToolbarProps } from "@/widgets/offering-list";
import { CoffeeshopDetailScreen } from "./CoffeeshopDetailScreen";

afterEach(() => {
  cleanup();
  block.suspend = false;
});

/**
 * Coffee shop detail screen (add-coffeeshop-directory design.md D8, D10;
 * specs "Coffee shop detail page" and "Coffee shop Offerings tab"). The async
 * detail block and the R12 compositions are replaced by stubs: the block
 * renders the Offerings slot it receives, the compositions record their props.
 */

// The back control is a route button (render-navigation-actions-as-buttons);
// the app router is mocked — test infrastructure only.
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const block = vi.hoisted(() => ({
  suspend: false,
  toolbar: null as FilteredOfferingsToolbarProps | null,
  results: null as FilteredOfferingsResultsProps | null,
}));

vi.mock("@/widgets/coffeeshop-detail", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/widgets/coffeeshop-detail")>();
  return {
    ...actual,
    CoffeeshopDetail: ({ offerings }: { offerings?: ReactNode }) => {
      if (block.suspend) throw new Promise<void>(() => {});
      return <div data-testid="detail-block">{offerings}</div>;
    },
  };
});

vi.mock("@/widgets/offering-list", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/widgets/offering-list")>();
  return {
    ...actual,
    FilteredOfferingsToolbar: (props: FilteredOfferingsToolbarProps) => {
      block.toolbar = props;
      return <div data-testid="offerings-toolbar" />;
    },
    FilteredOfferingsResults: (props: FilteredOfferingsResultsProps) => {
      block.results = props;
      return <div data-testid="offerings-results" />;
    },
  };
});

describe("CoffeeshopDetailScreen", () => {
  it("shows the back link, three placeholder bars and two skeleton cards while loading (spec: Loading)", () => {
    block.suspend = true;
    const { container } = render(<CoffeeshopDetailScreen locale="es" ulid="01SHOP" searchParams={{}} />);
    fireEvent.click(screen.getByRole("button", { name: "Volver a cafeterías" }));
    expect(router.push).toHaveBeenCalledWith("/es/coffeeshops");
    expect(container.querySelectorAll(".animate-pulse.h-4, .animate-pulse.h-6").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll(".grid > *")).toHaveLength(2);
  });

  it("fills the Ofertas panel with the shared filtered offerings scoped to the coffee shop (spec: Offerings of the coffee shop)", () => {
    const searchParams = { coffeeshopUlid: "OTHER", process: "washed" };
    render(<CoffeeshopDetailScreen locale="es" ulid="01SHOP" searchParams={searchParams} />);
    expect(screen.getByTestId("offerings-toolbar")).toBeDefined();
    expect(screen.getByTestId("offerings-results")).toBeDefined();
    expect(block.toolbar?.searchParams).toBe(searchParams);
    expect(block.results?.path).toBe("/es/coffeeshops/01SHOP");
    expect(block.results?.searchParams).toBe(searchParams);
    expect(block.results?.fixedQuery).toEqual({ coffeeshopUlid: "01SHOP" });
    expect(block.results?.paginationQuery).toEqual({ tab: "offerings" });
  });
});
