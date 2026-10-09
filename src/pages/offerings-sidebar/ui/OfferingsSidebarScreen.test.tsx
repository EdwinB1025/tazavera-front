import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { SidebarProvider } from "@/shared/ui";
import { AppSidebarProvider } from "@/widgets/app-sidebar";
import { getMessages } from "@/shared/lib/i18n";
import { offeringFacetsTexts } from "@/features/offering-facets";
import type { FilteredOfferingsFacetsProps } from "@/widgets/offering-list";
import { OfferingsSidebarScreen } from "@/pages/offerings-sidebar";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  facets.props = null;
});

// jsdom has no matchMedia; the sidebar reads the md breakpoint through it.
// Test infrastructure only.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

// jsdom has no ResizeObserver; Radix Slider and Popover measure with one.
beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  }
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/es/offerings",
  useRouter: () => ({ push: () => {} }),
  useSearchParams: () => new URLSearchParams(),
}));

/**
 * The facet composition is an async Server Component — untestable in Vitest —
 * so it is replaced at the widget's public API by a stub that renders a
 * marker and records its props.
 */
const facets = vi.hoisted(() => ({
  props: null as FilteredOfferingsFacetsProps | null,
}));

vi.mock("@/widgets/offering-list", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/widgets/offering-list")>();
  return {
    ...actual,
    FilteredOfferingsFacets: (props: FilteredOfferingsFacetsProps) => {
      facets.props = props;
      return <div data-testid="filtered-offerings-facets" />;
    },
  };
});

const SESSIONS: Record<string, Session> = {
  anonymous: { state: "anonymous" },
};

/**
 * The offerings slot screen (add-sidebar-slot design.md D9; spec "Shown on
 * the offerings list"; extract-filtered-offerings design.md D5, D7): the
 * sidebar for every session state, with the list's entry holding the
 * filtered offerings facets (collapse-sidebar-filters).
 */
describe("OfferingsSidebarScreen (extract-filtered-offerings design.md D5, D7)", () => {
  it.each(Object.keys(SESSIONS))(
    "renders the sidebar with the list's entry and the facets for a %s session",
    (key) => {
      const searchParams = { process: "washed" };
      render(
        <SidebarProvider>
          <AppSidebarProvider session={SESSIONS[key]!} toggleLabel="sidebar.toggle">
            <OfferingsSidebarScreen locale="es" searchParams={searchParams} />
          </AppSidebarProvider>
        </SidebarProvider>,
      );
      const sidebars = screen.getAllByRole("complementary");
      expect(sidebars).toHaveLength(1);
      expect(
        within(screen.getByRole("navigation")).getByRole("link", { name: "Explorar ofertas" }),
      ).toBeDefined();
      expect(within(sidebars[0]!).getByTestId("filtered-offerings-facets")).toBeDefined();
      expect(facets.props?.locale).toBe("es");
      expect(facets.props?.searchParams).toBe(searchParams);
      expect(facets.props?.texts).toEqual(offeringFacetsTexts(getMessages("filters", "es")));
    },
  );
});
