import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { SidebarProvider } from "@/shared/ui";
import { AppSidebarProvider } from "@/widgets/app-sidebar";
import { CoffeeshopsSidebarScreen } from "@/pages/coffeeshops";

afterEach(() => {
  cleanup();
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
  usePathname: () => "/es/coffeeshops",
  useRouter: () => ({ push: () => {} }),
  useSearchParams: () => new URLSearchParams("name=nomad"),
}));

/**
 * The directory's slot screen (add-coffeeshop-directory design.md D9;
 * app-shell spec "Management sidebar").
 */
describe("CoffeeshopsSidebarScreen", () => {
  it("renders the sidebar with the coffee shop facets and no navigation (spec: Shown on the coffee shop directory)", () => {
    render(
      <SidebarProvider>
        <AppSidebarProvider session={{ state: "anonymous" }} toggleLabel="sidebar.toggle">
          <CoffeeshopsSidebarScreen locale="es" searchParams={{ name: "nomad" }} />
        </AppSidebarProvider>
      </SidebarProvider>,
    );
    const sidebar = screen.getByRole("complementary");
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(within(sidebar).getByRole("search", { name: "Filtros" })).toBeDefined();
    expect((within(sidebar).getByRole("searchbox", { name: "Nombre" }) as HTMLInputElement).value).toBe("nomad");
  });
});
