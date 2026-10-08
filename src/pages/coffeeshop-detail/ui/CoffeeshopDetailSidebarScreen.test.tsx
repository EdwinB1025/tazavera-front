import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { SidebarProvider } from "@/shared/ui";
import { getMessages } from "@/shared/lib/i18n";
import { offeringFacetsTexts } from "@/features/offering-facets";
import { AppSidebarProvider } from "@/widgets/app-sidebar";
import type { FilteredOfferingsFacetsProps } from "@/widgets/offering-list";
import { CoffeeshopDetailSidebarScreen } from "./CoffeeshopDetailSidebarScreen";

afterEach(() => {
  cleanup();
  facets.props = null;
});

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/es/coffeeshops/01SHOP",
  useRouter: () => ({ push: () => {} }),
  useSearchParams: () => new URLSearchParams(),
}));

const facets = vi.hoisted(() => ({ props: null as FilteredOfferingsFacetsProps | null }));

vi.mock("@/widgets/offering-list", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/widgets/offering-list")>();
  return {
    ...actual,
    FilteredOfferingsFacets: (props: FilteredOfferingsFacetsProps) => {
      facets.props = props;
      return <div data-testid="filtered-offerings-facets" />;
    },
  };
});

function renderSlot(searchParams: Record<string, string>) {
  return render(
    <SidebarProvider>
      <AppSidebarProvider session={{ state: "anonymous" }} toggleLabel="sidebar.toggle">
        <CoffeeshopDetailSidebarScreen locale="es" searchParams={searchParams} />
      </AppSidebarProvider>
    </SidebarProvider>,
  );
}

/**
 * The detail's slot screen (add-coffeeshop-directory design.md D9; app-shell
 * spec "Management sidebar"; offering-catalog spec "Coffee shop Locations
 * tab").
 */
describe("CoffeeshopDetailSidebarScreen", () => {
  it("renders the offering facets on the Ofertas tab (spec: Shown on the coffee shop Offerings tab)", () => {
    const searchParams = { process: "washed" };
    renderSlot(searchParams);
    const sidebar = screen.getByRole("complementary");
    expect(within(sidebar).getByTestId("filtered-offerings-facets")).toBeDefined();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(facets.props?.searchParams).toBe(searchParams);
    expect(facets.props?.texts).toEqual(offeringFacetsTexts(getMessages("filters", "es")));
  });

  it("renders no sidebar on the Ubicaciones tab (spec: No sidebar on Locations)", () => {
    renderSlot({ tab: "locations" });
    expect(screen.queryByRole("complementary")).toBeNull();
    expect(facets.props).toBeNull();
  });
});
