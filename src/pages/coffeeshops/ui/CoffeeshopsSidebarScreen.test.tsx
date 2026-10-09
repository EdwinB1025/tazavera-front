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
  function renderScreen() {
    render(
      <SidebarProvider>
        <AppSidebarProvider session={{ state: "anonymous" }} toggleLabel="sidebar.toggle">
          <CoffeeshopsSidebarScreen locale="es" searchParams={{ name: "nomad" }} />
        </AppSidebarProvider>
      </SidebarProvider>,
    );
    return screen.getByRole("complementary");
  }

  it("renders the sidebar with the list's entry holding the coffee shop facets (spec: Shown on the coffee shop directory)", () => {
    const sidebar = renderScreen();
    const entry = within(screen.getByRole("navigation")).getByRole("link", { name: "Explora coffees" });
    expect(entry.getAttribute("aria-current")).toBe("page");
    expect(within(sidebar).getByRole("search", { name: "Filtros" })).toBeDefined();
  });

  it("keeps the applied value while the facets are collapsed (spec: Filters keep applying while collapsed)", () => {
    const sidebar = renderScreen();
    expect(within(sidebar).getByRole("button", { name: "Filtros" }).getAttribute("aria-expanded")).toBe("false");
    expect((within(sidebar).getByRole("searchbox", { name: "Nombre" }) as HTMLInputElement).value).toBe("nomad");
  });
});
