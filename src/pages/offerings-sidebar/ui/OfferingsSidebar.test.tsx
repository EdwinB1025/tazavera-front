import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { SidebarProvider } from "@/shared/ui";
import { AppSidebarProvider } from "@/widgets/app-sidebar";
import { getMessages } from "@/shared/lib/i18n";
import { offeringFacetsTexts, parseOfferingFilters } from "@/features/offering-facets";
import { OfferingsSidebar } from "@/pages/offerings-sidebar";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
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

const FACETS = {
  values: parseOfferingFilters({}),
  options: {
    countries: [],
    regions: [],
    processes: [],
    varieties: [],
    producers: [],
    tasteNotes: [],
  },
  texts: offeringFacetsTexts(getMessages("filters", "es")),
};

const SESSIONS: Record<string, Session> = {
  anonymous: { state: "anonymous" },
  loading: { state: "loading" },
  coffeeshop: {
    state: "authenticated",
    user: { name: "Lucía", surname: "Pérez", role: "coffeeshop" },
  },
};

/**
 * The offerings sidebar (add-sidebar-slot design.md D9; spec "Shown on the
 * offerings list"): the sidebar for every session state, with no navigation
 * entries, holding the offering facet panel (add-offering-facets design.md D7).
 */
describe("OfferingsSidebar (design.md D9; add-offering-facets D7)", () => {
  it.each(Object.keys(SESSIONS))(
    "renders the sidebar with no navigation for a %s session",
    (key) => {
      render(
        <SidebarProvider>
          <AppSidebarProvider session={SESSIONS[key]!} toggleLabel="sidebar.toggle">
            <OfferingsSidebar {...FACETS} />
          </AppSidebarProvider>
        </SidebarProvider>,
      );
      const sidebar = screen.getByRole("complementary");
      expect(screen.queryByRole("navigation")).toBeNull();
      expect(within(sidebar).getByRole("search", { name: "Filtros" })).toBeDefined();
    },
  );
});
